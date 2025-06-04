// Déclarations de types pour les modules de données
declare module '../data/languages' {
  import { Language } from '../types';
  export const supportedLanguages: Language[];
}

declare module '../data/emergencyPhrases' {
  import { EmergencyPhrase } from '../types';
  export const emergencyPhrases: EmergencyPhrase[];
}
