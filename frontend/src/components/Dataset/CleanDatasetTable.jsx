// src/components/Dataset/CleanDatasetTable.jsx
import React, { useState } from 'react';
import { Download, FileJson, FileText, Filter } from 'lucide-react';
import DataTable from '../Common/DataTable';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import { downloadJson, downloadCsv, downloadDecisionReport } from '../../utils/download';
import { useCleanup } from '../../context/CleanupContext';

export default function CleanDatasetTable({ records = [] }) {
  const { decisionLog, summaryStats, showToast } = useCleanup();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRecords = records.filter(rec => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "MERGED") return rec.record_status === "Merged" || rec.is_cleaned;
    if (statusFilter === "FLAGGED") return rec.record_status === "Flagged for Review";
    if (statusFilter === "PRESERVED") return rec.record_status === "Preserved";
    return true;
  });

  const columns = [
    {
      key: "master_id",
      header: "Master ID",
      width: "120px",
      render: (val, row) => (
        <div className="id-cell-group">
          <code className="master-id-code">{val}</code>
          {row.is_cleaned && (
            <Badge variant="CLEANED" size="sm">CLEANED</Badge>
          )}
        </div>
      )
    },
    {
      key: "name",
      header: "Canonical Name",
      render: (val) => <strong>{val}</strong>
    },
    {
      key: "email",
      header: "Email Address"
    },
    {
      key: "phone",
      header: "Phone Number"
    },
    {
      key: "address",
      header: "Street Address",
      render: (val, row) => (
        <span>{val ? `${val}, ${row.city || ''}` : row.city || '—'}</span>
      )
    },
    {
      key: "record_status",
      header: "Record Status",
      render: (val) => (
        <Badge variant={val}>
          {val}
        </Badge>
      )
    },
    {
      key: "sources",
      header: "Source Systems",
      render: (val) => (
        <div className="source-pill-group">
          {Array.isArray(val) ? val.map((s, i) => (
            <span key={i} className="source-mini-tag">{s}</span>
          )) : <span className="source-mini-tag">{val || "CRM"}</span>}
        </div>
      )
    },
    {
      key: "merged_ids",
      header: "Merged Records",
      render: (val) => (
        <div className="merged-ids-group">
          {Array.isArray(val) && val.length > 1 ? (
            val.map((id) => (
              <span key={id} className="merged-id-chip">{id}</span>
            ))
          ) : (
            <span className="no-merge-chip">Original ({val?.[0] || 'Single'})</span>
          )}
        </div>
      )
    }
  ];

  const handleCsvDownload = () => {
    downloadCsv(records, "clean_master_dataset.csv");
    showToast("Clean Master CSV downloaded.", "success");
  };

  const handleJsonDownload = () => {
    downloadJson(records, "clean_master_dataset.json");
    showToast("Clean Master JSON downloaded.", "success");
  };

  const handleReportDownload = () => {
    downloadDecisionReport(decisionLog, summaryStats, "deduplication_audit_report.txt");
    showToast("Decision Audit Report downloaded.", "success");
  };

  return (
    <div className="clean-dataset-table-component">
      {/* Top Action & Export Bar */}
      <div className="dataset-actions-header">
        <div className="filter-tabs-row">
          <div className="filter-title">
            <Filter size={15} />
            <span>Filter:</span>
          </div>
          {["ALL", "MERGED", "FLAGGED", "PRESERVED"].map((opt) => (
            <button
              key={opt}
              className={`filter-btn-tab ${statusFilter === opt ? 'active' : ''}`}
              onClick={() => setStatusFilter(opt)}
            >
              {opt === "ALL" ? `All (${records.length})` : opt}
            </button>
          ))}
        </div>

        <div className="download-buttons-group">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleCsvDownload}
          >
            Download Clean CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={FileJson}
            onClick={handleJsonDownload}
          >
            Download Clean JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={FileText}
            onClick={handleReportDownload}
          >
            Download Decision Report
          </Button>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredRecords}
        searchPlaceholder="Search master records by name, email, phone, or ID..."
        defaultPageSize={10}
        emptyTitle="No clean records found"
        emptyDescription="Execute the cleanup agent workflow to generate the master dataset."
      />
    </div>
  );
}
