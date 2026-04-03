import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, ToastContext } from '../App';
import {
  BookOpen, Wifi, Brain, ChevronRight, ChevronLeft,
  Loader, RotateCcw, Beaker, Check, Info, Clock,
  TrendingUp, Monitor, Activity
} from 'lucide-react';

// ── Default & Sample Values ───────────────────────────────────────────────────
const DEFAULTS = {
  daily_study_hours: 4, attendance_percentage: 80,
  assignment_submission_rate: 85, late_submission_count: 2,
  revision_frequency_per_week: 3, lms_login_frequency_per_week: 5,
  lms_time_spent_hours_per_week: 6, video_lectures_watched_per_week: 4,
  practice_quiz_attempts: 5, class_participation_score: 5,
  search_skill_score: 6, source_evaluation_score: 5,
  time_management_score: 6, procrastination_score: 4, stress_level: 5,
};

const SAMPLE_GOOD = {
  daily_study_hours: 6.5, attendance_percentage: 92,
  assignment_submission_rate: 96, late_submission_count: 1,
  revision_frequency_per_week: 5, lms_login_frequency_per_week: 9,
  lms_time_spent_hours_per_week: 12, video_lectures_watched_per_week: 7,
  practice_quiz_attempts: 12, class_participation_score: 8,
  search_skill_score: 8, source_evaluation_score: 7,
  time_management_score: 8, procrastination_score: 2, stress_level: 3,
};

const SAMPLE_RISK = {
  daily_study_hours: 1.5, attendance_percentage: 52,
  assignment_submission_rate: 48, late_submission_count: 10,
  revision_frequency_per_week: 1, lms_login_frequency_per_week: 2,
  lms_time_spent_hours_per_week: 2, video_lectures_watched_per_week: 1,
  practice_quiz_attempts: 2, class_participation_score: 2,
  search_skill_score: 3, source_evaluation_score: 3,
  time_management_score: 3, procrastination_score: 8, stress_level: 8,
};

// ── Steps Config ──────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Academic Engagement', icon: BookOpen },
  { label: 'Digital Learning', icon: Monitor },
  { label: 'Study Habits', icon: Brain },
];

// ── Helper: get slider color class based on field + value ─────────────────────
const getSliderClass = (field, value) => {
  const inverted = ['procrastination_score', 'stress_level', 'late_submission_count'];
  const isInverted = inverted.includes(field);
  const ranges = {
    daily_study_hours: [2, 5], attendance_percentage: [60, 85],
    assignment_submission_rate: [60, 85], late_submission_count: [2, 6],
    revision_frequency_per_week: [2, 4], lms_login_frequency_per_week: [3, 7],
    lms_time_spent_hours_per_week: [3, 10], video_lectures_watched_per_week: [2, 6],
    practice_quiz_attempts: [3, 8], class_participation_score: [4, 7],
    search_skill_score: [4, 7], source_evaluation_score: [4, 7],
    time_management_score: [4, 7], procrastination_score: [3, 6], stress_level: [3, 7],
  };
  const [low, high] = ranges[field] || [3, 7];
  let level;
  if (isInverted) { level = value > high ? 'low' : value > low ? 'medium' : 'high'; }
  else { level = value < low ? 'low' : value <= high ? 'medium' : 'high'; }
  return { level, cls: level === 'high' ? 'slider-success' : level === 'medium' ? 'slider-warning' : 'slider-danger' };
};

const getBadgeClass = (field, value) => getSliderClass(field, value).level;

