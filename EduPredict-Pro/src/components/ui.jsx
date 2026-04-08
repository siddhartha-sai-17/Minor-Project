import React from 'react';
import { motion } from 'framer-motion';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  icon: Icon,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 outline-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 text-white shadow-md shadow-primary-500/20 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 focus:ring-4 focus:ring-primary-500/20',
    secondary: 'bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus:ring-4 focus:ring-slate-200',
    ghost: 'text-slate-600 hover:text-primary-600 hover:bg-primary-50',
    danger: 'bg-danger text-white shadow-md shadow-danger/20 hover:bg-red-600 hover:shadow-lg hover:shadow-danger/30 focus:ring-4 focus:ring-danger/20',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
      ) : null}
      {children}
    </motion.button>
  );
}

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div 
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${hover ? 'hover:shadow-md transition-shadow duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCard({ children, className = '', ...props }) {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'info', className = '' }) {
  const variants = {
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-amber-600 border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    info: 'bg-info/10 text-info border border-info/20',
    primary: 'bg-primary-50 text-primary-700 border border-primary-100',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
