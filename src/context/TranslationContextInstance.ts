import { createContext } from 'react';
import type { TranslationContextType } from './TranslationContext';

// Création du contexte
export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);
