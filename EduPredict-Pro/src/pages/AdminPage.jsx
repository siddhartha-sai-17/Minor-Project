import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UploadCloud, Search, ShieldAlert, Filter, CheckCircle2,
  AlertTriangle, MoreVertical, ExternalLink 
} from 'lucide-react';
import { Button, GlassCard, Badge } from '../components/ui';
import { Link } from 'react-router-dom';

// Mock Data
const mockStudents = [
  { id: 'S101', name: 'Alex Johnson', latestPrediction: 'Pass', riskLevel: 'Low', cluster: 'Consistent', lastActive: '2 hrs ago' },
  { id: 'S102', name: 'Maria Garcia', latestPrediction: 'At Risk', riskLevel: 'High', cluster: 'Last-minute', lastActive: '3 days ago' },
  { id: 'S103', name: 'James Smith', latestPrediction: 'Pass', riskLevel: 'Medium', cluster: 'Passive', lastActive: '1 day ago' },
  { id: 'S104', name: 'Sarah Lee', latestPrediction: 'Pass', riskLevel: 'Low', cluster: 'Consistent', lastActive: '5 hrs ago' },
  { id: 'S105', name: 'David Chen', latestPrediction: 'At Risk', riskLevel: 'High', cluster: 'Last-minute', lastActive: '1 week ago' },
];

export default function AdminPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filtered = mockStudents.filter(s => {
    if (filter !== 'All' && s.riskLevel !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 2000); // Mock processing
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Administrator Console</h1>
          <p className="text-slate-500 mt-1">Manage users, run bulk analyses, and monitor system-wide risks.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={handleUpload} icon={UploadCloud} loading={isUploading}>
            Bulk Upload CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1 */}
        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">Total Students</div>
            <div className="text-3xl font-display font-bold text-slate-900 mt-1">1,248</div>
          </div>
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl"><Users size={24} /></div>
        </GlassCard>

        {/* KPI 2 */}
        <GlassCard className="p-5 flex items-center justify-between border border-transparent shadow-[0_0_0_1px_rgba(239,68,68,0.2)] bg-danger/5">
          <div>
            <div className="text-sm font-medium text-danger/80">High Risk Cohort</div>
            <div className="text-3xl font-display font-bold text-danger mt-1">84</div>
          </div>
          <div className="p-3 bg-danger/10 text-danger rounded-xl"><ShieldAlert size={24} /></div>
        </GlassCard>

        {/* KPI 3 */}
        <GlassCard className="p-5 lg:col-span-2 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <div className="text-sm font-medium text-slate-400">System Health</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-3 w-3 rounded-full bg-success"></span>
              <span className="text-lg font-semibold">XGBoost API Optimal</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 uppercase">Last Model Retrain</div>
            <div className="text-sm">2 Days Ago</div>
          </div>
        </GlassCard>
      </div>

      {/* ── Student Directory ── */}
      <GlassCard className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Search by name or ID..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 h-10 py-0"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['All', 'High', 'Medium', 'Low'].map(f => (
              <button 
                key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {f === 'All' ? 'All Risks' : `${f} Risk`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Latest Prediction</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">K-Means Cluster</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filtered.map(student => (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    layout
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{student.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {student.latestPrediction === 'Pass' ? (
                        <div className="flex items-center gap-1.5 text-success font-medium"><CheckCircle2 size={16}/> Pass</div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-danger font-medium"><AlertTriangle size={16}/> At Risk</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={student.riskLevel === 'High' ? 'danger' : student.riskLevel === 'Medium' ? 'warning' : 'success'}>
                        {student.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{student.cluster}</td>
                    <td className="px-6 py-4 text-slate-500">{student.lastActive}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/results/${student.id}`} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
                        View profile <ExternalLink size={14} />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <ShieldAlert size={32} className="mx-auto mb-3 text-slate-300" />
              <p>No students found matching current filters.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
