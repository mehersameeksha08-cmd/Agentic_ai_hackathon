// src/components/Quality/QualityIssueCard.jsx
import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  FileCode,
  Copy,
  Sliders,
  CheckCircle2
} from 'lucide-react';

const ISSUE_ICONS = {
  email: Mail,
  phone: Phone,
  address: MapPin,
  formatting: FileCode,
  duplicate: Copy,
  conflict: Sliders,
  default: AlertTriangle
};

export default function QualityIssueCard({ title, count, type = "default", severity = "medium", description }) {
  const Icon = ISSUE_ICONS[type] || ISSUE_ICONS.default;

  const severityClasses = {
    high: "severity-high",
    medium: "severity-medium",
    low: "severity-low",
    resolved: "severity-resolved"
  };

  return (
    <div className={`quality-issue-card ${severityClasses[severity] || 'severity-medium'}`}>
      <div className="issue-card-top">
        <div className="issue-icon-wrap">
          <Icon size={18} />
        </div>
        <span className="issue-count-badge">{count}</span>
      </div>

      <div className="issue-info">
        <h4 className="issue-title">{title}</h4>
        {description && <p className="issue-desc">{description}</p>}
      </div>

      <div className="issue-footer">
        <span className="severity-indicator">
          {severity === 'resolved' ? (
            <>
              <CheckCircle2 size={13} />
              <span>Resolved</span>
            </>
          ) : (
            <>
              <span className="sev-dot" />
              <span>{severity === 'high' ? 'High Impact' : severity === 'medium' ? 'Attention' : 'Minor'}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
