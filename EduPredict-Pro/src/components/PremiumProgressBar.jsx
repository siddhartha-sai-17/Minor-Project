import React from 'react';
import { motion } from 'framer-motion';

export default function PremiumProgressBar({ 
  value = 0, 
  max = 100, 
  label = "", 
  color = "bg-indigo-600",
  showValue = true,
  className = ""
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-end mb-1">
          {label && <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>}
          {showValue && <span className="text-sm font-extrabold text-slate-900">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          className={`h-full ${color} rounded-full relative`}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-white/20" />
        </motion.div>
      </div>
    </div>
  );
}
