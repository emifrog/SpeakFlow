import React, { useState, useRef } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { extractTextFromImage, extractTextFromDocument, translateMediaText } from '../services/mediaTranslationService';
import type { MediaTranslationResult, OCRResult } from '../services/mediaTranslationService';
import './MediaTranslator.css';

const MediaTranslator: React.FC = () => {
  const {
    sourceLanguage,
    targetLanguage,
    setSourceText,
    setTranslatedText,
    // offlineMode, // Commenté car non utilisé pour l'instant
  } = useTranslation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [translationResult, setTranslationResult] = useState<MediaTranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'image' | 'document'>('image');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gérer la sélection de fichier
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setCurrentFile(file);
    setError(null);
    setExtractedText('');
    setTranslationResult(null);

    // Créer une URL pour la prévisualisation si c'est une image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Déclencher le sélecteur de fichier
  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Extraire le texte du média
  const handleExtractText = async () => {
    if (!currentFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let text = '';

      if (currentFile.type.startsWith('image/')) {
        // Traitement d'image avec OCR
        const results = await extractTextFromImage(currentFile, sourceLanguage);
        setOcrResults(results);
        text = results.map(result => result.text).join(' ');
      } else {
        // Traitement de document
        text = await extractTextFromDocument(currentFile);
        setOcrResults([]);
      }

      setExtractedText(text);
      setSourceText(text);
    } catch (err) {
      console.error('Erreur lors de l\'extraction du texte:', err);
      setError('Erreur lors de l\'extraction du texte. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Traduire le texte extrait
  const handleTranslate = async () => {
    if (!extractedText) {
      setError('Aucun texte à traduire');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await translateMediaText(
        extractedText,
        sourceLanguage,
        targetLanguage
      );

      setTranslationResult(result);
      setTranslatedText(result.translatedText);
    } catch (err) {
      console.error('Erreur lors de la traduction:', err);
      setError('Erreur lors de la traduction. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Nettoyer les ressources lors du changement de fichier
  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCurrentFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setOcrResults([]);
    setTranslationResult(null);
    setError(null);
    setSourceText('');
    setTranslatedText('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="media-translator">
      <div className="media-tabs">
        <button 
          className={`media-tab ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          Images
        </button>
        <button 
          className={`media-tab ${activeTab === 'document' ? 'active' : ''}`}
          onClick={() => setActiveTab('document')}
        >
          Documents
        </button>
      </div>

      <div className="media-content">
        <div className="file-selection">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={activeTab === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
            style={{ display: 'none' }}
          />
          <button 
            className="select-file-btn"
            onClick={handleSelectFileClick}
          >
            {currentFile ? 'Changer de fichier' : `Sélectionner un ${activeTab === 'image' ? 'image' : 'document'}`}
          </button>
          {currentFile && (
            <span className="file-name">{currentFile.name}</span>
          )}
        </div>

        {previewUrl && (
          <div className="media-preview">
            <img src={previewUrl} alt="Aperçu" />
          </div>
        )}

        {currentFile && !isProcessing && !extractedText && (
          <button 
            className="extract-text-btn"
            onClick={handleExtractText}
          >
            Extraire le texte
          </button>
        )}

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Traitement en cours...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {extractedText && !isProcessing && !translationResult && (
          <div className="extracted-text-container">
            <h3>Texte extrait :</h3>
            <div className="extracted-text">
              {extractedText}
            </div>
            {activeTab === 'image' && ocrResults.length > 0 && (
              <div className="ocr-details">
                <h4>Détails OCR :</h4>
                <ul className="ocr-results-list">
                  {ocrResults.map((result, index) => (
                    <li key={index} className="ocr-result-item">
                      <span className="ocr-confidence">Confiance: {result.confidence.toFixed(2)}%</span>
                      {result.boundingBox && (
                        <span className="ocr-position">Position: {JSON.stringify(result.boundingBox)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button 
              className="translate-btn"
              onClick={handleTranslate}
            >
              Traduire
            </button>
          </div>
        )}

        {translationResult && (
          <div className="translation-result">
            <div className="result-section">
              <h3>Texte original ({translationResult.sourceLanguage}) :</h3>
              <div className="result-text">
                {translationResult.originalText}
              </div>
            </div>
            <div className="result-section">
              <h3>Traduction ({translationResult.targetLanguage}) :</h3>
              <div className="result-text">
                {translationResult.translatedText}
              </div>
            </div>
            <button 
              className="reset-btn"
              onClick={handleReset}
            >
              Nouveau fichier
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaTranslator;
