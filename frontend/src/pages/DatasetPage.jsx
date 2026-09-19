// src/pages/DatasetPage.jsx
import React from 'react';
import DatasetComparison from '../components/Dataset/DatasetComparison';
import CleanDatasetTable from '../components/Dataset/CleanDatasetTable';
import SafeMergeBanner from '../components/Dashboard/SafeMergeBanner';
import { useCleanup } from '../context/CleanupContext';

export default function DatasetPage() {
  const { cleanedDataset, summaryStats } = useCleanup();

  const totalCleaned = cleanedDataset.length;
  const mergedCount = summaryStats.recordsMerged;
  const unchangedCount = Math.max(0, totalCleaned - mergedCount);
  const affectedCount = summaryStats.recordsMerged + summaryStats.flaggedForReview;

  return (
    <div className="dataset-page">
      <div className="page-title-banner">
        <h2 className="page-heading">Clean Master Dataset &amp; Provenance</h2>
        <p className="page-subheading">
          Deduplicated single-source-of-truth golden records with complete audit trails and source system lineage.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="dataset-kpi-strip">
        <div className="dataset-kpi-card">
          <span className="kpi-label">Total Cleaned Records</span>
          <span className="kpi-number text-success">{totalCleaned}</span>
          <span className="kpi-hint">Golden master entities</span>
        </div>
        <div className="dataset-kpi-card">
          <span className="kpi-label">Records Merged</span>
          <span className="kpi-number text-primary">{mergedCount}</span>
          <span className="kpi-hint">Duplicates safely united</span>
        </div>
        <div className="dataset-kpi-card">
          <span className="kpi-label">Records Unchanged</span>
          <span className="kpi-number">{unchangedCount}</span>
          <span className="kpi-hint">Unique baseline profiles</span>
        </div>
        <div className="dataset-kpi-card">
          <span className="kpi-label">Records Affected</span>
          <span className="kpi-number text-warning">{affectedCount}</span>
          <span className="kpi-hint">Normalized or clustered</span>
        </div>
      </div>

      {/* Before / After Comparison */}
      <DatasetComparison />

      {/* Clean Dataset Table with Download Options */}
      <section className="master-table-section">
        <div className="section-header">
          <h3 className="section-title">Consolidated Master Records</h3>
          <span className="section-subtitle">Search, sort, and export the deduplicated customer catalog</span>
        </div>

        <CleanDatasetTable records={cleanedDataset} />
      </section>

      <SafeMergeBanner />
    </div>
  );
}
