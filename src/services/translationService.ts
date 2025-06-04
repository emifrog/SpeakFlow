import axios from 'axios';

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
