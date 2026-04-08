import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, BarChart3, Target, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import GradientButton from '../components/GradientButton';
import { GlassCard } from '../components/ui';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const titleWords = "Predict Academic Outcomes With Precision AI".split(" ");

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Animated Mesh Background */}
      <div className="animated-mesh" />
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-40 px-4">
        <div className="container max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/60 shadow-lg backdrop-blur-md mb-10 text-xs font-extrabold uppercase tracking-widest text-indigo-700"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            EduPredict Pro v2.0 is Live
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1] max-w-4xl mx-auto">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
                className="inline-block mr-3"
              >
                {word === "Precision" || word === "AI" ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-gradient-x">{word}</span>
                ) : word}
              </motion.span>
            ))}
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            className="text-lg md:text-2xl text-slate-600 mb-14 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            A production-grade machine learning system analyzing student learning behaviors to detect risk, segment learners, and generate AI study roadmaps.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/register">
              <GradientButton size="lg" className="px-10" icon={ArrowRight}>Start Analysis</GradientButton>
            </Link>
            <Link to="/predict">
              <GradientButton variant="secondary" size="lg" className="px-10">Try Demo Prediction</GradientButton>
            </Link>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -z-10" 
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -left-20 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl -z-10" 
        />
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="py-32 relative bg-white/30 backdrop-blur-sm border-t border-white/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-2 mb-4 text-indigo-600"
            >
              <Sparkles size={20} />
              <span className="text-xs font-extrabold uppercase tracking-[0.3em]">Intelligence Suite</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-6 tracking-tight">Enterprise-Grade AI Architecture</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Powered by Scikit-Learn, XGBoost, and SHAP Explainable AI for unprecedented insight accuracy.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: Brain, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', title: 'Behavioral ML Models', desc: 'Auto-selects between Random Forest, XGBoost, and Logic Regression for peak accuracy.' },
              { icon: Target, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', title: 'Risk Detection', desc: 'Identifies at-risk learners instantly using 15+ engagement indicators.' },
              { icon: BarChart3, color: 'from-info to-blue-600', bg: 'bg-blue-50', title: 'Smart Segmentation', desc: 'K-Means clustering categorizes learning styles like Consistent or Last-minute.' },
              { icon: Zap, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', title: 'Actionable Insights', desc: 'Generates rule-based personalized 7-day study plans to improve performance.' },
              { icon: ShieldCheck, color: 'from-slate-600 to-slate-800', bg: 'bg-slate-50', title: 'Explainable AI (XAI)', desc: 'Uses SHAP values to explain exactly WHY a prediction was made in plain English.' },
              { icon: Sparkles, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', title: 'AI Assistant', desc: 'Claude-powered study bot trained on your specific learning metrics.' },
            ].map((f, i) => (
              <motion.div key={i} variants={itemVariants}>
                <div className="glass-card p-10 h-full group hover:bg-white/80 transition-all duration-500 border border-white">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${f.color} text-white flex items-center justify-center mb-8 shadow-lg shadow-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <f.icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-extrabold mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
