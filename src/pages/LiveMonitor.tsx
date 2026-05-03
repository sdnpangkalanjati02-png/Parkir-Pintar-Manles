/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParking } from '../hooks/useParking';
import { 
  Activity, Globe, Search, ArrowRightLeft, 
  MapPin, ShieldCheck, ShieldAlert,
  Car, Bike, Clock, ChevronRight,
  TrendingUp, TrendingDown,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function LiveMonitor() {
  const { allLogs, branches } = useParking();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-scrolling logs effect simulation
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => {
    let logs = [...allLogs].sort((a, b) => b.entryTime - a.entryTime);
    if (selectedBranchId !== 'all') {
      logs = logs.filter(l => l.branchId === selectedBranchId);
    }
    if (searchQuery) {
      logs = logs.filter(l => l.plateNumber.includes(searchQuery.toUpperCase()));
    }
    return logs;
  }, [allLogs, selectedBranchId, searchQuery]);

  const activeCount = useMemo(() => allLogs.filter(l => l.status === 'parked').length, [allLogs]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            Live Network Monitor
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Global Operations</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time vehicle trajectory and regional occupancy</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text"
               placeholder="Search active plate..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
             />
          </div>
          <select 
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            className="bg-white border border-slate-100 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="all">Global Fleet</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <MonitorCard 
            label="Total Entries Today" 
            value={allLogs.filter(l => l.entryTime >= new Date().setHours(0,0,0,0)).length} 
            icon={<ArrowRightLeft />}
            color="blue"
          />
          <MonitorCard 
            label="Current Occupancy" 
            value={activeCount} 
            icon={<Activity />}
            color="emerald"
            pulse
          />
          <MonitorCard 
            label="Active Branches" 
            value={branches.filter(b => b.status === 'active').length} 
            icon={<Globe />}
            color="indigo"
          />
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all" />
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Quo</h3>
            <div className="text-3xl font-black tracking-tight tracking-widest">NORMAL</div>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">All sensors operating within parameters</p>
          </div>
          <div className="flex items-center gap-2 mt-8 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-full border border-white/10 transition-all hover:bg-white/20 cursor-pointer">
             Network Health 99.8%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Activity Feed */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Live Activity Feed</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consolidated vehicle event stream</p>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase text-slate-400 shadow-sm">
                 Queue: 0 ms
               </div>
            </div>
          </div>
          
          <div className="p-6 h-[600px] overflow-y-auto scrollbar-hide space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredLogs.map((log, idx) => {
                const branch = branches.find(b => b.id === log.branchId);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={log.id}
                    className={cn(
                      "group flex items-center p-6 bg-white border border-slate-100 rounded-[2rem] hover:ring-2 hover:ring-blue-500/10 hover:shadow-lg transition-all",
                      idx === 0 && "ring-2 ring-emerald-500/20 border-emerald-100 bg-emerald-50/30"
                    )}
                  >
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm relative group-hover:scale-110 transition-all",
                        log.status === 'parked' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      )}>
                        {log.vehicleType === 'car' ? <Car size={28} /> : <Bike size={28} />}
                        {idx === 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-ping" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-slate-800 tracking-tight text-xl">{log.plateNumber}</span>
                          <div className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                            log.status === 'parked' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                          )}>
                            {log.status === 'parked' ? 'INCOMING' : 'DEPARTED'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-blue-500" />
                            {branch?.name || 'Unknown Region'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDistanceToNow(log.entryTime)} ago
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Station</div>
                        <div className="text-xs font-bold text-slate-800">GATE-{log.status === 'parked' ? 'IN-01' : 'OUT-01'}</div>
                      </div>
                      <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Region Occupancy Radar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Regional Health</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time occupancy across branch nodes</p>
            </div>
            
            <div className="space-y-6">
              {branches.map(b => {
                const occupancyCount = allLogs.filter(l => l.branchId === b.id && l.status === 'parked').length;
                const totalCap = b.capacity.car + b.capacity.motorcycle;
                const percentage = Math.round((occupancyCount / totalCap) * 100);
                
                return (
                  <div key={b.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{b.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{percentage}% Full</div>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${percentage}%` }}
                         className={cn(
                           "h-full rounded-full transition-all",
                           percentage > 90 ? "bg-rose-500" : percentage > 70 ? "bg-amber-500" : "bg-blue-500"
                         )}
                       />
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                       <span>{occupancyCount} ACTIVE</span>
                       <span>{totalCap} CAP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                 <ShieldCheck size={20} />
               </div>
               <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Security Node</h3>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Encrypted Data Stream</div>
               </div>
             </div>
             
             <div className="space-y-3">
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Uptime</span>
                 <span className="text-[10px] font-bold text-emerald-600">34d 12h 45m</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bandwidth</span>
                 <span className="text-[10px] font-bold text-blue-600">4.2 MBps</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonitorCard({ label, value, icon, color, pulse }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
    >
      <div className={cn(
        "absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.03]",
        color === 'blue' ? "bg-blue-600" : color === 'indigo' ? "bg-indigo-600" : "bg-emerald-600"
      )} />
      
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-4 rounded-2xl relative",
          color === 'blue' ? "bg-blue-50 text-blue-600" : color === 'indigo' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
        )}>
          {icon}
          {pulse && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
      </div>
    </motion.div>
  );
}
