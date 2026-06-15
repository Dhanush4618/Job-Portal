import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Render Node */}
      <div style={toastContainerStyle}>
        {toasts.map((t) => (
          <div key={t.id} className="fade-in" style={{ ...toastItemStyle, ...getToastTypeStyles(t.type) }}>
            {getToastIcon(t.type)}
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={closeButtonStyle}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Inline CSS for Toast Container & Items (leveraging design tokens)
const toastContainerStyle = {
  position: 'fixed',
  top: '24px',
  right: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  zIndex: 9999,
  maxWidth: '350px',
  width: '100%',
};

const toastItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 20px',
  borderRadius: '8px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  backdropFilter: 'blur(8px)',
  borderLeft: '4px solid transparent',
  color: '#ffffff',
  animation: 'fadeIn 0.3s ease-out',
};

const closeButtonStyle = {
  marginLeft: 'auto',
  background: 'none',
  border: 'none',
  color: 'inherit',
  opacity: 0.7,
  cursor: 'pointer',
  padding: '2px',
  display: 'flex',
  alignItems: 'center',
};

const getToastTypeStyles = (type) => {
  switch (type) {
    case 'success':
      return {
        background: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderLeft: '4px solid #10b981',
      };
    case 'warning':
      return {
        background: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderLeft: '4px solid #f59e0b',
      };
    case 'danger':
      return {
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderLeft: '4px solid #ef4444',
      };
    default: // info / primary
      return {
        background: 'rgba(99, 102, 241, 0.15)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderLeft: '4px solid #6366f1',
      };
  }
};

const getToastIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} color="#10b981" />;
    case 'warning':
      return <AlertTriangle size={20} color="#f59e0b" />;
    case 'danger':
      return <AlertCircle size={20} color="#ef4444" />;
    default:
      return <Info size={20} color="#6366f1" />;
  }
};
