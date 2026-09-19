// src/components/Common/Badge.jsx
import React from 'react';

export default function Badge({ variant, children, className = "", size = "md" }) {
  const norm = (variant || children || "").toString().toUpperCase();

  let badgeStyle = "badge-default";

  if (norm.includes("MERGE")) {
    badgeStyle = "badge-merge";
  } else if (norm.includes("KEEP SEPARATE") || norm.includes("PRESERVE")) {
    badgeStyle = "badge-preserve";
  } else if (norm.includes("FLAG") || norm.includes("REVIEW")) {
    badgeStyle = "badge-flagged";
  } else if (norm.includes("CONFLICT")) {
    badgeStyle = "badge-conflict";
  } else if (norm.includes("MISSING")) {
    badgeStyle = "badge-missing";
  } else if (norm.includes("CLEAN")) {
    badgeStyle = "badge-cleaned";
  } else if (norm.includes("HIGH")) {
    badgeStyle = "badge-high-conf";
  } else if (norm.includes("MEDIUM")) {
    badgeStyle = "badge-med-conf";
  } else if (norm.includes("LOW")) {
    badgeStyle = "badge-low-conf";
  } else if (norm.includes("MATCH")) {
    badgeStyle = "badge-match";
  } else if (norm.includes("ACTIVE") || norm.includes("GOOD")) {
    badgeStyle = "badge-active";
  }

  const sizeClass = size === "sm" ? "badge-sm" : size === "lg" ? "badge-lg" : "badge-md";

  return (
    <span className={`badge ${badgeStyle} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}
