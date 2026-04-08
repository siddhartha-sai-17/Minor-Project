import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { Brain, Sparkles, BarChart2, Lightbulb, CheckCircle } from 'lucide-react';

const STEPS = [
  { icon: Brain,       text: 'Analyzing your learning patterns…'    },
  { icon: BarChart2,   text: 'Evaluating academic engagement…'       },
  { icon: Sparkles,    text: 'Running prediction models…'            },
  { icon: Lightbulb,  text: 'Generating personalized insights…'     },
  { icon: CheckCircle, text: 'Preparing your report…'                },
];

// ── Shimmer skeleton block ─────────────────────────────────────
function ShimmerBlock({ height = 80, style = {} }) {
  return (
    <motion.div
      style={{
        height,
        borderRadius: 12,
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% auto',
        ...style,
      }}
      animate={{ backgroundPosition: ['0% center', '200% center'] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export default function LoadingAnalysisScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-start', padding: '3rem 1rem', maxWidth: 700, margin: '0 auto',
      }}
    >
      {/* Pulsing icon */}
      <motion.div
        style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #eef2ff, #ede9fe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 0 0 0 rgba(79,70,229,0.3)',
        }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(79,70,229,0.3)',
            '0 0 0 18px rgba(79,70,229,0)',
            '0 0 0 0 rgba(79,70,229,0)',
          ],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Brain size={36} style={{ color: '#4f46e5' }} />
      </motion.div>

      <div className="section-label" style={{ marginBottom: '0.5rem' }}>AI Analysis in Progress</div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
        Generating Your Learning Report
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
        Our models are analysing 15 behavioural indicators to predict your learning outcome.
      </p>

      {/* Staggered status steps */}
      <motion.div
        style={{ width: '100%', marginBottom: '2rem' }}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={i}
              variants={staggerItem}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '0.5rem',
                background: 'white', border: '1px solid var(--border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <motion.div
                style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon size={16} style={{ color: '#4f46e5' }} />
              </motion.div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {step.text}
              </span>
              {/* Animated dots */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(d => (
                  <motion.div
                    key={d}
                    style={{ width: 5, height: 5, borderRadius: '50%', background: '#c7d2fe' }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1, delay: i * 0.15 + d * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Shimmer skeleton cards */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {[...Array(4)].map((_, i) => <ShimmerBlock key={i} height={76} />)}
        </div>
        <ShimmerBlock height={120} />
        <ShimmerBlock height={200} />
      </div>
    </motion.div>
  );
}
