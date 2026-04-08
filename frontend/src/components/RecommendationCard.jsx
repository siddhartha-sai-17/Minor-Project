import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { staggerItem } from '../lib/animations';

const PRIORITY_CONFIG = {
  High:   { cls: 'priority-high',   color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'HIGH',   dot: '#ef4444' },
  Medium: { cls: 'priority-medium', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'MEDIUM', dot: '#f59e0b' },
  Low:    { cls: 'priority-low',    color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', label: 'LOW',    dot: '#10b981' },
};

export default function RecommendationCard({ rec, idx }) {
  const [open, setOpen] = useState(idx === 0);

  // Legacy string format
  if (typeof rec === 'string') {
    return (
      <motion.div
        className="rec-card"
        variants={staggerItem}
        whileHover={{ borderColor: '#c7d2fe', boxShadow: '0 4px 20px rgba(79,70,229,0.10)' }}
        transition={{ duration: 0.2 }}
      >
        <div className="rec-card-header" onClick={() => setOpen(p => !p)}>
          <div className="rec-priority priority-medium">{String(idx + 1).padStart(2, '0')}</div>
          <span className="rec-card-title">{rec}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.Medium;

  return (
    <motion.div
      className="rec-card"
      variants={staggerItem}
      whileHover={{
        borderColor: cfg.border,
        boxShadow: `0 6px 24px ${cfg.color}1a`,
        transition: { duration: 0.22 },
      }}
      style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}
    >
      <div
        className="rec-card-header"
        onClick={() => setOpen(p => !p)}
        style={{ cursor: 'pointer' }}
      >
        {/* Priority badge — pops in with spring */}
        <motion.div
          className={`rec-priority ${cfg.cls}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.06, type: 'spring', stiffness: 500, damping: 22 }}
          style={{ position: 'relative' }}
        >
          {(rec.priority || 'M')[0]}
          {/* Pulsing dot for High priority */}
          {rec.priority === 'High' && (
            <motion.div
              style={{
                position: 'absolute', top: -2, right: -2,
                width: 7, height: 7, borderRadius: '50%', background: cfg.dot,
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
        </motion.div>

        <div style={{ flex: 1 }}>
          <div className="rec-card-title">{rec.title}</div>
          {rec.category && (
            <motion.span
              className="rec-category-badge"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
            >
              {rec.category}
            </motion.span>
          )}
        </div>

        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </motion.div>
      </div>

      {/* Expandable body — smooth height with AnimatePresence */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="rec-card-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '0.25rem' }}>
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