// ── Learning Readiness Score (heuristic, 0-100) ───────────────────────────────
const computeReadiness = (d) => {
  const scores = [
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
  return Math.round(Math.min(100, Math.max(0, scores.reduce((a, b) => a + b, 0))));
};

// ── Slider Field ──────────────────────────────────────────────────────────────
function SliderField({ id, label, hint, min, max, step = 1, unit = '', value, onChange }) {
  const { level, cls } = getSliderClass(id, value);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="range-wrap">
      <div className="range-header">
        <label className="input-label" style={{ marginBottom: 0 }}>{label}</label>
        <span className={`range-value-badge ${level}`}>{value}{unit}</span>
      </div>
      <div style={{ position: 'relative', padding: '0.5rem 0' }}>
        <div style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          height: 6, width: `${pct}%`, background: level === 'high' ? 'var(--success)' : level === 'medium' ? 'var(--warning)' : 'var(--danger)',
          borderRadius: 3, pointerEvents: 'none', zIndex: 1, transition: 'width 0.15s, background 0.2s',
        }} />
        <input
          type="range" name={id} min={min} max={max} step={step}
          value={value} onChange={onChange}
          className={cls}
          style={{ margin: 0, position: 'relative', zIndex: 2 }}
        />
      </div>
      <p className="helper-text">{hint}</p>
    </div>
  );
}

