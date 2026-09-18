# Data Cleanup Agent

An enterprise-grade, AI-powered customer data quality inspection and safe deduplication platform.

> **Product Message**: Turn messy customer data into a clean, trustworthy master dataset — safely.

---

## 🚀 Quick Start (Frontend)

To run the frontend web application:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will start immediately at `http://localhost:3000`.

*(You can also run `npm install` and `npm run dev` directly from the project root!)*

---

## 🛠️ Application Highlights

### 1. Workflow Architecture
- **Ingest & Parse**: Upload **CSV**, **JSON**, or **Excel (XLSX)** datasets with automatic schema and field detection in the browser.
- **Data Quality Diagnostics**: Circular Data Quality Score gauge (72/100 $\to$ 94/100) and categorized issue cards for missing, malformed, and conflicting attributes.
- **Candidate Deduplication**: Inspect duplicate pairs with AI confidence indicators (`98%`, `65%`, `35%`), positive match evidence bullets, conflict signals, and AI reasoning.
- **Side-by-Side Review Modal**: Full side-by-side customer profile diffs with real-time `MATCH`, `CONFLICT`, and `MISSING` attribute highlights.
- **Interactive Steward Actions**: Click `MERGE`, `KEEP SEPARATE`, or `FLAG / CONTINUE REVIEW` to update application state, dashboard KPIs, and the Decision Log.
- **Clean Master Dataset**: Export deduplicated golden records as **Clean CSV**, **Clean JSON**, or a formatted **Decision Audit Report**.
- **Decision Audit Log**: Searchable and filterable governance log with full provenance tracking.

---

## 📦 Project Structure

```
Data-cleaning-agent/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/              # Badge, Button, Modal, Toast, EmptyState, DataTable
│   │   │   ├── Dashboard/           # SummaryCard, CleanupStepperModal, SafeMergeBanner
│   │   │   ├── Dataset/             # CleanDatasetTable, DatasetComparison
│   │   │   ├── DecisionLog/         # DecisionLogTable
│   │   │   ├── Duplicates/          # DuplicateTable, ConfidenceBadge, EvidenceList
│   │   │   ├── Layout/              # Sidebar, Header, Layout
│   │   │   ├── Quality/             # QualityScoreGauge, QualityIssueCard, FieldHealthTable
│   │   │   ├── Review/              # ReviewTable, RecordComparisonModal
│   │   │   └── Upload/              # FileUpload, DatasetOverview, FieldAvailability, PromptInput
│   │   ├── context/
│   │   │   └── CleanupContext.jsx   # Global application state & workflow runner
│   │   ├── data/
│   │   │   └── demoData.js          # Pre-loaded starter test cases (Sneha, Rahul, Anita)
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx    # Main overview & KPI dashboard
│   │   │   ├── UploadPage.jsx       # File upload & schema inspector
│   │   │   ├── QualityPage.jsx      # Data quality audit & score gauge
│   │   │   ├── DuplicatesPage.jsx   # Candidate duplicate pairs & evidence
│   │   │   ├── ReviewPage.jsx       # Human-in-the-loop review queue
│   │   │   ├── DatasetPage.jsx      # Clean master dataset & before/after comparison
│   │   │   ├── DecisionLogPage.jsx  # Audit log & governance
│   │   │   ├── SettingsModal.jsx    # Thresholds & safe merge guardrails
│   │   │   └── HelpModal.jsx        # Documentation & starter case guide
│   │   ├── services/
│   │   │   ├── api.js               # Production API adapter (points to FastAPI backend)
│   │   │   └── mockApi.js           # In-memory mock service layer
│   │   ├── utils/
│   │   │   ├── download.js          # In-browser CSV/JSON/Report exporter
│   │   │   └── fileParser.js        # In-browser CSV/JSON/XLSX parser
│   │   ├── App.jsx                  # React Router routes
│   │   ├── main.jsx                 # Application entry
│   │   └── index.css                # Enterprise SaaS styling
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/                         # FastAPI backend & Python engines
├── data/                            # Test JSON and CSV datasets
├── test_agent.py                    # Automated test verification script
└── README.md
```

---

## 🛡️ Safe Merge Policy

The application visually enforces a strict **Safe Merge Guarantee**:
- Customer records are **never** merged solely because names match.
- Clashing primary identifiers (such as conflicting phone numbers or differing street numbers) automatically route records to the steward review queue to prevent irreversible data corruption.
