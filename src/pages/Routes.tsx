import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import TranslatePage from './TranslatePage';
import EmergencyPage from './EmergencyPage';
import MediaPage from './MediaPage';
import SettingsPage from './SettingsPage';

const AppRoutes: React.FC = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/translate" replace />} />
        <Route path="/translate" element={<TranslatePage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/translate" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
