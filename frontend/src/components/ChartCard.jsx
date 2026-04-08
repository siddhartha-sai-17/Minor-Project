import React from 'react';
import { motion } from 'framer-motion';

/**
 * ChartCard
 * Premium wrapper for all Recharts. Provides entrance animation,
 * hover lift, and consistent header/subtitle styling.
 *
 * Props:
 *   title        - card title text (required)
 *   icon         - Lucide icon component
 *   iconColor    - hex colour for icon
 *   subtitle     - secondary description text
 *   delay        - animation delay in seconds (default 0)
 *   children     - chart content (<ResponsiveContainer>...)
 *   style        - extra styles on the card
 *   bodyStyle    - extra styles on the body wrapper
 *   noPadBody    - if true, removes default body padding
 */
export default function ChartCard({
  title, icon: Icon, iconColor = 'var(--primary)',
  subtitle, delay = 0, children,
  style = {}, bodyStyle = {}, noPadBody = false,
}) {
  return (
    <motion.div
      className="chart-card"
      style={style}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{
        y: -3,
        boxShadow: '0 12px 36px rgba(79,70,229,0.09), 0 4px 14px rgba(0,0,0,0.06)',
        transition: { type: 'spring', stiffness: 340, damping: 24 },
      }}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="chart-card-header">
          <div>
            {title && (
              <div className="chart-card-title">
                {Icon && <Icon size={16} style={{ color: iconColor }} />}
                {title}
              </div>
            )}
            {subtitle && <div className="chart-card-sub">{subtitle}</div>}
          </div>
        </div>
      )}

      {/* Body */}
      <div style={noPadBody ? bodyStyle : { padding: '0 0 1rem', ...bodyStyle }}>
        {children}
      </div>
    </motion.div>
  );
}
