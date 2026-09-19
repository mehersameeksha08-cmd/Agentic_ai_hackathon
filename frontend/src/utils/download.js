// src/utils/download.js
// Client-side file exporter for JSON, CSV, and Decision Reports

export function downloadJson(data, filename = 'clean_master_dataset.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerDownload(blob, filename);
}

export function downloadCsv(data, filename = 'clean_master_dataset.csv') {
  if (!Array.isArray(data) || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  data.forEach(item => {
    const values = headers.map(header => {
      const val = item[header];
      if (Array.isArray(val)) {
        return `"${val.join('; ').replace(/"/g, '""')}"`;
      }
      const escaped = ('' + (val !== null && val !== undefined ? val : '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

export function downloadDecisionReport(decisions = [], summary = {}, filename = 'deduplication_decision_report.txt') {
  const lines = [
    "================================================================================",
    "               DATA CLEANUP AGENT — AUDIT & DECISION REPORT                    ",
    "================================================================================",
    `Generated on: ${new Date().toISOString()}`,
    `Total Evaluated Pairs: ${decisions.length}`,
    `Merged Pairs: ${summary.recordsMerged || 0}`,
    `Preserved Pairs: ${summary.keptSeparate || 0}`,
    `Flagged for Review: ${summary.flaggedForReview || 0}`,
    "--------------------------------------------------------------------------------",
    "",
    "DETAILED DECISION LOG:",
    ""
  ];

  decisions.forEach((d, idx) => {
    lines.push(`[Case #${idx + 1}] Pair: ${d.customer_id_1} <---> ${d.customer_id_2}`);
    lines.push(`  Decision:   ${d.decision}`);
    lines.push(`  Confidence: ${typeof d.confidence === 'number' ? Math.round(d.confidence * 100) + '%' : d.confidence}`);
    lines.push(`  Status:     ${d.status}`);
    lines.push(`  Reason:     ${d.reason}`);
    if (d.evidence && d.evidence.length > 0) {
      lines.push(`  Evidence:`);
      d.evidence.forEach(ev => lines.push(`    - ${ev}`));
    }
    if (d.conflicts && d.conflicts.length > 0) {
      lines.push(`  Conflicts:`);
      d.conflicts.forEach(cf => lines.push(`    - ${cf}`));
    }
    lines.push("");
  });

  lines.push("================================================================================");
  lines.push("End of Decision Audit Report — Safe Master Dataset Generated");

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
