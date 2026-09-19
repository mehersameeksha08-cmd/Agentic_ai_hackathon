// src/components/Review/RecordComparisonModal.jsx
import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import Badge from '../Common/Badge';
import ConfidenceBadge from '../Duplicates/ConfidenceBadge';
import { useCleanup } from '../../context/CleanupContext';
import {
  Check,
  AlertTriangle,
  HelpCircle,
  Merge,
  Split,
  Flag,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';

const COMPARE_FIELDS = [
  { key: "name", label: "Full Name", icon: User },
  { key: "email", label: "Email Address", icon: Mail },
  { key: "phone", label: "Phone Number", icon: Phone },
  { key: "address", label: "Street Address", icon: MapPin },
  { key: "city", label: "City", icon: MapPin },
  { key: "state", label: "State", icon: MapPin },
  { key: "country", label: "Country", icon: MapPin },
  { key: "last_updated", label: "Last Updated", icon: Calendar },
  { key: "source", label: "Source System", icon: Layers }
];

export default function RecordComparisonModal() {
  const { activeComparisonCase, setActiveComparisonCase, handleReviewAction } = useCleanup();
  const [customNote, setCustomNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState(null);

  if (!activeComparisonCase) return null;

  const c1 = activeComparisonCase.customer1 || {};
  const c2 = activeComparisonCase.customer2 || {};

  // Compute field comparison highlights: MATCH, CONFLICT, MISSING
  const getFieldComparison = (key) => {
    const val1 = (c1[key] || "").toString().trim().toLowerCase();
    const val2 = (c2[key] || "").toString().trim().toLowerCase();

    if (!val1 && !val2) {
      return { status: "MISSING", label: "Both Missing", className: "highlight-missing" };
    }
    if (!val1 || !val2) {
      return { status: "MISSING", label: "One Missing", className: "highlight-missing" };
    }
    if (val1 === val2) {
      return { status: "MATCH", label: "Exact Match", className: "highlight-match" };
    }

    // Special matching rules: address abbreviations (e.g. 12 lake rd vs 12 lake road)
    if (key === "address") {
      const norm1 = val1.replace(/\brd\b/g, 'road').replace(/[^\w\s]/g, '').trim();
      const norm2 = val2.replace(/\brd\b/g, 'road').replace(/[^\w\s]/g, '').trim();
      if (norm1 === norm2) {
        return { status: "MATCH", label: "Normalized Match", className: "highlight-match" };
      }
    }

    // Special matching rules: name initial (e.g. sneha srirampur vs s. srirampur)
    if (key === "name") {
      const tokens1 = val1.split(/\s+/);
      const tokens2 = val2.split(/\s+/);
      if (tokens1.length > 1 && tokens2.length > 1 && tokens1[tokens1.length - 1] === tokens2[tokens2.length - 1]) {
        if (tokens1[0][0] === tokens2[0][0]) {
          return { status: "MATCH", label: "Compatible Name", className: "highlight-match" };
        }
      }
    }

    return { status: "CONFLICT", label: "Conflicting", className: "highlight-conflict" };
  };

  const executeDecision = async (action) => {
    setSubmittingAction(action);
    await handleReviewAction(activeComparisonCase.id, action, customNote);
    setSubmittingAction(null);
    setCustomNote("");
  };

  return (
    <Modal
      isOpen={Boolean(activeComparisonCase)}
      onClose={() => setActiveComparisonCase(null)}
      title="Side-by-Side Record Comparison"
      subtitle={`Investigating Candidate Pair: ${activeComparisonCase.customer_id_1} vs ${activeComparisonCase.customer_id_2}`}
      maxWidth="900px"
    >
      <div className="comparison-modal-content">
        {/* Top Intelligence Banner */}
        <div className="comparison-ai-banner">
          <div className="ai-banner-left">
            <div className="current-ai-decision">
              <span className="banner-small-label">Initial AI Assessment</span>
              <Badge variant={activeComparisonCase.decision} size="lg">
                {activeComparisonCase.decision}
              </Badge>
            </div>
            <div className="ai-confidence-wrap">
              <span className="banner-small-label">Model Confidence</span>
              <ConfidenceBadge confidence={activeComparisonCase.confidence} />
            </div>
          </div>
          <div className="ai-banner-right">
            <span className="banner-small-label">Reasoning &amp; Evidence</span>
            <p className="ai-reason-quote">"{activeComparisonCase.reason}"</p>
          </div>
        </div>

        {/* Side-by-Side Table with Highlights */}
        <div className="comparison-fields-table">
          <div className="fields-table-header">
            <div className="col-field-name">Attribute</div>
            <div className="col-customer-a">
              <span className="cust-tag">Customer A</span>
              <strong>{activeComparisonCase.customer_id_1}</strong>
            </div>
            <div className="col-status-tag">Comparison</div>
            <div className="col-customer-b">
              <span className="cust-tag">Customer B</span>
              <strong>{activeComparisonCase.customer_id_2}</strong>
            </div>
          </div>

          <div className="fields-table-body">
            {COMPARE_FIELDS.map((field) => {
              const comp = getFieldComparison(field.key);
              const Icon = field.icon;
              const valA = c1[field.key];
              const valB = c2[field.key];

              return (
                <div key={field.key} className={`comparison-row ${comp.className}`}>
                  <div className="col-field-name">
                    <Icon size={14} className="field-row-icon" />
                    <span>{field.label}</span>
                  </div>

                  <div className="col-customer-a">
                    <span className="cell-val">
                      {valA ? String(valA) : <span className="val-missing">Missing</span>}
                    </span>
                  </div>

                  <div className="col-status-tag">
                    <span className={`comp-pill pill-${comp.status.toLowerCase()}`}>
                      {comp.status === "MATCH" && <Check size={11} />}
                      {comp.status === "CONFLICT" && <AlertTriangle size={11} />}
                      {comp.status === "MISSING" && <HelpCircle size={11} />}
                      <span>{comp.label}</span>
                    </span>
                  </div>

                  <div className="col-customer-b">
                    <span className="cell-val">
                      {valB ? String(valB) : <span className="val-missing">Missing</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Notes */}
        <div className="review-notes-section">
          <label htmlFor="review-note-input" className="review-note-label">
            Steward Audit Notes (Optional):
          </label>
          <input
            id="review-note-input"
            type="text"
            className="review-note-input"
            placeholder="e.g., Verified phone with customer support; confirmed relocation."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
          />
        </div>

        {/* Review Actions Footer */}
        <div className="comparison-action-footer">
          <div className="footer-policy-note">
            <span>Select safe action to update master dataset &amp; decision log:</span>
          </div>

          <div className="decision-actions-row">
            <Button
              variant="success"
              icon={Merge}
              loading={submittingAction === "MERGE"}
              onClick={() => executeDecision("MERGE")}
            >
              MERGE RECORDS
            </Button>

            <Button
              variant="outline"
              icon={Split}
              loading={submittingAction === "KEEP SEPARATE"}
              onClick={() => executeDecision("KEEP SEPARATE")}
            >
              KEEP SEPARATE
            </Button>

            <Button
              variant="secondary"
              icon={Flag}
              loading={submittingAction === "FLAGGED"}
              onClick={() => executeDecision("FLAGGED")}
            >
              FLAG / CONTINUE REVIEW
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
