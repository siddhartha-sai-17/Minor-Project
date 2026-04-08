import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldAlert, Sparkles, Brain, Clock, ChevronRight, CheckCircle2, ChevronLeft, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';
import PremiumProgressBar from '../components/PremiumProgressBar';

const formSections = [
  {
    id: 'engagement', title: 'Course Engagement', icon: Clock,
    fields: [
      { name: 'attendance_percentage', label: 'Attendance (%)', type: 'number', placeholder: 'e.g., 85' },
      { name: 'daily_study_hours', label: 'Daily Study Hours', type: 'number', placeholder: 'e.g., 3' },
      { name: 'video_lectures_watched_per_week', label: 'Lecture Views / Week', type: 'number', placeholder: 'e.g., 5' },
    ]
  },
  {
    id: 'performance', title: 'Academic Performance', icon: Brain,
    fields: [
      { name: 'assignment_submission_rate', label: 'Assignment Rate (%)', type: 'number', placeholder: 'e.g., 90' },
      { name: 'practice_quiz_attempts', label: 'Quiz Attempts / Wk', type: 'number', placeholder: 'e.g., 4' },
      { name: 'class_participation_score', label: 'Participation (0-10)', type: 'number', placeholder: 'e.g., 7' },
    ]
  },
  {
    id: 'behavior', title: 'Behavioral Metrics', icon: ShieldAlert,
    fields: [
      { name: 'procrastination_score', label: 'Procrastination (0-10)', type: 'number', placeholder: 'e.g., 4' },
      { name: 'stress_level', label: 'Stress Level (0-10)', type: 'number', placeholder: 'e.g., 5' },
      { name: 'time_management_score', label: 'Time Management (0-10)', type: 'number', placeholder: 'e.g., 8' },
    ]
  }
];

const analysisMessages = [
  "Analyzing study behavior...",
  "Evaluating academic patterns...",
  "Running XGBoost predictors...",
  "Generating personalized insights...",
  "Finalizing your academic roadmap..."
];

export default function PredictionFormPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setStatusIndex(prev => (prev + 1) % analysisMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < formSections.length - 1) setCurrentStep(c => c + 1);
    else handlePredict();
  };
  
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handlePredict = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/results'); 
    }, 7500); // Longer timeout to see the messages
  };

  const currentSection = formSections[currentStep];
  const progressPercent = ((currentStep + 1) / formSections.length) * 100;

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden">
        <div className="animated-mesh opacity-50" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center text-center max-w-md px-6"
        >
          <div className="relative mb-12">
            {/* Pulsing Brain Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0 0px rgba(99, 102, 241, 0.4)",
                  "0 0 0 40px rgba(99, 102, 241, 0)",
                  "0 0 0 0px rgba(99, 102, 241, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center text-white"
            >
              <Brain size={48} strokeWidth={1.5} />
            </motion.div>
            
            {/* Rotating border */}
            <div className="absolute inset-[-15px]">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <motion.circle
                  cx="50" cy="50" r="48"
                  fill="none"
                  stroke="url(#gradForm)"
                  strokeWidth="2"
                  strokeDasharray="10 20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <defs>
                  <linearGradient id="gradForm" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">AI Engine Processing</h2>
          
          <div className="h-8 flex items-center justify-center bg-indigo-50 px-6 rounded-full border border-indigo-100 flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest"
              >
                {analysisMessages[statusIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <div className="mt-12 w-full space-y-4">
             <div className="flex items-center gap-4 py-3 px-4 glass-card bg-white animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-100 shimmer shrink-0" />
                <div className="h-4 w-full bg-slate-100 shimmer rounded" />
             </div>
             <div className="flex items-center gap-4 py-3 px-4 glass-card bg-white animate-pulse opacity-60">
                <div className="w-8 h-8 rounded-lg bg-slate-100 shimmer shrink-0" />
                <div className="h-4 w-5/6 bg-slate-100 shimmer rounded" />
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-indigo-600 mb-3"
        >
          <Sparkles size={16} />
          <span className="text-[10px] font-extrabold uppercase tracking-[.3em]">Behavioral Input</span>
        </motion.div>
        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">Academic AI Predictor</h1>
        <p className="text-slate-500 font-medium mt-2">Personalize your analysis with detailed learning habits.</p>
      </div>

      {/* Progress Section */}
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex justify-between">
          {formSections.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 relative z-10">
              <motion.div
                animate={{ 
                  scale: i === currentStep ? 1 : 0.9,
                  backgroundColor: i <= currentStep ? '#4F46E5' : '#F1F5F9',
                  color: i <= currentStep ? '#FFFFFF' : '#94A3B8',
                  borderColor: i < currentStep ? '#4F46E5' : (i === currentStep ? '#818CF8' : '#E2E8F0')
                }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 font-display font-extrabold transition-colors shadow-sm`}
              >
                {i < currentStep ? <CheckCircle2 size={18} /> : i + 1}
              </motion.div>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${i === currentStep ? 'text-indigo-600' : 'text-slate-400'}`}>
                {s.title.split(" ")[0]}
              </span>
              
              {/* Connector */}
              {i < formSections.length - 1 && (
                <div className="absolute top-5 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-[2px] bg-slate-100 -z-10 overflow-hidden min-w-[60px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: i < currentStep ? '100%' : '0%' }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <PremiumProgressBar value={progressPercent} color="bg-gradient-to-r from-indigo-500 to-violet-500" showValue={false} />
      </div>

      {/* Form Card */}
      <div className="glass-card bg-white/80 p-1 bg-gradient-to-tr from-indigo-500/10 via-white/80 to-violet-500/10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <header className="flex items-center gap-5 mb-10 pb-6 border-b border-slate-50">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <currentSection.icon size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">{currentSection.title}</h2>
                  <p className="text-slate-500 text-sm font-medium">Step {currentStep + 1} of {formSections.length}</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {currentSection.fields.map(field => (
                  <div key={field.name} className="space-y-2 group">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">
                      {field.label}
                    </label>
                    <div className="relative">
                       <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        className="input-field py-4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <footer className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-50">
            <button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className={`flex items-center gap-2 text-sm font-extrabold text-slate-400 hover:text-slate-900 transition-colors px-4 py-2 rounded-xl disabled:opacity-0`}
            >
              <ChevronLeft size={18} />
              Previous Group
            </button>
            <div className="flex gap-4 w-full sm:w-auto">
               <GradientButton 
                onClick={nextStep} 
                className="w-full sm:w-auto min-w-[200px]"
                icon={currentStep === formSections.length - 1 ? Sparkles : ChevronRight}
              >
                {currentStep === formSections.length - 1 ? 'Generate Analysis' : 'Continue'}
              </GradientButton>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
