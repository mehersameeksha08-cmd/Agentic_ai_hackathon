// src/data/demoData.js
// Standard demo dataset and mock evaluation data specified in the project requirements.

export const DEMO_CUSTOMERS = [
  {
    customer_id: "C1001",
    name: "Sneha Srirampur",
    email: "sneha@gmail.com",
    phone: "9876543210",
    address: "12 Lake Road",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    last_updated: "2026-09-10",
    source: "CRM"
  },
  {
    customer_id: "C1044",
    name: "S. Srirampur",
    email: "sneha@gmail.com",
    phone: "9876543210",
    address: "12 Lake Rd",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    last_updated: "2026-09-12",
    source: "Support"
  },
  {
    customer_id: "C1088",
    name: "Sneh Srirampur",
    email: "srirampur@gmail.com",
    phone: "9876543210",
    address: "14 Lake Road",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    last_updated: "2026-09-15",
    source: "Web"
  },
  {
    customer_id: "C2001",
    name: "Rahul Kumar",
    email: "rahul1@example.com",
    phone: "9000000001",
    address: "10 MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    last_updated: "2026-09-01",
    source: "CRM"
  },
  {
    customer_id: "C2002",
    name: "Rahul Kumar",
    email: "rahul2@example.com",
    phone: "9000000002",
    address: "22 Park Street",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    last_updated: "2026-09-02",
    source: "Web"
  },
  {
    customer_id: "C3001",
    name: "Anita Rao",
    email: "anita@example.com",
    phone: "9111111111",
    address: "5 Green Avenue",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    last_updated: "2026-08-01",
    source: "CRM"
  },
  {
    customer_id: "C3002",
    name: "Anita Rao",
    email: "anita@example.com",
    phone: "9222222222",
    address: "5 Green Avenue",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    last_updated: "2026-08-20",
    source: "Billing"
  }
];

