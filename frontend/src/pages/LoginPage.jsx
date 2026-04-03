import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader, CheckCircle, BrainCircuit, BarChart2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h2>Welcome back to your learning hub</h2>
            <p>Sign in to access your analysis history, run new assessments, and track your academic growth over time.</p>
          </div>
          <div className="auth-feature-list">
            {[
              { icon: BrainCircuit, text: 'AI-powered learning outcome prediction' },
              { icon: BarChart2, text: 'Full analytics dashboard with charts' },
              { icon: ShieldCheck, text: 'Personalized risk assessment & action plan' },
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
            <h2>Sign in</h2>
            <p>Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="error-banner">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label" htmlFor="email">
                <Mail size={13} style={{ display: 'inline', marginRight: 4 }} />
                Email Address
              </label>
              <input
                id="email" type="email" className="input-field"
                value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="student@university.edu"
              />
            </div>

            <div className="form-group">
              <label className="input-label" htmlFor="password">
                <Lock size={13} style={{ display: 'inline', marginRight: 4 }} />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password" type={showPwd ? 'text' : 'password'} className="input-field"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }} disabled={isLoading}>
              {isLoading ? <><Loader size={16} className="animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="form-toggle">
            Don't have an account? <Link to="/register">Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
