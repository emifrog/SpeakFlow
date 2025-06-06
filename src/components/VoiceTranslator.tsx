import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { speakText } from '../services/translationService';
import type { Language } from '../types';
import './VoiceTranslator.css';

const VoiceTranslator: React.FC = () => {
  const {
    sourceLanguage,
    targetLanguage,
    sourceText,
    translatedText,
    isListening,
    highVisibilityMode,
    setSourceText,
    setTranslatedText,
    supportedLanguages
  } = useTranslation();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const { startListening, stopListening, hasRecognitionSupport, error } = useSpeechRecognition();

  // Gérer le bouton d'écoute
  const handleListenClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setSourceText('');
      setTranslatedText('');
      startListening();
    }
  };

  // Fonction pour prononcer la traduction
  const handleSpeak = () => {
    if (translatedText) {
      setIsSpeaking(true);
      speakText(translatedText, targetLanguage);
      
      // Vérifier quand la synthèse vocale est terminée
      const checkSpeaking = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(checkSpeaking);
        }
      }, 100);
    }
  };

  // Arrêter la synthèse vocale lorsque le composant est démonté
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Appliquer la classe de mode haute visibilité si nécessaire
  const containerClass = `voice-translator ${highVisibilityMode ? 'high-visibility' : ''}`;
  
  // Trouver les objets de langue complets
  const sourceLang = supportedLanguages.find((lang: Language) => lang.code === sourceLanguage) as Language;
  const targetLang = supportedLanguages.find((lang: Language) => lang.code === targetLanguage) as Language;

  return (
    <div className={containerClass}>
      {!hasRecognitionSupport && (
        <div className="error-message">
          La reconnaissance vocale n'est pas supportée par votre navigateur.
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="translation-container">
        <div className="source-container">
          <div className="language-indicator">
            <span className="flag">{sourceLang.flag}</span>
            <span className="language-name">{sourceLang.name}</span>
          </div>
          
          <div className="text-display">
            {sourceText || (isListening ? 'Écoute en cours...' : 'Appuyez sur le bouton pour parler')}
          </div>
        </div>
        
        <div className="translated-container">
          <div className="language-indicator">
            <span className="flag">{targetLang.flag}</span>
            <span className="language-name">{targetLang.name}</span>
          </div>
          
          <div className="text-display">
            {translatedText || 'La traduction apparaîtra ici'}
          </div>
        </div>
      </div>
      
      <div className="controls">
        <button 
          className={`listen-button ${isListening ? 'listening' : ''}`}
          onClick={handleListenClick}
          disabled={!hasRecognitionSupport}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor"/>
          </svg>
          {isListening ? 'Arrêter' : 'Parler'}
        </button>
        
        <button 
          className={`speak-button ${isSpeaking ? 'speaking' : ''}`}
          onClick={handleSpeak}
          disabled={!translatedText}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
          </svg>
          Prononcer
        </button>
        
        <button 
          className="clear-button"
          onClick={() => {
            setSourceText('');
            setTranslatedText('');
          }}
          disabled={!sourceText && !translatedText}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
          </svg>
          Effacer
        </button>
      </div>
    </div>
  );
};

export default VoiceTranslator;
