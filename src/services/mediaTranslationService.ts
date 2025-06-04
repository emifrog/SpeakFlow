// Service pour la traduction de texte à partir de médias (images et documents)
import type { Language } from '../types';
import { googleCloudConfig, isGoogleCloudConfigured } from '../config/googleCloud';
import axios from 'axios';
import { translateText } from './googleTranslationService';

// Types pour l'API Google Cloud Vision
interface Vertex {
  x: number;
  y: number;
}

interface BoundingPoly {
  vertices: Vertex[];
}

interface TextAnnotation {
  description: string;
  boundingPoly?: BoundingPoly;
  confidence?: number;
}

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
 * Extrait le texte d'une image à l'aide de l'OCR avec Google Cloud Vision API
 * @param imageFile Fichier image à analyser
 * @param sourceLanguage Langue source (optionnel, pour améliorer la précision)
 * @returns Promesse avec les résultats OCR
 */
export const extractTextFromImage = async (
  imageFile: File,
  sourceLanguage?: string
): Promise<OCRResult[]> => {
  try {
    // Vérifier si l'application est hors ligne
    if (navigator.onLine === false) {
      throw new Error('La reconnaissance de texte n\'est pas disponible en mode hors ligne');
    }

    // Vérifier si la configuration Google Cloud est disponible
    if (!isGoogleCloudConfigured()) {
      throw new Error('La configuration Google Cloud n\'est pas disponible');
    }
    
    // Convertir l'image en base64
    const base64 = await fileToBase64(imageFile);
    
    // Préparer la requête pour l'API Vision
    const requestData = {
      requests: [
        {
          image: {
            content: base64.split(',')[1] // Enlever le préfixe "data:image/jpeg;base64,"
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 10
            }
          ],
          imageContext: sourceLanguage ? {
            languageHints: [sourceLanguage]
          } : undefined
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

    // Extraire les résultats de l'OCR
    const result = response.data.responses[0];
    
    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      return [];
    }

    // Convertir les résultats au format attendu
    const ocrResults: OCRResult[] = result.textAnnotations.map((annotation: TextAnnotation, index: number) => {
      // Le premier résultat contient le texte complet, les autres sont des mots individuels
      const confidence = annotation.confidence || (index === 0 ? 0.95 : 0.85);
      
      // Créer un boundingBox si disponible
      let boundingBox;
      if (annotation.boundingPoly && annotation.boundingPoly.vertices) {
        const vertices = annotation.boundingPoly.vertices;
        const minX = Math.min(...vertices.map((v: Vertex) => v.x || 0));
        const minY = Math.min(...vertices.map((v: Vertex) => v.y || 0));
        const maxX = Math.max(...vertices.map((v: Vertex) => v.x || 0));
        const maxY = Math.max(...vertices.map((v: Vertex) => v.y || 0));
        
        boundingBox = {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };
      }
      
      return {
        text: annotation.description,
        confidence: confidence * 100, // Convertir en pourcentage
        boundingBox
      };
    });
    
    // Stocker l'image et le résultat dans le stockage local pour la démo
    localStorage.setItem('lastProcessedImage', base64);
    localStorage.setItem('lastOCRResult', JSON.stringify(ocrResults));
    
    return ocrResults;
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
 * Traduit le texte extrait d'un média en utilisant l'API Google Cloud Translation
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
    // Si le texte est vide, retourner un résultat vide
    if (!text.trim()) {
      return {
        originalText: '',
        translatedText: '',
        sourceLanguage,
        targetLanguage,
        timestamp: Date.now()
      };
    }

    // Utiliser le service de traduction Google Cloud
    const translationResult = await translateText(
      text,
      sourceLanguage,
      targetLanguage,
      sourceLanguage === 'auto' // Utiliser la détection automatique si sourceLanguage est 'auto'
    );
    
    // Créer et retourner le résultat
    const result: MediaTranslationResult = {
      originalText: text,
      translatedText: translationResult.translatedText,
      sourceLanguage: translationResult.detectedLanguage || sourceLanguage,
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
