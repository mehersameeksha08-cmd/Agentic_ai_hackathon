// src/components/Common/LoadingState.jsx
import React from 'react';

export default function LoadingState({ message = "Loading data...", size = "md" }) {
  return (
    <div className={`loading-state-container size-${size}`}>
      <div className="spinner-ring" />
      <p className="loading-message">{message}</p>
    </div>
  );
}
