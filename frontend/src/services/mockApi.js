// src/services/mockApi.js
// Frontend mock service layer simulating backend endpoints with in-memory state.

import {
  DEMO_CUSTOMERS,
  DEMO_CANDIDATES,
  DEMO_QUALITY_METRICS,
  DEMO_CLEANED_DATASET,
  DEMO_DECISION_LOG,
  DEMO_SUMMARY_STATS
} from '../data/demoData';

// In-memory state simulating a backend session
let state = {
  activeFilename: "demo_customers.json",
  originalDataset: [...DEMO_CUSTOMERS],
  candidates: JSON.parse(JSON.stringify(DEMO_CANDIDATES)),
  cleanedDataset: JSON.parse(JSON.stringify(DEMO_CLEANED_DATASET)),
  decisionLog: JSON.parse(JSON.stringify(DEMO_DECISION_LOG)),
  qualityMetrics: JSON.parse(JSON.stringify(DEMO_QUALITY_METRICS)),
  summaryStats: { ...DEMO_SUMMARY_STATS },
  cleanupInstruction: "Find duplicate customer records. Merge only when you are confident; flag uncertain cases.",
  isCleaned: true
};

const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Load or switch dataset
  async loadDemoDataset() {
    await delay(200);
    state = {
      activeFilename: "demo_customers.json",
      originalDataset: [...DEMO_CUSTOMERS],
      candidates: JSON.parse(JSON.stringify(DEMO_CANDIDATES)),
      cleanedDataset: JSON.parse(JSON.stringify(DEMO_CLEANED_DATASET)),
      decisionLog: JSON.parse(JSON.stringify(DEMO_DECISION_LOG)),
      qualityMetrics: JSON.parse(JSON.stringify(DEMO_QUALITY_METRICS)),
      summaryStats: { ...DEMO_SUMMARY_STATS },
      cleanupInstruction: "Find duplicate customer records. Merge only when you are confident; flag uncertain cases.",
      isCleaned: true
    };
    return {
      success: true,
      filename: state.activeFilename,
      recordsCount: state.originalDataset.length
    };
  },

  // Simulates POST /upload
  async uploadDataset(records, filename = "uploaded_dataset.csv") {
    await delay(300);
    state.activeFilename = filename;
    state.originalDataset = records;
    state.isCleaned = false;

    // Reset results for newly uploaded dataset until cleanup is executed
    state.summaryStats = {
      totalRecords: records.length,
      duplicateCandidates: 0,
      recordsMerged: 0,
      keptSeparate: 0,
      flaggedForReview: 0,
      incompleteRecords: Math.max(0, Math.floor(records.length * 0.15)),
      conflictingRecords: 0
    };

    return {
      success: true,
      filename,
      recordsCount: records.length
    };
  },

  // Simulates GET /preview
  async getDatasetPreview() {
    await delay(150);
    return {
      filename: state.activeFilename,
      records: state.originalDataset,
      totalCount: state.originalDataset.length,
      isCleaned: state.isCleaned
    };
  },

  // Simulates POST /analyze
  async analyzeDataset() {
    await delay(250);
    return {
      qualityMetrics: state.qualityMetrics,
      summaryStats: state.summaryStats
    };
  },

  // Simulates POST /cleanup with multi-stage progress
  async startCleanup(instruction, onProgress) {
    state.cleanupInstruction = instruction;
    const stages = [
      { name: "Uploading Data", pct: 15 },
      { name: "Reading Dataset", pct: 30 },
      { name: "Normalizing Data", pct: 48 },
      { name: "Detecting Duplicates", pct: 65 },
      { name: "Investigating Candidates", pct: 82 },
      { name: "Applying Safe Decisions", pct: 94 },
      { name: "Generating Clean Dataset", pct: 100 }
    ];

    for (const stage of stages) {
      if (onProgress) {
        onProgress(stage.name, stage.pct);
      }
      await delay(250); // Snappy simulation
    }

    state.isCleaned = true;
    return {
      success: true,
      summaryStats: state.summaryStats,
      qualityMetrics: state.qualityMetrics
    };
  },

  // Simulates GET /duplicates
  async getDuplicateCandidates() {
    await delay(150);
    return state.candidates;
  },

  // Simulates GET /review-cases
  async getReviewCases() {
    await delay(150);
    return state.candidates.filter(c => c.status === "Needs Review" || c.decision === "FLAGGED");
  },

  // Simulates POST /review-cases/{id}/decision
  async updateReviewDecision(caseId, newDecision, notes = "") {
    await delay(200);
    const candidate = state.candidates.find(c => c.id === caseId || `${c.customer_id_1}-${c.customer_id_2}` === caseId);
    if (!candidate) {
      throw new Error(`Candidate case ${caseId} not found.`);
    }

    const previousDecision = candidate.decision;
    candidate.decision = newDecision;
    candidate.status = "Resolved";
    candidate.manual_notes = notes;

    // Update Decision Log
    const newLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      record_a: `${candidate.customer_id_1} (${candidate.customer1?.name || ''})`,
      record_b: `${candidate.customer_id_2} (${candidate.customer2?.name || ''})`,
      decision: newDecision,
      confidence: typeof candidate.confidence === 'number' ? `${Math.round(candidate.confidence * 100)}%` : candidate.confidence,
      matching_fields: candidate.matching_fields.join(", "),
      conflicts: candidate.conflicts.length > 0 ? candidate.conflicts.join(", ") : "None",
      reason: `Manual override by user: ${notes || 'Action confirmed in review modal.'}`,
      action: newDecision === "MERGE" ? "Merged manually" : newDecision === "KEEP SEPARATE" ? "Kept separate manually" : "Flagged for second review"
    };
    state.decisionLog.unshift(newLogEntry);

    // Update Summary Stats dynamically
    if (previousDecision === "FLAGGED" && newDecision !== "FLAGGED") {
      state.summaryStats.flaggedForReview = Math.max(0, state.summaryStats.flaggedForReview - 1);
    }
    if (newDecision === "MERGE" && previousDecision !== "MERGE") {
      state.summaryStats.recordsMerged += 1;
    } else if (newDecision === "KEEP SEPARATE" && previousDecision !== "KEEP SEPARATE") {
      state.summaryStats.keptSeparate += 1;
    }

    return {
      success: true,
      candidate,
      newLogEntry,
      summaryStats: state.summaryStats
    };
  },

  // Simulates GET /clean-dataset
  async getCleanDataset() {
    await delay(150);
    return state.cleanedDataset;
  },

  // Simulates GET /decision-log
  async getDecisionLog() {
    await delay(150);
    return state.decisionLog;
  },

  // Simulates GET /quality
  async getQualityMetrics() {
    await delay(100);
    return state.qualityMetrics;
  },

  // Simulates GET /summary
  async getSummaryStats() {
    await delay(100);
    return state.summaryStats;
  }
};
