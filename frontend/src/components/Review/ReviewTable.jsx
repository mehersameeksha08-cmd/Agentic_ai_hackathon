// src/components/Review/ReviewTable.jsx
import React from 'react';
import { Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import Badge from '../Common/Badge';
import Button from '../Common/Button';
import ConfidenceBadge from '../Duplicates/ConfidenceBadge';
import { useCleanup } from '../../context/CleanupContext';

export default function ReviewTable({ cases = [] }) {
  const { setActiveComparisonCase } = useCleanup();

  return (
    <div className="review-table-container">
      <div className="table-scroll-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Record A</th>
              <th>Record B</th>
              <th>Matching Fields</th>
              <th>Conflicting Fields</th>
              <th>Confidence</th>
              <th>AI Explanation</th>
              <th>Suggested Action</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="table-row">
                <td>
                  <div className="record-cell">
                    <span className="record-id-tag">{c.customer_id_1}</span>
                    <strong className="record-name-text">{c.customer1?.name}</strong>
                    <span className="record-sub-text">{c.customer1?.email}</span>
                  </div>
                </td>
                <td>
                  <div className="record-cell">
                    <span className="record-id-tag">{c.customer_id_2}</span>
                    <strong className="record-name-text">{c.customer2?.name}</strong>
                    <span className="record-sub-text">{c.customer2?.email}</span>
                  </div>
                </td>
                <td>
                  <div className="field-tags-wrap">
                    {c.matching_fields.map((mf, i) => (
                      <span key={i} className="chip-match">
                        <CheckCircle size={10} />
                        <span>{mf}</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="field-tags-wrap">
                    {c.conflicts && c.conflicts.length > 0 ? (
                      c.conflicts.map((cf, i) => (
                        <span key={i} className="chip-conflict">
                          <AlertTriangle size={10} />
                          <span>{cf}</span>
                        </span>
                      ))
                    ) : (
                      <span className="no-conflict-label">None</span>
                    )}
                  </div>
                </td>
                <td style={{ minWidth: "140px" }}>
                  <ConfidenceBadge confidence={c.confidence} />
                </td>
                <td style={{ maxWidth: "240px" }}>
                  <p className="cell-reason-text" title={c.reason}>
                    {c.reason}
                  </p>
                </td>
                <td style={{ maxWidth: "180px" }}>
                  <span className="suggested-action-tag">
                    {c.suggested_action}
                  </span>
                </td>
                <td>
                  <Badge variant={c.status === "Needs Review" ? "FLAGGED" : "GOOD"} size="sm">
                    {c.status}
                  </Badge>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Eye}
                    onClick={() => setActiveComparisonCase(c)}
                  >
                    Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
