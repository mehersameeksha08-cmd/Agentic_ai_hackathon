// src/components/Quality/FieldHealthTable.jsx
import React from 'react';
import Badge from '../Common/Badge';

export default function FieldHealthTable({ fields = [] }) {
  return (
    <div className="field-health-table-card">
      <div className="table-card-header">
        <h4 className="card-heading">Field-Level Health Breakdown</h4>
        <p className="card-subheading">Completeness and validity metrics across all schema columns</p>
      </div>

      <div className="table-responsive-wrapper">
        <table className="field-health-table">
          <thead>
            <tr>
              <th>Field Name</th>
              <th>Completeness</th>
              <th>Validity</th>
              <th>Health Status</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f, idx) => (
              <tr key={idx}>
                <td>
                  <code className="field-code">{f.field}</code>
                </td>
                <td>
                  <div className="progress-cell">
                    <div className="mini-progress-bg">
                      <div
                        className="mini-progress-fill fill-complete"
                        style={{ width: `${f.completeness}%` }}
                      />
                    </div>
                    <span className="pct-label">{f.completeness}%</span>
                  </div>
                </td>
                <td>
                  <div className="progress-cell">
                    <div className="mini-progress-bg">
                      <div
                        className="mini-progress-fill fill-valid"
                        style={{ width: `${f.validity}%` }}
                      />
                    </div>
                    <span className="pct-label">{f.validity}%</span>
                  </div>
                </td>
                <td>
                  <Badge variant={f.status === "Good" ? "GOOD" : f.status === "Critical" ? "CONFLICT" : "FLAGGED"} size="sm">
                    {f.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
