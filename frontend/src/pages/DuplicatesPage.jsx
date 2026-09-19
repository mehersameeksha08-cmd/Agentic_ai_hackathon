// src/pages/DuplicatesPage.jsx
import React from 'react';
import { Database, Users, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import DuplicateTable from '../components/Duplicates/DuplicateTable';
import SafeMergeBanner from '../components/Dashboard/SafeMergeBanner';
import { useCleanup } from '../context/CleanupContext';

export default function DuplicatesPage() {
  const { duplicateCandidates, summaryStats } = useCleanup();

  // Categorize confidence tiers
  const highConfCount = duplicateCandidates.filter(c => c.confidence >= 0.85).length;
  const ambigCount = duplicateCandidates.filter(c => c.confidence >= 0.50 && c.confidence < 0.85).length;
  const lowConfCount = duplicateCandidates.filter(c => c.confidence < 0.50).length;

  return (
    <div className="duplicates-page">
      <div className="page-title-banner">
        <h2 className="page-heading">Duplicate Detection &amp; Candidate Investigations</h2>
        <p className="page-subheading">
          Deterministic pair generation and AI agent investigation for candidate duplicate customer profiles.
        </p>
      </div>

      {/* Summary Stat Widgets */}
      <div className="duplicates-summary-strip">
        <div className="dup-stat-card">
          <div className="dup-icon-box">
            <Database size={18} />
          </div>
          <div>
            <div className="dup-val">{summaryStats.totalRecords}</div>
            <div className="dup-lbl">Total Records</div>
          </div>
        </div>

        <div className="dup-stat-card">
          <div className="dup-icon-box">
            <Users size={18} />
          </div>
          <div>
            <div className="dup-val">{duplicateCandidates.length}</div>
            <div className="dup-lbl">Candidate Pairs</div>
          </div>
        </div>

        <div className="dup-stat-card stat-green">
          <div className="dup-icon-box">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="dup-val">{highConfCount}</div>
            <div className="dup-lbl">High Confidence</div>
          </div>
        </div>

        <div className="dup-stat-card stat-orange">
          <div className="dup-icon-box">
            <HelpCircle size={18} />
          </div>
          <div>
            <div className="dup-val">{ambigCount}</div>
            <div className="dup-lbl">Ambiguous Cases</div>
          </div>
        </div>

        <div className="dup-stat-card stat-blue">
          <div className="dup-icon-box">
            <XCircle size={18} />
          </div>
          <div>
            <div className="dup-val">{lowConfCount}</div>
            <div className="dup-lbl">Low Confidence</div>
          </div>
        </div>
      </div>

      {/* Duplicate Candidates Table */}
      <section className="dup-table-section">
        <DuplicateTable candidates={duplicateCandidates} />
      </section>

      <SafeMergeBanner />
    </div>
  );
}
