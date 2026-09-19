// src/context/CleanupContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { inspectDatasetFields } from '../utils/fileParser';
import { DEMO_CUSTOMERS } from '../data/demoData';

const CleanupContext = createContext();

export function CleanupProvider({ children }) {
  // Application State
  const [selectedFile, setSelectedFile] = useState({
    name: "demo_customers.json",
    type: "application/json",
    size: "1.2 KB",
    recordsCount: DEMO_CUSTOMERS.length,
    columnsCount: 10,
    status: "Demo Active"
  });

  const [originalDataset, setOriginalDataset] = useState([]);
  const [datasetFields, setDatasetFields] = useState([]);
  const [missingValuesCount, setMissingValuesCount] = useState(0);

  const [cleanupInstruction, setCleanupInstruction] = useState(
    "Find duplicate customer records. Merge only when you are confident; flag uncertain cases."
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const [duplicateCandidates, setDuplicateCandidates] = useState([]);
  const [reviewCases, setReviewCases] = useState([]);
  const [cleanedDataset, setCleanedDataset] = useState([]);
  const [decisionLog, setDecisionLog] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalRecords: 0,
    duplicateCandidates: 0,
    recordsMerged: 0,
    keptSeparate: 0,
    flaggedForReview: 0,
    incompleteRecords: 0,
    conflictingRecords: 0
  });

  const [toast, setToast] = useState(null); // { message, type }
  const [activeComparisonCase, setActiveComparisonCase] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load standard demo dataset
  const loadDemoData = async () => {
    try {
      await api.loadDemoDataset();
      const preview = await api.getDatasetPreview();
      const candidates = await api.getDuplicateCandidates();
      const reviews = await api.getReviewCases();
      const cleaned = await api.getCleanDataset();
      const log = await api.getDecisionLog();
      const quality = await api.getQualityMetrics();
      const stats = await api.getSummaryStats();

      const { detectedFields, missingValuesCount: mCount } = inspectDatasetFields(preview.records);

      setOriginalDataset(preview.records);
      setDatasetFields(detectedFields);
      setMissingValuesCount(mCount);
      setDuplicateCandidates(candidates);
      setReviewCases(reviews);
      setCleanedDataset(cleaned);
      setDecisionLog(log);
      setQualityMetrics(quality);
      setSummaryStats(stats);

      setSelectedFile({
        name: "demo_customers.json",
        type: "application/json",
        size: "1.4 KB",
        recordsCount: preview.records.length,
        columnsCount: detectedFields.length,
        status: "Demo Active"
      });

      showToast("Demo customer dataset loaded successfully.", "info");
    } catch (err) {
      console.error(err);
      showToast("Failed to load demo data.", "error");
    }
  };

  // Load custom parsed dataset into context
  const setLoadedDataset = async (records, fileMeta) => {
    try {
      await api.uploadDataset(records, fileMeta.name);
      const { detectedFields, missingValuesCount: mCount } = inspectDatasetFields(records);

      setOriginalDataset(records);
      setDatasetFields(detectedFields);
      setMissingValuesCount(mCount);
      setSelectedFile(fileMeta);

      // Reset subsequent analysis until user triggers Start Cleanup
      setDuplicateCandidates([]);
      setReviewCases([]);
      setCleanedDataset([]);
      setDecisionLog([]);
      setSummaryStats({
        totalRecords: records.length,
        duplicateCandidates: 0,
        recordsMerged: 0,
        keptSeparate: 0,
        flaggedForReview: 0,
        incompleteRecords: Math.floor(records.length * 0.1),
        conflictingRecords: 0
      });

      showToast(`Dataset "${fileMeta.name}" loaded with ${records.length} records.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to set uploaded dataset.", "error");
    }
  };

  // Trigger Multi-Stage Cleanup Workflow
  const runCleanupWorkflow = async (customInstruction = cleanupInstruction) => {
    if (!originalDataset || originalDataset.length === 0) {
      showToast("Please upload a customer dataset or load demo data first.", "warning");
      return;
    }

    setIsProcessing(true);
    setShowProgressModal(true);
    setProcessingProgress(0);

    try {
      await api.startCleanup(customInstruction, (stageName, pct) => {
        setProcessingStage(stageName);
        setProcessingProgress(pct);
      });

      // Fetch refreshed results
      const candidates = await api.getDuplicateCandidates();
      const reviews = await api.getReviewCases();
      const cleaned = await api.getCleanDataset();
      const log = await api.getDecisionLog();
      const quality = await api.getQualityMetrics();
      const stats = await api.getSummaryStats();

      setDuplicateCandidates(candidates);
      setReviewCases(reviews);
      setCleanedDataset(cleaned);
      setDecisionLog(log);
      setQualityMetrics(quality);
      setSummaryStats(stats);

      setTimeout(() => {
        setIsProcessing(false);
        setShowProgressModal(false);
        showToast("Cleanup complete! Master dataset and decision audit log generated.", "success");
      }, 500);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setShowProgressModal(false);
      showToast("Cleanup workflow encountered an error.", "error");
    }
  };

  // User manually overrides a review decision
  const handleReviewAction = async (caseId, newDecision, notes = "") => {
    try {
      const res = await api.updateReviewDecision(caseId, newDecision, notes);
      if (res.success) {
        // Update candidate in candidate list
        setDuplicateCandidates(prev =>
          prev.map(c => (c.id === caseId ? { ...c, decision: newDecision, status: "Resolved" } : c))
        );

        // Update review cases
        setReviewCases(prev => prev.filter(c => c.id !== caseId));

        // Update Decision log
        setDecisionLog(prev => [res.newLogEntry, ...prev]);

        // Update summary stats
        setSummaryStats({ ...res.summaryStats });

        showToast(`Case ${caseId} updated to ${newDecision}.`, "success");
        setActiveComparisonCase(null);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update decision.", "error");
    }
  };

  // Initialize demo data on mount
  useEffect(() => {
    loadDemoData();
  }, []);

  return (
    <CleanupContext.Provider
      value={{
        selectedFile,
        setSelectedFile,
        originalDataset,
        datasetFields,
        missingValuesCount,
        cleanupInstruction,
        setCleanupInstruction,
        isProcessing,
        processingStage,
        processingProgress,
        showProgressModal,
        setShowProgressModal,
        duplicateCandidates,
        reviewCases,
        cleanedDataset,
        decisionLog,
        qualityMetrics,
        summaryStats,
        toast,
        showToast,
        activeComparisonCase,
        setActiveComparisonCase,
        isSettingsOpen,
        setIsSettingsOpen,
        isHelpOpen,
        setIsHelpOpen,
        loadDemoData,
        setLoadedDataset,
        runCleanupWorkflow,
        handleReviewAction
      }}
    >
      {children}
    </CleanupContext.Provider>
  );
}

export function useCleanup() {
  const context = useContext(CleanupContext);
  if (!context) {
    throw new Error("useCleanup must be used within a CleanupProvider");
  }
  return context;
}
