import React from 'react';
import EmergencyPhrases from '../components/EmergencyPhrases';
import PageTransition from '../components/PageTransition';

const EmergencyPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="emergency-section">
        <EmergencyPhrases />
      </div>
    </PageTransition>
  );
};

export default EmergencyPage;
