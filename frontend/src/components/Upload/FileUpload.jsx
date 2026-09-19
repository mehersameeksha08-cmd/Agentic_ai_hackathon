// src/components/Upload/FileUpload.jsx
import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Trash2, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import Button from '../Common/Button';
import Badge from '../Common/Badge';
import { parseJson, parseCsv, parseXlsx } from '../../utils/fileParser';
import { useCleanup } from '../../context/CleanupContext';

export default function FileUpload() {
  const { selectedFile, setLoadedDataset, loadDemoData, showToast } = useCleanup();
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);

  const processSelectedFile = async (file) => {
    if (!file) return;
    setIsParsing(true);

    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let records = [];

      if (ext === 'json') {
        const text = await file.text();
        records = parseJson(text);
      } else if (ext === 'csv') {
        const text = await file.text();
        records = parseCsv(text);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const arrayBuf = await file.arrayBuffer();
        records = parseXlsx(arrayBuf);
      } else {
        throw new Error(`Unsupported file type (.${ext}). Please upload CSV, JSON, or XLSX.`);
      }

      const columnsCount = records.length > 0 ? Object.keys(records[0]).length : 0;
      const sizeKB = (file.size / 1024).toFixed(1) + " KB";

      await setLoadedDataset(records, {
        name: file.name,
        type: file.type || `application/${ext}`,
        size: sizeKB,
        recordsCount: records.length,
        columnsCount: columnsCount,
        status: "Uploaded & Parsed"
      });
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to parse file.", "error");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="file-upload-component">
      {/* Dropzone Area */}
      <div
        className={`dropzone-container ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.json,.xlsx,.xls"
          style={{ display: 'none' }}
        />

        <div className="dropzone-icon-circle">
          <UploadCloud size={36} className="upload-icon" />
        </div>

        <h3 className="dropzone-main-text">Drop your customer dataset here</h3>
        <p className="dropzone-sub-text">or choose a file from your computer</p>

        <div className="dropzone-formats-badge">
          <span>Supported formats:</span>
          <strong>CSV, JSON, XLSX / Excel</strong>
        </div>

        <div className="dropzone-actions-row">
          <Button
            variant="primary"
            icon={UploadCloud}
            onClick={() => fileInputRef.current?.click()}
            loading={isParsing}
          >
            Choose File
          </Button>

          <Button
            variant="outline"
            icon={Sparkles}
            onClick={loadDemoData}
          >
            Load Demo Dataset
          </Button>
        </div>
      </div>

      {/* Selected File Details Card */}
      {selectedFile && (
        <div className="selected-file-card">
          <div className="selected-file-left">
            <div className="file-type-icon-box">
              <FileSpreadsheet size={24} />
            </div>
            <div className="file-meta-content">
              <div className="file-title-row">
                <span className="file-name-text">{selectedFile.name}</span>
                <Badge variant={selectedFile.status === "Demo Active" ? "ACTIVE" : "GOOD"} size="sm">
                  {selectedFile.status}
                </Badge>
              </div>
              <div className="file-specs-row">
                <span>{selectedFile.type || "Dataset"}</span>
                <span className="dot-sep">•</span>
                <span>{selectedFile.size}</span>
                <span className="dot-sep">•</span>
                <strong>{selectedFile.recordsCount} records</strong>
                <span className="dot-sep">•</span>
                <span>{selectedFile.columnsCount} columns</span>
              </div>
            </div>
          </div>

          <div className="selected-file-right">
            <button
              className="file-remove-btn"
              onClick={loadDemoData}
              title="Reset dataset"
            >
              <Trash2 size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="privacy-notice-box">
        <ShieldAlert size={16} className="privacy-icon" />
        <p className="privacy-text">
          <strong>Privacy Notice:</strong> Customer data may contain sensitive information. Keep your datasets secure and only upload data you are authorized to process.
        </p>
      </div>
    </div>
  );
}
