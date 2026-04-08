import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Chrome, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Background Mesh */}
      <div className="animated-mesh opacity-70" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-400/10 blur-[120px] animate-pulse-slow" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="glass-card p-10 border-white/60 relative overflow-hidden group/card bg-white/60">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-50" />

          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200"
            >
              <CheckCircle2 color="white" size={32} />
            </motion.div>
            <h1 className="text-3xl font-display font-extrabold text-slate-900 mb-2 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-slate-500 font-medium">
              {isLogin ? "Enter your credentials to access your dashboard" : "Join the next generation of academic AI"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="text"
                      className="input-field pl-12"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                {isLogin && (
                  <button type="button" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <GradientButton type="submit" size="lg" className="w-full" icon={ArrowRight}>
              {isLogin ? "Sign In" : "Get Started"}
            </GradientButton>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-extrabold text-slate-400 bg-transparent px-4">
              <span className="bg-white/50 backdrop-blur-sm px-4">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white/50 hover:bg-white hover:border-indigo-300 transition-all text-sm font-bold text-slate-700 shadow-sm">
              <Github size={18} />
              GitHub
            </button>
            <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white/50 hover:bg-white hover:border-indigo-300 transition-all text-sm font-bold text-slate-700 shadow-sm">
              <Chrome size={18} />
              Google
            </button>
          </div>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-extrabold text-indigo-600">
                {isLogin ? "Create Account" : "Sign In"}
              </span>
            </button>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-center mt-8 text-xs text-slate-400 font-medium">
          By continuing, you agree to EduPredict's <br/>
          <span className="underline hover:text-indigo-500 cursor-pointer">Terms of Service</span> and <span className="underline hover:text-indigo-500 cursor-pointer">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}
