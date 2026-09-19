// src/components/Common/Button.jsx
import React from 'react';

export default function Button({
  children,
  variant = 'primary', // primary, secondary, outline, danger, success, ghost
  size = 'md', // sm, md, lg
  icon: Icon,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseClass = "btn";
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : Icon ? (
        <span className="btn-icon"><Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} /></span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
