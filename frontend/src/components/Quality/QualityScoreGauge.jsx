// src/components/Quality/QualityScoreGauge.jsx
import React from 'react';
import { Award, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function QualityScoreGauge({ score = 72, targetScore = 94, isCleaned = true }) {
  // Determine rating label and color
  let rating = "Needs Attention";
  let ratingClass = "rating-warning";
  if (score >= 85) {
    rating = "Good";
    ratingClass = "rating-good";
  } else if (score < 50) {
    rating = "Critical";
    ratingClass = "rating-critical";
  }

  // SVG Gauge calculations
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="quality-score-card">
      <div className="score-card-header">
        <div className="header-icon-box">
          <Award size={20} />
        </div>
        <div>
          <h3 className="score-card-title">Data Quality Score</h3>
          <p className="score-card-subtitle">Aggregate health based on completeness, validity & deduplication</p>
        </div>
      </div>

      <div className="gauge-center-content">
        {/* SVG Circular Gauge */}
        <div className="svg-gauge-wrap">
          <svg height={radius * 2 + 10} width={radius * 2 + 10} className="gauge-svg">
            <circle
              stroke="#e2e8f0"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius + 5}
              cy={radius + 5}
            />
            <circle
              className={`gauge-bar ${ratingClass}`}
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              fill="transparent"
              r={normalizedRadius}
              cx={radius + 5}
              cy={radius + 5}
            />
          </svg>
          <div className="gauge-value-display">
            <span className="gauge-number">{score}</span>
            <span className="gauge-denominator">/ 100</span>
          </div>
        </div>

        {/* Rating and Legend */}
        <div className="gauge-legend-side">
          <div className={`rating-status-pill ${ratingClass}`}>
            {score >= 85 ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{rating}</span>
          </div>

          <div className="gauge-status-breakdown">
            <div className="status-tier">
              <span className="tier-dot dot-good" />
              <span>Good (85–100)</span>
            </div>
            <div className="status-tier">
              <span className="tier-dot dot-warning" />
              <span>Needs Attention (50–84)</span>
            </div>
            <div className="status-tier">
              <span className="tier-dot dot-critical" />
              <span>Critical (0–49)</span>
            </div>
          </div>

          {isCleaned && (
            <div className="score-improvement-banner">
              <TrendingUp size={16} className="trend-icon" />
              <span>Score projected to reach <strong>{targetScore}/100</strong> post-cleanup</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
