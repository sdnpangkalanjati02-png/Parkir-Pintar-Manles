/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParking } from '../hooks/useParking';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Users, TrendingUp, DollarSign, Clock, 
  ArrowUpRight, ArrowDownRight, Package,
  MoreVertical, Search, Filter, RefreshCw,
  AlertTriangle, Bell, X
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { logs, stats, currentBranchId, branches } = useParking();
  const { user } = useAuth();
  const currentBranch = branches.find(b => b.id === currentBranchId);
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'car' | 'motorcycle'>('all');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isManagement = ['admin', 'keuangan', 'direktur'].includes(user?.role || '');
  const occupancyRate = stats.occupied / stats.totalCapacity;
  const isHighOccupancy = occupancyRate >= 0.9;
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string, message: string, time: Date }[]>([]);

  // Simulation: Trigger Management Notification when occupancy hits 90%
  useEffect(() => {
    if (isHighOccupancy && isManagement) {
      const exists = notifications.some(n => n.message.includes('KRITIS'));
      if (!exists) {
        setNotifications(prev => [
          { 
            id: Math.random().toString(36).substr(2, 9), 
            message: `PERINGATAN KRITIS: Kapasitas Parkir ${Math.round(occupancyRate * 100)}%`, 
            time: new Date() 
          },
          ...prev
        ]);
      }
    }
  }, [isHighOccupancy, isManagement, occupancyRate]);

  const processedChartData = React.useMemo(() => {
    const buckets: Record<string, { name: string, entries: number, revenue: number, cars: number, motorcycles: number }> = {};
    
    // Generate last 6 buckets of 2-hour intervals
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000));
      const hour = Math.floor(d.getHours() / 2) * 2;
      const key = `${hour < 10 ? '0' : ''}${hour}:00`;
      buckets[key] = { name: key, entries: 0, revenue: 0, cars: 0, motorcycles: 0 };
    }

    logs.forEach(log => {
      const logDate = new Date(log.entryTime);
      const hour = Math.floor(logDate.getHours() / 2) * 2;
      const key = `${hour < 10 ? '0' : ''}${hour}:00`;
      
      if (buckets[key]) {
        buckets[key].entries++;
        if (log.vehicleType === 'car') buckets[key].cars++;
        else buckets[key].motorcycles++;
        
        // If exited, add to revenue bucket (simple approximation for chart)
        if (log.status === 'exited' && log.exitTime) {
          const duration = (log.exitTime - log.entryTime) / (1000 * 60 * 60);
          const baseFare = 3000;
          const hourlyRate = 5000;
          const fare = baseFare + (Math.max(0, Math.ceil(duration) - 1) * hourlyRate);
          buckets[key].revenue += fare;
        }
      }
    });

    return Object.values(buckets);
  }, [logs]);

  // Auto-refresh simulation every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => {
        setLastRefreshed(new Date());
        setIsSyncing(false);
      }, 1000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const chartData = [
    { name: '08:00', entries: 12, revenue: 45000 },
    { name: '10:00', entries: 25, revenue: 120000 },
    { name: '12:00', entries: 42, revenue: 210000 },
    { name: '14:00', entries: 35, revenue: 150000 },
    { name: '16:00', entries: 28, revenue: 95000 },
    { name: '18:00', entries: 15, revenue: 60000 },
  ];

  const filteredLogs = logs.filter(log => 
    vehicleFilter === 'all' || log.vehicleType === vehicleFilter
  );

  const kpis = [
    { title: 'Parked Vehicles', value: stats.occupied, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', isUp: true },
    ...(isManagement ? [{ title: 'Total Revenue', value: `Rp ${stats.revenueToday.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8.4%', isUp: true }] : []),
    { title: 'Total Entries', value: stats.entriesToday, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: '-2.1%', isUp: false },
    { title: 'Occupancy Rate', value: `${((stats.occupied / stats.totalCapacity) * 100).toFixed(1)}%`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+4.5%', isUp: true },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* High Occupancy Alert Banner */}
      <AnimatePresence>
        {isHighOccupancy && !alertDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-rose-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Kapasitas Hampir Penuh</h4>
                  <p className="text-white/80 text-xs font-medium">Saat ini lot parkir telah terisi {Math.round(occupancyRate * 100)}%. Harap arahkan kendaraan ke area parkir tambahan.</p>
                </div>
              </div>
              <button 
                onClick={() => setAlertDismissed(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                id="dismiss-occupancy-alert"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Quick Notification Bar */}
      {isManagement && notifications.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {notifications.map((n) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={n.id}
              className="flex-shrink-0 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 flex items-center gap-3 shadow-sm"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Bell size={12} className="text-white" />
              </div>
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">{n.message}</span>
              <button 
                onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                className="text-blue-300 hover:text-blue-600"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">{currentBranch?.code}</span>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{currentBranch?.name}</h2>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500">Sistem Parkir Otomatis - Real-time monitoring</p>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isSyncing ? "bg-blue-500 animate-pulse" : "bg-emerald-500"
              )} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {isSyncing ? 'Syncing...' : `Live: Updated ${format(lastRefreshed, 'HH:mm:ss')}`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="bg-white border border-slate-200 p-2 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
              <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${kpi.bg} p-3 rounded-xl`}>
                <kpi.icon className={kpi.color} size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {kpi.trend}
                {kpi.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div className="text-sm font-medium text-slate-400 mb-1">{kpi.title}</div>
            <div className="text-2xl font-bold text-slate-800">{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className={cn("space-y-8", isManagement ? "lg:col-span-2" : "lg:col-span-3")}>
          {isManagement && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Revenue Stream</h3>
                  <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">LIVE</div>
                </div>
                <div className="h-48 px-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 10 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 10 }} 
                        tickFormatter={(value) => `Rp${value/1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Vehicle Distribution</h3>
                  <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">PER 2HR</div>
                </div>
                <div className="h-48 px-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 10 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 10 }} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                        cursor={{ fill: '#F8FAFC' }}
                      />
                      <Bar dataKey="cars" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Cars" />
                      <Bar dataKey="motorcycles" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Motorcycles" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Recent Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Filter size={14} className="text-slate-400" />
                  <select 
                    value={vehicleFilter}
                    onChange={(e) => setVehicleFilter(e.target.value as any)}
                    className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Vehicles</option>
                    <option value="car">Cars Only</option>
                    <option value="motorcycle">Motorcycles</option>
                  </select>
                </div>
              </div>
              <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Ticket</th>
                    <th className="px-6 py-4">Plate Number</th>
                    <th className="px-6 py-4">Entry Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Vehicle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700">{log.ticketCode}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-900 text-white px-2 py-1 rounded text-xs font-bold tracking-widest">
                          {log.plateNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(log.entryTime, 'HH:mm (dd MMM)', { locale: id })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          log.status === 'parked' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {log.status === 'parked' ? 'Inside' : 'Out'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2 capitalize">
                        <Package size={14} className="text-slate-400" />
                        {log.vehicleType}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                        No activity detected for this vehicle type.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className={cn("space-y-8", !isManagement && "lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 space-y-0 lg:space-y-8")}>
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
            <h4 className="text-lg font-bold mb-4">Capacity Status</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 opacity-80">
                  <span>Usage</span>
                  <span>{stats.occupied} / {stats.totalCapacity} Lots</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500" 
                    style={{ width: `${(stats.occupied / stats.totalCapacity) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-xs opacity-70 leading-relaxed">
                Smart lot detection is active. Optimized routing for incoming vehicles is enabled.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Search className="text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search ticket or plate..." 
                className="w-full text-sm border-none bg-transparent focus:ring-0 placeholder:text-slate-400"
              />
            </div>
            
            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors">
                Print Daily Report
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors">
                Override Gate Status
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors">
                Manual Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