export const DEMO_CANDIDATES = [
  {
    id: "PAIR-001",
    customer_id_1: "C1001",
    customer_id_2: "C1044",
    customer1: DEMO_CUSTOMERS[0],
    customer2: DEMO_CUSTOMERS[1],
    confidence: 0.98,
    confidence_level: "High Confidence",
    decision: "MERGE", // MERGE | KEEP SEPARATE | FLAGGED
    status: "Resolved",
    matching_fields: ["Email", "Phone", "Normalized Address", "Name Initial"],
    conflicts: [],
    evidence: [
      "✓ Exact match on email: sneha@gmail.com",
      "✓ Exact match on phone: 9876543210",
      "✓ Address matches after standardization ('12 Lake Rd' == '12 Lake Road')",
      "✓ Name compatible: 'Sneha Srirampur' matches 'S. Srirampur'"
    ],
    reason: "Multiple independent identifiers strongly indicate these records represent the same customer entity.",
    suggested_action: "Merge into single golden master record preserving latest update (2026-09-12)."
  },
  {
    id: "PAIR-002",
    customer_id_1: "C1001",
    customer_id_2: "C1088",
    customer1: DEMO_CUSTOMERS[0],
    customer2: DEMO_CUSTOMERS[2],
    confidence: 0.65,
    confidence_level: "Medium Confidence",
    decision: "FLAGGED",
    status: "Needs Review",
    matching_fields: ["Phone", "City", "Similar Name"],
    conflicts: ["House Number (12 vs 14)", "Different Email (sneha@ vs srirampur@)"],
    evidence: [
      "✓ Same phone number: 9876543210",
      "✓ Similar name tokens: 'Sneha' vs 'Sneh'",
      "⚠ Different email addresses: sneha@gmail.com vs srirampur@gmail.com",
      "⚠ Conflicting street numbers: 12 Lake Road vs 14 Lake Road"
    ],
    reason: "Some identifiers match, but important customer information conflicts. House numbers 12 vs 14 on Lake Road and separate emails suggest possible family members or distinct neighbors.",
    suggested_action: "Human verification required to confirm whether this is a relocated customer or distinct individual."
  },
  {
    id: "PAIR-003",
    customer_id_1: "C1044",
    customer_id_2: "C1088",
    customer1: DEMO_CUSTOMERS[1],
    customer2: DEMO_CUSTOMERS[2],
    confidence: 0.65,
    confidence_level: "Medium Confidence",
    decision: "FLAGGED",
    status: "Needs Review",
    matching_fields: ["Phone", "City", "Last Name"],
    conflicts: ["House Number (12 vs 14)", "Different Email"],
    evidence: [
      "✓ Matching phone number: 9876543210",
      "✓ Matching city: Hyderabad",
      "⚠ Address mismatch (12 Lake Rd vs 14 Lake Road)",
      "⚠ Email mismatch"
    ],
    reason: "Ambiguous duplicate candidate. Same phone number shared across different street addresses and email accounts.",
    suggested_action: "Verify primary residential address before merging."
  },
  {
    id: "PAIR-004",
    customer_id_1: "C2001",
    customer_id_2: "C2002",
    customer1: DEMO_CUSTOMERS[3],
    customer2: DEMO_CUSTOMERS[4],
    confidence: 0.35,
    confidence_level: "Low Confidence",
    decision: "KEEP SEPARATE",
    status: "Resolved",
    matching_fields: ["Name ('Rahul Kumar')"],
    conflicts: [
      "Different Phone (9000000001 vs 9000000002)",
      "Different Email (rahul1@ vs rahul2@)",
      "Different City (Bengaluru vs Hyderabad)",
      "Different Address"
    ],
    evidence: [
      "✓ Exact match on common name 'Rahul Kumar'",
      "⚠ Completely different contact numbers: 9000000001 vs 9000000002",
      "⚠ Different email handles at example.com",
      "⚠ Located in distinct metropolitan areas: Bengaluru vs Hyderabad"
    ],
    reason: "Same name alone does not establish that these records represent the same customer. Different phone, email, and location confirm distinct individuals.",
    suggested_action: "Preserve as independent customer profiles."
  },
  {
    id: "PAIR-005",
    customer_id_1: "C3001",
    customer_id_2: "C3002",
    customer1: DEMO_CUSTOMERS[5],
    customer2: DEMO_CUSTOMERS[6],
    confidence: 0.70,
    confidence_level: "Medium Confidence",
    decision: "FLAGGED",
    status: "Needs Review",
    matching_fields: ["Name", "Email", "Address", "City"],
    conflicts: ["Phone Number (9111111111 vs 9222222222)"],
    evidence: [
      "✓ Exact match on name: 'Anita Rao'",
      "✓ Exact match on email: anita@example.com",
      "✓ Exact match on address: 5 Green Avenue, Chennai",
      "⚠ Primary phone conflict: 9111111111 vs 9222222222"
    ],
    reason: "Name, email, and address match, but phone numbers conflict. Safe merge policy prevents automatic merge when primary contact channels clash.",
    suggested_action: "Investigate whether the customer updated their phone number from Billing source, or if this is an account takeover."
  }
];

export const DEMO_QUALITY_METRICS = {
  initialScore: 72,
  cleanedScore: 94,
  issues: {
    emailIssues: 24,
    phoneIssues: 17,
    missingAddresses: 31,
    formattingIssues: 52,
    conflictingFields: 15,
    duplicateValues: 42,
    missingEmail: 8,
    missingPhone: 6,
    invalidEmail: 16,
    invalidPhone: 11
  },
  fieldHealth: [
    { field: "customer_id", completeness: 100, validity: 100, status: "Good" },
    { field: "name", completeness: 100, validity: 98, status: "Good" },
    { field: "email", completeness: 92, validity: 86, status: "Needs Attention" },
    { field: "phone", completeness: 94, validity: 89, status: "Needs Attention" },
    { field: "address", completeness: 88, validity: 78, status: "Critical" },
    { field: "city", completeness: 100, validity: 96, status: "Good" },
    { field: "last_updated", completeness: 100, validity: 100, status: "Good" },
    { field: "source", completeness: 100, validity: 100, status: "Good" }
  ]
};

