// src/components/Upload/DatasetOverview.jsx
import React from 'react';
import { Database, Columns, AlertOctagon, Users } from 'lucide-react';
import { useCleanup } from '../../context/CleanupContext';

export default function DatasetOverview() {
  const { originalDataset, datasetFields, missingValuesCount, duplicateCandidates } = useCleanup();

  const cards = [
    {
      label: "Total Records",
      value: originalDataset.length,
      icon: Database,
      hint: "Rows parsed in dataset",
      color: "info"
    },
    {
      label: "Columns",
      value: datasetFields.length,
      icon: Columns,
      hint: "Fields detected",
      color: "neutral"
    },
    {
      label: "Missing Values",
      value: missingValuesCount,
      icon: AlertOctagon,
      hint: "Empty or null cells",
      color: missingValuesCount > 0 ? "warning" : "success"
    },
    {
      label: "Duplicate Candidates",
      value: duplicateCandidates.length,
      icon: Users,
      hint: "Pairs detected for investigation",
      color: "primary"
    }
  ];

  return (
    <div className="dataset-overview-grid">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className={`overview-stat-card card-${c.color}`}>
            <div className="stat-top">
              <span className="stat-label">{c.label}</span>
              <div className="stat-icon-wrap">
                <Icon size={18} />
              </div>
            </div>
            <div className="stat-number">{c.value}</div>
            <div className="stat-hint">{c.hint}</div>
          </div>
        );
      })}
    </div>
  );
}
