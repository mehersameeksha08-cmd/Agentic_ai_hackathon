// src/components/Dashboard/SafeMergeBanner.jsx
import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function SafeMergeBanner() {
  return (
    <div className="safe-merge-banner">
      <div className="banner-icon-side">
        <ShieldCheck size={24} className="banner-shield" />
      </div>
      <div className="banner-text-side">
        <h4 className="banner-title">Safe Merge Policy Enforcement</h4>
        <p className="banner-description">
          Records should not be merged solely because their names match. Conflicting important identifiers (such as differing phone numbers, street addresses, or distinct emails) are automatically isolated and flagged for human review to prevent irreversible data corruption.
        </p>
      </div>
      <div className="banner-tag">
        <Info size={14} />
        <span>Enterprise Guarantee</span>
      </div>
    </div>
  );
}
