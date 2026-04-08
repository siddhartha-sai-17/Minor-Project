import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, Target, Lightbulb, CheckCircle, AlertTriangle,
  AlertCircle, TrendingUp, Award, Clock, BookOpen,
  Monitor, Brain, Zap, BarChart2, Printer, Activity,
  Info, Star, Calendar
} from 'lucide-react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import GlassHeroCard from '../components/GlassHeroCard';
import AnimatedMetricCard from '../components/AnimatedMetricCard';
import RecommendationCard from '../components/RecommendationCard';
import ChartCard from '../components/ChartCard';
import LoadingAnalysisScreen from '../components/LoadingAnalysisScreen';
import GradientButton from '../components/GradientButton';
import { staggerContainer, staggerItem } from '../lib/animations';

// ── Health Score ──────────────────────────────────────────────────────────────
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

// ── Badge helpers ─────────────────────────────────────────────────────────────
const outcomeClass = (o) => ({ Excellent: 'excellent', Good: 'good', Average: 'average', Poor: 'poor', 'At Risk': 'at-risk' }[o] || 'average');
const riskClass    = (r) => ({ Low: 'low-risk', Medium: 'medium-risk', High: 'high-risk' }[r] || 'medium-risk');
const outcomeColor = (o) => ({ Excellent: '#10b981', Good: '#3b82f6', Average: '#f59e0b', Poor: '#ef4444', 'At Risk': '#ef4444' }[o] || '#f59e0b');
const riskColor    = (r) => ({ Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' }[r] || '#f59e0b');

const CHART_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

// ── Custom Chart Tooltip ──────────────────────────────────────────────────────
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

// ── Progress Row ──────────────────────────────────────────────────────────────
function ProgressRow({ label, value, target, unit = '' }) {
  const pct   = Math.min(100, Math.round((value / target) * 100));
  const color = pct >= 85 ? 'var(--success)' : pct >= 55 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span>
          <strong style={{ color }}>{value}{unit}</strong>
          <span style={{ color: 'var(--text-muted)' }}> / {target}{unit} target</span>
        </span>
      </div>
      <div className="progress-bar-track">
        <motion.div
          className="progress-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', textAlign: 'right' }}>{pct}% of target</div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { id }    = useParams();
  const { token } = useContext(AuthContext);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) return;
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analysis/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => setResult(r.data.analysis))
      .catch(() => setError('Failed to load analysis. It may not exist or you may not have access.'))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <LoadingAnalysisScreen />;

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <AlertTriangle size={40} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
      <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      <Link to="/history" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>Back to History</Link>
    </div>
  );
  if (!result) return null;

  const d           = result;
  const healthScore = computeHealthScore(d);
  const conf        = d.confidence_score ? Math.round(d.confidence_score * 100) : null;
  const OColor      = outcomeColor(d.predicted_learning_outcome);
  const RColor      = riskColor(d.predicted_risk_level);

  // ── Insights ─────────────────────────────────────────────────
  const rawInsights = Array.isArray(d.analysis_summary) ? d.analysis_summary.slice(1) : [];
  const insights = rawInsights.map((item) => {
    if (typeof item === 'object' && item.type) return item;
    const t    = String(item).toLowerCase();
    const type = t.includes('excellent') || t.includes('strong') ? 'strength'
      : t.includes('critical') || t.includes('urgent') || t.includes('risk') ? 'risk'
      : 'improvement';
    return { type, metric: '', text: item };
  });

  // ── Recommendations ───────────────────────────────────────────
  const recs = Array.isArray(d.recommendations) ? d.recommendations : [];

  // ── Chart Data ────────────────────────────────────────────────
  const radarData = [
    { subject: 'Taking Part', A: d.class_participation_score * 10, Target: 80, fullMark: 100 },
    { subject: 'Finding Info', A: d.search_skill_score * 10, Target: 80, fullMark: 100 },
    { subject: 'Checking Facts', A: d.source_evaluation_score * 10, Target: 80, fullMark: 100 },
    { subject: 'Managing Time', A: d.time_management_score * 10, Target: 80, fullMark: 100 },
    { subject: 'Low Stress', A: ((10 - d.stress_level) / 9) * 100, Target: 70, fullMark: 100 },
    { subject: 'Focus', A: ((10 - d.procrastination_score) / 9) * 100, Target: 70, fullMark: 100 },
  ];

  const barData = [
    { name: 'Study Hrs', value: d.daily_study_hours, target: 6 },
    { name: 'Revision/wk', value: d.revision_frequency_per_week, target: 4 },
    { name: 'LMS Logins', value: d.lms_login_frequency_per_week, target: 7 },
    { name: 'LMS Hrs/wk', value: d.lms_time_spent_hours_per_week, target: 10 },
    { name: 'Videos/wk', value: d.video_lectures_watched_per_week, target: 5 },
    { name: 'Quizzes/wk', value: d.practice_quiz_attempts, target: 8 },
  ];

  const gapItems = [
    { label: 'Attendance', value: d.attendance_percentage, target: 90, unit: '%' },
    { label: 'Assignment Submission', value: d.assignment_submission_rate, target: 95, unit: '%' },
    { label: 'Daily Study Hours', value: d.daily_study_hours, target: 6, unit: ' hrs' },
    { label: 'Quiz Attempts / Week', value: d.practice_quiz_attempts, target: 8, unit: '/wk' },
  ].map(item => ({ ...item, pct: Math.min(100, Math.round((item.value / item.target) * 100)) }))
    .sort((a, b) => (100 - a.pct) - (100 - b.pct));

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
    .sort((a, b) => b.value - a.value).slice(0, 10);

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

  return (
    <AnimatedPageWrapper>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Back + Actions ── */}
        <motion.div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div whileHover={{ x: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
            <Link to="/history" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
              <ArrowLeft size={15} /> Back to History
            </Link>
          </motion.div>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <motion.button className="btn btn-secondary btn-sm" onClick={() => window.print()} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
              <Printer size={14} /> Print
            </motion.button>
            <GradientButton size="sm" as={Link} onClick={() => {}}>
              <Activity size={14} /> New Analysis
            </GradientButton>
          </div>
        </motion.div>

        {/* ── HERO ── */}
        <GlassHeroCard
          outcome={d.predicted_learning_outcome}
          riskLevel={d.predicted_risk_level}
          healthScore={healthScore}
          confidence={conf}
          studyHours={d.daily_study_hours}
          attendance={d.attendance_percentage}
          createdDate={d.created_at}
          analysisId={d.id}
          outcomeColor={OColor}
          outcomeClass={outcomeClass(d.predicted_learning_outcome)}
          riskClass={riskClass(d.predicted_risk_level)}
        />

        {/* ── KPI CARDS ── */}
        <motion.div
          className="kpi-grid"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          style={{ margin: '1.5rem 0' }}
        >
          <AnimatedMetricCard icon={Award}     label="Learning Outcome"  value={d.predicted_learning_outcome}          bg="#eef2ff" color="#4f46e5" />
          <AnimatedMetricCard icon={Zap}       label="Risk Level"        value={d.predicted_risk_level}                bg={d.predicted_risk_level === 'High' ? '#fee2e2' : d.predicted_risk_level === 'Medium' ? '#fef3c7' : '#d1fae5'} color={RColor} />
          <AnimatedMetricCard icon={Activity}  label="Health Score"      value={healthScore} unit="/100"               bg="#f0fdf4" color="#10b981" sub="Overall learning wellness" />
          <AnimatedMetricCard icon={Star}      label="Confidence"        value={conf ? `${conf}%` : '–'}               bg="#f5f3ff" color="#8b5cf6" sub="Model certainty" />
          <AnimatedMetricCard icon={BookOpen}  label="Attendance"        value={d.attendance_percentage} unit="%"      bg="#f0f9ff" color="#0ea5e9" sub={d.attendance_percentage >= 85 ? 'Good' : 'Needs improvement'} />
          <AnimatedMetricCard icon={Clock}     label="Study Hours"       value={d.daily_study_hours} unit=" h/d"       bg="#fff7ed" color="#f59e0b" sub="Daily average" />
          <AnimatedMetricCard icon={TrendingUp} label="Assignment Rate"  value={d.assignment_submission_rate} unit="%" bg="#f0fdf4" color="#10b981" />
          <AnimatedMetricCard icon={Brain}     label="Delaying Work"     value={`${d.procrastination_score}/10`}       bg="#fef2f2" color="#ef4444" sub="Lower = better" />
        </motion.div>

        {/* ── CHARTS ROW 1 ── */}
        <div className="charts-grid" style={{ marginBottom: '1.5rem' }}>
          <ChartCard title="Target vs Current (Engagement)" icon={Monitor} iconColor="#0ea5e9" subtitle="Are you meeting the recommended benchmarks?" delay={0.1}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Your Value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={12}
                  isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" />
                <Bar dataKey="target" name="Recommended Target" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={12}
                  isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Behavioral Profile" icon={Brain} iconColor="#8b5cf6" subtitle="Radar view of your study habits vs benchmark" delay={0.18}>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                <Radar name="Target Benchmark" dataKey="Target" stroke="#e5e7eb" fill="#f3f4f6" fillOpacity={0.4} strokeWidth={1} strokeDasharray="4 4" isAnimationActive={true} animationDuration={1400} />
                <Radar name="Your Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} isAnimationActive={true} animationDuration={1200} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── CHARTS ROW 2 ── */}
        <div className="charts-grid" style={{ marginBottom: '1.5rem' }}>
          <ChartCard title="Gap Analysis (Priority Focus)" icon={Target} iconColor="#10b981" subtitle="Sorted by areas needing the most attention" delay={0.22} noPadBody>
            <div style={{ padding: '0 1.25rem 1.25rem' }}>
              {gapItems.map((g, i) => <ProgressRow key={i} label={g.label} value={g.value} target={g.target} unit={g.unit} />)}
            </div>
          </ChartCard>

          {fiData.length > 0 && (
            <ChartCard title="Prediction Factor Importance" icon={Zap} iconColor="#4f46e5" subtitle="These factors heavily influenced your predicted outcome." delay={0.28} noPadBody>
              <div style={{ padding: '0 0 1rem' }}>
                <ResponsiveContainer width="100%" height={fiData.length * 28 + 20}>
                  <BarChart data={fiData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} />
                    <Tooltip content={<CustomTooltip />} formatter={(v) => [`${v}%`, 'Importance']} />
                    <Bar dataKey="value" name="Importance" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={10}
                      isAnimationActive={true} animationDuration={1100} animationEasing="ease-out">
                      {fiData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}
        </div>

        {/* ── SMART IMPROVEMENT PLAN ── */}
        <motion.div
          className="chart-card"
          style={{ marginBottom: '1.5rem', padding: '1.75rem', borderTop: '4px solid #4f46e5' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
        >
          <div className="section-title-row">
            <div className="section-title" style={{ fontSize: '1.25rem' }}>
              <div className="section-title-icon" style={{ background: '#4f46e5', color: '#fff' }}>
                <Lightbulb size={18} />
              </div>
              Your Smart Improvement Plan
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {recs.length} Action Tasks
            </span>
          </div>

          {d.predicted_risk_level === 'High' && (
            <motion.div
              style={{ display: 'flex', gap: '0.875rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#991b1b', alignItems: 'center' }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 22 }}
            >
              <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
              <div><strong>Critical Action Required:</strong> The indicators below have put you at high risk. Focus immediately on the High Priority items.</div>
            </motion.div>
          )}

          {recs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recs.filter(r => (r.priority || '').includes('High')).length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <h4 style={{ color: '#ef4444', borderBottom: '1px solid #fecaca', paddingBottom: '0.5rem', marginBottom: '1rem' }}>⚠️ Immediate Actions (High Priority)</h4>
                  <motion.div variants={staggerContainer} initial="initial" animate="animate">
                    {recs.filter(r => (r.priority || '').includes('High')).map((rec, i) => (
                      <RecommendationCard key={`hi-${i}`} rec={rec} idx={i} />
                    ))}
                  </motion.div>
                </div>
              )}
              {recs.filter(r => (r.priority || '') === 'Medium' || (r.priority || '').includes('Medium')).length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <h4 style={{ color: '#f59e0b', borderBottom: '1px solid #fde68a', paddingBottom: '0.5rem', marginBottom: '1rem' }}>📈 Improve Next (Medium Priority)</h4>
                  <motion.div variants={staggerContainer} initial="initial" animate="animate">
                    {recs.filter(r => (r.priority || '') === 'Medium' || (r.priority || '').includes('Medium')).map((rec, i) => (
                      <RecommendationCard key={`med-${i}`} rec={rec} idx={i} />
                    ))}
                  </motion.div>
                </div>
              )}
              {recs.filter(r => (r.priority || '') === 'Low' || (r.priority || '').includes('Low') || (!r.priority && typeof r !== 'string')).length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <h4 style={{ color: '#10b981', borderBottom: '1px solid #bbf7d0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>✅ Keep it Up (Routine / Strengths)</h4>
                  <motion.div variants={staggerContainer} initial="initial" animate="animate">
                    {recs.filter(r => (r.priority || '') === 'Low' || (r.priority || '').includes('Low') || (!r.priority && typeof r !== 'string')).map((rec, i) => (
                      <RecommendationCard key={`lo-${i}`} rec={rec} idx={i} />
                    ))}
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No AI recommendations generated for this profile.</p>
          )}
        </motion.div>

        {/* ── INPUT SUMMARY TABLE ── */}
        <motion.div
          className="chart-card"
          style={{ marginBottom: '1.5rem', padding: '1.75rem 1.75rem 0' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1], delay: 0.38 }}
        >
          <div className="section-title-row" style={{ paddingBottom: '1rem' }}>
            <div className="section-title">
              <div className="section-title-icon"><BookOpen size={16} /></div>
              Input Summary & Status
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Metric</th><th>Your Value</th><th>Ideal Range</th><th>Status</th></tr>
              </thead>
              <tbody>
                {inputSummary.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.03, duration: 0.3 }}
                  >
                    <td style={{ fontWeight: 500 }}>{row.metric}</td>
                    <td style={{ fontWeight: 700 }}>{row.value}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{row.ideal}</td>
                    <td><span className={`badge ${statusBadge(row.status)}`} style={{ fontSize: '0.72rem' }}>{statusLabel(row.status)}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── 7-DAY ACTION PLAN ── */}
        <motion.div
          className="chart-card"
          style={{ marginBottom: '2rem', padding: '1.75rem' }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1], delay: 0.44 }}
        >
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
              <motion.div
                key={i}
                className="plan-day"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.48 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(79,70,229,0.10)' }}
              >
                <div className="plan-day-num">{p.day}</div>
                <div className="plan-day-text">{p.text}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Footer CTA ── */}
        <motion.div
          style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', paddingBottom: '1rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/dashboard"><GradientButton size="lg"><Activity size={18} /> Run New Analysis</GradientButton></Link>
          <Link to="/history"><GradientButton size="lg" variant="secondary"><BarChart2 size={18} /> View All History</GradientButton></Link>
        </motion.div>
      </div>
    </AnimatedPageWrapper>
  );
}
