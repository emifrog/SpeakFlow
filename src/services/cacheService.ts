/**
 * Service de gestion du cache optimisé pour SpeakFlow
 * Implémente une stratégie LRU (Least Recently Used) et limite la taille des données
 */

// Configuration du cache
const CACHE_CONFIG = {
  // Nombre maximum d'entrées dans le cache
  MAX_ENTRIES: 100,
  
  // Taille maximale du texte à mettre en cache (en caractères)
  MAX_TEXT_LENGTH: 500,
  
  // Durée de vie des entrées du cache (en millisecondes) - 7 jours par défaut
  EXPIRATION_TIME: 7 * 24 * 60 * 60 * 1000,
  
  // Taille maximale du localStorage (en octets, environ 5MB)
  MAX_STORAGE_SIZE: 5 * 1024 * 1024
};

// Interface pour les entrées du cache
export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  lastAccessed: number;
}

/**
 * Classe de gestion du cache avec limite de taille et stratégie LRU
 */
export class OptimizedCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private storageKey: string;
  
  constructor(storageKey: string) {
    this.cache = new Map<string, CacheEntry<T>>();
    this.storageKey = storageKey;
    this.loadFromStorage();
  }
  
  /**
   * Récupère une entrée du cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > CACHE_CONFIG.EXPIRATION_TIME) {
      this.delete(key);
      return null;
    }
    
    // Mettre à jour la date de dernier accès (pour LRU)
    entry.lastAccessed = Date.now();
    this.cache.set(key, entry);
    
    return entry.value;
  }
  
  /**
   * Ajoute ou met à jour une entrée dans le cache
   */
  set(key: string, value: T): void {
    // Vérifier si le cache est plein avant d'ajouter une nouvelle entrée
    if (!this.cache.has(key) && this.cache.size >= CACHE_CONFIG.MAX_ENTRIES) {
      this.evictLRU();
    }
    
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    };
    
    this.cache.set(key, entry);
    this.saveToStorage();
  }
  
  /**
   * Supprime une entrée du cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }
  
  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }
  
  /**
   * Supprime l'entrée la moins récemment utilisée (LRU)
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return;
    
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    
    // Trouver l'entrée la moins récemment utilisée
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    // Supprimer l'entrée la plus ancienne
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  
  /**
   * Charge le cache depuis le localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData) as Record<string, CacheEntry<T>>;
        
        // Convertir l'objet en Map et filtrer les entrées expirées
        const now = Date.now();
        Object.entries(parsedData).forEach(([key, entry]) => {
          if (now - entry.timestamp <= CACHE_CONFIG.EXPIRATION_TIME) {
            this.cache.set(key, entry);
          }
        });
        
        console.log(`Cache '${this.storageKey}' chargé avec ${this.cache.size} entrées valides`);
      }
    } catch (error) {
      console.error(`Erreur lors du chargement du cache '${this.storageKey}':`, error);
      // En cas d'erreur, réinitialiser le cache
      this.cache.clear();
    }
  }
  
  /**
   * Sauvegarde le cache dans le localStorage
   */
  private saveToStorage(): void {
    try {
      // Convertir la Map en objet pour le stockage
      const cacheObject: Record<string, CacheEntry<T>> = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      const serialized = JSON.stringify(cacheObject);
      
      // Vérifier la taille avant de sauvegarder
      if (serialized.length > CACHE_CONFIG.MAX_STORAGE_SIZE) {
        // Si le cache est trop grand, supprimer la moitié des entrées les plus anciennes
        this.reduceCache();
        return this.saveToStorage(); // Réessayer après réduction
      }
      
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du cache '${this.storageKey}':`, error);
      
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' || 
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        // Si l'erreur est due à un dépassement de quota, réduire le cache
        this.reduceCache();
      }
    }
  }
  
  /**
   * Réduit la taille du cache en supprimant les entrées les plus anciennes
   */
  private reduceCache(): void {
    // Trier les entrées par date de dernier accès
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Supprimer la moitié des entrées les plus anciennes
    const entriesToRemove = Math.ceil(entries.length / 2);
    for (let i = 0; i < entriesToRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    console.log(`Cache '${this.storageKey}' réduit: ${entriesToRemove} entrées supprimées`);
  }
  
  /**
   * Retourne le nombre d'entrées dans le cache
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Fonction utilitaire pour tronquer un texte à une longueur maximale
 */
export const truncateText = (text: string, maxLength: number = CACHE_CONFIG.MAX_TEXT_LENGTH): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength);
};

/**
 * Fonction utilitaire pour estimer la taille en octets d'une chaîne
 */
export const estimateStringSize = (str: string): number => {
  // Une approximation grossière: chaque caractère prend environ 2 octets en UTF-16
  return str.length * 2;
};

/**
 * Fonction utilitaire pour vérifier si le localStorage est disponible
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    // Ignorer l'erreur et retourner false
    return false;
  }
};

// Exporter la configuration pour permettre des ajustements
export const getCacheConfig = () => ({ ...CACHE_CONFIG });

/**
 * Calcule et retourne la taille approximative du cache en octets
 */
export const getCacheSize = (storageKey: string): { entries: number; sizeInBytes: number; sizeFormatted: string } => {
  try {
    const data = localStorage.getItem(storageKey);
    const entries = data ? Object.keys(JSON.parse(data)).length : 0;
    const sizeInBytes = data ? estimateStringSize(data) : 0;
    
    // Formater la taille en KB ou MB
    let sizeFormatted = '';
    if (sizeInBytes < 1024) {
      sizeFormatted = `${sizeInBytes} octets`;
    } else if (sizeInBytes < 1024 * 1024) {
      sizeFormatted = `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      sizeFormatted = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    
    return { entries, sizeInBytes, sizeFormatted };
  } catch {
    return { entries: 0, sizeInBytes: 0, sizeFormatted: '0 octets' };
  }
};
