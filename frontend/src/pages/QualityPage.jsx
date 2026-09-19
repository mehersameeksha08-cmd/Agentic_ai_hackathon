// src/pages/QualityPage.jsx
import React from 'react';
import QualityScoreGauge from '../components/Quality/QualityScoreGauge';
import QualityIssueCard from '../components/Quality/QualityIssueCard';
import FieldHealthTable from '../components/Quality/FieldHealthTable';
import SafeMergeBanner from '../components/Dashboard/SafeMergeBanner';
import { useCleanup } from '../context/CleanupContext';

export default function QualityPage() {
  const { qualityMetrics, summaryStats } = useCleanup();

  const issues = qualityMetrics?.issues || {
    emailIssues: 24,
    phoneIssues: 17,
    missingAddresses: 31,
    formattingIssues: 52,
    conflictingFields: 15,
    duplicateValues: 42,
    missingEmail: 8,
    missingPhone: 6,
    invalidEmail: 16,
    invalidPhone: 11
  };

  const fields = qualityMetrics?.fieldHealth || [];

  return (
    <div className="quality-page">
      <div className="page-title-banner">
        <h2 className="page-heading">Customer Data Quality Health</h2>
        <p className="page-subheading">
          Automated data validation audit inspecting incomplete values, formatting irregularities, and conflicting attributes.
        </p>
      </div>

      {/* Top Quality Score Banner */}
      <div className="quality-top-overview">
        <QualityScoreGauge
          score={qualityMetrics?.initialScore || 72}
          targetScore={qualityMetrics?.cleanedScore || 94}
          isCleaned={true}
        />

        <div className="quality-summary-text-box">
          <h4>Health Audit Insights</h4>
          <p>
            The ingestion agent evaluated <strong>{summaryStats.totalRecords} records</strong> and identified <strong>{issues.formattingIssues + issues.emailIssues} formatting and syntax anomalies</strong>.
          </p>
          <p>
            Standardizing address suffixes (e.g. <code>12 Lake Rd</code> $\to$ <code>12 Lake Road</code>) and phone digits resolves <strong>{issues.formattingIssues} formatting inconsistencies</strong> without data loss.
          </p>
          <div className="audit-provenance-pill">
            <span>Deterministic Normalization Engine Active</span>
          </div>
        </div>
      </div>

      {/* Quality Issue Cards */}
      <section className="quality-cards-section">
        <div className="section-header">
          <h3 className="section-title">Detected Issue Categories</h3>
          <span className="section-subtitle">Issues identified across email, phone, address, and duplicate dimensions</span>
        </div>

        <div className="quality-cards-grid">
          <QualityIssueCard
            title="Missing Email"
            count={issues.missingEmail || 8}
            type="email"
            severity="medium"
            description="Records lacking contact email addresses."
          />
          <QualityIssueCard
            title="Missing Phone"
            count={issues.missingPhone || 6}
            type="phone"
            severity="medium"
            description="Records missing primary telephone numbers."
          />
          <QualityIssueCard
            title="Missing Address"
            count={issues.missingAddresses || 31}
            type="address"
            severity="high"
            description="Incomplete street or residential addresses."
          />
          <QualityIssueCard
            title="Invalid Email Format"
            count={issues.invalidEmail || 16}
            type="email"
            severity="high"
            description="Malformed domains or syntax errors."
          />
          <QualityIssueCard
            title="Invalid Phone Format"
            count={issues.invalidPhone || 11}
            type="phone"
            severity="medium"
            description="Non-standard digit lengths or missing area codes."
          />
          <QualityIssueCard
            title="Formatting Issues"
            count={issues.formattingIssues || 52}
            type="formatting"
            severity="low"
            description="Whitespace, casing, or unexpanded abbreviations."
          />
          <QualityIssueCard
            title="Duplicate Values"
            count={issues.duplicateValues || 42}
            type="duplicate"
            severity="high"
            description="Redundant records sharing primary identifiers."
          />
          <QualityIssueCard
            title="Conflicting Fields"
            count={issues.conflictingFields || 15}
            type="conflict"
            severity="high"
            description="Clashing phone numbers or different street numbers."
          />
        </div>
      </section>

      {/* Field Health Breakdown Table */}
      <FieldHealthTable fields={fields} />

      <SafeMergeBanner />
    </div>
  );
}
