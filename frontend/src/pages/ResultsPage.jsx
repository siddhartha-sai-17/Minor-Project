import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, Target, Lightbulb, CheckCircle, AlertTriangle,
  AlertCircle, TrendingUp, ChevronDown, ChevronUp, Award,
  Clock, BookOpen, Monitor, Brain, Zap, BarChart2,
  Download, Printer, Activity, Info, Star, Calendar
} from 'lucide-react';

// ── Learning Health Score ──────────────────────────────────────────────────────
const computeHealthScore = (d) => {
  if (!d) return 0;
  const w = [
    Math.min(100, (d.daily_study_hours / 6) * 100) * 0.15,
    d.attendance_percentage * 0.15,
    d.assignment_submission_rate * 0.10,
    Math.max(0, 100 - (d.late_submission_count / 20) * 100) * 0.05,
    Math.min(100, (d.revision_frequency_per_week / 5) * 100) * 0.10,
    Math.min(100, ((d.lms_login_frequency_per_week / 7 + d.lms_time_spent_hours_per_week / 10) / 2) * 100) * 0.05,
    Math.min(100, (d.video_lectures_watched_per_week / 6) * 100) * 0.05,
    Math.min(100, (d.practice_quiz_attempts / 8) * 100) * 0.05,
    (d.class_participation_score / 10) * 100 * 0.05,
    ((d.search_skill_score + d.source_evaluation_score) / 2 / 10) * 100 * 0.05,
    (d.time_management_score / 10) * 100 * 0.10,
    ((10 - d.procrastination_score) / 9) * 100 * 0.05,
    ((10 - d.stress_level) / 9) * 100 * 0.05,
  ];
  return Math.round(Math.min(100, Math.max(0, w.reduce((a, b) => a + b, 0))));
};

