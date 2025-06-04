import type { EmergencyPhrase } from '../types';

export const emergencyPhrases: EmergencyPhrase[] = [
  {
    id: 'pain',
    category: 'Médical',
    text: {
      fr: 'Où avez-vous mal ?',
      en: 'Where does it hurt?',
      es: '¿Dónde le duele?',
      de: 'Wo haben Sie Schmerzen?',
      it: 'Dove fa male?'
    }
  },
  {
    id: 'allergies',
    category: 'Médical',
    text: {
      fr: 'Avez-vous des allergies ?',
      en: 'Do you have any allergies?',
      es: '¿Tiene alguna alergia?',
      de: 'Haben Sie Allergien?',
      it: 'Ha qualche allergia?'
    }
  },
  {
    id: 'breathe',
    category: 'Médical',
    text: {
      fr: 'Pouvez-vous respirer normalement ?',
      en: 'Can you breathe normally?',
      es: '¿Puede respirar normalmente?',
      de: 'Können Sie normal atmen?',
      it: 'Può respirare normalmente?'
    }
  },
  {
    id: 'stay_calm',
    category: 'Sécurité',
    text: {
      fr: 'Restez calme, nous sommes là pour vous aider.',
      en: 'Stay calm, we are here to help you.',
      es: 'Mantenga la calma, estamos aquí para ayudarle.',
      de: 'Bleiben Sie ruhig, wir sind hier, um Ihnen zu helfen.',
      it: 'Stia calmo, siamo qui per aiutarla.'
    }
  },
  {
    id: 'evacuate',
    category: 'Sécurité',
    text: {
      fr: 'Nous devons évacuer le bâtiment immédiatement.',
      en: 'We need to evacuate the building immediately.',
      es: 'Necesitamos evacuar el edificio inmediatamente.',
      de: 'Wir müssen das Gebäude sofort evakuieren.',
      it: 'Dobbiamo evacuare l\'edificio immediatamente.'
    }
  }
];
