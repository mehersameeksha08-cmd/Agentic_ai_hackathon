// src/components/Upload/PromptInput.jsx
import React from 'react';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import Button from '../Common/Button';
import { useCleanup } from '../../context/CleanupContext';

const EXAMPLE_PROMPTS = [
  {
    id: 1,
    label: "Confident Merge",
    text: "Find duplicate customer records. Merge only when you are confident; flag uncertain cases."
  },
  {
    id: 2,
    label: "Conservative Mode",
    text: "Clean duplicate customers conservatively."
  },
  {
    id: 3,
    label: "Avoid Name-Only Merges",
    text: "Find duplicates but do not merge customers only because their names match."
  },
  {
    id: 4,
    label: "Flag Conflicts",
    text: "Identify conflicting customer records and flag them for review."
  }
];

export default function PromptInput({ onStartCleanup }) {
  const { cleanupInstruction, setCleanupInstruction, isProcessing, runCleanupWorkflow } = useCleanup();

  const handleStart = () => {
    if (onStartCleanup) {
      onStartCleanup();
    } else {
      runCleanupWorkflow(cleanupInstruction);
    }
  };

  return (
    <div className="prompt-input-card">
      <div className="prompt-title-row">
        <div className="prompt-title-wrap">
          <div className="sparkle-circle">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="prompt-heading">What should I clean?</h3>
            <p className="prompt-subheading">Instruct the autonomous agent with natural language directives</p>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <div className="prompt-textarea-wrapper">
        <textarea
          className="prompt-main-textarea"
          rows={3}
          value={cleanupInstruction}
          onChange={(e) => setCleanupInstruction(e.target.value)}
          placeholder="Find duplicate customer records. Merge only when you are confident; flag uncertain cases."
        />
      </div>

      {/* Example Prompt Chips */}
      <div className="prompt-examples-section">
        <div className="examples-label-row">
          <Lightbulb size={14} className="lightbulb-icon" />
          <span>Quick Example Instructions:</span>
        </div>
        <div className="example-chips-list">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className={`example-chip-btn ${cleanupInstruction === ex.text ? 'selected' : ''}`}
              onClick={() => setCleanupInstruction(ex.text)}
            >
              <span className="chip-tag">{ex.label}</span>
              <span className="chip-text">"{ex.text}"</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="prompt-action-bar">
        <div className="prompt-guarantee-note">
          <span>🛡️ Safe merge algorithms prevent destructive overwrites</span>
        </div>
        <Button
          variant="primary"
          size="lg"
          icon={ArrowRight}
          onClick={handleStart}
          loading={isProcessing}
        >
          {isProcessing ? "Processing Cleanup..." : "Start Cleanup"}
        </Button>
      </div>
    </div>
  );
}