// ── Gauge SVG ─────────────────────────────────────────────────────────────────
function GaugeMeter({ value, max = 100, label, color, size = 120 }) {
  const r = size * 0.4, cx = size / 2, cy = size * 0.58;
  const pct = Math.min(1, Math.max(0, value / max));
  const startAngle = Math.PI;
  const angle = startAngle + pct * Math.PI;
  const sx = cx + r * Math.cos(startAngle), sy = cy + r * Math.sin(startAngle);
  const ex = cx + r * Math.cos(angle), ey = cy + r * Math.sin(angle);
  const largeArc = pct > 0.5 ? 1 : 0;
  const trackEnd = { x: cx + r, y: cy };

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`}
        stroke="var(--surface-2)" strokeWidth={size * 0.065} fill="none" strokeLinecap="round" />
      {pct > 0 && (
        <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
          stroke={color} strokeWidth={size * 0.065} fill="none" strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 4} textAnchor="middle"
        style={{ fontSize: size * 0.175, fontWeight: 800, fill: color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {value}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle"
        style={{ fontSize: size * 0.082, fill: 'var(--text-muted)', fontFamily: 'Inter' }}>
        {label}
      </text>
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, unit = '', bg, color, sub }) {
  return (
    <div className="kpi-card animate-fade-in">
      <div className="kpi-icon" style={{ background: bg }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{unit}</span></div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

// ── Insight Card ──────────────────────────────────────────────────────────────
function InsightCard({ type, metric, text }) {
  const cfg = {
    strength:    { icon: CheckCircle, cls: 'strength',    tag: '✅ Strength' },
    improvement: { icon: TrendingUp,   cls: 'improvement', tag: '📈 Improve' },
    risk:        { icon: AlertCircle,  cls: 'risk',        tag: '⚠️ Risk' },
  }[type] || { icon: Info, cls: 'improvement', tag: metric };
  const Icon = cfg.icon;
  return (
    <div className={`insight-card ${cfg.cls}`}>
      <div className="insight-icon"><Icon size={16} /></div>
      <div>
        <div className="metric-tag">{cfg.tag}{metric ? ` · ${metric}` : ''}</div>
        <p>{text}</p>
      </div>
    </div>
  );
}

// ── Recommendation Accordion ──────────────────────────────────────────────────
function RecCard({ rec, idx }) {
  const [open, setOpen] = useState(idx === 0);

  // handle both new (object) and old (string) formats
  if (typeof rec === 'string') {
    return (
      <div className="rec-card">
        <div className="rec-card-header" onClick={() => setOpen(p => !p)}>
          <div className="rec-priority priority-medium">
            {String(idx + 1).padStart(2, '0')}
          </div>
          <span className="rec-card-title">{rec}</span>
          {open ? <ChevronUp size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
        </div>
      </div>
    );
  }

  const priorityClass = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' }[rec.priority] || 'priority-medium';
  const planDays = rec.plan_7_days?.split(/day\s*\d+[:.\-]/i).filter(Boolean) || [];

  return (
    <div className="rec-card">
      <div className="rec-card-header" onClick={() => setOpen(p => !p)}>
        <div className={`rec-priority ${priorityClass}`}>{(rec.priority || 'M')[0]}</div>
        <div style={{ flex: 1 }}>
          <div className="rec-card-title">{rec.title}</div>
          {rec.category && <span className="rec-category-badge">{rec.category}</span>}
        </div>
        {open ? <ChevronUp size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      </div>
      {open && (
        <div className="rec-card-body">
          {rec.why && (
            <div className="rec-field">
              <div className="rec-field-label">Why This Matters</div>
              <div className="rec-field-value">{rec.why}</div>
            </div>
          )}
          {rec.impact && (
            <div className="rec-field">
              <div className="rec-field-label">Expected Impact</div>
              <div className="rec-field-value">{rec.impact}</div>
            </div>
          )}
          {rec.action && (
            <div className="rec-action-box">
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', marginBottom: '0.375rem' }}>
                💡 Suggested Action
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{rec.action}</div>
            </div>
          )}
          {rec.plan_7_days && (
            <div className="rec-plan-grid">
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--success)', marginBottom: '0.375rem' }}>
                📅 7-Day Action Plan
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{rec.plan_7_days}</div>
            </div>
          )}
          {rec.expected_30_day && (
            <div className="rec-field">
              <div className="rec-field-label">30-Day Improvement</div>
              <div className="rec-field-value">{rec.expected_30_day}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Horizontal Progress Bar ───────────────────────────────────────────────────
function ProgressRow({ label, value, target, unit = '' }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const good = pct >= 85;
  const mid = pct >= 55;
  const color = good ? 'var(--success)' : mid ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color }}>{value}{unit}</strong>
          <span style={{ color: 'var(--text-muted)' }}> / {target}{unit} target</span>
        </span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', textAlign: 'right' }}>{pct}% of target</div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '0.625rem 0.875rem', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong></p>
      ))}
    </div>
  );
};

// ── Outcome / Risk Badge Helpers ──────────────────────────────────────────────
const outcomeClass = (o) => ({ 'Excellent': 'excellent', 'Good': 'good', 'Average': 'average', 'Poor': 'poor', 'At Risk': 'at-risk' }[o] || 'average');
const riskClass    = (r) => ({ 'Low': 'low-risk', 'Medium': 'medium-risk', 'High': 'high-risk' }[r] || 'medium-risk');
const outcomeColor = (o) => ({ 'Excellent': '#10b981', 'Good': '#3b82f6', 'Average': '#f59e0b', 'Poor': '#ef4444', 'At Risk': '#ef4444' }[o] || '#f59e0b');
const riskColor    = (r) => ({ 'Low': '#10b981', 'Medium': '#f59e0b', 'High': '#ef4444' }[r] || '#f59e0b');

const CHART_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

// ── Main Component ────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    axios.get(`http://localhost:5000/api/analysis/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => setResult(r.data.analysis))
      .catch(() => setError('Failed to load analysis. It may not exist or you may not have access.'))
      .finally(() => setLoading(false));
  }, [id, token]);

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="animate-fade-in" style={{ maxWidth: 960, margin: '0 auto' }}>
      {[140, 90, 220, 300].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, marginBottom: '1.25rem' }} />
      ))}
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <AlertTriangle size={40} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
      <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      <Link to="/history" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>Back to History</Link>
    </div>
  );
  if (!result) return null;

  const d = result;
  const healthScore = computeHealthScore(d);
  const conf = d.confidence_score ? Math.round(d.confidence_score * 100) : null;
  const OColor = outcomeColor(d.predicted_learning_outcome);
  const RColor = riskColor(d.predicted_risk_level);

  // ── Insights (handle old string[] or new object[]) ─────────────────────────
  const rawInsights = Array.isArray(d.analysis_summary) ? d.analysis_summary.slice(1) : [];
  const insights = rawInsights.map((item, i) => {
    if (typeof item === 'object' && item.type) return item;
    // heuristic categorize old string items
    const t = String(item).toLowerCase();
    const type = t.includes('excellent') || t.includes('strong') || t.includes('high') && !t.includes('high risk') && !t.includes('critical') ? 'strength'
      : t.includes('critical') || t.includes('urgent') || t.includes('risk') || t.includes('deficit') ? 'risk'
      : 'improvement';
    return { type, metric: '', text: item };
  });
  const strengths   = insights.filter(i => i.type === 'strength');
  const improvements = insights.filter(i => i.type === 'improvement');
  const risks       = insights.filter(i => i.type === 'risk');

  // ── Recommendations (handle both formats) ─────────────────────────────────
  const recs = Array.isArray(d.recommendations) ? d.recommendations : [];

  // ── Radar Chart Data ───────────────────────────────────────────────────────
  const radarData = [
    { subject: 'Taking Part', A: d.class_participation_score * 10, Target: 80, fullMark: 100 },
    { subject: 'Finding Info', A: d.search_skill_score * 10, Target: 80, fullMark: 100 },
    { subject: 'Checking Facts', A: d.source_evaluation_score * 10, Target: 80, fullMark: 100 },
    { subject: 'Managing Time', A: d.time_management_score * 10, Target: 80, fullMark: 100 },
    { subject: 'Low Stress', A: ((10 - d.stress_level) / 9) * 100, Target: 70, fullMark: 100 },
    { subject: 'Focus', A: ((10 - d.procrastination_score) / 9) * 100, Target: 70, fullMark: 100 },
  ];

  // ── Bar Chart Data (Academic Engagement) ──────────────────────────────────
  const barData = [
    { name: 'Study Hrs', value: d.daily_study_hours, target: 6 },
    { name: 'Revision/wk', value: d.revision_frequency_per_week, target: 4 },
    { name: 'LMS Logins', value: d.lms_login_frequency_per_week, target: 7 },
    { name: 'LMS Hrs/wk', value: d.lms_time_spent_hours_per_week, target: 10 },
    { name: 'Videos/wk', value: d.video_lectures_watched_per_week, target: 5 },
    { name: 'Quizzes/wk', value: d.practice_quiz_attempts, target: 8 },
  ];

  // ── Gap Analysis Items ────────────────────────────────────────────────────
  const gapItems = [
    { label: 'Attendance', value: d.attendance_percentage, target: 90, unit: '%' },
    { label: 'Assignment Submission', value: d.assignment_submission_rate, target: 95, unit: '%' },
    { label: 'Daily Study Hours', value: d.daily_study_hours, target: 6, unit: ' hrs' },
    { label: 'Quiz Attempts / Week', value: d.practice_quiz_attempts, target: 8, unit: '/wk' }
  ].map(item => {
    const pct = Math.min(100, Math.round((item.value / item.target) * 100));
    return { ...item, pct, gap: 100 - pct };
  }).sort((a, b) => b.gap - a.gap);

  // ── Feature Importance ────────────────────────────────────────────────────
  const featureMap = {
    daily_study_hours: 'Study Hours', attendance_percentage: 'Attendance',
    assignment_submission_rate: 'Assignment Rate', late_submission_count: 'Late Submissions',
    revision_frequency_per_week: 'Revision Freq.', lms_login_frequency_per_week: 'LMS Logins',
    lms_time_spent_hours_per_week: 'LMS Time', video_lectures_watched_per_week: 'Video Lectures',
    practice_quiz_attempts: 'Quiz Attempts', class_participation_score: 'Taking Part',
    search_skill_score: 'Finding Info', source_evaluation_score: 'Checking Facts',
    time_management_score: 'Managing Time', procrastination_score: 'Putting Off Work',
    stress_level: 'Stress Level',
  };
  const fi = d.feature_importance || {};
  const fiData = Object.entries(fi)
    .map(([k, v]) => ({ name: featureMap[k] || k, value: Math.round(v * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // ── Input Summary Table data ───────────────────────────────────────────────
  const inputSummary = [
    { metric: 'Daily Study Hours', value: `${d.daily_study_hours} hrs/day`, ideal: '5–6 hrs/day', status: d.daily_study_hours >= 5 ? 'good' : d.daily_study_hours >= 2 ? 'fair' : 'poor' },
    { metric: 'Attendance', value: `${d.attendance_percentage}%`, ideal: '≥ 90%', status: d.attendance_percentage >= 85 ? 'good' : d.attendance_percentage >= 60 ? 'fair' : 'poor' },
    { metric: 'Assignment Submission', value: `${d.assignment_submission_rate}%`, ideal: '≥ 90%', status: d.assignment_submission_rate >= 85 ? 'good' : d.assignment_submission_rate >= 60 ? 'fair' : 'poor' },
    { metric: 'Late Submissions', value: d.late_submission_count, ideal: '≤ 2', status: d.late_submission_count <= 2 ? 'good' : d.late_submission_count <= 6 ? 'fair' : 'poor' },
    { metric: 'Revision Frequency', value: `${d.revision_frequency_per_week}×/wk`, ideal: '4–5×/week', status: d.revision_frequency_per_week >= 4 ? 'good' : d.revision_frequency_per_week >= 2 ? 'fair' : 'poor' },
    { metric: 'LMS Login Frequency', value: `${d.lms_login_frequency_per_week}×/wk`, ideal: '≥ 7×/week', status: d.lms_login_frequency_per_week >= 7 ? 'good' : d.lms_login_frequency_per_week >= 3 ? 'fair' : 'poor' },
    { metric: 'LMS Time Spent', value: `${d.lms_time_spent_hours_per_week} hrs/wk`, ideal: '8–12 hrs', status: d.lms_time_spent_hours_per_week >= 8 ? 'good' : d.lms_time_spent_hours_per_week >= 3 ? 'fair' : 'poor' },
    { metric: 'Video Lectures', value: `${d.video_lectures_watched_per_week}/wk`, ideal: '≥ 5/week', status: d.video_lectures_watched_per_week >= 5 ? 'good' : d.video_lectures_watched_per_week >= 2 ? 'fair' : 'poor' },
    { metric: 'Practice Quiz Attempts', value: `${d.practice_quiz_attempts}/wk`, ideal: '8–10/week', status: d.practice_quiz_attempts >= 8 ? 'good' : d.practice_quiz_attempts >= 3 ? 'fair' : 'poor' },
    { metric: 'Taking Part in Class', value: `${d.class_participation_score}/10`, ideal: '≥ 7/10', status: d.class_participation_score >= 7 ? 'good' : d.class_participation_score >= 4 ? 'fair' : 'poor' },
    { metric: 'Managing Your Time', value: `${d.time_management_score}/10`, ideal: '≥ 7/10', status: d.time_management_score >= 7 ? 'good' : d.time_management_score >= 4 ? 'fair' : 'poor' },
    { metric: 'Putting Off Work', value: `${d.procrastination_score}/10`, ideal: '≤ 3/10', status: d.procrastination_score <= 3 ? 'good' : d.procrastination_score <= 6 ? 'fair' : 'poor' },
    { metric: 'Stress Level', value: `${d.stress_level}/10`, ideal: '≤ 3/10', status: d.stress_level <= 3 ? 'good' : d.stress_level <= 7 ? 'fair' : 'poor' },
  ];

  const statusBadge = (s) => ({ good: 'badge-success', fair: 'badge-warning', poor: 'badge-danger' }[s] || 'badge-info');
  const statusLabel = (s) => ({ good: '✓ On Track', fair: '△ Needs Work', poor: '✗ At Risk' }[s] || s);

  const createdDate = new Date(d.created_at);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Back + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/history" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft size={15} /> Back to History
        </Link>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            <Activity size={14} /> New Analysis
          </Link>
        </div>
      </div>

      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <div className="results-hero">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="hero-outcome-label">Learning Analysis Report</div>
              <div className="hero-outcome-value">{d.predicted_learning_outcome}</div>
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span className={`badge badge-${outcomeClass(d.predicted_learning_outcome)}`} style={{ fontSize: '0.8rem' }}>
                  🎯 {d.predicted_learning_outcome} Outcome
                </span>
                <span className={`badge badge-${riskClass(d.predicted_risk_level)}`} style={{ fontSize: '0.8rem' }}>
                  ⚡ {d.predicted_risk_level} Risk
                </span>
              </div>
              <div className="hero-meta">
                <span>📅 {createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>🕐 {createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>📊 ID #{d.id}</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <GaugeMeter value={healthScore} label="Health Score" color={OColor} size={110} />
            </div>
          </div>

          <div className="hero-stats-row">
            {[
              { label: 'Health Score', value: `${healthScore}`, sub: '/ 100', color: OColor },
              { label: 'Confidence', value: conf ? `${conf}%` : 'N/A', color: '#c7d2fe' },
              { label: 'Study Hours', value: `${d.daily_study_hours}h`, sub: '/day', color: 'rgba(255,255,255,0.9)' },
              { label: 'Attendance', value: `${d.attendance_percentage}%`, color: 'rgba(255,255,255,0.9)' },
            ].map((s, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-value" style={{ color: s.color }}>{s.value}{s.sub && <span style={{ fontSize: '1rem', opacity: 0.6 }}>{s.sub}</span>}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────── */}
      <div className="kpi-grid">
        <KPICard icon={Award}     label="Learning Outcome"    value={d.predicted_learning_outcome}     bg="#eef2ff" color="#4f46e5" />
        <KPICard icon={Zap}       label="Risk Level"          value={d.predicted_risk_level}           bg={d.predicted_risk_level === 'High' ? '#fee2e2' : d.predicted_risk_level === 'Medium' ? '#fef3c7' : '#d1fae5'} color={RColor} />
        <KPICard icon={Activity}  label="Health Score"        value={healthScore}   unit="/100"         bg="#f0fdf4" color="#10b981" sub="Overall learning wellness" />
        <KPICard icon={Star}      label="Confidence"          value={conf ? `${conf}%` : '–'}           bg="#f5f3ff" color="#8b5cf6" sub="Model certainty" />
        <KPICard icon={BookOpen}  label="Attendance"          value={d.attendance_percentage} unit="%"  bg="#f0f9ff" color="#0ea5e9" sub={`${d.attendance_percentage >= 85 ? 'Good' : 'Needs improvement'}`} />
        <KPICard icon={Clock}     label="Study Hours"         value={d.daily_study_hours} unit=" h/d"   bg="#fff7ed" color="#f59e0b" sub="Daily average" />
        <KPICard icon={TrendingUp} label="Assignment Rate"    value={d.assignment_submission_rate} unit="%" bg="#f0fdf4" color="#10b981" />
        <KPICard icon={Brain}     label="Delaying Work"       value={`${d.procrastination_score}/10`}   bg="#fef2f2" color="#ef4444" sub="Lower = better" />
      </div>

      {/* ── VISUAL ANALYTICS GRID ────────────────────────────── */}
      <div className="charts-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title"><Monitor size={16} style={{ color: '#0ea5e9' }} /> Target vs Current (Engagement)</div>
              <div className="chart-card-sub">Are you meeting the recommended benchmarks?</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Your Value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="target" name="Recommended Target" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title"><Brain size={16} style={{ color: '#8b5cf6' }} /> Behavioral Profile</div>
              <div className="chart-card-sub">Radar view of your study habits vs benchmark</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              
              <Radar name="Target Benchmark" dataKey="Target" stroke="#e5e7eb" fill="#f3f4f6" fillOpacity={0.4} strokeWidth={1} strokeDasharray="4 4" />
              <Radar name="Your Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 1 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title"><Target size={16} style={{ color: '#10b981' }} /> Gap Analysis (Priority Focus)</div>
              <div className="chart-card-sub">Sorted by areas needing the most attention</div>
            </div>
          </div>
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            {gapItems.map((g, i) => (
              <ProgressRow key={i} label={g.label} value={g.value} target={g.target} unit={g.unit} />
            ))}
          </div>
        </div>

        {/* Feature Importance moved next to gap analysis */}
        {fiData.length > 0 && (
          <div className="chart-card" style={{ padding: '1.75rem' }}>
            <div className="section-title-row">
              <div className="section-title">
                <div className="section-title-icon"><Zap size={16} /></div>
                Prediction Factor Importance
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              These factors heavily influenced your predicted outcome.
            </p>
            <ResponsiveContainer width="100%" height={fiData.length * 28 + 20}>
              <BarChart data={fiData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} />
                <Tooltip content={<CustomTooltip />} formatter={(v) => [`${v}%`, 'Importance']} />
                <Bar dataKey="value" name="Importance" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={10}>
                  {fiData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── YOUR SMART IMPROVEMENT PLAN ───────────────────────────────── */}
      <div className="chart-card" style={{ marginBottom: '1.5rem', padding: '1.75rem', borderTop: '4px solid #4f46e5' }}>
        <div className="section-title-row">
          <div className="section-title" style={{ fontSize: '1.25rem' }}>
            <div className="section-title-icon" style={{ background: '#4f46e5', color: '#fff' }}><Lightbulb size={18} /></div>
            Your Smart Improvement Plan
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{recs.length} Action Tasks</span>
        </div>

        {d.predicted_risk_level === 'High' && (
          <div style={{ display: 'flex', gap: '0.875rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#991b1b', alignItems: 'center' }}>
            <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div><strong>Critical Action Required:</strong> The indicators below have put you at high risk. Focus immediately on the High Priority items.</div>
          </div>
        )}

        {recs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Risk Alerts */}
            {recs.filter(r => (r.priority || '').includes('High')).length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: '#ef4444', borderBottom: '1px solid #fecaca', paddingBottom: '0.5rem', marginBottom: '1rem' }}>⚠️ Immediate Actions (High Priority)</h4>
                {recs.filter(r => (r.priority || '').includes('High')).map((rec, i) => <RecCard key={`hi-${i}`} rec={rec} idx={i} />)}
              </div>
            )}
            
            {/* Improve Next */}
            {recs.filter(r => (r.priority || '') === 'Medium' || (r.priority || '').includes('Medium')).length > 0 && (
               <div style={{ marginBottom: '1rem' }}>
                 <h4 style={{ color: '#f59e0b', borderBottom: '1px solid #fde68a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>📈 Improve Next (Medium Priority)</h4>
                 {recs.filter(r => (r.priority || '') === 'Medium' || (r.priority || '').includes('Medium')).map((rec, i) => <RecCard key={`med-${i}`} rec={rec} idx={i} />)}
               </div>
            )}

            {/* Strengths / Maintain */}
            {recs.filter(r => (r.priority || '') === 'Low' || (r.priority || '').includes('Low') || (!r.priority && typeof r !== 'string')).length > 0 && (
               <div style={{ marginBottom: '1rem' }}>
                 <h4 style={{ color: '#10b981', borderBottom: '1px solid #bbf7d0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>✅ Keep it Up (Routine / Strengths)</h4>
                 {recs.filter(r => (r.priority || '') === 'Low' || (r.priority || '').includes('Low') || (!r.priority && typeof r !== 'string')).map((rec, i) => <RecCard key={`lo-${i}`} rec={rec} idx={i} />)}
               </div>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No AI recommendations generated for this profile.</p>
        )}
      </div>

      {/* ── INPUT SUMMARY TABLE ───────────────────────────────── */}
      <div className="chart-card" style={{ marginBottom: '1.5rem', padding: '1.75rem 1.75rem 0' }}>
        <div className="section-title-row" style={{ paddingBottom: '1rem' }}>
          <div className="section-title">
            <div className="section-title-icon"><BookOpen size={16} /></div>
            Input Summary & Status
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Your Value</th>
                <th>Ideal Range</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inputSummary.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.metric}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.value}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.ideal}</td>
                  <td><span className={`badge ${statusBadge(row.status)}`} style={{ fontSize: '0.72rem' }}>{statusLabel(row.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 7-DAY ACTION PLAN ─────────────────────────────────── */}
      <div className="chart-card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div className="section-title-row">
          <div className="section-title">
            <div className="section-title-icon"><Calendar size={16} /></div>
            Quick 7-Day Action Plan
          </div>
        </div>
        <div className="plan-grid">
          {[
            { day: 'Day 1', text: 'Set up a fixed daily study schedule & log into LMS' },
            { day: 'Day 2', text: 'Attend all classes & review missed material' },
            { day: 'Day 3', text: 'Complete pending assignments & organize backlog' },
            { day: 'Day 4', text: 'Attempt 2 practice quizzes & revise notes' },
            { day: 'Day 5', text: 'Watch pending video lectures & take notes' },
            { day: 'Day 6', text: 'Reflect on procrastination triggers; practice focus' },
            { day: 'Day 7', text: 'Review weekly progress & set goals for next week' },
          ].map((p, i) => (
            <div key={i} className="plan-day">
              <div className="plan-day-num">{p.day}</div>
              <div className="plan-day-text">{p.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer CTA ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', paddingBottom: '1rem' }}>
        <Link to="/dashboard" className="btn btn-primary btn-lg">
          <Activity size={18} /> Run New Analysis
        </Link>
        <Link to="/history" className="btn btn-secondary btn-lg">
          <BarChart2 size={18} /> View All History
        </Link>
      </div>
    </div>
  );
}
