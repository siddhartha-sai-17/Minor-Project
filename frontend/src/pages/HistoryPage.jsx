import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Database, ExternalLink, Search, Filter, ChevronRight,
  TrendingUp, TrendingDown, Minus, BarChart2, Award,
  Calendar, AlertCircle, CheckCircle, Clock, RefreshCw
} from 'lucide-react';

// ── Health Score Helper ───────────────────────────────────────────────────────
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
const outcomeBadge = (o) => ({
  'Excellent': 'badge-success', 'Good': 'badge-info',
  'Average': 'badge-warning',  'Poor': 'badge-danger', 'At Risk': 'badge-danger',
}[o] || 'badge-warning');

const riskBadge = (r) => ({
  'Low': 'badge-success', 'Medium': 'badge-warning', 'High': 'badge-danger',
}[r] || 'badge-warning');

// ── Mini Sparkline ────────────────────────────────────────────────────────────
function Sparkline({ data }) {
  if (!data || data.length < 2) return <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>;
  return (
    <ResponsiveContainer width={80} height={30}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Trend Icon ────────────────────────────────────────────────────────────────
function TrendIcon({ trend }) {
  if (trend === 'up')   return <TrendingUp size={14} style={{ color: 'var(--success)' }} />;
  if (trend === 'down') return <TrendingDown size={14} style={{ color: 'var(--danger)' }} />;
  return <Minus size={14} style={{ color: 'var(--text-muted)' }} />;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="kpi-card animate-fade-in">
      <div className="kpi-icon" style={{ background: bg }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color, fontSize: '1.5rem' }}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const { token } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch]       = useState('');
  const [filterOutcome, setFilterOutcome] = useState('All');
  const [filterRisk, setFilterRisk]       = useState('All');
  const [sortBy, setSortBy]               = useState('newest');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const resp = await axios.get('http://localhost:5000/api/analysis/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(resp.data.history || []);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchHistory(); }, [token]);

  // ── Enrich with health score ──────────────────────────────────────────────
  const enriched = useMemo(() =>
    history.map(item => ({ ...item, healthScore: computeHealthScore(item) })),
    [history]
  );

  // ── Summary Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!enriched.length) return {};
    const avgHealth  = Math.round(enriched.reduce((s, i) => s + i.healthScore, 0) / enriched.length);
    const riskCounts = enriched.reduce((acc, i) => { acc[i.predicted_risk_level] = (acc[i.predicted_risk_level] || 0) + 1; return acc; }, {});
    const mostRisk   = Object.entries(riskCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const scores     = enriched.map(i => i.healthScore);
    const trend      = scores.length >= 2 ? (scores[0] > scores[scores.length - 1] ? 'up' : scores[0] < scores[scores.length - 1] ? 'down' : 'flat') : 'flat';
    return { avgHealth, mostRisk, trend, total: enriched.length };
  }, [enriched]);

  // ── Trend chart data ──────────────────────────────────────────────────────
  const trendData = useMemo(() =>
    [...enriched].reverse().map((item, i) => ({
      name: `#${i + 1}`,
      Health: item.healthScore,
      Attendance: item.attendance_percentage,
    })),
    [enriched]
  );

  // ── Filtered + Sorted ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...enriched];
    if (filterOutcome !== 'All') list = list.filter(i => i.predicted_learning_outcome === filterOutcome);
    if (filterRisk    !== 'All') list = list.filter(i => i.predicted_risk_level === filterRisk);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.predicted_learning_outcome.toLowerCase().includes(q) ||
        i.predicted_risk_level.toLowerCase().includes(q) ||
        new Date(i.created_at).toLocaleDateString().includes(q)
      );
    }
    if (sortBy === 'newest')      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === 'oldest')      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sortBy === 'highest')     list.sort((a, b) => b.healthScore - a.healthScore);
    if (sortBy === 'highest-risk') list.sort((a, b) => {
      const r = { High: 3, Medium: 2, Low: 1 };
      return r[b.predicted_risk_level] - r[a.predicted_risk_level];
    });
    return list;
  }, [enriched, filterOutcome, filterRisk, search, sortBy]);

  // ── Unique outcomes & risks for filter dropdowns ──────────────────────────
  const outcomes = ['All', ...new Set(enriched.map(i => i.predicted_learning_outcome))];
  const risks    = ['All', 'Low', 'Medium', 'High'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '0.625rem 0.875rem', boxShadow: 'var(--shadow-md)', fontSize: '0.8rem' }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>)}
      </div>
    );
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90 }} />)}
      </div>
      <div className="skeleton" style={{ height: 180, marginBottom: '1.25rem' }} />
      <div className="skeleton" style={{ height: 400 }} />
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.4rem' }}>Analytics Log</div>
          <h1 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Database size={24} style={{ color: 'var(--primary)' }} /> Analysis History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.375rem' }}>
            Track your learning health score, risk levels, and academic progress over time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchHistory}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            New Analysis <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      {/* ── Summary Stats ──────────────────────────────────── */}
      {enriched.length > 0 && (
        <div className="history-stats-row">
          <StatCard icon={Database}     label="Total Analyses"     value={stats.total}       color="#4f46e5"  bg="#eef2ff"  sub="All time" />
          <StatCard icon={Award}        label="Avg Health Score"   value={`${stats.avgHealth}/100`} color="#10b981" bg="#f0fdf4" sub="Learning wellness" />
          <StatCard icon={AlertCircle}  label="Common Risk Level"  value={stats.mostRisk}    color={stats.mostRisk === 'High' ? '#ef4444' : stats.mostRisk === 'Medium' ? '#f59e0b' : '#10b981'} bg={stats.mostRisk === 'High' ? '#fef2f2' : stats.mostRisk === 'Medium' ? '#fffbeb' : '#f0fdf4'} sub="Most frequent" />
          <StatCard icon={TrendingUp}   label="Score Trend"        value={stats.trend === 'up' ? '↑ Improving' : stats.trend === 'down' ? '↓ Declining' : '→ Stable'} color={stats.trend === 'up' ? '#10b981' : stats.trend === 'down' ? '#ef4444' : '#94a3b8'} bg={stats.trend === 'up' ? '#f0fdf4' : stats.trend === 'down' ? '#fef2f2' : '#f8fafc'} sub="vs. first analysis" />
        </div>
      )}

      {/* ── Trend Chart ─────────────────────────────────────── */}
      {trendData.length >= 2 && (
        <div className="chart-card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
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
              <Line type="monotone" dataKey="Health" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3, fill: '#4f46e5' }} name="Health Score" />
              <Line type="monotone" dataKey="Attendance" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} name="Attendance %" strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Filter Bar ─────────────────────────────────────── */}
      <div className="filter-bar">
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
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Database size={28} /></div>
            {enriched.length === 0 ? (
              <>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No analyses yet</p>
                <p style={{ marginBottom: '1.5rem' }}>Run your first learning behavior assessment to get started.</p>
                <Link to="/dashboard" className="btn btn-primary">Start Your First Assessment</Link>
              </>
            ) : (
              <>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No results match your filter</p>
                <p style={{ marginBottom: '1rem' }}>Try clearing your filters or search term.</p>
                <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterOutcome('All'); setFilterRisk('All'); }}>
                  Clear Filters
                </button>
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
            <tbody>
              {filtered.map((item, idx) => {
                const prevScore = filtered[idx + 1]?.healthScore;
                const trend = prevScore === undefined ? null : item.healthScore > prevScore ? 'up' : item.healthScore < prevScore ? 'down' : 'flat';
                return (
                  <tr key={item.id}>
                    <td style={{ whiteSpace: 'nowrap', minWidth: 120 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={10} />
                        {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${outcomeBadge(item.predicted_learning_outcome)}`} style={{ fontSize: '0.72rem' }}>
                        {item.predicted_learning_outcome}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${riskBadge(item.predicted_risk_level)}`} style={{ fontSize: '0.72rem' }}>
                        {item.predicted_risk_level}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 800, border: '2px solid',
                          borderColor: item.healthScore >= 70 ? '#10b981' : item.healthScore >= 45 ? '#f59e0b' : '#ef4444',
                          color: item.healthScore >= 70 ? '#10b981' : item.healthScore >= 45 ? '#f59e0b' : '#ef4444',
                        }}>
                          {item.healthScore}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.daily_study_hours}h/d</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.attendance_percentage}%</span>
                        <div className="progress-bar-track" style={{ width: 64, height: 4 }}>
                          <div className="progress-bar-fill" style={{ width: `${item.attendance_percentage}%`, background: item.attendance_percentage >= 85 ? 'var(--success)' : item.attendance_percentage >= 60 ? 'var(--warning)' : 'var(--danger)' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.assignment_submission_rate}%</td>
                    <td>
                      {trend ? <TrendIcon trend={trend} /> : <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <Link
                        to={`/results/${item.id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        View <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} analysis record{filtered.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
