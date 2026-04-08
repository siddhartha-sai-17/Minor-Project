import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, BrainCircuit, BarChart2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import GradientButton from '../components/GradientButton';
import { shakeVariant } from '../lib/animations';

const FEATURES = [
  { icon: BrainCircuit, text: 'Predict your learning outcome instantly' },
  { icon: BarChart2,    text: '15+ metrics analyzed with rich charts' },
  { icon: ShieldCheck,  text: 'Private, secure per-user data storage' },
];

export default function RegisterPage() {
  const [formData, setFormData]   = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) { setError('Passwords do not match.'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`,
        { full_name: formData.full_name, email: formData.email, password: formData.password }
      );
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength      = formData.password.length === 0 ? 0 : formData.password.length < 6 ? 1 : formData.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'][strength];

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
              <h2>Start your academic intelligence journey</h2>
              <p>Create your free account to run AI-powered learning behavior analysis and get personalized recommendations.</p>
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
              <h2>Create your account</h2>
              <p>Free forever — no credit card required</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="error-banner"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1, ...shakeVariant.shake }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <motion.div className="form-group" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <label className="input-label" htmlFor="full_name">
                  <User size={13} style={{ display: 'inline', marginRight: 4 }} /> Full Name
                </label>
                <motion.input
                  id="full_name" name="full_name" type="text" className="input-field"
                  value={formData.full_name} onChange={handleChange}
                  required placeholder="Jane Doe"
                  whileFocus={{ boxShadow: '0 0 0 3px rgba(79,70,229,0.15)', borderColor: '#4f46e5' }}
                />
              </motion.div>

              {/* Email */}
              <motion.div className="form-group" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
                <label className="input-label" htmlFor="reg-email">
                  <Mail size={13} style={{ display: 'inline', marginRight: 4 }} /> Email Address
                </label>
                <motion.input
                  id="reg-email" name="email" type="email" className="input-field"
                  value={formData.email} onChange={handleChange}
                  required placeholder="student@university.edu"
                  whileFocus={{ boxShadow: '0 0 0 3px rgba(79,70,229,0.15)', borderColor: '#4f46e5' }}
                />
              </motion.div>

              {/* Password */}
              <motion.div className="form-group" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                <label className="input-label" htmlFor="reg-password">
                  <Lock size={13} style={{ display: 'inline', marginRight: 4 }} /> Password
                </label>
                <div style={{ position: 'relative' }}>
                  <motion.input
                    id="reg-password" name="password"
                    type={showPwd ? 'text' : 'password'} className="input-field"
                    value={formData.password} onChange={handleChange}
                    required placeholder="Min. 6 characters"
                    style={{ paddingRight: '2.75rem' }}
                    whileFocus={{ boxShadow: '0 0 0 3px rgba(79,70,229,0.15)', borderColor: '#4f46e5' }}
                  />
                  <motion.button
                    type="button" onClick={() => setShowPwd(s => !s)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>

                {/* Animated password strength bar */}
                <AnimatePresence>
                  {formData.password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}
                    >
                      {[1, 2, 3].map(l => (
                        <motion.div
                          key={l}
                          style={{ flex: 1, height: 3, borderRadius: 2 }}
                          animate={{ background: strength >= l ? strengthColor : 'var(--border)' }}
                          transition={{ duration: 0.3 }}
                        />
                      ))}
                      <motion.span
                        key={strengthLabel}
                        style={{ fontSize: '0.72rem', fontWeight: 700, color: strengthColor }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      >
                        {strengthLabel}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password */}
              <motion.div className="form-group" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
                <label className="input-label" htmlFor="confirm">
                  <Lock size={13} style={{ display: 'inline', marginRight: 4 }} /> Confirm Password
                </label>
                <motion.input
                  id="confirm" name="confirm"
                  type={showPwd ? 'text' : 'password'} className="input-field"
                  value={formData.confirm} onChange={handleChange}
                  required placeholder="Re-enter password"
                  whileFocus={{ boxShadow: '0 0 0 3px rgba(79,70,229,0.15)', borderColor: '#4f46e5' }}
                />
                <AnimatePresence>
                  {formData.confirm && formData.password !== formData.confirm && (
                    <motion.p
                      className="error-text"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      Passwords don't match
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }} style={{ marginTop: '0.5rem' }}>
                <GradientButton type="submit" loading={isLoading} disabled={isLoading} style={{ width: '100%' }}>
                  Create Free Account
                </GradientButton>
              </motion.div>
            </form>

            <motion.div className="form-toggle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.56 }}>
              Already have an account? <Link to="/login">Sign in here</Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
