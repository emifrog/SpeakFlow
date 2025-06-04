// Service de gestion des notifications push

// Fonction pour demander la permission de notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Ce navigateur ne prend pas en charge les notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Fonction pour s'abonner aux notifications push
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Les notifications push ne sont pas prises en charge par ce navigateur');
      return null;
    }
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VITE_PUBLIC_VAPID_KEY || '')
    });
    
    // Ici, vous enverriez normalement la subscription à votre serveur backend
    console.log('Abonnement aux notifications push réussi:', subscription);
    
    return subscription;
  } catch (error) {
    console.error('Erreur lors de l\'abonnement aux notifications push:', error);
    return null;
  }
};

// Fonction pour se désabonner des notifications push
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return true;
    }
    
    const success = await subscription.unsubscribe();
    
    // Ici, vous informeriez normalement votre serveur backend
    console.log('Désabonnement des notifications push réussi');
    
    return success;
  } catch (error) {
    console.error('Erreur lors du désabonnement des notifications push:', error);
    return false;
  }
};

// Fonction pour vérifier l'état de l'abonnement aux notifications push
export const checkPushNotificationSubscription = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return !!subscription;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'abonnement aux notifications push:', error);
    return false;
  }
};

// Fonction utilitaire pour convertir la clé VAPID en Uint8Array
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};
