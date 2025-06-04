import { useState, useEffect, useCallback } from 'react';
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
  
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null);
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
      
      setRecognition(recognitionInstance);
    } else {
      setHasRecognitionSupport(false);
      setError("La reconnaissance vocale n'est pas supportée par votre navigateur");
    }
    
    // Nettoyer lors du démontage
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [options.continuous, options.interimResults, options.lang, recognition, sourceLanguage]);

  // Gérer les résultats de la reconnaissance vocale
  useEffect(() => {
    if (!recognition) return;

    const handleResult = async (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        setSourceText(transcript);
        
        // Si la détection automatique est activée, détecter la langue
        if (isAutoDetect) {
          try {
            const detectedLangCode = await detectLanguage(transcript);
            const detectedLang = supportedLanguages.find((lang) => lang.code === detectedLangCode);
            if (detectedLang) {
              setSourceLanguage(detectedLang.code);
            }
          } catch (error) {
            console.error("Erreur lors de la détection de la langue:", error);
          }
        }
        
        // Traduire le texte
        try {
          const translation = await translateText(
            transcript,
            sourceLanguage,
            targetLanguage,
            isAutoDetect
          );
          setTranslatedText(translation.translatedText);
        } catch (error) {
          console.error("Erreur lors de la traduction:", error);
          setError("Erreur lors de la traduction");
        }
      }
    };

    const handleError = (event: Event) => {
      setError("Erreur lors de la reconnaissance vocale");
      setIsListening(false);
      console.error("Erreur de reconnaissance vocale:", event);
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;
  }, [recognition, sourceLanguage, targetLanguage, isAutoDetect, setSourceText, setTranslatedText, setIsListening, setSourceLanguage, supportedLanguages]);

  // Démarrer l'écoute
  const startListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.lang = isAutoDetect ? 'auto' : sourceLanguage;
        recognition.start();
        setIsListening(true);
        setError(null);
      } catch (error) {
        console.error("Erreur au démarrage de la reconnaissance vocale:", error);
        setError("Impossible de démarrer la reconnaissance vocale");
      }
    }
  }, [recognition, sourceLanguage, isAutoDetect, setIsListening]);

  // Arrêter l'écoute
  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, setIsListening]);

  return {
    isListening: Boolean(recognition) && recognition?.onend !== null,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error
  };
};
