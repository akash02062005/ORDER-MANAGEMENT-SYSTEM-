import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  style = {},
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="btn-spinner" />
          {children}
        </>
      ) : children}
    </button>
  );
};

export default Button;
