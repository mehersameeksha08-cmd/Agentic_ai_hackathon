// src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  CheckCircle,
  Copy,
  AlertTriangle,
  Database,
  FileText,
  Settings,
  HelpCircle,
  ShieldCheck,
  X
} from 'lucide-react';
import { useCleanup } from '../../context/CleanupContext';

export default function Sidebar({ isOpen, onClose }) {
  const { reviewCases, setIsSettingsOpen, setIsHelpOpen } = useCleanup();

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/upload", label: "Upload Data", icon: UploadCloud },
    { to: "/quality", label: "Data Quality", icon: CheckCircle },
    { to: "/duplicates", label: "Duplicate Detection", icon: Copy },
    { to: "/review", label: "Review Cases", icon: AlertTriangle, badge: reviewCases.length },
    { to: "/dataset", label: "Clean Dataset", icon: Database },
    { to: "/decision-log", label: "Decision Log", icon: FileText },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <ShieldCheck size={22} className="logo-svg" />
          </div>
          <div className="brand-info">
            <span className="brand-title">Data Cleanup Agent</span>
            <span className="brand-tag">Enterprise Edition</span>
          </div>
          {isOpen && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Core Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => isOpen && onClose()}
              >
                <Icon size={18} className="link-icon" />
                <span className="link-text">{item.label}</span>
                {Boolean(item.badge) && item.badge > 0 && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Safe Merge Policy Banner in Sidebar */}
        <div className="sidebar-policy-box">
          <div className="policy-header">
            <ShieldCheck size={14} className="policy-icon" />
            <span>Safe Merge Policy</span>
          </div>
          <p className="policy-text">
            Automatic merges require high confidence. Names alone never trigger a merge.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="sidebar-bottom">
          <button
            className="sidebar-bottom-link"
            onClick={() => {
              setIsSettingsOpen(true);
              if (isOpen) onClose();
            }}
          >
            <Settings size={17} className="link-icon" />
            <span>Settings</span>
          </button>
          <button
            className="sidebar-bottom-link"
            onClick={() => {
              setIsHelpOpen(true);
              if (isOpen) onClose();
            }}
          >
            <HelpCircle size={17} className="link-icon" />
            <span>Help & Docs</span>
          </button>
        </div>
      </aside>
    </>
  );
}
