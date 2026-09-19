# Data Cleanup Agent — Frontend Application

A polished, responsive enterprise web application for AI-powered customer data quality inspection and safe deduplication.

> **Product Message**: Turn messy customer data into a clean, trustworthy master dataset — safely.

---

## 1. Features & Capabilities

- **Workflow-Driven UI**:
  `Upload Data` → `Analyze` → `Detect Duplicate Candidates` → `Investigate` → `Make Decisions` → `Review Cases` → `Clean Master Dataset` → `Decision Audit Log` → `Export`
- **In-Browser File Parsing**:
  Select and instantly preview **CSV**, **JSON**, and **Excel (XLSX)** datasets client-side using SheetJS (`xlsx`).
- **Interactive Multi-Stage Cleanup Stepper**:
  Simulates a progressive 7-stage cleanup pipeline with real-time percentage, animations, and stage checkmarks.
- **Natural-Language Instruction Bar**:
  Supports custom cleanup prompts (e.g. *"Find duplicate customer records. Merge only when you are confident; flag uncertain cases"*).
- **Data Quality Audit & Gauges**:
  SVG circular Data Quality Score gauge (72/100 $\to$ 94/100) with issue cards for missing contact info, formatting errors, and conflicting fields.
- **Duplicate Detection & Evidence Panel**:
  Displays candidate duplicate pairs, confidence meters (High, Medium, Low), positive match evidence chips, conflict warnings, and AI reasoning.
- **Side-by-Side Record Comparison Modal**:
  Side-by-side customer profile comparison with visual highlights:
  - `MATCH` (Exact and normalized matches)
  - `CONFLICT` (Conflicting phone or address signals)
  - `MISSING` (Unavailable or empty fields)
  Steward action buttons (`MERGE`, `KEEP SEPARATE`, `FLAG / CONTINUE REVIEW`) dynamically update state, metrics, and audit logs.
- **Clean Master Dataset & Before/After Comparison**:
  Searchable, sortable, paginated golden master records catalog with source provenance tags (`CRM`, `Support`, `Web`, `Billing`), `CLEANED` badges, and one-click downloads for Clean CSV, Clean JSON, and Decision Audit Reports.
- **Decision Audit Log**:
  Immutable governance log with filtering by decision type (`MERGE`, `KEEP SEPARATE`, `FLAGGED`) and keyword search.

---

## 2. Technology Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router (`react-router-dom` v7)
- **Icons**: Lucide React
- **File Parsing**: SheetJS (`xlsx`)
- **Styling**: Pure Modern SaaS CSS with responsive design (Desktop, Tablet, Mobile)
- **Architecture**: Isolated Frontend Service Layer (`src/services/api.js` & `src/services/mockApi.js`)

---

## 3. Quick Start

### Installation
From the `frontend` folder (or project root):
```bash
npm install
```

### Run Locally (Development Server)
```bash
npm run dev
```
Open `http://localhost:3000` (or the port displayed in your terminal) in your web browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 4. Frontend Architecture & Service Layer

The frontend components do NOT embed mock data directly. All data access flows through a clean service abstraction:

```
src/
├── components/
│   ├── Common/              # Button, Badge, Modal, Toast, EmptyState, DataTable
│   ├── Dashboard/           # SummaryCard, CleanupStepperModal, SafeMergeBanner
│   ├── Dataset/             # CleanDatasetTable, DatasetComparison
│   ├── DecisionLog/         # DecisionLogTable
│   ├── Duplicates/          # DuplicateTable, ConfidenceBadge, EvidenceList
│   ├── Layout/              # Sidebar, Header, Layout
│   ├── Quality/             # QualityScoreGauge, QualityIssueCard, FieldHealthTable
│   ├── Review/              # ReviewTable, RecordComparisonModal
│   └── Upload/              # FileUpload, DatasetOverview, FieldAvailability, PromptInput
├── context/
│   └── CleanupContext.jsx   # Global application state & workflow runner
├── data/
│   └── demoData.js          # Starter test cases (Sneha Srirampur, Rahul Kumar, Anita Rao)
├── pages/
│   ├── DashboardPage.jsx
│   ├── UploadPage.jsx
│   ├── QualityPage.jsx
│   ├── DuplicatesPage.jsx
│   ├── ReviewPage.jsx
│   ├── DatasetPage.jsx
│   ├── DecisionLogPage.jsx
│   ├── SettingsModal.jsx
│   └── HelpModal.jsx
├── services/
│   ├── api.js               # Production API adapter (points to FastAPI backend)
│   └── mockApi.js           # In-memory mock service layer
├── utils/
│   ├── download.js          # Browser file exporter (CSV, JSON, Text Report)
│   └── fileParser.js        # CSV, JSON, and XLSX parsers
├── App.jsx                  # Main router configuration
├── main.jsx                 # Vite application entry
└── index.css                # Enterprise SaaS styling
```

---

## 5. Future FastAPI Integration

To connect this frontend to a real FastAPI backend:
1. Set the backend URL in `.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_USE_MOCK=false
   ```
2. The endpoints prepared in [`src/services/api.js`](src/services/api.js) will automatically communicate with:
   - `POST /upload`: Upload dataset file
   - `GET /preview`: Fetch dataset schema & records
   - `POST /analyze`: Execute data-quality diagnostics
   - `POST /cleanup`: Run autonomous cleanup workflow
   - `GET /duplicates`: Retrieve candidate duplicate pairs
   - `GET /review-cases`: Retrieve cases requiring review
   - `POST /review-cases/{id}/decision`: Record steward resolution
   - `GET /clean-dataset`: Retrieve consolidated golden master dataset
   - `GET /decision-log`: Retrieve decision audit records
