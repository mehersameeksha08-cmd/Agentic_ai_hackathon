// src/components/Layout/Layout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../Common/Toast';
import { useCleanup } from '../../context/CleanupContext';
import CleanupStepperModal from '../Dashboard/CleanupStepperModal';
import RecordComparisonModal from '../Review/RecordComparisonModal';
import SettingsModal from '../../pages/SettingsModal';
import HelpModal from '../../pages/HelpModal';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast, showToast, isSettingsOpen, setIsSettingsOpen, isHelpOpen, setIsHelpOpen } = useCleanup();

  return (
    <div className="app-shell">
      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main App Container */}
      <div className="app-main-wrapper">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="app-page-container">
          {children}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => showToast(null)} />}

      {/* Cleanup Stepper Progress Modal */}
      <CleanupStepperModal />

      {/* Record Comparison Modal for Review */}
      <RecordComparisonModal />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
