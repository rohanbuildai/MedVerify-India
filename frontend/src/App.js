import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/common/ProtectedRoute';
import './styles/globals.css';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const PublicReportsPage = lazy(() => import('./pages/PublicReportsPage'));
const FlaggedPage = lazy(() => import('./pages/FlaggedPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const { LoginPage, RegisterPage } = require('./pages/AuthPages');

// Loading fallback
const PageLoader = () => (
  <div style={{
    minHeight: '60vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexDirection: 'column', gap: 12
  }}>
    <div style={{
      width: 36, height: 36, border: '3px solid var(--slate-200)',
      borderTopColor: 'var(--green-600)', borderRadius: '50%',
      animation: 'spin .7s linear infinite'
    }} />
    <p style={{ color: 'var(--slate-400)', fontSize: 13 }}>Loading...</p>
  </div>
);

// 404 Page
const NotFoundPage = () => (
  <div style={{
    minHeight: '70vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexDirection: 'column', gap: 16,
    textAlign: 'center', padding: 24
  }}>
    <div style={{ fontSize: 72, lineHeight: 1 }}>🔍</div>
    <h2 style={{ fontSize: '2rem' }}>Page Not Found</h2>
    <p style={{ color: 'var(--slate-500)', maxWidth: 400 }}>
      The page you're looking for doesn't exist. It may have been moved or the URL might be incorrect.
    </p>
    <a href="/" className="btn btn-primary btn-lg">Go Home</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/verify/:id" element={<VerifyPage />} />
                <Route path="/reports/public" element={<PublicReportsPage />} />
                <Route path="/flagged" element={<FlaggedPage />} />

                {/* Auth Routes (redirect if logged in) */}
                <Route path="/login" element={
                  <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
                } />
                <Route path="/register" element={
                  <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
                } />

                {/* Protected Routes */}
                <Route path="/report" element={
                  <ProtectedRoute><ReportPage /></ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute><AdminPage /></AdminRoute>
                } />
                <Route path="/admin/*" element={
                  <AdminRoute><AdminPage /></AdminRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
