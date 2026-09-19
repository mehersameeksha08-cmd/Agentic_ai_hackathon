// src/pages/DashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  Database,
  Users,
  Merge,
  Split,
  AlertTriangle,
  AlertOctagon,
  Sliders,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Button from '../components/Common/Button';
import SummaryCard from '../components/Dashboard/SummaryCard';
import SafeMergeBanner from '../components/Dashboard/SafeMergeBanner';
import QualityScoreGauge from '../components/Quality/QualityScoreGauge';
import DuplicateTable from '../components/Duplicates/DuplicateTable';
import { useCleanup } from '../context/CleanupContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    summaryStats,
    qualityMetrics,
    duplicateCandidates,
    loadDemoData,
    runCleanupWorkflow
  } = useCleanup();

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <section className="dashboard-welcome-banner">
        <div className="welcome-text-content">
          <div className="welcome-tag">
            <Sparkles size={14} />
            <span>Autonomous Master Data Management</span>
          </div>
          <h2 className="welcome-title">Data Cleanup Agent</h2>
          <p className="welcome-description">
            Turn messy customer data into a clean, trustworthy master dataset — safely. Identify duplicate records, investigate ambiguous cases, and prevent unsafe merges when identifiers conflict.
          </p>
          <div className="welcome-actions">
            <Button
              variant="primary"
              size="md"
              icon={UploadCloud}
              onClick={() => navigate("/upload")}
            >
              Upload Data
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={Sparkles}
              onClick={loadDemoData}
            >
              Load Demo Dataset
            </Button>
          </div>
        </div>

        <div className="welcome-score-box">
          <QualityScoreGauge
            score={qualityMetrics?.initialScore || 72}
            targetScore={qualityMetrics?.cleanedScore || 94}
            isCleaned={true}
          />
        </div>
      </section>

      {/* Safe Merge Policy Banner */}
      <SafeMergeBanner />

      {/* Summary KPI Cards */}
      <section className="dashboard-kpi-section">
        <div className="section-header">
          <h3 className="section-title">Data Quality &amp; Deduplication Metrics</h3>
          <span className="section-subtitle">Real-time statistics across active customer records</span>
        </div>

        <div className="kpi-grid">
          <SummaryCard
            icon={Database}
            number={summaryStats.totalRecords}
            label="Total Records"
            description="Ingested customer entities"
            status="info"
            onClick={() => navigate("/dataset")}
          />
          <SummaryCard
            icon={Users}
            number={summaryStats.duplicateCandidates}
            label="Duplicate Candidates"
            description="Candidate pairs evaluated"
            status="neutral"
            onClick={() => navigate("/duplicates")}
          />
          <SummaryCard
            icon={Merge}
            number={summaryStats.recordsMerged}
            label="Records Merged"
            description="Safely consolidated duplicates"
            status="success"
            onClick={() => navigate("/dataset")}
          />
          <SummaryCard
            icon={Split}
            number={summaryStats.keptSeparate}
            label="Kept Separate"
            description="Preserved as distinct persons"
            status="info"
            onClick={() => navigate("/duplicates")}
          />
          <SummaryCard
            icon={AlertTriangle}
            number={summaryStats.flaggedForReview}
            label="Flagged for Review"
            description="Cases requiring human validation"
            status="warning"
            onClick={() => navigate("/review")}
          />
          <SummaryCard
            icon={AlertOctagon}
            number={summaryStats.incompleteRecords}
            label="Incomplete Records"
            description="Missing email, phone, or address"
            status="neutral"
            onClick={() => navigate("/quality")}
          />
          <SummaryCard
            icon={Sliders}
            number={summaryStats.conflictingRecords}
            label="Conflicting Records"
            description="Clashing phone/address details"
            status="danger"
            onClick={() => navigate("/review")}
          />
        </div>
      </section>

      {/* Duplicate Candidates Quick Table Preview */}
      <section className="dashboard-candidates-preview">
        <div className="section-header-flex">
          <div>
            <h3 className="section-title">Recent Duplicate Candidate Investigations</h3>
            <p className="section-subtitle">Candidate pairs investigated by the autonomous reasoning agent</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate("/duplicates")}
          >
            View All ({duplicateCandidates.length})
          </Button>
        </div>

        <DuplicateTable candidates={duplicateCandidates.slice(0, 4)} />
      </section>
    </div>
  );
}
