// Service pour la traduction de texte à partir de médias (images et documents)
import type { Language } from '../types';

// Interface pour les résultats de l'OCR
export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Interface pour les résultats de la traduction de médias
export interface MediaTranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

/**
 * Extrait le texte d'une image à l'aide de l'OCR
 * @param imageFile Fichier image à analyser
 * @param sourceLanguage Langue source (optionnel, pour améliorer la précision)
 * @returns Promesse avec les résultats OCR
 */
export const extractTextFromImage = async (
  imageFile: File,
  sourceLanguage?: string
): Promise<OCRResult[]> => {
  try {
    // Dans une implémentation réelle, nous utiliserions une API OCR comme Tesseract.js, Google Vision API, etc.
    // Pour cette démonstration, nous simulons un résultat OCR
    
    // Convertir l'image en base64 pour l'affichage
    const base64 = await fileToBase64(imageFile);
    
    // Simuler un délai de traitement OCR
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simuler un résultat OCR avec adaptation à la langue source si spécifiée
    const languageSpecificText = sourceLanguage === 'en' 
      ? "This is text extracted from the image" 
      : "Ceci est un texte extrait de l'image";
      
    const mockResult: OCRResult[] = [
      {
        text: languageSpecificText,
        confidence: 0.92,
        boundingBox: {
          x: 10,
          y: 10,
          width: 200,
          height: 50
        }
      }
    ];
    
    // Stocker l'image et le résultat dans le stockage local pour la démo
    localStorage.setItem('lastProcessedImage', base64);
    localStorage.setItem('lastOCRResult', JSON.stringify(mockResult));
    
    return mockResult;
  } catch (error) {
    console.error('Erreur lors de l\'extraction de texte de l\'image:', error);
    throw error;
  }
};

/**
 * Extrait le texte d'un document (PDF, DOCX, etc.)
 * @param documentFile Fichier document à analyser
 * @returns Promesse avec le texte extrait
 */
export const extractTextFromDocument = async (
  documentFile: File
): Promise<string> => {
  try {
    // Dans une implémentation réelle, nous utiliserions une bibliothèque comme pdf.js, mammoth.js, etc.
    // Pour cette démonstration, nous simulons un résultat
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simuler un texte extrait en fonction du type de fichier
    const fileExtension = documentFile.name.split('.').pop()?.toLowerCase();
    let extractedText = '';
    
    switch (fileExtension) {
      case 'pdf':
        extractedText = "Ceci est un texte extrait d'un document PDF.";
        break;
      case 'docx':
      case 'doc':
        extractedText = "Ceci est un texte extrait d'un document Word.";
        break;
      case 'txt':
        // Pour les fichiers texte, on peut lire le contenu directement
        extractedText = await readTextFile(documentFile);
        break;
      default:
        extractedText = "Texte extrait du document.";
    }
    
    return extractedText;
  } catch (error) {
    console.error('Erreur lors de l\'extraction de texte du document:', error);
    throw error;
  }
};

/**
 * Traduit le texte extrait d'un média
 * @param text Texte à traduire
 * @param sourceLanguage Code de la langue source
 * @param targetLanguage Code de la langue cible
 * @returns Promesse avec le résultat de traduction
 */
export const translateMediaText = async (
  text: string,
  sourceLanguage: Language['code'],
  targetLanguage: Language['code']
): Promise<MediaTranslationResult> => {
  try {
    // Dans une implémentation réelle, nous utiliserions une API de traduction
    // Pour cette démonstration, nous simulons une traduction
    
    // Simuler un délai de traduction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler une traduction basique
    let translatedText = '';
    
    if (sourceLanguage === 'fr' && targetLanguage === 'en') {
      // Français vers Anglais
      translatedText = text
        .replace(/Ceci est/g, 'This is')
        .replace(/texte extrait/g, 'text extracted')
        .replace(/d'un document/g, 'from a document')
        .replace(/d'une image/g, 'from an image')
        .replace(/PDF/g, 'PDF')
        .replace(/Word/g, 'Word');
    } else if (sourceLanguage === 'en' && targetLanguage === 'fr') {
      // Anglais vers Français
      translatedText = text
        .replace(/This is/g, 'Ceci est')
        .replace(/text extracted/g, 'texte extrait')
        .replace(/from a document/g, 'd\'un document')
        .replace(/from an image/g, 'd\'une image');
    } else {
      // Pour les autres combinaisons de langues, on simule une traduction
      translatedText = `[${targetLanguage}] ${text}`;
    }
    
    // Créer et retourner le résultat
    const result: MediaTranslationResult = {
      originalText: text,
      translatedText,
      sourceLanguage,
      targetLanguage,
      timestamp: Date.now()
    };
    
    // Stocker le résultat dans le cache pour le mode hors ligne
    const cachedResults = JSON.parse(localStorage.getItem('mediaTranslationCache') || '[]');
    cachedResults.push(result);
    localStorage.setItem('mediaTranslationCache', JSON.stringify(cachedResults.slice(-10))); // Garder les 10 derniers résultats
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la traduction du texte:', error);
    throw error;
  }
};

// Fonctions utilitaires

/**
 * Convertit un fichier en base64
 * @param file Fichier à convertir
 * @returns Promesse avec la chaîne base64
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
 * Lit le contenu d'un fichier texte
 * @param file Fichier texte à lire
 * @returns Promesse avec le contenu du fichier
 */
const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
