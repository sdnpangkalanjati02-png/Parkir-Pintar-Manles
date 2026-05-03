/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, LogIn, LogOut, Settings, ParkingCircle, Info, 
  FileText, User as UserIcon, Power, Video, Globe, ChevronDown, 
  Cpu, Activity, Shield, DollarSign, AlertTriangle, Users, Briefcase 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useParking } from '../hooks/useParking';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { config, branches, currentBranchId, setCurrentBranchId } = useParking();
  const [showBranchPanel, setShowBranchPanel] = React.useState(false);

  const isManagement = ['admin', 'keuangan', 'direktur'].includes(user?.role || '');
  const isStaff = ['admin', 'karyawan'].includes(user?.role || '');

  const currentBranch = branches.find(b => b.id === currentBranchId);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ...(isManagement ? [
      { to: '/monitor', icon: Activity, label: 'Live Monitor' },
      { to: '/reports', icon: FileText, label: 'Reports' },
      { to: '/members', icon: Users, label: 'Members' },
      { to: '/employees', icon: Briefcase, label: 'Employees' },
      { to: '/fares', icon: DollarSign, label: 'Fare Setup' },
      { to: '/users', icon: Shield, label: 'Users' }
    ] : []),
    ...(isStaff ? [
      { to: '/entry', icon: LogIn, label: 'Entry Gate' },
      { to: '/exit', icon: LogOut, label: 'Exit Gate' }
    ] : []),
    { to: '/cctv', icon: Video, label: 'Monitoring' },
    { to: '/issues', icon: AlertTriangle, label: 'Troubles' },
    ...(isManagement ? [
      { to: '/branches', icon: Globe, label: 'Regions' },
      { to: '/hardware', icon: Cpu, label: 'Hardware' }
    ] : []),
    ...(user?.role === 'admin' || user?.role === 'direktur' ? [{ to: '/config', icon: Settings, label: 'Settings' }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#F5F5F5] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-bottom border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 overflow-hidden">
            <img src={config.companyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800 leading-none">{(config.companyName || 'PARK').split(' ')[0]}</h1>
            <p className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase mt-1">Management System</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-blue-50 text-blue-600 font-medium" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={cn(
                    "transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0",
              user?.role === 'admin' ? "bg-slate-900" : "bg-blue-600"
            )}>
              <UserIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-slate-800 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{user?.role}</div>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <Power size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 mx-4 mb-6 mt-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <Info size={14} />
            System Status
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Entry Gate</span>
              <span className="flex items-center gap-1.5 text-green-600 font-medium h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Exit Gate</span>
              <span className="flex items-center gap-1.5 text-green-600 font-medium h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-slate-500">
              Logged in as <span className="text-slate-900 font-semibold uppercase">{user?.name} — {user?.role}</span>
            </div>
            
            {/* Branch Switcher */}
            <div className="relative">
              <button 
                onClick={() => setShowBranchPanel(!showBranchPanel)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-200 transition-all group"
              >
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[8px] font-black text-white">
                   <Globe size={10} />
                </div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                  {currentBranch?.name || 'SELECT BRANCH'}
                </span>
                <ChevronDown size={12} className={cn("text-slate-400 transition-transform", showBranchPanel && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showBranchPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 p-2 overflow-hidden"
                  >
                    <div className="px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                      SELECT ACTIVE BRANCH
                    </div>
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setCurrentBranchId(b.id);
                          setShowBranchPanel(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group",
                          currentBranchId === b.id 
                            ? "bg-blue-50 text-blue-700 border border-blue-100" 
                            : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        <div>
                          <div className="text-[10px] font-black uppercase leading-tight">{b.name}</div>
                          <div className="text-[8px] font-bold opacity-60 uppercase">{b.location}</div>
                        </div>
                        {currentBranchId === b.id && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600">
            INTEGRATED SYSTEM v1.0.4
          </div>
        </header>
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
