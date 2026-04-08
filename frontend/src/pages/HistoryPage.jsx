import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Database, ExternalLink, Search, ChevronRight,
  TrendingUp, TrendingDown, Minus, BarChart2, Award,
  AlertCircle, Clock, RefreshCw
} from 'lucide-react';
import AnimatedPageWrapper from '../components/AnimatedPageWrapper';
import AnimatedMetricCard from '../components/AnimatedMetricCard';
import GradientButton from '../components/GradientButton';
import { staggerContainer, staggerItem, tableRowVariants } from '../lib/animations';

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

const outcomeBadge = (o) => ({ Excellent: 'badge-success', Good: 'badge-info', Average: 'badge-warning', Poor: 'badge-danger', 'At Risk': 'badge-danger' }[o] || 'badge-warning');
const riskBadge    = (r) => ({ Low: 'badge-success', Medium: 'badge-warning', High: 'badge-danger' }[r] || 'badge-warning');

// ── Trend Icon ────────────────────────────────────────────────────────────────
function TrendIcon({ trend }) {
  if (trend === 'up')   return <motion.div initial={{ y: 4 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}><TrendingUp size={14} style={{ color: 'var(--success)' }} /></motion.div>;
  if (trend === 'down') return <TrendingDown size={14} style={{ color: 'var(--danger)' }} />;
  return <Minus size={14} style={{ color: 'var(--text-muted)' }} />;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '0.625rem 0.875rem', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
};

export default function HistoryPage() {
  const { token } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch]               = useState('');
  const [filterOutcome, setFilterOutcome] = useState('All');
  const [filterRisk, setFilterRisk]       = useState('All');
  const [sortBy, setSortBy]               = useState('newest');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analysis/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(resp.data.history || []);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchHistory(); }, [token]);

  const enriched = useMemo(() => history.map(item => ({ ...item, healthScore: computeHealthScore(item) })), [history]);

  const stats = useMemo(() => {
    if (!enriched.length) return {};
    const avgHealth  = Math.round(enriched.reduce((s, i) => s + i.healthScore, 0) / enriched.length);
    const riskCounts = enriched.reduce((acc, i) => { acc[i.predicted_risk_level] = (acc[i.predicted_risk_level] || 0) + 1; return acc; }, {});
    const mostRisk   = Object.entries(riskCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const scores     = enriched.map(i => i.healthScore);
    const trend      = scores.length >= 2 ? (scores[0] > scores[scores.length - 1] ? 'up' : scores[0] < scores[scores.length - 1] ? 'down' : 'flat') : 'flat';
    return { avgHealth, mostRisk, trend, total: enriched.length };
  }, [enriched]);

  const trendData = useMemo(() =>
    [...enriched].reverse().map((item, i) => ({ name: `#${i + 1}`, Health: item.healthScore, Attendance: item.attendance_percentage })),
    [enriched]
  );

  const filtered = useMemo(() => {
    let list = [...enriched];
    if (filterOutcome !== 'All') list = list.filter(i => i.predicted_learning_outcome === filterOutcome);
    if (filterRisk !== 'All')    list = list.filter(i => i.predicted_risk_level === filterRisk);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.predicted_learning_outcome.toLowerCase().includes(q) ||
        i.predicted_risk_level.toLowerCase().includes(q) ||
        new Date(i.created_at).toLocaleDateString().includes(q)
      );
    }
    if (sortBy === 'newest')       list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === 'oldest')       list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sortBy === 'highest')      list.sort((a, b) => b.healthScore - a.healthScore);
    if (sortBy === 'highest-risk') list.sort((a, b) => {
      const r = { High: 3, Medium: 2, Low: 1 };
      return r[b.predicted_risk_level] - r[a.predicted_risk_level];
    });
    return list;
  }, [enriched, filterOutcome, filterRisk, search, sortBy]);

  const outcomes = ['All', ...new Set(enriched.map(i => i.predicted_learning_outcome))];
  const risks    = ['All', 'Low', 'Medium', 'High'];

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <AnimatedPageWrapper>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              style={{ height: 90, borderRadius: 12, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% auto' }}
              animate={{ backgroundPosition: ['0% center', '200% center'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
            />
          ))}
        </div>
        {[180, 400].map((h, i) => (
          <motion.div
            key={i}
            style={{ height: h, borderRadius: 12, marginBottom: '1.25rem', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% auto' }}
            animate={{ backgroundPosition: ['0% center', '200% center'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: i * 0.15 }}
          />
        ))}
      </div>
    </AnimatedPageWrapper>
  );

  return (
    <AnimatedPageWrapper>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="section-label" style={{ marginBottom: '0.4rem' }}>Analytics Log</div>
            <h1 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Database size={24} style={{ color: 'var(--primary)' }} /> Analysis History
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.375rem' }}>
              Track your learning health score, risk levels, and academic progress over time.
            </p>
          </motion.div>
          <motion.div style={{ display: 'flex', gap: '0.625rem' }} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <motion.button className="btn btn-secondary btn-sm" onClick={fetchHistory} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
              <RefreshCw size={14} /> Refresh
            </motion.button>
            <Link to="/dashboard">
              <GradientButton size="sm">New Analysis <ChevronRight size={15} /></GradientButton>
            </Link>
          </motion.div>
        </div>

        {/* ── Summary Stats ── */}
        {enriched.length > 0 && (
          <motion.div
            className="history-stats-row"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            style={{ marginBottom: '1.5rem' }}
          >
            <AnimatedMetricCard icon={Database}    label="Total Analyses"    value={stats.total}           color="#4f46e5" bg="#eef2ff" sub="All time" />
            <AnimatedMetricCard icon={Award}       label="Avg Health Score"  value={stats.avgHealth}       color="#10b981" bg="#f0fdf4" sub="Learning wellness" unit="/100" />
            <AnimatedMetricCard icon={AlertCircle} label="Common Risk Level" value={stats.mostRisk}        color={stats.mostRisk === 'High' ? '#ef4444' : stats.mostRisk === 'Medium' ? '#f59e0b' : '#10b981'} bg={stats.mostRisk === 'High' ? '#fef2f2' : stats.mostRisk === 'Medium' ? '#fffbeb' : '#f0fdf4'} sub="Most frequent" />
            <AnimatedMetricCard icon={TrendingUp}  label="Score Trend"       value={stats.trend === 'up' ? '↑ Improving' : stats.trend === 'down' ? '↓ Declining' : '→ Stable'} color={stats.trend === 'up' ? '#10b981' : stats.trend === 'down' ? '#ef4444' : '#94a3b8'} bg={stats.trend === 'up' ? '#f0fdf4' : stats.trend === 'down' ? '#fef2f2' : '#f8fafc'} sub="vs. first analysis" />
          </motion.div>
        )}

        {/* ── Trend Chart ── */}
        {trendData.length >= 2 && (
          <motion.div
            className="chart-card"
            style={{ marginBottom: '1.25rem', padding: '1.5rem' }}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(79,70,229,0.09)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart2 size={16} style={{ color: 'var(--primary)' }} /> Progress Over Time
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Health Score & Attendance across analyses</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Health" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3, fill: '#4f46e5' }} name="Health Score"
                  isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                <Line type="monotone" dataKey="Attendance" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} name="Attendance %" strokeDasharray="5 3"
                  isAnimationActive={true} animationDuration={1400} animationEasing="ease-out" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── Filter Bar ── */}
        <motion.div
          className="filter-bar"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.2 }}
        >
          <div className="search-input-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text" placeholder="Search by outcome, risk, or date…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}>
            {outcomes.map(o => <option key={o} value={o}>{o === 'All' ? 'All Outcomes' : o}</option>)}
          </select>
          <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
            {risks.map(r => <option key={r} value={r}>{r === 'All' ? 'All Risk Levels' : `${r} Risk`}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Score</option>
            <option value="highest-risk">Highest Risk</option>
          </select>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {filtered.length} of {enriched.length} entries
          </span>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          className="table-container"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.25 }}
        >
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Database size={28} /></div>
              {enriched.length === 0 ? (
                <>
                  <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No analyses yet</p>
                  <p style={{ marginBottom: '1.5rem' }}>Run your first learning behavior assessment to get started.</p>
                  <Link to="/dashboard"><GradientButton>Start Your First Assessment</GradientButton></Link>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No results match your filter</p>
                  <p style={{ marginBottom: '1rem' }}>Try clearing your filters or search term.</p>
                  <GradientButton variant="secondary" size="sm" onClick={() => { setSearch(''); setFilterOutcome('All'); setFilterRisk('All'); }}>Clear Filters</GradientButton>
                </>
              )}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Outcome</th>
                  <th>Risk Level</th>
                  <th>Health Score</th>
                  <th>Study Hrs</th>
                  <th>Attendance</th>
                  <th>Assignment</th>
                  <th>Trend</th>
                  <th>Action</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                <AnimatePresence>
                  {filtered.map((item, idx) => {
                    const prevScore = filtered[idx + 1]?.healthScore;
                    const trend = prevScore === undefined ? null : item.healthScore > prevScore ? 'up' : item.healthScore < prevScore ? 'down' : 'flat';
                    const scoreColor = item.healthScore >= 70 ? '#10b981' : item.healthScore >= 45 ? '#f59e0b' : '#ef4444';
                    return (
                      <motion.tr
                        key={item.id}
                        variants={tableRowVariants}
                        layout
                        whileHover={{ background: 'var(--surface-2)' }}
                        transition={{ duration: 0.18 }}
                      >
                        <td style={{ whiteSpace: 'nowrap', minWidth: 120 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={10} />
                            {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td>
                          <motion.span
                            className={`badge ${outcomeBadge(item.predicted_learning_outcome)}`}
                            style={{ fontSize: '0.72rem' }}
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          >
                            {item.predicted_learning_outcome}
                          </motion.span>
                        </td>
                        <td>
                          <motion.span
                            className={`badge ${riskBadge(item.predicted_risk_level)}`}
                            style={{ fontSize: '0.72rem' }}
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          >
                            {item.predicted_risk_level}
                          </motion.span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <motion.div
                              style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, border: '2px solid', borderColor: scoreColor, color: scoreColor }}
                              whileHover={{ scale: 1.12 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                              {item.healthScore}
                            </motion.div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.daily_study_hours}h/d</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.attendance_percentage}%</span>
                            <div className="progress-bar-track" style={{ width: 64, height: 4 }}>
                              <motion.div
                                className="progress-bar-fill"
                                style={{ background: item.attendance_percentage >= 85 ? 'var(--success)' : item.attendance_percentage >= 60 ? 'var(--warning)' : 'var(--danger)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.attendance_percentage}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.assignment_submission_rate}%</td>
                        <td>{trend ? <TrendIcon trend={trend} /> : <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>
                          <motion.div whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                            <Link
                              to={`/results/${item.id}`}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: '0.78rem' }}
                            >
                              View <ExternalLink size={12} />
                            </Link>
                          </motion.div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </motion.tbody>
            </table>
          )}
        </motion.div>

        {filtered.length > 0 && (
          <motion.div
            style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Showing {filtered.length} analysis record{filtered.length !== 1 ? 's' : ''}
          </motion.div>
        )}
      </div>
    </AnimatedPageWrapper>
  );
}
