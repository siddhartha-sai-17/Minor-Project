import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = icons[toast.type] || Info;
            return (
              <motion.div
                key={toast.id}
                className={`toast toast-${toast.type}`}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              >
                <Icon size={18} style={{ color: toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--danger)' : 'var(--info)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', flex: 1 }}>{toast.message}</span>
                <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.125rem' }}>
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
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
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
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
        <motion.div
          style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading EduPredict…
        </motion.span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <ToastProvider>
        <BrowserRouter>
          <Navbar user={user} logout={logout} />
          <main className="page-container container">
            <GlobalErrorBoundary>
              <RoutesWithAnimation user={user} />
            </GlobalErrorBoundary>
          </main>
        </BrowserRouter>
      </ToastProvider>
    </AuthContext.Provider>
  );
}

// ── Routes wrapped with AnimatePresence ───────────────────────────────────────
function RoutesWithAnimation({ user }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={!user ? <LoginPage />    : <Navigate to="/dashboard" />} />
        <Route path="/register"  element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user  ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/history"   element={user  ? <HistoryPage />   : <Navigate to="/login" />} />
        <Route path="/results/:id" element={user ? <ResultsPage /> : <Navigate to="/login" />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ user, logout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <motion.nav
      className="glass-nav"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container navbar">
        <Link to="/" className="brand">
          <motion.div
            className="brand-icon"
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 16 }}
          >
            <BookOpen size={18} />
          </motion.div>
          Edu<em>Predict</em>
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <NavLink to="/dashboard" active={isActive('/dashboard')} icon={<Activity size={15} />}>
                New Analysis
              </NavLink>
              <NavLink to="/history" active={isActive('/history')} icon={<History size={15} />}>
                History
              </NavLink>
              <div className="nav-divider" />
              <motion.div
                className="user-pill"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <div className="user-avatar">{initials}</div>
                <span>{user.full_name?.split(' ')[0] || user.email}</span>
              </motion.div>
              <motion.button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '0.25rem' }}
                title="Logout"
                whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.10)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <LogOut size={15} /> Logout
              </motion.button>
            </>
          ) : (
            <>
              <NavLink to="/login" active={isActive('/login')}>Log in</NavLink>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

// ── NavLink subcomponent with animated underline ──────────────────────────────
function NavLink({ to, active, children, icon }) {
  return (
    <Link to={to} className={`nav-link${active ? ' active' : ''}`} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      {icon}
      {children}
      {active && (
        <motion.div
          layoutId="nav-underline"
          style={{
            position: 'absolute', bottom: -4, left: 0, right: 0,
            height: 2, background: 'var(--primary)', borderRadius: 2,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        />
      )}
    </Link>
  );
}

export default App;
