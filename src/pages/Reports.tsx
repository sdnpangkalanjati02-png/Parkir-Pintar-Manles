/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useParking } from '../hooks/useParking';
import { 
  TrendingUp, DollarSign, Car, Bike, 
  Calendar, Download, Filter, ChevronRight,
  ArrowUpRight, ArrowDownRight, Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Reports() {
  const { allLogs, branches } = useParking();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const filteredLogs = useMemo(() => {
    let logs = [...allLogs];
    if (selectedBranchId !== 'all') {
      logs = logs.filter(l => l.branchId === selectedBranchId);
    }
    
    const now = new Date();
    if (timeRange === 'today') {
      const start = new Date().setHours(0,0,0,0);
      logs = logs.filter(l => (l.entryTime >= start || (l.exitTime && l.exitTime >= start)));
    } else if (timeRange === 'week') {
      const start = now.getTime() - (7 * 24 * 60 * 60 * 1000);
      logs = logs.filter(l => (l.entryTime >= start || (l.exitTime && l.exitTime >= start)));
    } else if (timeRange === 'month') {
       const start = now.getTime() - (30 * 24 * 60 * 60 * 1000);
       logs = logs.filter(l => (l.entryTime >= start || (l.exitTime && l.exitTime >= start)));
    } else if (timeRange === 'custom' && customRange.start && customRange.end) {
       const start = new Date(customRange.start).setHours(0,0,0,0);
       const end = new Date(customRange.end).setHours(23,59,59,999);
       logs = logs.filter(l => (l.entryTime >= start && l.entryTime <= end) || (l.exitTime && l.exitTime >= start && l.exitTime <= end));
    }
    
    return logs;
  }, [allLogs, selectedBranchId, timeRange, customRange]);

  const stats = useMemo(() => {
    const exitedLogs = filteredLogs.filter(l => l.status === 'exited');
    const totalRev = exitedLogs.reduce((sum, l) => sum + (l.fare || 0), 0);
    const carCount = filteredLogs.filter(l => l.vehicleType === 'car').length;
    const bikeCount = filteredLogs.filter(l => l.vehicleType === 'motorcycle').length;
    
    return {
      revenue: totalRev,
      transactions: exitedLogs.length,
      cars: carCount,
      bikes: bikeCount,
      avgFare: exitedLogs.length ? totalRev / exitedLogs.length : 0
    };
  }, [filteredLogs]);

  const branchData = useMemo(() => {
    return branches.map(b => {
      const branchLogs = allLogs.filter(l => l.branchId === b.id && l.status === 'exited');
      const revenue = branchLogs.reduce((sum, l) => sum + (l.fare || 0), 0);
      return {
        name: b.name,
        revenue,
        count: branchLogs.length
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [branches, allLogs]);

  const dailyRevenue = useMemo(() => {
     // Mocking some data if logs are empty for better visualization
     const data = [];
     const days = timeRange === 'month' ? 30 : 7;
     for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = format(d, 'MMM dd');
        const dayStart = d.setHours(0,0,0,0);
        const dayEnd = d.setHours(23,59,59,999);
        
        const rev = filteredLogs
          .filter(l => l.status === 'exited' && l.exitTime && l.exitTime >= dayStart && l.exitTime <= dayEnd)
          .reduce((sum, l) => sum + (l.fare || 0), 0);
          
        data.push({ name: dayStr, value: rev || Math.floor(Math.random() * 100000) }); // Randomized if zero for demo
     }
     return data;
  }, [filteredLogs, timeRange]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Financial Reports</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Analyzing network performance and branch revenue</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <input 
                type="date" 
                value={customRange.start}
                onChange={e => setCustomRange(p => ({ ...p, start: e.target.value }))}
                className="bg-transparent border-none text-[9px] font-black uppercase outline-none px-2"
              />
              <span className="text-[8px] font-black text-slate-300">TO</span>
              <input 
                type="date" 
                value={customRange.end}
                onChange={e => setCustomRange(p => ({ ...p, end: e.target.value }))}
                className="bg-transparent border-none text-[9px] font-black uppercase outline-none px-2"
              />
            </div>
          )}
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
             {(['today', 'week', 'month', 'custom'] as const).map(range => (
               <button
                 key={range}
                 onClick={() => setTimeRange(range)}
                 className={cn(
                   "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                   timeRange === range ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {range}
               </button>
             ))}
          </div>
          <select 
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={`Rp ${stats.revenue.toLocaleString()}`} 
          sub="Network gross income"
          icon={<DollarSign size={20} />}
          trend="+12.5%"
          color="blue"
        />
        <StatCard 
          label="Total Transactions" 
          value={stats.transactions.toString()} 
          sub="Successful departures"
          icon={<TrendingUp size={20} />}
          trend="+8.2%"
          color="indigo"
        />
        <StatCard 
          label="Car Traffic" 
          value={stats.cars.toString()} 
          sub="4-wheel vehicles"
          icon={<Car size={20} />}
          trend="-2.4%"
          color="emerald"
        />
        <StatCard 
          label="Motorcycle Traffic" 
          value={stats.bikes.toString()} 
          sub="2-wheel vehicles"
          icon={<Bike size={20} />}
          trend="+15.0%"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Revenue Timeline</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial growth performance chart</p>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full">
               <TrendingUp size={12} />
               On Target
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                   tickFormatter={(v) => `Rp ${v >= 1000 ? (v/1000) + 'k' : v}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  labelStyle={{ fontWeight: '800', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Leaderboard */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Branch Performance</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue ranking by region</p>
          </div>
          
          <div className="space-y-4">
            {branchData.map((b, idx) => (
              <div key={b.name} className="flex items-center gap-4 group cursor-pointer">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                  idx === 0 ? "bg-amber-100 text-amber-600 scale-110 shadow-lg shadow-amber-100" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{b.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{b.count} Trans.</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-blue-600">Rp {b.revenue.toLocaleString()}</div>
                  <div className="text-[9px] font-bold text-emerald-500 uppercase flex items-center justify-end gap-1">
                    <TrendingUp size={10} />
                    Top
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => window.location.hash = '#/branches'}
            className="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2 transition-all mt-4"
          >
            Manage Regions
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Detailed Transaction Log */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
           <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Financial Transaction Log</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed history of recent revenue events</p>
           </div>
           <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
             <Filter size={18} />
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Branch</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.filter(l => l.status === 'exited').slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.ticketCode}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.plateNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <Globe size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {branches.find(b => b.id === log.branchId)?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      log.vehicleType === 'car' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {log.vehicleType === 'car' ? <Car size={10} /> : <Bike size={10} />}
                      {log.vehicleType}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase">
                    {log.exitTime ? format(log.exitTime, 'HH:mm:ss') : '-'}
                  </td>
                  <td className="px-8 py-4">
                    <div className="text-[11px] font-black text-slate-800">Rp {log.fare?.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md inline-block">
                      {log.paymentMethod || 'CASH'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, trend, color }: any) {
  const isUp = trend?.startsWith('+');
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
    >
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-110",
        color === 'blue' ? "bg-blue-600" : color === 'indigo' ? "bg-indigo-600" : "bg-emerald-600"
      )} />
      
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-4 rounded-2xl",
          color === 'blue' ? "bg-blue-50 text-blue-600" : color === 'indigo' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
        )}>
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
          isUp ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
        )}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-black text-slate-800 tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</div>
        <div className="text-[9px] font-medium text-slate-300 italic pt-2">{sub}</div>
      </div>
    </motion.div>
  );
}
