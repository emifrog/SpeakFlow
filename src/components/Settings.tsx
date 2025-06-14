import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { requestNotificationPermission, checkPushNotificationSubscription, subscribeToPushNotifications, unsubscribeFromPushNotifications } from '../services/notificationService';
import { getCacheSize } from '../services/cacheService';
import './Settings.css';

const Settings: React.FC = () => {
  const {
    highVisibilityMode,
    offlineMode,
    notificationsEnabled,
    setHighVisibilityMode,
    setOfflineMode,
    setNotificationsEnabled
  } = useTranslation();
  
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({ entries: 0, sizeInBytes: 0, sizeFormatted: '0 octets' });
  const [cacheCleared, setCacheCleared] = useState(false);
  
  // Charger les informations sur le cache
  useEffect(() => {
    const updateCacheInfo = () => {
      const info = getCacheSize('translationCache');
      setCacheInfo(info);
    };
    
    updateCacheInfo();
    
    // Mettre à jour les informations sur le cache toutes les 5 secondes si la page est active
    const interval = setInterval(updateCacheInfo, 5000);
    
    return () => clearInterval(interval);
  }, [cacheCleared]);
  
  // Vérifier si les notifications sont supportées et l'état de l'abonnement
  useEffect(() => {
    const checkNotificationSupport = async () => {
      // Vérifier si les notifications sont supportées par le navigateur
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      setNotificationsSupported(supported);
      
      if (supported) {
        // Vérifier l'état actuel de l'abonnement
        const isSubscribed = await checkPushNotificationSubscription();
        setNotificationsEnabled(isSubscribed);
      }
    };
    
    checkNotificationSupport();
  }, [setNotificationsEnabled]);

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      // Désabonner l'utilisateur des notifications
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        setNotificationsEnabled(false);
      }
    } else {
      // Demander la permission et abonner l'utilisateur aux notifications
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        const subscription = await subscribeToPushNotifications();
        if (subscription) {
          setNotificationsEnabled(true);
        }
      }
    }
  };

  return (
    <div className="settings">
      <h2 className="settings-title">Paramètres</h2>
      
      <div className="settings-options">
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-name">Mode haute visibilité</h3>
            <p className="setting-description">
              Interface adaptée pour une utilisation dans des conditions difficiles
            </p>
          </div>
          
          <div className="setting-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={highVisibilityMode}
                onChange={() => setHighVisibilityMode(!highVisibilityMode)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-name">Mode hors ligne</h3>
            <p className="setting-description">
              Utiliser uniquement les traductions en cache (fonctionnalités limitées)
            </p>
          </div>
          
          <div className="setting-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={offlineMode}
                onChange={() => setOfflineMode(!offlineMode)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        {notificationsSupported && (
          <div className="setting-item">
            <div className="setting-info">
              <h3 className="setting-name">Notifications push</h3>
              <p className="setting-description">
                Recevez des alertes lorsque de nouvelles fonctionnalités ou mises à jour sont disponibles
              </p>
            </div>
            
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={handleNotificationToggle}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-name">Gestion du cache</h3>
            <p className="setting-description">
              Traductions stockées localement: {cacheInfo.entries} entrées ({cacheInfo.sizeFormatted})
            </p>
          </div>
          
          <button 
            className="clear-cache-button"
            onClick={() => {
              localStorage.removeItem('translationCache');
              setCacheCleared(prev => !prev); // Inverser pour déclencher la mise à jour
              alert('Cache de traduction effacé avec succès');
            }}
            disabled={cacheInfo.entries === 0}
          >
            Effacer
          </button>
        </div>
      </div>
      
      <div className="app-info">
        <h3 className="app-info-title">À propos de SpeakFlow</h3>
        <p className="app-version">Version 1.0.0</p>
        <p className="app-description">
          Application PWA de traduction vocale en temps réel conçue spécifiquement pour les sapeurs-pompiers.
        </p>
        <p className="copyright">© 2025 XRWeb - Tous droits réservés</p>
      </div>
    </div>
  );
};

export default Settings;
