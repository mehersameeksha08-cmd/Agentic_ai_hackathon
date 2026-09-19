// src/services/api.js
// Production API Client configured for future FastAPI Backend connection.
// By default, this delegates to mockApi.js when VITE_USE_MOCK is true or when backend is unreachable.

import { mockApi } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

/**
 * Service Layer Interface
 * All UI components should interact with this unified API service.
 */
export const api = {
  // Load standard Demo Dataset
  async loadDemoDataset() {
    return mockApi.loadDemoDataset();
  },

  // Upload customer dataset: CSV, JSON, or XLSX
  // Future endpoint: POST /upload
  async uploadDataset(records, filename) {
    if (USE_MOCK) {
      return mockApi.uploadDataset(records, filename);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, records })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn("Backend unavailable, falling back to mockApi:", err);
      return mockApi.uploadDataset(records, filename);
    }
  },

  // Get active dataset preview & fields
  // Future endpoint: GET /preview
  async getDatasetPreview() {
    if (USE_MOCK) return mockApi.getDatasetPreview();
    try {
      const response = await fetch(`${API_BASE_URL}/preview`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      return mockApi.getDatasetPreview();
    }
  },

  // Analyze dataset data-quality metrics
  // Future endpoint: POST /analyze
  async analyzeDataset() {
    if (USE_MOCK) return mockApi.analyzeDataset();
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      return mockApi.analyzeDataset();
    }
  },

  // Execute Cleanup Workflow with progressive status callback
  // Future endpoint: POST /cleanup
  async startCleanup(instruction, onProgress) {
    if (USE_MOCK) {
      return mockApi.startCleanup(instruction, onProgress);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_request: instruction })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn("Backend unavailable, running mock cleanup:", err);
      return mockApi.startCleanup(instruction, onProgress);
    }
  },

  // Get duplicate candidate pairs
  // Future endpoint: GET /duplicates
  async getDuplicateCandidates() {
    if (USE_MOCK) return mockApi.getDuplicateCandidates();
    try {
      const response = await fetch(`${API_BASE_URL}/duplicates`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      return mockApi.getDuplicateCandidates();
    }
  },

  // Get ambiguous cases pending review
  // Future endpoint: GET /review-cases
  async getReviewCases() {
    if (USE_MOCK) return mockApi.getReviewCases();
    try {
      const response = await fetch(`${API_BASE_URL}/review-cases`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      return mockApi.getReviewCases();
    }
  },

  // Update a review decision manually (MERGE, KEEP SEPARATE, FLAGGED)
  // Future endpoint: POST /review-cases/{id}/decision
  async updateReviewDecision(caseId, decision, notes = "") {
    if (USE_MOCK) return mockApi.updateReviewDecision(caseId, decision, notes);
    try {
      const response = await fetch(`${API_BASE_URL}/review-cases/${caseId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      return mockApi.updateReviewDecision(caseId, decision, notes);
    }
  },

  // Get clean golden master dataset
  // Future endpoint: GET /clean-dataset
  async getCleanDataset() {
    if (USE_MOCK) return mockApi.getCleanDataset();
    try {
      const response = await fetch(`${API_BASE_URL}/clean-dataset`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      return mockApi.getCleanDataset();
    }
  },

  // Get audit decision log
  // Future endpoint: GET /decision-log
  async getDecisionLog() {
    if (USE_MOCK) return mockApi.getDecisionLog();
    try {
      const response = await fetch(`${API_BASE_URL}/decision-log`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      return mockApi.getDecisionLog();
    }
  },

  // Get quality metrics
  async getQualityMetrics() {
    return mockApi.getQualityMetrics();
  },

  // Get summary statistics
  async getSummaryStats() {
    return mockApi.getSummaryStats();
  }
};
