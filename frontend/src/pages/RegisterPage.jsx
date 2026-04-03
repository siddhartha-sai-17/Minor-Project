import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, Loader, BrainCircuit, BarChart2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) { setError('Passwords do not match.'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = formData.password.length === 0 ? 0
    : formData.password.length < 6 ? 1
    : formData.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'][strength];

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-split">
        {/* Left Panel */}
        <div className="auth-left">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex' }}>
                <BookOpen size={22} />
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem' }}>EduPredict</span>
            </div>
            <h2>Start your academic intelligence journey</h2>
            <p>Create your free account to run AI-powered learning behavior analysis and get personalized recommendations.</p>
          </div>
          <div className="auth-feature-list">
            {[
              { icon: BrainCircuit, text: 'Predict your learning outcome instantly' },
              { icon: BarChart2, text: '15+ metrics analyzed with rich charts' },
              { icon: ShieldCheck, text: 'Private, secure per-user data storage' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="auth-feature-item">
                <Icon size={16} style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-header">
            <h2>Create your account</h2>
            <p>Free forever — no credit card required</p>
          </div>

          {error && <div className="error-banner"><span>{error}</span></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label" htmlFor="full_name">
                <User size={13} style={{ display: 'inline', marginRight: 4 }} /> Full Name
              </label>
              <input id="full_name" name="full_name" type="text" className="input-field"
                value={formData.full_name} onChange={handleChange}
                required placeholder="Jane Doe" />
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="email">
                <Mail size={13} style={{ display: 'inline', marginRight: 4 }} /> Email Address
              </label>
              <input id="email" name="email" type="email" className="input-field"
                value={formData.email} onChange={handleChange}
                required placeholder="student@university.edu" />
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="password">
                <Lock size={13} style={{ display: 'inline', marginRight: 4 }} /> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input id="password" name="password" type={showPwd ? 'text' : 'password'} className="input-field"
                  value={formData.password} onChange={handleChange}
                  required placeholder="Min. 6 characters"
                  style={{ paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.password.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem' }}>
                  {[1,2,3].map(l => (
                    <div key={l} style={{ flex: 1, height: 3, borderRadius: 2, background: strength >= l ? strengthColor : 'var(--border)', transition: 'background 0.2s' }} />
                  ))}
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="confirm">
                <Lock size={13} style={{ display: 'inline', marginRight: 4 }} /> Confirm Password
              </label>
              <input id="confirm" name="confirm" type={showPwd ? 'text' : 'password'} className="input-field"
                value={formData.confirm} onChange={handleChange}
                required placeholder="Re-enter password" />
              {formData.confirm && formData.password !== formData.confirm && (
                <p className="error-text">Passwords don't match</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={isLoading}>
              {isLoading ? <><Loader size={16} className="animate-spin" /> Creating account…</> : 'Create Free Account'}
            </button>
          </form>

          <div className="form-toggle">
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
