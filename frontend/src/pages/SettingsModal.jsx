// src/pages/SettingsModal.jsx
import React, { useState } from 'react';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import { Sliders, Shield, Database, Save } from 'lucide-react';
import { useCleanup } from '../context/CleanupContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { showToast } = useCleanup();
  const [highThreshold, setHighThreshold] = useState(85);
  const [ambiguousThreshold, setAmbiguousThreshold] = useState(50);
  const [strictNamePolicy, setStrictNamePolicy] = useState(true);
  const [autoFlagConflicts, setAutoFlagConflicts] = useState(true);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || "http://localhost:8000");

  const handleSave = () => {
    showToast("System settings saved successfully.", "success");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agent & Engine Configuration"
      subtitle="Configure enterprise deduplication thresholds and safety guardrails"
      maxWidth="600px"
    >
      <div className="settings-modal-body">
        {/* Safety Policies */}
        <div className="settings-group">
          <div className="group-title-row">
            <Shield size={16} />
            <h4>Safe Merge Guardrails</h4>
          </div>

          <label className="settings-toggle-label">
            <input
              type="checkbox"
              checked={strictNamePolicy}
              onChange={(e) => setStrictNamePolicy(e.target.checked)}
            />
            <div className="toggle-text">
              <strong>Prohibit Name-Only Merging</strong>
              <span>Never merge two customers solely because their first and last names match.</span>
            </div>
          </label>

          <label className="settings-toggle-label">
            <input
              type="checkbox"
              checked={autoFlagConflicts}
              onChange={(e) => setAutoFlagConflicts(e.target.checked)}
            />
            <div className="toggle-text">
              <strong>Auto-Flag Identifier Conflicts</strong>
              <span>Automatically isolate candidate pairs with differing phone numbers or house numbers.</span>
            </div>
          </label>
        </div>

        {/* Confidence Thresholds */}
        <div className="settings-group">
          <div className="group-title-row">
            <Sliders size={16} />
            <h4>Deduplication Thresholds</h4>
          </div>

          <div className="slider-control">
            <div className="slider-label-row">
              <span>Automatic Merge Threshold:</span>
              <strong>{highThreshold}%</strong>
            </div>
            <input
              type="range"
              min="70"
              max="99"
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
            />
            <span className="slider-hint">Pairs scoring above this threshold with zero conflicts merge automatically.</span>
          </div>

          <div className="slider-control">
            <div className="slider-label-row">
              <span>Ambiguous Candidate Floor:</span>
              <strong>{ambiguousThreshold}%</strong>
            </div>
            <input
              type="range"
              min="30"
              max="65"
              value={ambiguousThreshold}
              onChange={(e) => setAmbiguousThreshold(Number(e.target.value))}
            />
            <span className="slider-hint">Pairs scoring between floor and merge threshold trigger AI investigation.</span>
          </div>
        </div>

        {/* Backend API URL */}
        <div className="settings-group">
          <div className="group-title-row">
            <Database size={16} />
            <h4>Backend Integration URL</h4>
          </div>

          <div className="api-url-input-wrap">
            <input
              type="text"
              className="text-input-field"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
            />
            <span className="input-hint-text">FastAPI server base URL (configured via VITE_API_URL).</span>
          </div>
        </div>

        <div className="settings-actions-footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </div>
    </Modal>
  );
}
