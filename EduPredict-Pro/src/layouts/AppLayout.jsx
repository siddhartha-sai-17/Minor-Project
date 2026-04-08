import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, User, Menu, X, Bell, Search, Sparkles } from 'lucide-react'
import FloatingAIBot from '../components/FloatingAIBot'

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Mock student data for the bot
  const studentData = {
    name: "Alex",
    gpa: 3.8,
    risk: "low",
    engagement: 92,
    lastAnalysis: "2026-04-03"
  }

  return (
    <div className="page-layout selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <BookOpen size={22} strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
              EduPredict<span className="text-indigo-600">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
            <NavLink to="/dashboard" current={location.pathname}>Dashboard</NavLink>
            <NavLink to="/predict" current={location.pathname}>Predict</NavLink>
            <NavLink to="/admin" current={location.pathname}>Insights</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search analysis..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all w-48 focus:w-64"
              />
            </div>
            
            <button className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="h-8 w-px bg-slate-200 mx-1" />
            
            <Link to="/dashboard" className="flex items-center gap-3 p-1 pr-4 pl-1 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden group-hover:border-indigo-100 transition-colors">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-slate-900 leading-none">Alex S.</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Student</span>
              </div>
            </Link>
          </div>

          <button 
            className="lg:hidden p-2.5 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white lg:hidden flex flex-col"
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white">
                  <BookOpen size={22} strokeWidth={2.5} />
                </div>
                <span className="font-display font-extrabold text-xl">Menu</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-3 text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={24}/>
              </button>
            </div>
            <div className="flex flex-col p-6 gap-2">
              <MobileNavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
              <MobileNavLink to="/predict" onClick={() => setMobileMenuOpen(false)}>Predictions</MobileNavLink>
              <MobileNavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</MobileNavLink>
              
              <div className="my-6 border-t border-slate-100" />
              
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-4">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                  <div className="font-extrabold text-slate-900">Alex Saunders</div>
                  <div className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Premium Plan</div>
                </div>
              </div>
              <button className="mt-4 w-full py-4 rounded-xl bg-slate-900 text-white font-extrabold shadow-lg shadow-slate-200">Sign Out</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content Area with Page Transitions ── */}
      <main className="page-main relative pt-2 lg:pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* ── Floating AI Bot ── */}
      <FloatingAIBot studentData={studentData} />
      
      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/60 bg-slate-50/50 py-10 mt-20 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <BookOpen size={18} />
            <span className="font-display font-bold text-sm tracking-tight text-slate-900">EduPredict Pro</span>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            © 2026 EduPredict Pro. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer uppercase tracking-widest">Privacy</span>
            <span className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer uppercase tracking-widest">Terms</span>
            <span className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer uppercase tracking-widest">Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ to, current, children }) {
  const isActive = (current.startsWith(to) && to !== '/') || current === to;
  return (
    <Link 
      to={to} 
      className={`px-6 py-2.5 text-sm font-extrabold transition-all relative rounded-xl ${isActive ? 'text-indigo-600 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
    >
      <span className="relative z-10">{children}</span>
      {isActive && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50"
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        />
      )}
    </Link>
  )
}

function MobileNavLink({ to, onClick, children }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className="p-4 text-lg font-extrabold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all"
    >
      {children}
    </Link>
  )
}
