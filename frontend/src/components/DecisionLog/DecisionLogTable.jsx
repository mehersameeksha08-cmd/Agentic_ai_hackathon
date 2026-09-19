// src/components/DecisionLog/DecisionLogTable.jsx
import React, { useState } from 'react';
import { Filter, Download } from 'lucide-react';
import DataTable from '../Common/DataTable';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import { downloadDecisionReport } from '../../utils/download';
import { useCleanup } from '../../context/CleanupContext';

export default function DecisionLogTable({ logEntries = [] }) {
  const { summaryStats, showToast } = useCleanup();
  const [decisionFilter, setDecisionFilter] = useState("ALL");

  const filteredEntries = logEntries.filter(entry => {
    if (decisionFilter === "ALL") return true;
    return entry.decision === decisionFilter;
  });

  const columns = [
    {
      key: "timestamp",
      header: "Timestamp",
      width: "150px",
      render: (val) => <span className="time-code">{val}</span>
    },
    {
      key: "record_a",
      header: "Record A",
      render: (val) => <strong>{val}</strong>
    },
    {
      key: "record_b",
      header: "Record B",
      render: (val) => <strong>{val}</strong>
    },
    {
      key: "decision",
      header: "Decision",
      width: "130px",
      render: (val) => <Badge variant={val}>{val}</Badge>
    },
    {
      key: "confidence",
      header: "Confidence",
      width: "90px",
      render: (val) => <strong>{val}</strong>
    },
    {
      key: "matching_fields",
      header: "Matching Fields",
      render: (val) => <span className="log-fields-text">{val}</span>
    },
    {
      key: "conflicts",
      header: "Conflicting Fields",
      render: (val) => (
        <span className={val !== "None" ? "text-conflict" : "text-muted"}>
          {val}
        </span>
      )
    },
    {
      key: "reason",
      header: "Investigation Reason",
      render: (val) => (
        <p className="log-reason-cell" title={val}>
          {val}
        </p>
      )
    },
    {
      key: "action",
      header: "System Action",
      render: (val) => <span className="action-tag">{val}</span>
    }
  ];

  const handleExportLog = () => {
    downloadDecisionReport(logEntries, summaryStats, "decision_audit_log.txt");
    showToast("Audit decision report downloaded.", "success");
  };

  return (
    <div className="decision-log-component">
      <div className="decision-log-top-bar">
        <div className="filter-group">
          <div className="filter-title">
            <Filter size={15} />
            <span>Filter Decision:</span>
          </div>
          {["ALL", "MERGE", "KEEP SEPARATE", "FLAGGED"].map((opt) => (
            <button
              key={opt}
              className={`filter-btn-tab ${decisionFilter === opt ? 'active' : ''}`}
              onClick={() => setDecisionFilter(opt)}
            >
              {opt === "ALL" ? `All Entries (${logEntries.length})` : opt}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={handleExportLog}
        >
          Export Decision Log
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredEntries}
        searchPlaceholder="Search audit log by customer ID, name, or keywords..."
        defaultPageSize={10}
        emptyTitle="No decision log entries"
        emptyDescription="Audit records will be recorded here as duplicate candidate decisions are evaluated."
      />
    </div>
  );
}
