// src/components/Duplicates/DuplicateTable.jsx
import React, { useState } from 'react';
import { Eye, CheckCircle, AlertTriangle, XCircle, Filter } from 'lucide-react';
import Badge from '../Common/Badge';
import ConfidenceBadge from './ConfidenceBadge';
import EvidenceList from './EvidenceList';
import Button from '../Common/Button';
import { useCleanup } from '../../context/CleanupContext';

export default function DuplicateTable({ candidates = [] }) {
  const { setActiveComparisonCase } = useCleanup();
  const [filterDecision, setFilterDecision] = useState("ALL");
  const [expandedRow, setExpandedRow] = useState(null);

  const filteredCandidates = candidates.filter(c => {
    if (filterDecision === "ALL") return true;
    return c.decision === filterDecision;
  });

  return (
    <div className="duplicate-table-component">
      {/* Filter Tabs */}
      <div className="table-filter-bar">
        <div className="filter-label">
          <Filter size={15} />
          <span>Filter by Decision:</span>
        </div>
        <div className="filter-buttons-group">
          {["ALL", "MERGE", "FLAGGED", "KEEP SEPARATE"].map((opt) => (
            <button
              key={opt}
              className={`filter-tab-btn ${filterDecision === opt ? 'active' : ''}`}
              onClick={() => setFilterDecision(opt)}
            >
              {opt === "ALL" ? `All Pairs (${candidates.length})` : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      <div className="table-scroll-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Record A</th>
              <th>Record B</th>
              <th>Matching Fields</th>
              <th>Conflicts</th>
              <th>Confidence</th>
              <th>Decision</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((cand) => {
              const isExpanded = expandedRow === cand.id;

              return (
                <React.Fragment key={cand.id}>
                  <tr className="table-row">
                    <td>
                      <div className="record-cell">
                        <span className="record-id-tag">{cand.customer_id_1}</span>
                        <span className="record-name-text">{cand.customer1?.name || "Customer A"}</span>
                        <span className="record-sub-text">{cand.customer1?.city || ""}</span>
                      </div>
                    </td>
                    <td>
                      <div className="record-cell">
                        <span className="record-id-tag">{cand.customer_id_2}</span>
                        <span className="record-name-text">{cand.customer2?.name || "Customer B"}</span>
                        <span className="record-sub-text">{cand.customer2?.city || ""}</span>
                      </div>
                    </td>
                    <td>
                      <div className="field-tags-wrap">
                        {cand.matching_fields && cand.matching_fields.map((mf, i) => (
                          <span key={i} className="chip-match">
                            <CheckCircle size={11} />
                            <span>{mf}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="field-tags-wrap">
                        {cand.conflicts && cand.conflicts.length > 0 ? (
                          cand.conflicts.map((cf, i) => (
                            <span key={i} className="chip-conflict">
                              <AlertTriangle size={11} />
                              <span>{cf}</span>
                            </span>
                          ))
                        ) : (
                          <span className="no-conflict-label">None detected</span>
                        )}
                      </div>
                    </td>
                    <td style={{ minWidth: "150px" }}>
                      <ConfidenceBadge confidence={cand.confidence} />
                    </td>
                    <td>
                      <Badge variant={cand.decision}>
                        {cand.decision}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row-actions-group">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => setActiveComparisonCase(cand)}
                        >
                          Review
                        </Button>
                        <button
                          className="toggle-expand-btn"
                          onClick={() => setExpandedRow(isExpanded ? null : cand.id)}
                          title="Toggle AI Evidence & Reasoning"
                        >
                          {isExpanded ? "Hide Details" : "Details"}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Evidence & Reason Row */}
                  {isExpanded && (
                    <tr className="expanded-details-tr">
                      <td colSpan={7}>
                        <div className="expanded-evidence-box">
                          <EvidenceList
                            evidence={cand.evidence}
                            conflicts={cand.conflicts}
                            reason={cand.reason}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
