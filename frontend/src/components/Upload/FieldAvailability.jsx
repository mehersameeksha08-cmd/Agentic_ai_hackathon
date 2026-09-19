// src/components/Upload/FieldAvailability.jsx
import React from 'react';
import { Check, X } from 'lucide-react';
import { useCleanup } from '../../context/CleanupContext';

const STANDARD_FIELDS = [
  { key: "customer_id", label: "customer_id", desc: "Unique Record Identifier" },
  { key: "name", label: "name", desc: "Customer Full Name" },
  { key: "email", label: "email", desc: "Primary Email Address" },
  { key: "phone", label: "phone", desc: "Phone Number" },
  { key: "address", label: "address", desc: "Street Address" },
  { key: "city", label: "city", desc: "City / Municipality" },
  { key: "state", label: "state", desc: "State / Province" },
  { key: "country", label: "country", desc: "Country" },
  { key: "last_updated", label: "last_updated", desc: "Record Timestamp" },
  { key: "source", label: "source", desc: "Source System (CRM/Billing)" }
];

export default function FieldAvailability() {
  const { originalDataset } = useCleanup();

  const availableKeys = originalDataset.length > 0
    ? Object.keys(originalDataset[0]).map(k => k.toLowerCase())
    : [];

  return (
    <div className="field-availability-box">
      <div className="field-avail-header">
        <h4 className="field-avail-title">Available Schema Fields</h4>
        <span className="field-avail-subtitle">Schema mapping and field detection</span>
      </div>

      <div className="field-pills-grid">
        {STANDARD_FIELDS.map((field) => {
          const isPresent = availableKeys.includes(field.key.toLowerCase());
          return (
            <div
              key={field.key}
              className={`field-pill-card ${isPresent ? 'detected' : 'missing'}`}
            >
              <div className="pill-status-icon">
                {isPresent ? <Check size={14} /> : <X size={14} />}
              </div>
              <div className="pill-content">
                <code className="field-key-name">{field.label}</code>
                <span className="field-status-label">
                  {isPresent ? "Detected" : "Not available"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
