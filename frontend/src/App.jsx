import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, History, Activity, User, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './App.css';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ResultsPage from './pages/ResultsPage';
import { GlobalErrorBoundary } from './components/ErrorBoundary';

export const AuthContext = React.createContext(null);

// ── Toast System ──────────────────────────────────────────────────────────────
export const ToastContext = React.createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => {
          const Icon = icons[toast.type] || Info;
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`} style={{ animation: 'slideInRight 0.3s ease forwards' }}>
              <Icon size={18} style={{ color: toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--danger)' : 'var(--info)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', flex: 1 }}>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.125rem' }}>
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
          else { setToken(null); localStorage.removeItem('token'); }
        })
        .catch(() => { setToken(null); localStorage.removeItem('token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', background: 'var(--background)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading EduPredict…</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <ToastProvider>
        <BrowserRouter>
          <Navbar user={user} logout={logout} />
          <main className="page-container container animate-fade-in">
            <GlobalErrorBoundary>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
                <Route path="/history" element={user ? <HistoryPage /> : <Navigate to="/login" />} />
                <Route path="/results/:id" element={user ? <ResultsPage /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </GlobalErrorBoundary>
          </main>
        </BrowserRouter>
      </ToastProvider>
    </AuthContext.Provider>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ user, logout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className="glass-nav">
      <div className="container navbar">
        <Link to="/" className="brand">
          <div className="brand-icon"><BookOpen size={18} /></div>
          Edu<em>Predict</em>
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                <Activity size={16} /> New Analysis
              </Link>
              <Link to="/history" className={isActive('/history')}>
                <History size={16} /> History
              </Link>
              <div className="nav-divider" />
              <div className="user-pill">
                <div className="user-avatar">{initials}</div>
                <span>{user.full_name?.split(' ')[0] || user.email}</span>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '0.25rem' }}
                title="Logout"
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default App;
