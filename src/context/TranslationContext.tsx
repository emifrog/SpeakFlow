import { useContext } from 'react';
import type { Language, EmergencyPhrase } from '../types';
import { TranslationContext } from './TranslationContextInstance';

// Type pour le contexte de traduction
export type TranslationContextType = {
  sourceLanguage: string;
  targetLanguage: string;
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText: string;
  setTranslatedText: (text: string) => void;
  autoDetect: boolean;
  setAutoDetect: (autoDetect: boolean) => void;
  highVisibilityMode: boolean;
  setHighVisibilityMode: (highVisibility: boolean) => void;
  offlineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  clearTranslation: () => void;
  supportedLanguages: Language[];
  emergencyPhrases: EmergencyPhrase[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

// Réexportation des constantes pour la rétro-compatibilité
// Utilisation d'importations dynamiques pour éviter les problèmes de références circulaires
// @ts-expect-error - Module '../data/languages' peut ne pas être trouvé lors de la compilation
export const supportedLanguages = () => import('../data/languages').then(module => module.supportedLanguages);
// @ts-expect-error - Module '../data/emergencyPhrases' peut ne pas être trouvé lors de la compilation
export const emergencyPhrases = () => import('../data/emergencyPhrases').then(module => module.emergencyPhrases);

// Hook personnalisé pour utiliser le contexte
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
