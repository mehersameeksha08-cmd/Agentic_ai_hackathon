// src/pages/ReviewPage.jsx
import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import ReviewTable from '../components/Review/ReviewTable';
import EmptyState from '../components/Common/EmptyState';
import SafeMergeBanner from '../components/Dashboard/SafeMergeBanner';
import { useCleanup } from '../context/CleanupContext';

export default function ReviewPage() {
  const { reviewCases } = useCleanup();

  return (
    <div className="review-page">
      <div className="page-title-banner">
        <div className="title-row-flex">
          <div>
            <h2 className="page-heading">Review Cases &amp; Ambiguous Candidates</h2>
            <p className="page-subheading">
              Human-in-the-loop review queue for candidate pairs containing conflicting identifiers or borderline confidence.
            </p>
          </div>
          {reviewCases.length > 0 && (
            <div className="pending-cases-pill">
              <AlertTriangle size={15} />
              <span>{reviewCases.length} Cases Require Steward Action</span>
            </div>
          )}
        </div>
      </div>

      {reviewCases.length === 0 ? (
        <div className="all-resolved-card">
          <EmptyState
            icon={CheckCircle2}
            title="All Candidate Records Have Been Resolved"
            description="Zero ambiguous duplicates remain in the review queue. Safe merge policies have been successfully satisfied."
          />
        </div>
      ) : (
        <section className="review-table-section">
          <ReviewTable cases={reviewCases} />
        </section>
      )}

      <SafeMergeBanner />
    </div>
  );
}
