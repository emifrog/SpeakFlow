import axios from 'axios';
import { googleCloudConfig, isGoogleCloudConfigured } from '../config/googleCloud';

// Interface pour les paramètres de traduction
interface TranslationParams {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Interface pour la réponse de traduction
interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
}

// Cache local pour les traductions
const translationCache = new Map<string, TranslationResponse>();

/**
 * Génère une clé de cache unique pour une requête de traduction
 */
const getCacheKey = (params: TranslationParams): string => {
  return `${params.text}_${params.sourceLanguage}_${params.targetLanguage}`;
};

/**
 * Vérifie si une traduction est dans le cache
 */
export const checkCache = (params: TranslationParams): TranslationResponse | null => {
  const cacheKey = getCacheKey(params);
  return translationCache.has(cacheKey) ? translationCache.get(cacheKey) || null : null;
};

/**
 * Ajoute une traduction au cache
 */
export const addToCache = (params: TranslationParams, response: TranslationResponse): void => {
  const cacheKey = getCacheKey(params);
  translationCache.set(cacheKey, response);
  
  // Stocker également dans le localStorage pour la persistance
  try {
    const cacheData = JSON.parse(localStorage.getItem('translationCache') || '{}');
    cacheData[cacheKey] = response;
    localStorage.setItem('translationCache', JSON.stringify(cacheData));
  } catch (error) {
    console.error('Erreur lors de la mise en cache de la traduction:', error);
  }
};

/**
 * Initialise le cache depuis le localStorage
 */
export const initializeCache = (): void => {
  try {
    const cacheData = JSON.parse(localStorage.getItem('translationCache') || '{}');
    Object.entries(cacheData).forEach(([key, value]) => {
      translationCache.set(key, value as TranslationResponse);
    });
    console.log(`Cache de traduction initialisé avec ${translationCache.size} entrées`);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du cache de traduction:', error);
  }
};

/**
 * Traduit un texte d'une langue source vers une langue cible en utilisant l'API Google Cloud Translation
 */
export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  useAutoDetect: boolean = false
): Promise<TranslationResponse> => {
  // Si le texte est vide, retourner une réponse vide
  if (!text.trim()) {
    return { translatedText: '' };
  }

  const params: TranslationParams = {
    text,
    sourceLanguage: useAutoDetect ? 'auto' : sourceLanguage,
    targetLanguage,
  };

  // Vérifier le cache d'abord
  const cachedTranslation = checkCache(params);
  if (cachedTranslation) {
    console.log('Traduction trouvée dans le cache');
    return cachedTranslation;
  }

  try {
    // Vérifier si l'application est hors ligne
    if (navigator.onLine === false) {
      // Retourner une traduction de secours simple
      const fallbackTranslation: TranslationResponse = {
        translatedText: `[HORS LIGNE] ${text}`,
        detectedLanguage: sourceLanguage,
      };
      return fallbackTranslation;
    }

    // Vérifier si la configuration Google Cloud est disponible
    if (!isGoogleCloudConfigured()) {
      throw new Error('La configuration Google Cloud n\'est pas disponible');
    }

    // Préparer les paramètres pour l'API Google Cloud Translation
    const requestData = {
      q: text,
      source: useAutoDetect ? undefined : sourceLanguage,
      target: targetLanguage,
      format: 'text',
    };

    // Appel à l'API Google Cloud Translation
    const response = await axios.post(
      `${googleCloudConfig.translation.endpoint}/translate`, 
      requestData,
      {
        params: {
          key: googleCloudConfig.apiKey,
        },
      }
    );
    
    // Extraire la traduction de la réponse
    const translationResult: TranslationResponse = {
      translatedText: response.data.data.translations[0].translatedText,
      detectedLanguage: response.data.data.translations[0].detectedSourceLanguage,
    };
    
    // Mettre en cache la réponse
    addToCache(params, translationResult);
    
    return translationResult;
  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
    
    // En cas d'erreur, retourner une réponse d'erreur
    return {
      translatedText: `Erreur de traduction: ${(error as Error).message}`,
    };
  }
};

/**
 * Détecte la langue d'un texte en utilisant l'API Google Cloud Translation
 */
export const detectLanguage = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return '';
  }

  try {
    // Vérifier si l'application est hors ligne
    if (navigator.onLine === false) {
      return 'fr'; // Par défaut, on suppose que c'est du français
    }

    // Vérifier si la configuration Google Cloud est disponible
    if (!isGoogleCloudConfigured()) {
      throw new Error('La configuration Google Cloud n\'est pas disponible');
    }

    // Appel à l'API Google Cloud pour détecter la langue
    const response = await axios.post(
      googleCloudConfig.languageDetection.endpoint,
      { q: text },
      {
        params: {
          key: googleCloudConfig.apiKey,
        },
      }
    );
    
    // Extraire le code de langue détecté
    return response.data.data.detections[0][0].language;
  } catch (error) {
    console.error('Erreur lors de la détection de langue:', error);
    return 'fr'; // Par défaut en cas d'erreur
  }
};

/**
 * Synthétise la parole à partir d'un texte
 */
export const speakText = (text: string, language: string): void => {
  if (!text.trim() || !window.speechSynthesis) {
    return;
  }

  // Arrêter toute synthèse vocale en cours
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.9; // Légèrement plus lent pour une meilleure compréhension
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
};

// Initialiser le cache au démarrage
initializeCache();
