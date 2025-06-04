import React, { useState, type ReactNode } from 'react';
import { supportedLanguages } from '../data/languages';
import { emergencyPhrases } from '../data/emergencyPhrases';
import { TranslationContext } from './TranslationContextInstance';

// Provider du contexte
export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // États
  const [sourceLanguage, setSourceLanguage] = useState('fr');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [autoDetect, setAutoDetect] = useState(false);
  const [highVisibilityMode, setHighVisibilityMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('translate');

  // Fonction pour effacer la traduction
  const clearTranslation = () => {
    setSourceText('');
    setTranslatedText('');
  };

  // Valeur du contexte
  const value = {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
    isListening,
    setIsListening,
    sourceText,
    setSourceText,
    translatedText,
    setTranslatedText,
    autoDetect,
    setAutoDetect,
    highVisibilityMode,
    setHighVisibilityMode,
    offlineMode,
    setOfflineMode,
    notificationsEnabled,
    setNotificationsEnabled,
    clearTranslation,
    supportedLanguages,
    emergencyPhrases,
    activeTab,
    setActiveTab,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
