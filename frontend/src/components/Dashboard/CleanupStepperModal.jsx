// src/components/Dashboard/CleanupStepperModal.jsx
import React from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useCleanup } from '../../context/CleanupContext';

const STAGES = [
  { id: 1, name: "Uploading Data", description: "Parsing in-memory and streaming dataset chunks." },
  { id: 2, name: "Reading Dataset", description: "Verifying schema, identifying primary keys & null fields." },
  { id: 3, name: "Normalizing Data", description: "Standardizing addresses (Rd -> Road), phone digits & names." },
  { id: 4, name: "Detecting Duplicates", description: "Computing token and discrete attribute similarity matrices." },
  { id: 5, name: "Investigating Candidates", description: "AI agent analyzing ambiguous pairs against user cleanup prompt." },
  { id: 6, name: "Applying Safe Decisions", description: "Enforcing safe merge policy & intercepting conflicts." },
  { id: 7, name: "Generating Clean Dataset", description: "Consolidating golden master records and decision audit trails." }
];

export default function CleanupStepperModal() {
  const { showProgressModal, processingStage, processingProgress } = useCleanup();

  if (!showProgressModal) return null;

  const currentStageIndex = STAGES.findIndex(s => s.name === processingStage);
  const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="modal-overlay">
      <div className="stepper-modal-container">
        {/* Header */}
        <div className="stepper-header">
          <div className="stepper-title-row">
            <div className="stepper-icon-glow">
              <Sparkles size={22} className="sparkle-anim" />
            </div>
            <div>
              <h3 className="stepper-title">Autonomous Cleanup Agent Active</h3>
              <p className="stepper-subtitle">Executing data-quality inspection and deduplication pipeline...</p>
            </div>
          </div>
          <div className="stepper-percentage">{processingProgress}%</div>
        </div>

        {/* Global Progress Bar */}
        <div className="stepper-progress-bar-bg">
          <div
            className="stepper-progress-bar-fill"
            style={{ width: `${processingProgress}%` }}
          />
        </div>

        {/* Stepper Stages List */}
        <div className="stepper-stages-list">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex || processingProgress === 100;
            const isCurrent = idx === activeIndex && processingProgress < 100;
            const isPending = idx > activeIndex;

            return (
              <div
                key={stage.id}
                className={`stepper-stage-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="stage-indicator">
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="check-icon" />
                  ) : isCurrent ? (
                    <Loader2 size={20} className="spin-icon" />
                  ) : (
                    <span className="stage-num">{stage.id}</span>
                  )}
                </div>

                <div className="stage-content">
                  <div className="stage-name-row">
                    <span className="stage-name">{stage.name}</span>
                    {isCurrent && <span className="stage-badge-live">In Progress</span>}
                    {isCompleted && <span className="stage-badge-done">Done</span>}
                  </div>
                  <p className="stage-desc">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="stepper-footer-notice">
          <span>🛡️ Safe Merge Policy active: Conflicting records will be flagged for review to prevent unsafe data loss.</span>
        </div>
      </div>
    </div>
  );
}
