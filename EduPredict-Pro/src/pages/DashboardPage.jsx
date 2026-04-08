import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, AlertTriangle, CheckCircle, Activity, 
  Clock, BookOpen, Target, CalendarDays, ChevronRight,
  ArrowUpRight, Users, Zap, Brain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar
} from 'recharts';
import GradientButton from '../components/GradientButton';
import AnimatedScoreRing from '../components/AnimatedScoreRing';
import CountUpMetric from '../components/CountUpMetric';
import RiskBadge from '../components/RiskBadge';
import PremiumProgressBar from '../components/PremiumProgressBar';

// Mock Data
const behaviorData = [
  { subject: 'Consistency', A: 85, fullMark: 100 },
  { subject: 'Focus', A: 92, fullMark: 100 },
  { subject: 'Participation', A: 78, fullMark: 100 },
  { subject: 'Time Mgmt', A: 65, fullMark: 100 },
  { subject: 'Info Literacy', A: 88, fullMark: 100 },
];

const trendData = [
  { name: 'Week 1', score: 65, avg: 70 },
  { name: 'Week 2', score: 72, avg: 71 },
  { name: 'Week 3', score: 70, avg: 72 },
  { name: 'Week 4', score: 85, avg: 74 },
  { name: 'Week 5', score: 88, avg: 75 },
];

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-indigo-600 mb-2"
          >
            <Activity size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">Academic Overview</span>
          </motion.div>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">Student Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time analysis of your academic trajectory.</p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-3">
          <Link to="/predict">
            <GradientButton icon={Brain} size="md">Run Analysis</GradientButton>
          </Link>
        </motion.div>
      </div>

      {/* ── Bento Grid Layout ── */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Main Hero Bento Card (2x2) */}
        <motion.div variants={cardVariants} className="md:col-span-2 lg:row-span-2">
          <div className="glass-card p-8 h-full bg-gradient-to-br from-white/80 to-indigo-50/30 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700" />
            
            <div>
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-1">Academic Health</h2>
                  <div className="text-3xl font-display font-extrabold text-slate-900">Summary Report</div>
                </div>
                <RiskBadge level="low" />
              </div>

              <div className="flex flex-col items-center justify-center my-10 relative">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl scale-125" />
                <AnimatedScoreRing value={87.4} size={200} strokeWidth={16} color="#4F46E5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8">
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Current GPA</div>
                <div className="text-2xl font-display font-extrabold text-slate-900">
                  <CountUpMetric value={3.8} suffix="" />
                </div>
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Confidence</div>
                <div className="text-2xl font-display font-extrabold text-indigo-600">
                  <CountUpMetric value={92} suffix="%" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Small Metrics */}
        <motion.div variants={cardVariants}>
          <div className="glass-card p-6 h-full flex flex-col justify-between hover:border-emerald-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Outcome</div>
              <div className="text-3xl font-display font-extrabold text-emerald-600">PASS</div>
            </div>
            <div className="mt-4 text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <ArrowUpRight size={12} /> 12% improvement vs last mid-term
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="glass-card p-6 h-full flex flex-col justify-between hover:border-amber-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Study Hours</div>
              <div className="text-3xl font-display font-extrabold text-slate-900">
                <CountUpMetric value={24} suffix="h" />
              </div>
            </div>
            <div className="mt-4">
              <PremiumProgressBar value={75} label="Goal Progress" color="bg-amber-500" showValue={false} />
            </div>
          </div>
        </motion.div>

        {/* Action Bento Card (2x1) */}
        <motion.div variants={cardVariants} className="md:col-span-2">
          <div className="glass-card p-6 h-full bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-[30deg] translate-x-1/2 pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Zap size={28} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl">Learning Profile</h3>
                  <p className="text-indigo-200 text-sm font-medium">Classified as 'Consistent Achievement' cluster.</p>
                </div>
              </div>
              <GradientButton variant="secondary" size="md" className="sm:w-auto w-full border-white/10 bg-white/10 text-white hover:bg-white/20">
                View Methodology
              </GradientButton>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Charts Section ── */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-900 uppercase">Performance Trend</h3>
                <p className="text-xs text-slate-500 font-bold tracking-wider mt-1">TRACKING ACROSS SEMESTER</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> Personal
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> Average
                </span>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 11, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    name="Performance" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#scoreColor)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="glass-card p-8 h-full flex flex-col">
            <h3 className="text-xl font-display font-extrabold text-slate-900 uppercase mb-2">Behavior Radar</h3>
            <p className="text-xs text-slate-500 font-bold mb-8 uppercase tracking-widest">HABITUAL STRENGTHS</p>
            <div className="h-[280px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={behaviorData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name="Skills" 
                    dataKey="A" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    fill="#4f46e5" 
                    fillOpacity={0.15} 
                    animationDuration={2000}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Recommendations Preview ── */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Smart Action Plan</h2>
          <GradientButton variant="ghost" size="sm" icon={ChevronRight}>Full Report</GradientButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { level: 'high', icon: Clock, title: 'Pending Assignments', desc: 'CS101 quiz and DB project due in 48h.', color: 'text-rose-600' },
            { level: 'medium', icon: Target, title: 'Reinforce Modules', desc: 'Focus on Data Structs (last score 65%).', color: 'text-amber-600' },
            { level: 'low', icon: Users, title: 'Collaborative Study', desc: 'Join the CS Peer group for review.', color: 'text-indigo-600' },
          ].map((rec, i) => (
            <motion.div key={i} variants={cardVariants}>
              <div className="glass-card p-6 h-full flex flex-col group hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-slate-50 ${rec.color} group-hover:scale-110 transition-transform duration-300`}>
                    <rec.icon size={20} strokeWidth={2.5} />
                  </div>
                  <RiskBadge level={rec.level} className="scale-90" />
                </div>
                <h3 className="font-extrabold text-slate-900 mb-2 leading-tight">{rec.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{rec.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
