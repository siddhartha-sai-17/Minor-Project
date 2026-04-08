import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';

// ── Count-up hook ──────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const el = ref.current;
    if (!el) return;
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = typeof target === 'number' && !Number.isInteger(target)
        ? start.toFixed(1)
        : Math.round(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return ref;
}

// ── Animated Score Ring (SVG) ──────────────────────────────────
function AnimatedScoreRing({ value, max = 100, color, size = 130 }) {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.56;
  const circumference = Math.PI * r; // half-circle

  const pct = Math.min(1, Math.max(0, value / max));
  const trackD  = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const fillPct = pct;

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`} style={{ overflow: 'visible' }}>
      {/* Track */}
      <path d={trackD} stroke="rgba(255,255,255,0.18)" strokeWidth={size * 0.065} fill="none" strokeLinecap="round" />
      {/* Animated fill */}
      <motion.path
        d={trackD}
        stroke={color}
        strokeWidth={size * 0.065}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - fillPct) }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
    </svg>
  );
}

// ── Stat pill inside hero ──────────────────────────────────────
function HeroStat({ label, value, sub, color, delay = 0, numeric = true, decimals = 0 }) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isNumeric = numeric && !isNaN(numericValue);
  const countRef = useCountUp(isNumeric ? numericValue : 0, 1000);

  return (
    <motion.div
      className="hero-stat"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hero-stat-value" style={{ color }}>
        {isNumeric ? (
          <>
            <span ref={countRef}>0</span>
            {sub && <span style={{ fontSize: '1rem', opacity: 0.6 }}>{sub}</span>}
          </>
        ) : (
          <>{value}{sub && <span style={{ fontSize: '1rem', opacity: 0.6 }}>{sub}</span>}</>
        )}
      </div>
      <div className="hero-stat-label">{label}</div>
    </motion.div>
  );
}

// ── GlassHeroCard ──────────────────────────────────────────────
export default function GlassHeroCard({
  outcome, riskLevel, healthScore, confidence,
  studyHours, attendance, createdDate, analysisId,
  outcomeColor, outcomeClass, riskClass,
}) {
  const scoreCountRef = useCountUp(healthScore, 1200);
  const scoreColor = healthScore >= 70 ? '#34d399' : healthScore >= 45 ? '#fbbf24' : '#f87171';

  return (
    <motion.div
      className="results-hero"
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hero-content">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-outcome-label">Learning Analysis Report</div>
            <div className="hero-outcome-value">{outcome}</div>

            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <motion.span
                className={`badge badge-${outcomeClass}`}
                style={{ fontSize: '0.8rem' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 500, damping: 22 }}
              >
                🎯 {outcome} Outcome
              </motion.span>
              <motion.span
                className={`badge badge-${riskClass}`}
                style={{ fontSize: '0.8rem' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.45, type: 'spring', stiffness: 500, damping: 22 }}
              >
                ⚡ {riskLevel} Risk
              </motion.span>
            </div>

            <div className="hero-meta">
              <span>📅 {new Date(createdDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>🕐 {new Date(createdDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              <span>📊 ID #{analysisId}</span>
            </div>
          </motion.div>

          {/* Right — animated score ring */}
          <motion.div
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.22, type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <AnimatedScoreRing value={healthScore} color={scoreColor} size={120} />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', paddingBottom: '0.5rem',
              }}>
                <span ref={scoreCountRef} style={{
                  fontSize: '1.75rem', fontWeight: 800,
                  color: scoreColor,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>0</span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '-2px' }}>/ 100</span>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Health Score
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          className="hero-stats-row"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <HeroStat label="Health Score" value={healthScore} sub=" /100" color={scoreColor} delay={0} />
          <HeroStat label="Confidence" value={confidence ? `${confidence}%` : 'N/A'} color="#c7d2fe" delay={0.06} numeric={false} />
          <HeroStat label="Study Hours" value={studyHours} sub="/day" color="rgba(255,255,255,0.9)" delay={0.12} />
          <HeroStat label="Attendance" value={attendance} sub="%" color="rgba(255,255,255,0.9)" delay={0.18} />
        </motion.div>
      </div>
    </motion.div>
  );
}
