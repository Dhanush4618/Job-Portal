import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Loading = () => (
  <div style={loadingContainerStyle}>
    <div style={spinnerStyle}></div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for this specific dashboard, boot back to home
    return <Navigate to="/" replace />;
  }

  return children;
};

// Styles for custom spinner loader
const loadingContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  width: '100%',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '3px solid rgba(255, 255, 255, 0.05)',
  borderTop: '3px solid var(--primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

// Inject spin keyframes into document head dynamically to support premium look
if (typeof document !== 'undefined') {
  const styleId = 'spinner-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

export default ProtectedRoute;
export { ProtectedRoute };
