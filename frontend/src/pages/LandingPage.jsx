import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit, LineChart, ShieldCheck, Sparkles,
  ArrowRight, CheckCircle, BarChart2, Target, Users, Zap
} from 'lucide-react';
import { AuthContext } from '../App';

const features = [
  {
    icon: BrainCircuit,
    color: '#4f46e5',
    bg: '#eef2ff',
    title: 'AI-Powered Prediction',
    desc: 'Our ensemble ML model (Random Forest + XGBoost) analyzes 15 behavioral metrics to predict your exact learning outcome with high accuracy.',
  },
  {
    icon: BarChart2,
    color: '#0ea5e9',
    bg: '#f0f9ff',
    title: 'Analytical Dashboard',
    desc: 'Visualize your learning profile with radar charts, bar graphs, gauges, and performance tables — all in one rich analytics report.',
  },
  {
    icon: ShieldCheck,
    color: '#10b981',
    bg: '#f0fdf4',
    title: 'Risk Assessment',
    desc: 'Identify high-risk behavioral patterns before they impact your grades — procrastination, attendance gaps, and assignment backlogs detected early.',
  },
  {
    icon: Sparkles,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    title: 'Personalized AI Recommendations',
    desc: 'Get structured, actionable improvement plans categorized by priority — from a 7-day action plan to 30-day expected improvements.',
  },
  {
    icon: LineChart,
    color: '#f59e0b',
    bg: '#fffbeb',
    title: 'Progress Tracking',
    desc: 'Track your learning health score, risk level, and key metrics over time with a searchable, filterable analysis history.',
  },
  {
    icon: Target,
    color: '#ef4444',
    bg: '#fef2f2',
    title: 'Goal Benchmarking',
    desc: 'Compare your metrics against ideal academic targets and see precisely where you stand in a clear performance vs. target visualization.',
  },
];

const stats = [
  { value: '15', label: 'Behavioral Metrics Analyzed' },
  { value: '95%+', label: 'Prediction Accuracy' },
  { value: '11', label: 'Recommendation Categories' },
  { value: '7', label: 'Analytics Chart Types' },
];

const benefits = [
  'Multi-step structured input form',
  'Learning Health Score (0–100)',
  'Feature importance explanation',
  'Exportable PDF report',
  'Secure per-user history',
  'Mobile-responsive design',
];

export default function LandingPage() {
  const { user } = useContext(AuthContext);
  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="landing-hero">
        <div className="landing-eyebrow">
          <Sparkles size={13} />
          EduPredict v2.0
        </div>

        <h1>
          Predict Your Learning Outcome with{' '}
          <span className="text-gradient">AI-Powered Analytics</span>
        </h1>

        <p>
          EduPredict analyzes your study habits, digital engagement, and
          behavioral patterns to build a complete academic health profile —
          then gives you a personalized roadmap to improve.
        </p>

        <div className="hero-cta-group">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Your Free Assessment <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In to Dashboard
              </Link>
            </>
          )}
        </div>

        {/* Stats Band */}
        <div className="stats-band animate-fade-in-delay-1">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="stat-item-value">{s.value}</div>
              <div className="stat-item-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ──────────────────────────────────────────── */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>Platform Capabilities</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Everything you need to understand your learning
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', fontSize: '0.95rem' }}>
            A complete student analytics platform built for academic insight — not just a prediction tool.
          </p>
        </div>

        <div className="features-grid animate-fade-in-delay-2">
          {features.map((f, i) => (
            <div key={i} className="feature-card card-hover">
              <div className="feature-icon" style={{ background: f.bg }}>
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Benefits Strip ────────────────────────────────────── */}
      <div
        className="animate-fade-in-delay-3"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2.5rem',
          marginBottom: '4rem',
          color: 'white',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>
            Why EduPredict?
          </div>
          <h2 style={{ color: 'white', fontSize: '1.6rem', marginBottom: '1rem' }}>
            Built for real academic impact
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, fontSize: '0.9rem' }}>
            Unlike generic study apps, EduPredict uses a trained machine learning model
            on 10,000+ student records to give you statistically grounded predictions
            and recommendations that actually change outcomes.
          </p>
          <Link to="/register" className="btn btn-lg" style={{ marginTop: '1.75rem', background: 'white', color: '#4f46e5', fontWeight: 700 }}>
            Try It Now — It's Free <ArrowRight size={18} />
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={18} style={{ color: '#6ee7b7', flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '2rem 0 1rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          EduPredict · Student Learning Behavior Analysis System
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
          Built with React · Flask · scikit-learn · Recharts · Lucide React
        </p>
      </div>
    </div>
  );
}
