// src/components/Duplicates/EvidenceList.jsx
import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

export default function EvidenceList({ evidence = [], conflicts = [], reason }) {
  return (
    <div className="evidence-panel">
      {reason && (
        <div className="evidence-reason-block">
          <strong>AI Investigation Rationale:</strong>
          <p>{reason}</p>
        </div>
      )}

      <div className="evidence-split-grid">
        {/* Positive Matches */}
        {evidence && evidence.length > 0 && (
          <div className="evidence-list-box positive">
            <div className="evidence-header-tag">
              <Check size={14} />
              <span>Supporting Evidence</span>
            </div>
            <ul className="evidence-bullets">
              {evidence.map((item, idx) => (
                <li key={idx}>
                  <span className="bullet-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conflicts */}
        {conflicts && conflicts.length > 0 && (
          <div className="evidence-list-box negative">
            <div className="evidence-header-tag">
              <AlertTriangle size={14} />
              <span>Conflicting Signals</span>
            </div>
            <ul className="evidence-bullets">
              {conflicts.map((item, idx) => (
                <li key={idx}>
                  <span className="bullet-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
