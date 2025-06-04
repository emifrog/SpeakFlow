import React from 'react';
import MediaTranslator from '../components/MediaTranslator';
import PageTransition from '../components/PageTransition';

const MediaPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="media-section">
        <MediaTranslator />
      </div>
    </PageTransition>
  );
};

export default MediaPage;
