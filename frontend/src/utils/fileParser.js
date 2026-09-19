// src/utils/fileParser.js
// In-browser parser for CSV, JSON, and XLSX datasets
import * as XLSX from 'xlsx';

export function parseJson(content) {
  try {
    const data = JSON.parse(content);
    if (!Array.isArray(data)) {
      throw new Error("JSON file must contain an array of customer records.");
    }
    return data;
  } catch (err) {
    throw new Error(`JSON parsing failed: ${err.message}`);
  }
}

export function parseCsv(content) {
  try {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    if (lines.length === 0) {
      throw new Error("CSV file is empty.");
    }

    // Split headers respecting quotes
    const splitRow = (row) => {
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const matches = [];
      let match = regex.exec(row);
      while (match) {
        if (match[1] !== undefined) {
          matches.push(match[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim());
        }
        match = regex.exec(row);
      }
      return matches;
    };

    const headers = splitRow(lines[0]);
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitRow(lines[i]);
      if (values.length === 0) continue;
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || "";
      });
      // Fallback for customer_id
      if (!obj.customer_id && !obj.id && !obj.CustomerId) {
        obj.customer_id = `ROW-${i}`;
      }
      records.push(obj);
    }

    return records;
  } catch (err) {
    throw new Error(`CSV parsing failed: ${err.message}`);
  }
}

export function parseXlsx(arrayBuffer) {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("Excel workbook has no sheets.");
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No data found in the first sheet of Excel file.");
    }
    return data;
  } catch (err) {
    throw new Error(`Excel parsing failed: ${err.message}`);
  }
}

export function inspectDatasetFields(records = []) {
  if (!records || records.length === 0) {
    return { detectedFields: [], missingValuesCount: 0 };
  }

  const fieldSet = new Set();
  records.forEach(rec => {
    Object.keys(rec).forEach(k => fieldSet.add(k));
  });

  const expectedFields = [
    "customer_id", "name", "email", "phone", "address",
    "city", "state", "country", "last_updated", "source"
  ];

  const detectedFields = expectedFields.map(f => {
    const foundKey = Object.keys(records[0] || {}).find(k => k.toLowerCase() === f.toLowerCase());
    return {
      name: f,
      isAvailable: Boolean(foundKey),
      actualKey: foundKey || null
    };
  });

  // Calculate missing values count
  let missingValuesCount = 0;
  records.forEach(rec => {
    Object.values(rec).forEach(val => {
      if (val === null || val === undefined || String(val).trim() === "") {
        missingValuesCount++;
      }
    });
  });

  return {
    detectedFields,
    allKeys: Array.from(fieldSet),
    missingValuesCount
  };
}
