import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { TranslationProvider } from './context/TranslationContextProvider';
import AppHeader from './components/AppHeader';
import AppRoutes from './pages/Routes';
import BottomNavigation from './components/BottomNavigation';
import './App.css';

function App() {
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
    <Router>
      <TranslationProvider>
        <div className="app">
          <AppHeader />
          
          {!isOnline && (
            <div className="offline-banner">
              Mode hors ligne - Fonctionnalités limitées disponibles
            </div>
          )}
          
          <main className="app-content">
            <AppRoutes />
          </main>
        
          <BottomNavigation />
          
          <footer className="app-footer">
            <p>SpeakFlow - Application de traduction vocale pour sapeurs-pompiers</p>
          </footer>
        </div>
      </TranslationProvider>
    </Router>
  );
}

export default App;
