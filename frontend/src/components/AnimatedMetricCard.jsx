import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { staggerItem, hoverLift } from '../lib/animations';

// ── Count-up hook ─────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const ref = useRef(null);
  useEffect(() => {
    const numTarget = typeof target === 'number' ? target : parseFloat(target);
    if (isNaN(numTarget)) return;
    let start = 0;
    const step = numTarget / (duration / 16);
    const el = ref.current;
    if (!el) return;
    const timer = setInterval(() => {
      start = Math.min(start + step, numTarget);
      el.textContent = Number.isInteger(numTarget) ? Math.round(start) : start.toFixed(1);
      if (start >= numTarget) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return ref;
}

/**
 * AnimatedMetricCard
 * Drop-in replacement for KPICard with stagger entrance, hover lift, and count-up.
 * Must be a child of a <motion.div variants={staggerContainer}> parent.
 */
export default function AnimatedMetricCard({ icon: Icon, label, value, unit = '', bg, color, sub }) {
  const numericValue = typeof value === 'number' ? value
    : typeof value === 'string' ? parseFloat(value) : NaN;
  const isNumeric = !isNaN(numericValue) && typeof value !== 'string';
  const countRef = useCountUp(isNumeric ? numericValue : 0);

  return (
    <motion.div
      className="kpi-card"
      variants={staggerItem}
      initial="initial"
      animate="animate"
      whileHover={{
        y: -5,
        boxShadow: '0 12px 32px rgba(79,70,229,0.13), 0 4px 12px rgba(0,0,0,0.07)',
        transition: { type: 'spring', stiffness: 380, damping: 22 },
      }}
      style={{ cursor: 'default' }}
    >
      <motion.div
        className="kpi-icon"
        style={{ background: bg }}
        whileHover={{ scale: 1.08, rotate: 4 }}
        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
      >
        <Icon size={17} style={{ color }} />
      </motion.div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>
        {isNumeric ? (
          <>
            <span ref={countRef}>0</span>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{unit}</span>
          </>
        ) : (
          <>
            {value}
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{unit}</span>
          </>
        )}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </motion.div>
  );
}
