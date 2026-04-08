import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function GradientButton({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  className = ""
}) {
  const baseStyles = "relative flex items-center justify-center gap-2 font-display font-extrabold tracking-tight transition-all duration-300 rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 border border-indigo-400/20",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 shadow-sm",
    ghost: "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50",
    success: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/20",
    danger: "bg-risk text-white shadow-lg shadow-rose-500/25 border border-rose-400/20",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
      
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      ) : null}
      
      <span className="relative z-10">{children}</span>
      
      {/* Animated Gradient Border (on hover) */}
      <span className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-xl transition-colors duration-500" />
    </motion.button>
  );
}
