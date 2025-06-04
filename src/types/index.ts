// Types pour les langues supportées
export type Language = {
  code: string;
  name: string;
  flag: string;
};

// Phrases d'urgence prédéfinies
export type EmergencyPhrase = {
  id: string;
  category: string;
  text: {
    [key: string]: string;
  };
};
