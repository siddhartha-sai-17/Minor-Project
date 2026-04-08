import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import { BookOpen, Mail, Lock, Eye, EyeOff, BrainCircuit, BarChart2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import GradientButton from '../components/GradientButton';
import { shakeVariant } from '../lib/animations';

const FEATURES = [
  { icon: BrainCircuit, text: 'AI-powered learning outcome prediction' },
  { icon: BarChart2,    text: 'Full analytics dashboard with charts' },
  { icon: ShieldCheck,  text: 'Personalized risk assessment & action plan' },
];

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`,
        { email, password }
      );
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPageWrapper>
      <div className="auth-page">
        <div className="auth-split">

          {/* ── Left Panel ── */}
          <motion.div
            className="auth-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
                <motion.div
                  style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex' }}
                  whileHover={{ rotate: 10, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                >
                  <BookOpen size={22} />
                </motion.div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem' }}>EduPredict</span>
              </div>
              <h2>Welcome back to your learning hub</h2>
              <p>Sign in to access your analysis history, run new assessments, and track your academic growth over time.</p>
            </div>

            <motion.div
              className="auth-feature-list"
              initial="initial"
              animate="animate"
              variants={{ animate: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
            >
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={i}
                  className="auth-feature-item"
                  variants={{
                    initial: { opacity: 0, x: -16 },
                    animate: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  <Icon size={16} style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
                  <span>{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right Panel ── */}
          <motion.div
            className="auth-right"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="auth-header">
              <h2>Sign in</h2>
              <p>Enter your credentials to continue</p>
            </div>

            {/* Error banner with shake */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="error-banner"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1, ...shakeVariant.shake }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.38 }}
              >
                <label className="input-label" htmlFor="email">
                  <Mail size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Email Address
                </label>
                <motion.input
                  id="email" type="email" className="input-field"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="student@university.edu"
                  whileFocus={{ boxShadow: '0 0 0 3px rgba(79,70,229,0.15)', borderColor: '#4f46e5' }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>

              {/* Password */}
              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.38 }}
              >
                <label className="input-label" htmlFor="password">
                  <Lock size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <motion.input
                    id="password" type={showPwd ? 'text' : 'password'} className="input-field"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required placeholder="••••••••"
                    style={{ paddingRight: '2.75rem' }}
                    whileFocus={{ boxShadow: '0 0 0 3px rgba(79,70,229,0.15)', borderColor: '#4f46e5' }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.button
                    type="button" onClick={() => setShowPwd(s => !s)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    whileHover={{ color: 'var(--primary)', scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.38 }}
                style={{ marginTop: '1.5rem' }}
              >
                <GradientButton type="submit" loading={isLoading} disabled={isLoading} style={{ width: '100%' }}>
                  Sign In
                </GradientButton>
              </motion.div>
            </form>

            <motion.div
              className="form-toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Don't have an account? <Link to="/register">Create one free</Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
