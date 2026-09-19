// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CleanupProvider } from './context/CleanupContext';
import Layout from './components/Layout/Layout';

// Pages
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import QualityPage from './pages/QualityPage';
import DuplicatesPage from './pages/DuplicatesPage';
import ReviewPage from './pages/ReviewPage';
import DatasetPage from './pages/DatasetPage';
import DecisionLogPage from './pages/DecisionLogPage';

export default function App() {
  return (
    <CleanupProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/quality" element={<QualityPage />} />
            <Route path="/duplicates" element={<DuplicatesPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/dataset" element={<DatasetPage />} />
            <Route path="/decision-log" element={<DecisionLogPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CleanupProvider>
  );
}
