// src/pages/UploadPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/Upload/FileUpload';
import DatasetOverview from '../components/Upload/DatasetOverview';
import FieldAvailability from '../components/Upload/FieldAvailability';
import PromptInput from '../components/Upload/PromptInput';
import DataTable from '../components/Common/DataTable';
import SafeMergeBanner from '../components/Dashboard/SafeMergeBanner';
import { useCleanup } from '../context/CleanupContext';

export default function UploadPage() {
  const navigate = useNavigate();
  const { originalDataset, runCleanupWorkflow } = useCleanup();

  // Columns for the preview data table
  const columns = originalDataset.length > 0
    ? Object.keys(originalDataset[0]).map(key => ({
        key,
        header: key.replace(/_/g, ' ').toUpperCase(),
        render: (val) => val ? String(val) : <span className="cell-empty">—</span>
      }))
    : [];

  const handleStartCleanup = async () => {
    await runCleanupWorkflow();
    navigate("/duplicates");
  };

  return (
    <div className="upload-page">
      <div className="page-title-banner">
        <h2 className="page-heading">Upload &amp; Configure Dataset</h2>
        <p className="page-subheading">
          Ingest customer datasets in CSV, JSON, or Excel format and configure natural-language cleanup parameters.
        </p>
      </div>

      {/* Upload Drag & Drop Component */}
      <FileUpload />

      {/* Dataset Overview Cards & Field Availability */}
      {originalDataset.length > 0 && (
        <>
          <DatasetOverview />

          <FieldAvailability />

          {/* Raw Data Preview Table (First 10-20 records) */}
          <section className="preview-table-section">
            <div className="section-header-flex">
              <div>
                <h3 className="section-title">Raw Data Preview</h3>
                <p className="section-subtitle">Displaying first records parsed from the active dataset</p>
              </div>
              <span className="record-count-badge">{originalDataset.length} Records</span>
            </div>

            <DataTable
              columns={columns}
              data={originalDataset.slice(0, 20)}
              searchPlaceholder="Search in preview records..."
              defaultPageSize={10}
            />
          </section>

          {/* Natural-Language Cleanup Request */}
          <PromptInput onStartCleanup={handleStartCleanup} />

          {/* Safe Merge Policy Banner */}
          <SafeMergeBanner />
        </>
      )}
    </div>
  );
}
