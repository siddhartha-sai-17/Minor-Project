import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function RiskBadge({ 
  level = "low", 
  className = "" 
}) {
  const configs = {
    low: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
      icon: CheckCircle,
      text: "Optimal Performance"
    },
    medium: {
      color: "bg-amber-50 text-amber-700 border-amber-200/50",
      icon: Info,
      text: "Action Needed"
    },
    high: {
      color: "bg-rose-50 text-rose-700 border-rose-200/50",
      icon: AlertTriangle,
      text: "At Risk"
    }
  };

  const config = configs[level] || configs.low;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 17, delay: 0.15 }}
      whileHover={{ y: -1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-extrabold uppercase tracking-widest shadow-sm ${config.color} ${className}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      <span>{config.text}</span>
    </motion.div>
  );
}