// ── Number Input Field ────────────────────────────────────────────────────────
function NumberField({ id, label, hint, min, max, step = 1, unit, value, onChange }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="input-label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id} type="number" name={id} className="input-field"
          min={min} max={max} step={step} value={value} onChange={onChange}
          style={{ paddingRight: unit ? '3.5rem' : '0.9rem' }}
        />
        {unit && (
          <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {unit}
          </span>
        )}
      </div>
      <p className="helper-text">{hint}</p>
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { token, user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const readiness = computeReadiness(form);
  const riskColor = readiness >= 70 ? '#10b981' : readiness >= 45 ? '#f59e0b' : '#ef4444';
  const riskLabel = readiness >= 70 ? 'Good' : readiness >= 45 ? 'Average' : 'At Risk';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleReset = () => { setForm(DEFAULTS); setStep(0); addToast('Form reset to defaults.', 'info'); };
  const handleLoadGood = () => { setForm(SAMPLE_GOOD); addToast('Loaded: Good Student sample data.', 'success'); };
  const handleLoadRisk = () => { setForm(SAMPLE_RISK); addToast('Loaded: At-Risk Student sample data.', 'info'); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const resp = await axios.post('http://localhost:5000/api/analysis/predict', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Analysis complete!', 'success');
      navigate(`/results/${resp.data.result.id}`);
    } catch (err) {
      const msg = err.response?.data?.validation_errors?.join(' | ')
        || err.response?.data?.error || 'Analysis failed. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── SVG Gauge for Readiness ───────────────────────────────────────────────
  const buildGaugePath = (value) => {
    const r = 52, cx = 60, cy = 65;
    const pct = Math.min(1, Math.max(0, value / 100));
    const startAngle = Math.PI;
    const valueAngle = startAngle + pct * Math.PI;
    const sx = cx + r * Math.cos(startAngle), sy = cy + r * Math.sin(startAngle);
    const ex = cx + r * Math.cos(valueAngle), ey = cy + r * Math.sin(valueAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    return { valuePath: `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`, trackPath: `M 8 65 A 52 52 0 0 1 112 65`, cx, cy };
  };
  const { valuePath, trackPath, cx, cy } = buildGaugePath(readiness);

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.4rem' }}>New Assessment</div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>
            Hello, {user?.full_name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Complete the 3-step form to generate your personalized AI learning analysis.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLoadGood}>
            <Beaker size={14} /> Sample: Good
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLoadRisk}>
            <Beaker size={14} /> Sample: At-Risk
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '1.5rem', alignItems: 'start' }}>
        {/* ── Left: Form ──────────────────────────────────────── */}
        <div>
          {/* Step Indicator */}
          <div className="step-indicator" style={{ marginBottom: '2rem' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className="step-item" onClick={() => setStep(i)} style={{ cursor: 'pointer' }}>
                  <div className={`step-circle ${step === i ? 'active' : step > i ? 'done' : ''}`}>
                    {step > i ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`step-label ${step === i ? 'active' : step > i ? 'done' : ''}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`step-connector ${step > i ? 'done' : step === i ? 'active' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP 0: Academic Engagement ───────────────────── */}
          {step === 0 && (
            <div className="animate-fade-in">
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon" style={{ background: '#eef2ff' }}>
                    <BookOpen size={18} style={{ color: '#4f46e5' }} />
                  </div>
                  <div>
                    <h3>Academic Engagement</h3>
                    <p>Core study habits and academic discipline metrics</p>
                  </div>
                </div>
                <div className="input-grid">
                  <SliderField id="daily_study_hours" label="Daily Study Hours" hint="Ideal: 5–6 hrs/day for strong performance" min={0} max={10} step={0.5} unit=" hrs" value={form.daily_study_hours} onChange={handleChange} />
                  <NumberField id="attendance_percentage" label="Attendance %" hint="Ideal: ≥ 90%. Below 60% is high-risk." min={0} max={100} unit="%" value={form.attendance_percentage} onChange={handleChange} />
                  <NumberField id="assignment_submission_rate" label="Assignment Submission Rate" hint="% of assignments submitted. Target: 100%." min={0} max={100} unit="%" value={form.assignment_submission_rate} onChange={handleChange} />
                  <SliderField id="late_submission_count" label="Late Submission Count" hint="Number of late assignments this semester (0 = best)" min={0} max={20} unit="" value={form.late_submission_count} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setStep(1)}>
                  Next: Digital Learning <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 1: Digital Learning ───────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon" style={{ background: '#f0f9ff' }}>
                    <Monitor size={18} style={{ color: '#0ea5e9' }} />
                  </div>
                  <div>
                    <h3>LMS & Digital Learning Usage</h3>
                    <p>How actively you engage with the Learning Management System</p>
                  </div>
                </div>
                <div className="input-grid">
                  <SliderField id="revision_frequency_per_week" label="Revision Frequency" hint="Times you revise each week. Ideal: 4–5×/week." min={0} max={7} step={0.5} unit="×/wk" value={form.revision_frequency_per_week} onChange={handleChange} />
                  <SliderField id="lms_login_frequency_per_week" label="LMS Login Frequency" hint="How often you log into LMS. Ideal: daily (7+)." min={0} max={14} unit="×/wk" value={form.lms_login_frequency_per_week} onChange={handleChange} />
                  <SliderField id="lms_time_spent_hours_per_week" label="LMS Time Spent" hint="Total hours on LMS per week. Ideal: 8–12 hrs." min={0} max={20} step={0.5} unit=" hrs" value={form.lms_time_spent_hours_per_week} onChange={handleChange} />
                  <SliderField id="video_lectures_watched_per_week" label="Video Lectures Watched" hint="Recorded lectures viewed per week. Ideal: ≥ 5." min={0} max={15} unit="/wk" value={form.video_lectures_watched_per_week} onChange={handleChange} />
                  <SliderField id="practice_quiz_attempts" label="Practice Quiz Attempts" hint="Self-test attempts per week. Ideal: 8–10." min={0} max={20} unit="/wk" value={form.practice_quiz_attempts} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-secondary" onClick={() => setStep(0)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button className="btn btn-primary" onClick={() => setStep(2)}>
                  Next: Study Habits <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Behavioral Quality ────────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon" style={{ background: '#f5f3ff' }}>
                    <Brain size={18} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div>
                    <h3>Your Study Habits & Choices</h3>
                    <p>Select the option that best describes you (1–10)</p>
                  </div>
                </div>

                <div style={{ background: 'var(--info-light)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.625rem', alignItems: 'flex-start', fontSize: '0.8rem', color: '#1e3a5f' }}>
                  <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Note: For <strong>Putting Off Work</strong> and <strong>How Stressed You Feel</strong>, a lower score is better!</span>
                </div>

                <div className="input-grid">
                  <SliderField id="class_participation_score" label="Taking Part in Class" hint="1 = I never join in, 10 = I always join in" min={1} max={10} unit="/10" value={form.class_participation_score} onChange={handleChange} />
                  <SliderField id="search_skill_score" label="Finding Good Information" hint="1 = It is very hard for me, 10 = It is very easy for me" min={1} max={10} unit="/10" value={form.search_skill_score} onChange={handleChange} />
                  <SliderField id="source_evaluation_score" label="Checking if Information is True" hint="1 = I never check, 10 = I always check carefully" min={1} max={10} unit="/10" value={form.source_evaluation_score} onChange={handleChange} />
                  <SliderField id="time_management_score" label="Managing Your Time" hint="1 = I am not good at planning, 10 = I am very good at planning" min={1} max={10} unit="/10" value={form.time_management_score} onChange={handleChange} />
                  <SliderField id="procrastination_score" label="Putting Off Work" hint="1 = I start right away, 10 = I always wait until the last minute" min={1} max={10} unit="/10" value={form.procrastination_score} onChange={handleChange} />
                  <SliderField id="stress_level" label="How Stressed You Feel" hint="1 = I feel calm, 10 = I feel very worried" min={1} max={10} unit="/10" value={form.stress_level} onChange={handleChange} />
                </div>
              </div>

              {error && <div className="error-banner" style={{ marginBottom: '1rem' }}><span>{error}</span></div>}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting
                    ? <><Loader size={18} className="animate-spin" /> Analyzing…</>
                    : <><Activity size={18} /> Generate AI Analysis</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Preview Panel ───────────────────────────── */}
        <div className="preview-panel animate-fade-in-delay-1">
          {/* Readiness Gauge */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <svg width="120" height="72" viewBox="0 0 120 72">
              <path d={trackPath} stroke="var(--surface-2)" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d={valuePath} stroke={riskColor} strokeWidth="8" fill="none" strokeLinecap="round" />
              <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: '18px', fontWeight: 800, fill: riskColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{readiness}</text>
              <text x={cx} y={cy + 8} textAnchor="middle" style={{ fontSize: '8px', fill: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>/ 100</text>
            </svg>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: '-0.375rem' }}>
              Readiness Score
            </div>
            <span className={`badge ${readiness >= 70 ? 'badge-success' : readiness >= 45 ? 'badge-warning' : 'badge-danger'}`} style={{ marginTop: '0.5rem', fontSize: '0.72rem' }}>
              {riskLabel}
            </span>
          </div>

          <div className="divider" />

          <h3 style={{ fontSize: '0.85rem', marginBottom: '0.875rem' }}>📊 Input Preview</h3>

          {[
            { label: 'Study Hours', val: `${form.daily_study_hours} hrs/day` },
            { label: 'Attendance', val: `${form.attendance_percentage}%` },
            { label: 'Assignment Rate', val: `${form.assignment_submission_rate}%` },
            { label: 'Late Submissions', val: form.late_submission_count },
            { label: 'Revision Freq.', val: `${form.revision_frequency_per_week}×/wk` },
            { label: 'LMS Logins', val: `${form.lms_login_frequency_per_week}×/wk` },
            { label: 'LMS Time', val: `${form.lms_time_spent_hours_per_week} hrs/wk` },
            { label: 'Video Lectures', val: `${form.video_lectures_watched_per_week}/wk` },
            { label: 'Quiz Attempts', val: `${form.practice_quiz_attempts}/wk` },
            { label: 'Taking Part', val: `${form.class_participation_score}/10` },
            { label: 'Managing Time', val: `${form.time_management_score}/10` },
            { label: 'Delaying Work', val: `${form.procrastination_score}/10` },
            { label: 'Stress', val: `${form.stress_level}/10` },
          ].map(({ label, val }, i) => (
            <div key={i} className="preview-metric">
              <span className="preview-metric-label">{label}</span>
              <span className="preview-metric-value">{val}</span>
            </div>
          ))}

          {/* Progress steps indicator */}
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.375rem' }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: step >= i ? 'var(--primary)' : 'var(--border)',
                transition: 'background 0.3s'
              }} />
            ))}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
            Step {step + 1} of 3
          </p>
        </div>
      </div>
    </div>
  );
}
