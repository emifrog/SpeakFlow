// Types pour l'application SpeakFlow

// Type pour une langue supportée
export interface Language {
  code: string;
  name: string;
  flag: string;
}

// Type pour les phrases d'urgence
export interface EmergencyPhrase {
  id: string;
  category: string;
  text: {
    [languageCode: string]: string;
  };
}

// Type pour les résultats de traduction
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

// Type pour les préférences utilisateur
export interface UserPreferences {
  highVisibilityMode: boolean;
  offlineMode: boolean;
  notificationsEnabled: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  autoDetect: boolean;
}

// Type pour l'historique de traduction
export interface TranslationHistoryItem extends TranslationResult {
  id: string;
  isFavorite: boolean;
}
