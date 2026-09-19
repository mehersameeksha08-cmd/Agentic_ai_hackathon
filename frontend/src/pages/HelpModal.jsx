// src/pages/HelpModal.jsx
import React from 'react';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import { HelpCircle, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Cleanup Agent — Documentation &amp; Guide"
      subtitle="Enterprise customer deduplication and data quality architecture"
      maxWidth="750px"
    >
      <div className="help-modal-body">
        {/* Core Philosophy */}
        <div className="help-section">
          <div className="help-section-title">
            <ShieldCheck size={18} className="text-primary" />
            <h4>Safe Deduplication Philosophy</h4>
          </div>
          <p>
            <strong>"Turn messy customer data into a clean, trustworthy master dataset — safely."</strong>
          </p>
          <p>
            In customer master data management, an incorrect merge is far more damaging than keeping two records separate. Our agent uses a deterministic pre-filter, normalizes address and phone identifiers, and leverages AI investigation exclusively for ambiguous borderline cases.
          </p>
        </div>

        {/* Workflow Diagram */}
        <div className="help-section">
          <div className="help-section-title">
            <BookOpen size={18} className="text-primary" />
            <h4>End-to-End Workflow</h4>
          </div>
          <ol className="help-workflow-steps">
            <li><strong>Upload:</strong> Ingest raw dataset (CSV, JSON, or Excel) with in-browser schema detection.</li>
            <li><strong>Normalize:</strong> Expand street abbreviations (<code>12 Lake Rd</code> $\to$ <code>12 Lake Road</code>), standardize phone numbers, and parse names.</li>
            <li><strong>Candidate Generation:</strong> Identify pairs exceeding similarity thresholds without sending the whole dataset to an LLM.</li>
            <li><strong>AI Investigation:</strong> Ambiguous candidate pairs are investigated against user-supplied natural language instructions.</li>
            <li><strong>Human Review:</strong> Cases with conflicting phone numbers or distinct house addresses are queued for steward sign-off.</li>
            <li><strong>Master Dataset:</strong> Merge clusters into canonical golden records with full source system lineage.</li>
          </ol>
        </div>

        {/* Common Starter Test Cases */}
        <div className="help-section">
          <div className="help-section-title">
            <CheckCircle size={18} className="text-primary" />
            <h4>Starter Test Case Analysis</h4>
          </div>
          <div className="help-qa-box">
            <strong>Q: Why were C1001 and C1044 merged?</strong>
            <p>They share identical email (<code>sneha@gmail.com</code>), identical phone (<code>9876543210</code>), identical city, and normalized street addresses match (<code>12 Lake Rd</code> == <code>12 Lake Road</code>).</p>
          </div>
          <div className="help-qa-box">
            <strong>Q: Why were C2001 and C2002 preserved as separate individuals?</strong>
            <p>Both records share the name <em>"Rahul Kumar"</em>, but have completely different phone numbers, emails, cities (Bengaluru vs Hyderabad), and street addresses. Names alone never justify merging.</p>
          </div>
          <div className="help-qa-box">
            <strong>Q: Why was Anita Rao (C3001 vs C3002) flagged for review?</strong>
            <p>Name, email, and address match, but primary phone numbers conflict (<code>9111111111</code> vs <code>9222222222</code>). Safe policy prevents automated merge.</p>
          </div>
        </div>

        <div className="help-actions-footer">
          <Button variant="primary" onClick={onClose}>
            Got it, thanks!
          </Button>
        </div>
      </div>
    </Modal>
  );
}
