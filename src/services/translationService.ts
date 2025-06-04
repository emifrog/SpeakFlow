import axios from 'axios';
import { OptimizedCache, truncateText } from './cacheService';

// URL de l'API de traduction (à remplacer par une vraie API)
const API_URL = 'https://translation-api.com/translate';

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

// Cache optimisé pour les traductions
const translationCache = new OptimizedCache<TranslationResponse>('translationCache');

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
  return translationCache.get(cacheKey);
};

/**
 * Ajoute une traduction au cache
 */
export const addToCache = (params: TranslationParams, response: TranslationResponse): void => {
  // Ne mettre en cache que si le texte n'est pas trop long
  if (params.text.length <= 1000) {
    const cacheKey = getCacheKey(params);
    translationCache.set(cacheKey, response);
  }
};

/**
 * Initialise le cache depuis le localStorage
 */
export const initializeCache = (): void => {
  // Le cache est automatiquement initialisé par la classe OptimizedCache
  console.log(`Cache de traduction initialisé avec ${translationCache.size} entrées`);
};

/**
 * Traduit un texte d'une langue source vers une langue cible
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
  
  // Tronquer le texte s'il est trop long pour le cache
  const truncatedText = truncateText(text, 1000);

  const params: TranslationParams = {
    text: truncatedText,
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
    // Simuler une traduction en mode hors ligne
    if (navigator.onLine === false) {
      // Retourner une traduction de secours simple
      const fallbackTranslation: TranslationResponse = {
        translatedText: `[HORS LIGNE] ${text}`,
        detectedLanguage: sourceLanguage,
      };
      return fallbackTranslation;
    }

    // Appel à l'API de traduction
    const response = await axios.post<TranslationResponse>(API_URL, params);
    
    // Mettre en cache la réponse
    addToCache(params, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
    
    // En cas d'erreur, retourner une réponse d'erreur
    return {
      translatedText: `Erreur de traduction: ${(error as Error).message}`,
    };
  }
};

/**
 * Détecte la langue d'un texte
 */
export const detectLanguage = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return '';
  }

  try {
    // Simuler une détection en mode hors ligne
    if (navigator.onLine === false) {
      return 'fr'; // Par défaut, on suppose que c'est du français
    }

    // Appel à l'API pour détecter la langue
    const response = await axios.post<{ detectedLanguage: string }>(
      'https://translation-api.com/detect',
      { text }
    );
    
    return response.data.detectedLanguage;
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
