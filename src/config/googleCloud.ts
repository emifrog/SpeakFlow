// Configuration pour les services Google Cloud
export const googleCloudConfig = {
  // Clé API pour les services Google Cloud
  apiKey: process.env.GOOGLE_CLOUD_API_KEY || '',
  
  // ID du projet Google Cloud
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
  
  // Configuration pour la traduction
  translation: {
    endpoint: 'https://translation.googleapis.com/v2',
  },
  
  // Configuration pour la vision (OCR)
  vision: {
    endpoint: 'https://vision.googleapis.com/v1',
  },
  
  // Configuration pour la détection de langue
  languageDetection: {
    endpoint: 'https://translation.googleapis.com/v2/detect',
  }
};

// Vérification de la configuration
export const isGoogleCloudConfigured = (): boolean => {
  return !!googleCloudConfig.apiKey && !!googleCloudConfig.projectId;
};
