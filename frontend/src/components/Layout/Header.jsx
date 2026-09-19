// src/components/Layout/Header.jsx
import React from 'react';
import { Menu, FileSpreadsheet, Sparkles, User, RefreshCw } from 'lucide-react';
import { useCleanup } from '../../context/CleanupContext';

export default function Header({ onMenuClick }) {
  const { selectedFile, isProcessing, reviewCases, cleanedDataset, loadDemoData } = useCleanup();

  let statusBadge = { label: "Ready", className: "status-ready" };
  if (isProcessing) {
    statusBadge = { label: "Processing...", className: "status-processing" };
  } else if (reviewCases.length > 0) {
    statusBadge = { label: `${reviewCases.length} Cases to Review`, className: "status-attention" };
  } else if (cleanedDataset.length > 0) {
    statusBadge = { label: "Cleaned Master Ready", className: "status-cleaned" };
  }

  return (
    <header className="app-top-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-titles">
          <div className="header-title-row">
            <h1 className="header-main-title">Data Cleanup Agent</h1>
            <span className="header-ai-pill">
              <Sparkles size={12} />
              <span>AI-Powered</span>
            </span>
          </div>
          <p className="header-subtitle">
            AI-powered customer data quality &amp; deduplication
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Active Dataset File Badge */}
        {selectedFile && (
          <div className="active-file-chip" title={`Current Dataset: ${selectedFile.name}`}>
            <FileSpreadsheet size={15} className="file-chip-icon" />
            <span className="file-chip-name">{selectedFile.name}</span>
            <span className="file-chip-count">({selectedFile.recordsCount} records)</span>
          </div>
        )}

        {/* Processing / Session Status */}
        <div className={`status-pill ${statusBadge.className}`}>
          <span className="status-dot" />
          <span>{statusBadge.label}</span>
        </div>

        {/* Quick Reload Demo button */}
        <button
          className="header-icon-action"
          onClick={loadDemoData}
          title="Reset to Demo Dataset"
          aria-label="Reload Demo Dataset"
        >
          <RefreshCw size={16} />
        </button>

        {/* User Profile Avatar Placeholder */}
        <div className="header-user-avatar" title="Data Steward Profile">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
