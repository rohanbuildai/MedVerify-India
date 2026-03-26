import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Full page spinner
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexDirection: 'column', gap: 16,
    background: 'var(--slate-50)'
  }}>
    <div style={{
      width: 44, height: 44, border: '3px solid var(--slate-200)',
      borderTopColor: 'var(--green-600)', borderRadius: '50%',
      animation: 'spin .7s linear infinite'
    }} />
    <p style={{ color: 'var(--slate-500)', fontSize: 14 }}>Loading MedVerify...</p>
  </div>
);

// Protect any route - redirect to login if not authed
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin-only route
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Redirect if already logged in (for /login, /register)
export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};