export const DEMO_CLEANED_DATASET = [
  {
    master_id: "M-C1001",
    name: "Sneha Srirampur",
    email: "sneha@gmail.com",
    phone: "9876543210",
    address: "12 Lake Road",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    last_updated: "2026-09-12",
    sources: ["CRM", "Support"],
    merged_ids: ["C1001", "C1044"],
    record_status: "Merged",
    is_cleaned: true
  },
  {
    master_id: "C1088",
    name: "Sneh Srirampur",
    email: "srirampur@gmail.com",
    phone: "9876543210",
    address: "14 Lake Road",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    last_updated: "2026-09-15",
    sources: ["Web"],
    merged_ids: ["C1088"],
    record_status: "Flagged for Review",
    is_cleaned: false
  },
  {
    master_id: "C2001",
    name: "Rahul Kumar",
    email: "rahul1@example.com",
    phone: "9000000001",
    address: "10 MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    last_updated: "2026-09-01",
    sources: ["CRM"],
    merged_ids: ["C2001"],
    record_status: "Preserved",
    is_cleaned: false
  },
  {
    master_id: "C2002",
    name: "Rahul Kumar",
    email: "rahul2@example.com",
    phone: "9000000002",
    address: "22 Park Street",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    last_updated: "2026-09-02",
    sources: ["Web"],
    merged_ids: ["C2002"],
    record_status: "Preserved",
    is_cleaned: false
  },
  {
    master_id: "C3001",
    name: "Anita Rao",
    email: "anita@example.com",
    phone: "9111111111",
    address: "5 Green Avenue",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    last_updated: "2026-08-01",
    sources: ["CRM"],
    merged_ids: ["C3001"],
    record_status: "Flagged for Review",
    is_cleaned: false
  },
  {
    master_id: "C3002",
    name: "Anita Rao",
    email: "anita@example.com",
    phone: "9222222222",
    address: "5 Green Avenue",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    last_updated: "2026-08-20",
    sources: ["Billing"],
    merged_ids: ["C3002"],
    record_status: "Flagged for Review",
    is_cleaned: false
  }
];

export const DEMO_DECISION_LOG = [
  {
    id: "LOG-001",
    timestamp: "2026-09-18 22:40:12",
    record_a: "C1001 (Sneha Srirampur)",
    record_b: "C1044 (S. Srirampur)",
    decision: "MERGE",
    confidence: "98%",
    matching_fields: "Email, Phone, Address, Name",
    conflicts: "None",
    reason: "Exact email & phone match with standardized street address abbreviation.",
    action: "Merged into M-C1001"
  },
  {
    id: "LOG-002",
    timestamp: "2026-09-18 22:40:13",
    record_a: "C1001 (Sneha Srirampur)",
    record_b: "C1088 (Sneh Srirampur)",
    decision: "FLAGGED",
    confidence: "65%",
    matching_fields: "Phone, City, Name",
    conflicts: "House Number (12 vs 14), Email",
    reason: "Phone matches but conflicting house number and distinct email requires human review.",
    action: "Routed to Review Queue"
  },
  {
    id: "LOG-003",
    timestamp: "2026-09-18 22:40:13",
    record_a: "C1044 (S. Srirampur)",
    record_b: "C1088 (Sneh Srirampur)",
    decision: "FLAGGED",
    confidence: "65%",
    matching_fields: "Phone, City",
    conflicts: "House Number (12 vs 14), Email",
    reason: "Shares phone number with differing residential address.",
    action: "Routed to Review Queue"
  },
  {
    id: "LOG-004",
    timestamp: "2026-09-18 22:40:14",
    record_a: "C2001 (Rahul Kumar)",
    record_b: "C2002 (Rahul Kumar)",
    decision: "KEEP SEPARATE",
    confidence: "95%",
    matching_fields: "Name",
    conflicts: "Phone, Email, City, Address",
    reason: "Common name shared across distinct entities in different cities.",
    action: "Preserved Separately"
  },
  {
    id: "LOG-005",
    timestamp: "2026-09-18 22:40:15",
    record_a: "C3001 (Anita Rao)",
    record_b: "C3002 (Anita Rao)",
    decision: "FLAGGED",
    confidence: "70%",
    matching_fields: "Name, Email, Address, City",
    conflicts: "Phone (9111111111 vs 9222222222)",
    reason: "Conflicting primary phone numbers prevent automated safe merge.",
    action: "Routed to Review Queue"
  }
];

export const DEMO_SUMMARY_STATS = {
  totalRecords: 7,
  duplicateCandidates: 5,
  recordsMerged: 2,
  keptSeparate: 2,
  flaggedForReview: 3,
  incompleteRecords: 1,
  conflictingRecords: 2
};
