import axios from 'axios';
import { googleCloudConfig, isGoogleCloudConfigured } from '../config/googleCloud';

// Interface pour la réponse OCR
interface OCRResponse {
  text: string;
  language?: string;
  error?: string;
}

/**
 * Extrait le texte d'une image en utilisant l'API Google Cloud Vision
 * @param imageFile - Fichier image à analyser
 * @returns Texte extrait de l'image et langue détectée
 */
export const extractTextFromImage = async (imageFile: File): Promise<OCRResponse> => {
  try {
    // Vérifier si l'application est hors ligne
    if (navigator.onLine === false) {
      return { 
        text: '', 
        error: 'La reconnaissance de texte n\'est pas disponible en mode hors ligne' 
      };
    }

    // Vérifier si la configuration Google Cloud est disponible
    if (!isGoogleCloudConfigured()) {
      throw new Error('La configuration Google Cloud n\'est pas disponible');
    }

    // Convertir l'image en base64
    const base64Image = await fileToBase64(imageFile);
    
    // Préparer la requête pour l'API Vision
    const requestData = {
      requests: [
        {
          image: {
            content: base64Image.split(',')[1] // Enlever le préfixe "data:image/jpeg;base64,"
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    };

    // Appel à l'API Google Cloud Vision
    const response = await axios.post(
      `${googleCloudConfig.vision.endpoint}/images:annotate`,
      requestData,
      {
        params: {
          key: googleCloudConfig.apiKey,
        },
      }
    );

    // Extraire le texte et la langue détectée
    const result = response.data.responses[0];
    
    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      return { 
        text: '', 
        error: 'Aucun texte détecté dans l\'image' 
      };
    }

    return {
      text: result.textAnnotations[0].description,
      language: result.textAnnotations[0].locale
    };
  } catch (error) {
    console.error('Erreur lors de l\'extraction de texte:', error);
    return {
      text: '',
      error: `Erreur lors de l'extraction de texte: ${(error as Error).message}`
    };
  }
};

/**
 * Convertit un fichier en chaîne base64
 * @param file - Fichier à convertir
 * @returns Chaîne base64 représentant le fichier
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Analyse une image et traduit le texte détecté
 * @param imageFile - Fichier image à analyser
 * @param targetLanguage - Langue cible pour la traduction
 * @returns Texte extrait et traduit
 */
export const analyzeAndTranslateImage = async (
  imageFile: File,
  targetLanguage: string
): Promise<{ originalText: string; translatedText: string; detectedLanguage?: string; error?: string }> => {
  try {
    // Extraire le texte de l'image
    const ocrResult = await extractTextFromImage(imageFile);
    
    if (ocrResult.error || !ocrResult.text) {
      return {
        originalText: '',
        translatedText: '',
        error: ocrResult.error || 'Aucun texte détecté'
      };
    }

    // Importer dynamiquement le service de traduction pour éviter les dépendances circulaires
    const { translateText } = await import('./googleTranslationService');
    
    // Traduire le texte extrait
    const translationResult = await translateText(
      ocrResult.text,
      ocrResult.language || 'auto',
      targetLanguage,
      true
    );

    return {
      originalText: ocrResult.text,
      translatedText: translationResult.translatedText,
      detectedLanguage: ocrResult.language || translationResult.detectedLanguage
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse et traduction de l\'image:', error);
    return {
      originalText: '',
      translatedText: '',
      error: `Erreur: ${(error as Error).message}`
    };
  }
};
