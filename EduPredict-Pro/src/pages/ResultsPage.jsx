import React from 'react';
import { motion } from 'framer-motion';
import { 
  Download, ArrowLeft, ShieldAlert, Sparkles, AlertTriangle, 
  CheckCircle2, Brain, Map, Clock, Share2, Info, TrendingUp, Zap
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import GradientButton from '../components/GradientButton';
import CountUpMetric from '../components/CountUpMetric';
import RiskBadge from '../components/RiskBadge';
import PremiumProgressBar from '../components/PremiumProgressBar';

// Mock SHAP Explainer Data
const shapData = [
  { feature: 'Attendance (-15%)', value: -0.65 },
  { feature: 'Quiz Scores (-8%)', value: -0.42 },
  { feature: 'Submission Time', value: 0.1 },
  { feature: 'Study Hours (+12%)', value: 0.55 },
  { feature: 'LMS Logins (+20%)', value: 0.8 },
];

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export default function ResultsPage() {
  const { id = 'ANA-2908' } = useParams();

  return (
    <div className="space-y-10 pb-20">
      {/* ── Page Header ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <Link to="/predict" className="group flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to analysis
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">Intelligence Report</h1>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border border-slate-200">ID: {id}</span>
          </div>
          <p className="text-slate-500 font-medium mt-2">Personalized academic trajectory based on behavior patterns.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <GradientButton variant="secondary" size="md" icon={Share2}>Share Report</GradientButton>
          <GradientButton size="md" icon={Download}>Export Analysis</GradientButton>
        </div>
      </header>

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        {/* Main Verdict Card - High Impact Hero */}
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <div className="glass-card p-1 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 h-full">
            <div className="bg-slate-900 h-full rounded-2xl p-10 relative overflow-hidden flex flex-col justify-between">
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
              
              <header className="relative z-10 flex justify-between items-start mb-16">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">Final Prediction Verdict</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-display font-extrabold text-white tracking-tighter">PASS</h2>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest mb-1 opacity-60">Model Confidence</div>
                  <div className="text-4xl font-display font-extrabold text-white">
                    <CountUpMetric value={89.4} suffix="%" />
                  </div>
                </div>
              </header>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-extrabold uppercase tracking-widest">
                    <CheckCircle2 size={18} />
                    Low Risk Trajectory
                  </div>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    XGBoost analysis predicts a <span className="text-white font-bold">Top 15%</span> finish this semester. Consistent study patterns are significantly compensating for minor attendance gaps.
                  </p>
                </div>
                
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group hover:border-indigo-500/50 transition-colors">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Brain size={14} className="text-indigo-400" /> Executive Summary
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Strong correlation detected between late-night LMS activity and quiz performance. Behavior cluster: <span className="text-indigo-300 font-bold">Strategic Consistent</span>. Focus on maintaining current engagement levels to secure high honors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Behavioral Radar/Scores */}
        <motion.div variants={cardVariants}>
          <div className="glass-card p-8 h-full flex flex-col bg-white">
            <h3 className="text-xl font-display font-extrabold text-slate-900 uppercase">Behavioral Indices</h3>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest mb-10 uppercase"> habit-driven performance</p>
            
            <div className="space-y-10 flex-1 flex flex-col justify-center">
              {[
                { label: 'Consistency', value: 85, color: 'bg-indigo-600', icon: TrendingUp },
                { label: 'Punctuality', value: 92, color: 'bg-emerald-500', icon: Clock },
                { label: 'Participation', value: 78, color: 'bg-violet-500', icon: Users },
                { label: 'Information Lit', value: 65, color: 'bg-amber-500', icon: Brain },
              ].map((b, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                       <b.icon size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                       <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{b.label}</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">{b.value}%</span>
                  </div>
                  <PremiumProgressBar value={b.value} color={b.color} showValue={false} />
                </div>
              ))}
            </div>
            
            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Info size={20} />
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-tight">These scores are calculated relative to anonymized peer data across your specific course level.</p>
            </div>
          </div>
        </motion.div>

        {/* Explainable AI (SHAP Analysis) - Full Width below */}
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <div className="glass-card p-10 bg-white">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight uppercase flex items-center gap-2">
                  <Zap size={24} className="text-amber-500 fill-amber-500/20" /> Explainable AI (XAI)
                </h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Understanding the <strong>WHY</strong> behind the PASS prediction.</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-100">Positive Impact</div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase tracking-widest border border-rose-100">Negative Impact</div>
              </div>
            </header>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[-1, 1]} hide />
                  <YAxis 
                    type="category" 
                    dataKey="feature" 
                    tick={{fontSize: 11, fill: '#475569', fontWeight: 800}} 
                    axisLine={false} 
                    tickLine={false} 
                    width={180} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800}} 
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32} animationDuration={1800}>
                    {shapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#F43F5E'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                 "SHAP (Shapley Additive Explanations) uses game theory to determine exactly how each behavior contributed to your final prediction result, providing transparency into the AI's decision-making process."
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Actionable Roadmap - Right Side column */}
        <motion.div variants={cardVariants}>
          <div className="glass-card p-8 h-full bg-slate-50 overflow-hidden relative border-slate-200">
            <h3 className="text-xl font-display font-extrabold text-slate-900 uppercase mb-8 flex items-center gap-2">
              <Map size={18} className="text-indigo-600" /> Action Roadmap
            </h3>
            
            <div className="relative space-y-6">
              {/* Vertical line connector */}
              <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-slate-200 -z-0" />
              
              {[
                { type: 'Critical', title: 'Submit Delayed Project', desc: 'CS101 assignment is overdue. Immediate submission is required.', risk: 'high' },
                { type: 'Guidance', title: 'Revision Strategy', desc: 'Study "Graph Algorithms" for 4 hours before the mock exam.', risk: 'medium' },
                { type: 'Success', title: 'Maintain Momentum', desc: 'Current late-night study streaks are proving highly productive.', risk: 'low' },
                { type: 'Routine', title: 'LMS Activity', desc: 'Target 95% lecture module viewing rate before Thursday.', risk: 'low' },
              ].map((rec, i) => (
                <div key={i} className="flex gap-4 relative z-10 group">
                  <div className={`w-12 h-12 rounded-2xl ${
                    rec.risk === 'high' ? 'bg-rose-100 text-rose-600' : rec.risk === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  } flex items-center justify-center shrink-0 border-4 border-slate-50 shadow-sm transition-transform group-hover:scale-110`}>
                    {rec.risk === 'high' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{rec.type}</span>
                      <RiskBadge level={rec.risk} className="scale-75 origin-left" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 mb-1">{rec.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{rec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12">
               <GradientButton variant="primary" size="md" className="w-full shadow-indigo-100/50" icon={Sparkles}>
                 Generate Full 7-Day Plan
               </GradientButton>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
