import React, { useState } from 'react';
import { useTranslation, type Language } from '../context/TranslationContext';
import './LanguageSelector.css';

const LanguageSelector: React.FC = () => {
  const {
    sourceLanguage,
    targetLanguage,
    autoDetect,
    setSourceLanguage,
    setTargetLanguage,
    setAutoDetect,
    supportedLanguages,
  } = useTranslation();

  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const [isTargetMenuOpen, setIsTargetMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les langues en fonction du terme de recherche
  const filteredLanguages = searchTerm
    ? supportedLanguages.filter((lang: Language) =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : supportedLanguages;

  // Gérer la sélection de la langue source
  const handleSourceLanguageSelect = (language: Language) => {
    setSourceLanguage(language.code);
    setIsSourceMenuOpen(false);
    setSearchTerm('');
  };

  // Gérer la sélection de la langue cible
  const handleTargetLanguageSelect = (language: Language) => {
    setTargetLanguage(language.code);
    setIsTargetMenuOpen(false);
    setSearchTerm('');
  };

  // Gérer l'activation/désactivation de la détection automatique
  const handleAutoDetectToggle = () => {
    setAutoDetect(!autoDetect);
    if (!autoDetect) {
      setIsSourceMenuOpen(false);
    }
  };

  return (
    <div className="language-selector">
      <div className="language-controls">
        <div className="language-dropdown-container">
          <button
            className={`language-button ${autoDetect ? 'disabled' : ''}`}
            onClick={() => !autoDetect && setIsSourceMenuOpen(!isSourceMenuOpen)}
            disabled={autoDetect}
          >
            <span className="flag">{supportedLanguages.find(l => l.code === sourceLanguage)?.flag}</span>
            <span className="language-name">{autoDetect ? 'Détection auto' : supportedLanguages.find(l => l.code === sourceLanguage)?.name}</span>
          </button>
          
          {isSourceMenuOpen && (
            <div className="language-dropdown">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Rechercher une langue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="language-list">
                {filteredLanguages.map((language: Language) => (
                  <button
                    key={language.code}
                    className={`language-option ${language.code === sourceLanguage ? 'selected' : ''}`}
                    onClick={() => handleSourceLanguageSelect(language)}
                  >
                    <span className="flag">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="swap-button" onClick={() => {
          const tempLang = sourceLanguage;
          setSourceLanguage(targetLanguage);
          setTargetLanguage(tempLang);
        }} disabled={autoDetect}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10L3 14L7 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 14H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 6L21 10L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="language-dropdown-container">
          <button
            className="language-button"
            onClick={() => setIsTargetMenuOpen(!isTargetMenuOpen)}
          >
            <span className="flag">{supportedLanguages.find(l => l.code === targetLanguage)?.flag}</span>
            <span className="language-name">{supportedLanguages.find(l => l.code === targetLanguage)?.name}</span>
          </button>
          
          {isTargetMenuOpen && (
            <div className="language-dropdown">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Rechercher une langue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="language-list">
                {filteredLanguages.map((language: Language) => (
                  <button
                    key={language.code}
                    className={`language-option ${language.code === targetLanguage ? 'selected' : ''}`}
                    onClick={() => handleTargetLanguageSelect(language)}
                  >
                    <span className="flag">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="auto-detect-container">
        <label className="auto-detect-label">
          <input
            type="checkbox"
            checked={autoDetect}
            onChange={handleAutoDetectToggle}
            className="auto-detect-checkbox"
          />
          <span className="auto-detect-text">Détection automatique de la langue</span>
        </label>
      </div>
    </div>
  );
};

export default LanguageSelector;
