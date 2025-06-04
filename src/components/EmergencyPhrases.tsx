import React, { useState } from 'react';
import { useTranslation, type EmergencyPhrase } from '../context/TranslationContext';
import { speakText } from '../services/translationService';
import './EmergencyPhrases.css';

const EmergencyPhrases: React.FC = () => {
  const { sourceLanguage, targetLanguage, setSourceText, setTranslatedText, emergencyPhrases } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('Médical');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Obtenir les catégories uniques
  const categories = Array.from(new Set(emergencyPhrases.map((phrase: EmergencyPhrase) => phrase.category)));

  // Filtrer les phrases par catégorie
  const filteredPhrases = emergencyPhrases.filter((phrase: EmergencyPhrase) => phrase.category === activeCategory);

  // Gérer la sélection d'une phrase
  const handlePhraseSelect = (phrase: EmergencyPhrase) => {
    const sourcePhrase = phrase.text[sourceLanguage] || phrase.text['fr'];
    const targetPhrase = phrase.text[targetLanguage] || '';
    
    setSourceText(sourcePhrase);
    setTranslatedText(targetPhrase);
  };

  // Prononcer la phrase
  const handleSpeak = (phrase: EmergencyPhrase) => {
    const targetPhrase = phrase.text[targetLanguage];
    
    if (targetPhrase) {
      setIsSpeaking(true);
      speakText(targetPhrase, targetLanguage);
      
      // Vérifier quand la synthèse vocale est terminée
      const checkSpeaking = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(checkSpeaking);
        }
      }, 100);
    }
  };

  return (
    <div className="emergency-phrases">
      <h2 className="emergency-title">Phrases d'urgence</h2>
      
      <div className="category-tabs">
        {categories.map((category: string) => (
          <button
            key={category}
            className={`category-tab ${category === activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="phrases-list">
        {filteredPhrases.map((phrase: EmergencyPhrase) => (
          <div key={phrase.id} className="phrase-card">
            <div className="phrase-content">
              <div className="source-phrase">
                {phrase.text[sourceLanguage] || phrase.text['fr']}
              </div>
              
              <div className="target-phrase">
                {phrase.text[targetLanguage] || 
                  <span className="not-available">Non disponible dans cette langue</span>}
              </div>
            </div>
            
            <div className="phrase-actions">
              <button 
                className="use-phrase-button"
                onClick={() => handlePhraseSelect(phrase)}
              >
                Utiliser
              </button>
              
              <button 
                className={`speak-phrase-button ${isSpeaking ? 'speaking' : ''}`}
                onClick={() => handleSpeak(phrase)}
                disabled={!phrase.text[targetLanguage]}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyPhrases;
