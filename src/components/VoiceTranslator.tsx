import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { speakText } from '../services/translationService';
import './VoiceTranslator.css';

const VoiceTranslator: React.FC = () => {
  const {
    sourceLanguage,
    targetLanguage,
    sourceText,
    translatedText,
    isListening,
    isHighVisibilityMode,
    setSourceText,
    setTranslatedText,
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
      speakText(translatedText, targetLanguage.code);
      
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
  const containerClass = `voice-translator ${isHighVisibilityMode ? 'high-visibility' : ''}`;

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
            <span className="flag">{sourceLanguage.flag}</span>
            <span className="language-name">{sourceLanguage.name}</span>
          </div>
          
          <div className="text-display">
            {sourceText || (isListening ? 'Écoute en cours...' : 'Appuyez sur le bouton pour parler')}
          </div>
        </div>
        
        <div className="translated-container">
          <div className="language-indicator">
            <span className="flag">{targetLanguage.flag}</span>
            <span className="language-name">{targetLanguage.name}</span>
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
          {isListening ? 'Arrêter' : 'Parler'}
        </button>
        
        <button 
          className={`speak-button ${isSpeaking ? 'speaking' : ''}`}
          onClick={handleSpeak}
          disabled={!translatedText}
        >
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
          Effacer
        </button>
      </div>
    </div>
  );
};

export default VoiceTranslator;
