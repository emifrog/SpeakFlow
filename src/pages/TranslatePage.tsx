import React from 'react';
import LanguageSelector from '../components/LanguageSelector';
import VoiceTranslator from '../components/VoiceTranslator';
import PageTransition from '../components/PageTransition';

const TranslatePage: React.FC = () => {
  return (
    <PageTransition>
      <div className="translate-section">
        <LanguageSelector />
        <VoiceTranslator />
      </div>
    </PageTransition>
  );
};

export default TranslatePage;
