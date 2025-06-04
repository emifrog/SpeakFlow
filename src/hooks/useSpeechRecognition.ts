import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { detectLanguage, translateText } from '../services/translationService';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
}

// Définir les interfaces pour l'API SpeechRecognition qui n'est pas incluse dans les types standard de TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Définition de l'interface SpeechRecognition pour éviter l'utilisation de 'any'
interface SpeechRecognitionAPI extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Type utilisé dans le hook pour la reconnaissance vocale
type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: (event: Event) => void;
};

// Accéder à l'API de reconnaissance vocale du navigateur
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionAPI;
  prototype: SpeechRecognitionAPI;
}





// Récupérer la classe de reconnaissance vocale du navigateur
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * Hook personnalisé pour utiliser la reconnaissance vocale
 */
export const useSpeechRecognition = (options: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn => {
  const { 
    sourceLanguage, 
    targetLanguage, 
    autoDetect: isAutoDetect,
    setSourceText, 
    setTranslatedText, 
    setIsListening,
    setSourceLanguage,
    supportedLanguages
  } = useTranslation();
  
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState<boolean>(false);

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if (SpeechRecognitionClass) {
      setHasRecognitionSupport(true);
      const recognitionInstance = new SpeechRecognitionClass() as unknown as SpeechRecognitionType;
      
      // Configurer les options
      recognitionInstance.continuous = options.continuous ?? true;
      recognitionInstance.interimResults = options.interimResults ?? true;
      recognitionInstance.lang = options.lang ?? sourceLanguage;
      
      recognitionRef.current = recognitionInstance;
    } else {
      setHasRecognitionSupport(false);
      setError("La reconnaissance vocale n'est pas supportée par votre navigateur");
    }
    
    // Nettoyer lors du démontage
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [options.continuous, options.interimResults, options.lang, sourceLanguage]);

  // Gérer les résultats de la reconnaissance vocale
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    // Définir les gestionnaires d'événements
    const handleResult = async (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        setSourceText(transcript);
        
        // Si la détection automatique est activée, détecter la langue
        if (isAutoDetect) {
          try {
            const detectedLanguage = await detectLanguage(transcript);
            if (detectedLanguage && supportedLanguages.some(lang => lang.code === detectedLanguage)) {
              setSourceLanguage(detectedLanguage);
            }
          } catch (error) {
            console.error("Erreur lors de la détection de la langue:", error);
          }
        }
        
        // Traduire le texte
        try {
          const response = await translateText(transcript, sourceLanguage, targetLanguage);
          const translatedText = response.translatedText;
          setTranslatedText(translatedText);
        } catch (error) {
          console.error("Erreur lors de la traduction:", error);
        }
      }
    };

    const handleError = (event: Event) => {
      const errorEvent = event as SpeechRecognitionErrorEvent;
      console.error("Erreur de reconnaissance vocale:", errorEvent.error, errorEvent.message);
      setError(`Erreur: ${errorEvent.error}`);
      setIsListening(false);
    };

    const handleEnd = () => {
      console.log("Session de reconnaissance vocale terminée");
      setIsListening(false);
    };

    // Assigner les gestionnaires d'événements
    recognitionRef.current.onresult = handleResult;
    recognitionRef.current.onerror = handleError;
    recognitionRef.current.onend = handleEnd;
    
    // Nettoyer les gestionnaires d'événements lors du démontage
    return () => {
      if (recognitionRef.current) {
        // Utiliser des fonctions vides au lieu de null pour éviter les erreurs TypeScript
        recognitionRef.current.onresult = (() => {}) as unknown as (event: SpeechRecognitionEvent) => void;
        recognitionRef.current.onerror = (() => {}) as unknown as (event: Event) => void;
        recognitionRef.current.onend = (() => {}) as unknown as (event: Event) => void;
      }
    };
  }, [sourceLanguage, targetLanguage, isAutoDetect, setSourceText, setTranslatedText, setIsListening, setSourceLanguage, supportedLanguages]);

  // Démarrer l'écoute
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = isAutoDetect ? 'auto' : sourceLanguage;
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du démarrage de la reconnaissance vocale:', err);
        setError('Erreur lors du démarrage de la reconnaissance vocale');
      }
    }
  }, [sourceLanguage, isAutoDetect, setIsListening]);

  // Arrêter l'écoute
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [setIsListening]);

  return {
    isListening: Boolean(recognitionRef.current) && recognitionRef.current?.onend !== null,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error
  };
};
