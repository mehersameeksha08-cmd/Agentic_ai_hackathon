// src/pages/DecisionLogPage.jsx
import React from 'react';
import DecisionLogTable from '../components/DecisionLog/DecisionLogTable';
import SafeMergeBanner from '../components/Dashboard/SafeMergeBanner';
import { useCleanup } from '../context/CleanupContext';

export default function DecisionLogPage() {
  const { decisionLog } = useCleanup();

  return (
    <div className="decision-log-page">
      <div className="page-title-banner">
        <h2 className="page-heading">Decision Audit Log &amp; Governance</h2>
        <p className="page-subheading">
          Complete, tamper-evident audit trail recording every automated and manual duplicate resolution decision.
        </p>
      </div>

      <section className="log-table-section">
        <DecisionLogTable logEntries={decisionLog} />
      </section>

      <SafeMergeBanner />
    </div>
  );
}
