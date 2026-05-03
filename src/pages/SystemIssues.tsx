/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParking } from '../hooks/useParking';
import { useAuth } from '../hooks/useAuth';
import { 
  AlertCircle, Plus, Search, ShieldCheck, 
  Clock, CheckCircle2, AlertTriangle, Info,
  Filter, ChevronRight, X, Send, Cpu, Network,
  Layout, Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { SystemIssue } from '../types';

export default function SystemIssues() {
  const { issues, reportIssue, updateIssue, currentBranchId } = useParking();
  const { user } = useAuth();
  const [isReporting, setIsReporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'hardware' | 'network' | 'software'>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hardware' as SystemIssue['category'],
    priority: 'low' as SystemIssue['priority']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    reportIssue({
      ...formData,
      reporterId: user.id,
      branchId: currentBranchId
    });
    
    setIsReporting(false);
    setFormData({ title: '', description: '', category: 'hardware', priority: 'low' });
  };

  const filteredIssues = issues.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || i.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: SystemIssue['status']) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'investigating': return <Clock className="text-blue-500" size={16} />;
      case 'open': return <AlertCircle className="text-rose-500" size={16} />;
      default: return <Info className="text-slate-400" size={16} />;
    }
  };

  const getPriorityColor = (priority: SystemIssue['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <AlertTriangle size={12} />
            Centralized Support
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">System Troubles</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Report technical issues directly to the central data center</p>
        </div>
        <button 
          onClick={() => setIsReporting(true)}
          className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 shrink-0"
        >
          <Plus size={16} />
          Log New Trouble
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search trouble tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm w-full md:w-auto">
          {(['all', 'hardware', 'network', 'software'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filterType === type ? "bg-slate-900 text-white shadow-md shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 border border-slate-50 border-dashed text-center space-y-4">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">System Status: Nominal</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active trouble tickets found in this branch</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredIssues.map((issue) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={issue.id}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "p-4 rounded-2xl border",
                      issue.category === 'hardware' ? "bg-rose-50 text-rose-600 border-rose-100" :
                      issue.category === 'network' ? "bg-blue-50 text-blue-600 border-blue-100" :
                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {issue.category === 'hardware' ? <Cpu size={20} /> :
                       issue.category === 'network' ? <Network size={20} /> :
                       <Layout size={20} />}
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      getPriorityColor(issue.priority)
                    )}>
                      {issue.priority}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-rose-600 transition-colors uppercase">{issue.title}</h3>
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2 uppercase italic">
                      {issue.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg">
                        {getStatusIcon(issue.status)}
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{issue.status}</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       TS: {new Date(issue.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReporting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsReporting(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
             >
               <div className="p-8 pb-0 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Diagnose & Report</h3>
                 <button 
                   onClick={() => setIsReporting(false)}
                   className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                 >
                   <X size={24} />
                 </button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Headline</label>
                   <input 
                     required
                     type="text"
                     value={formData.title}
                     onChange={e => setFormData(d => ({ ...d, title: e.target.value }))}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm"
                     placeholder="e.g., Gate 1 Controller Not Responding"
                   />
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detail Description</label>
                   <textarea 
                     required
                     rows={3}
                     value={formData.description}
                     onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm resize-none"
                     placeholder="Please provide specifics for the engineering team..."
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                     <select 
                       value={formData.category}
                       onChange={e => setFormData(d => ({ ...d, category: e.target.value as any }))}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm appearance-none"
                     >
                       <option value="hardware">Hardware</option>
                       <option value="network">Network</option>
                       <option value="software">Software</option>
                       <option value="other">Other</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severity</label>
                     <select 
                       value={formData.priority}
                       onChange={e => setFormData(d => ({ ...d, priority: e.target.value as any }))}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm appearance-none"
                     >
                       <option value="low">Low</option>
                       <option value="medium">Medium</option>
                       <option value="high">High</option>
                       <option value="critical">Critical</option>
                     </select>
                   </div>
                 </div>

                 <button 
                   type="submit"
                   className="w-full bg-rose-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 flex items-center justify-center gap-2"
                 >
                   <Send size={18} />
                   Transmit To Headquarters
                 </button>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
