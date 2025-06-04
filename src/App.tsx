import { useState, useEffect } from 'react';
import { TranslationProvider } from './context/TranslationContextProvider';
import AppHeader from './components/AppHeader';
import VoiceTranslator from './components/VoiceTranslator';
import LanguageSelector from './components/LanguageSelector';
import EmergencyPhrases from './components/EmergencyPhrases';
import MediaTranslator from './components/MediaTranslator';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('translate');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Surveiller l'état de la connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <TranslationProvider>
      <div className="app">
        <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />
        
        {!isOnline && (
          <div className="offline-banner">
            Mode hors ligne - Fonctionnalités limitées disponibles
          </div>
        )}
        
        <main className="app-content">
          {activeTab === 'translate' && (
            <div className="translate-section">
              <LanguageSelector />
              <VoiceTranslator />
            </div>
          )}
          
          {activeTab === 'emergency' && (
            <div className="emergency-section">
              <EmergencyPhrases />
            </div>
          )}
          
          {activeTab === 'media' && (
            <div className="media-section">
              <MediaTranslator />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="settings-section">
              <Settings />
            </div>
          )}
        </main>
        
        <footer className="app-footer">
          <p>SpeakFlow - Application de traduction vocale pour sapeurs-pompiers</p>
        </footer>
      </div>
    </TranslationProvider>
  );
}

export default App;
