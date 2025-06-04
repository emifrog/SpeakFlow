import React from 'react';
import Settings from '../components/Settings';
import PageTransition from '../components/PageTransition';

const SettingsPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="settings-section">
        <Settings />
      </div>
    </PageTransition>
  );
};

export default SettingsPage;
