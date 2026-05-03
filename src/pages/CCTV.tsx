/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Maximize2, Shield, Activity, 
  Settings, Layout, Radio, AlertCircle,
  Car, UserCheck, Lock, Unlock, RefreshCw,
  Clock, Eye, EyeOff, Search, Plus, Bookmark,
  ChevronDown, ZoomIn, ZoomOut, Move, Trash2, Info,
  Grid, Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useParking } from '../hooks/useParking';

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'alert';
  type: 'gate' | 'area' | 'vip';
  resolution: string;
  fps: number;
}

const CAMERAS: Camera[] = [
  { id: 'CAM-01', name: 'ENTRY GATE 1', location: 'North Entrance', status: 'online', type: 'gate', resolution: '4K', fps: 60 },
  { id: 'CAM-02', name: 'EXIT GATE 1', location: 'South Exit', status: 'online', type: 'gate', resolution: '4K', fps: 55 },
  { id: 'CAM-03', name: 'PARKING A-1', location: 'Main Lot West', status: 'online', type: 'area', resolution: '1080p', fps: 30 },
  { id: 'CAM-04', name: 'VIP ZONE', location: 'Basement 1', status: 'alert', type: 'vip', resolution: '1080p', fps: 30 },
  { id: 'CAM-05', name: 'LOBBY DROP', location: 'Main Lobby', status: 'online', type: 'area', resolution: '720p', fps: 24 },
  { id: 'CAM-06', name: 'PERIMETER 2', location: 'Rear Fence', status: 'offline', type: 'area', resolution: '1080p', fps: 0 },
];

export default function CCTVMonitoring() {
  const { logs, stats } = useParking();
  const [selectedCam, setSelectedCam] = useState<Camera | null>(CAMERAS[0]);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredCameras = CAMERAS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Banner Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
            <Video size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Security Center</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Multispectrual Monitoring System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
           <button 
             onClick={() => setViewMode('single')}
             className={cn(
               "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
               viewMode === 'single' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
             )}
           >
             <Monitor size={14} />
             Focus
           </button>
           <button 
             onClick={() => setViewMode('grid')}
             className={cn(
               "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
               viewMode === 'grid' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
             )}
           >
             <Grid size={14} />
             Matrix
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-50 space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Channels</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  type="text"
                  placeholder="Search feeds..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
              {filteredCameras.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => {
                    setSelectedCam(cam);
                    setViewMode('single');
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-[1.5rem] transition-all border group",
                    selectedCam?.id === cam.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                      : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30"
                  )}
                >
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-tight">{cam.name}</div>
                    <div className={cn(
                      "text-[8px] font-bold uppercase transition-colors",
                      selectedCam?.id === cam.id ? "text-slate-400" : "text-slate-300"
                    )}>
                      {cam.location}
                    </div>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    cam.status === 'online' ? "bg-emerald-500" : cam.status === 'alert' ? "bg-rose-500 animate-pulse" : "bg-slate-300"
                  )} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white space-y-4 relative overflow-hidden">
             <Activity className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
             <div className="flex items-center gap-3">
               <Shield className="text-blue-200" size={24} />
               <h3 className="text-sm font-black uppercase tracking-widest underline decoration-blue-400 underline-offset-4">Gate Security</h3>
             </div>
             <div className="space-y-4 pt-2">
                <GateControl label="ENTRY 01" status="SECURED" />
                <GateControl label="EXIT 01" status="SECURED" />
             </div>
          </div>
        </div>

        {/* Visualizer Area */}
        <div className="flex-1 min-h-[600px]">
           {viewMode === 'single' ? (
             <div className="bg-slate-900 rounded-[3rem] h-full relative overflow-hidden shadow-2xl border-8 border-white group">
                {/* Visual Simulation */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_100%)]" />
                <div className="absolute inset-0 pattern-grid-white/[0.02]" />
                
                {/* Simulated Feed Info */}
                <div className="absolute top-10 left-10 right-10 flex justify-between items-start z-10">
                   <div className="space-y-2">
                     <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">REC • LIVE</span>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest border-l border-white/20 pl-3 ml-1">
                          {selectedCam?.name}
                        </span>
                     </div>
                     <div className="text-[9px] font-black text-white/40 tracking-[0.25em] ml-2">
                       {selectedCam?.id} // {selectedCam?.resolution} // {selectedCam?.fps} FPS
                     </div>
                   </div>

                   <div className="text-right space-y-1">
                      <div className="text-3xl font-black text-white tracking-tighter tabular-nums leading-none">
                        {timestamp.toLocaleTimeString('en-US', { hour12: false })}
                      </div>
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        {timestamp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </div>
                   </div>
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-1/2 h-1/2 border border-white/5 rounded-full flex items-center justify-center">
                     <div className="w-1 h-1 bg-white/20 rounded-full" />
                   </div>
                </div>

                {/* Bottom Stats Overlay */}
                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                   <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-3xl border border-white/10 space-y-3 w-48 shadow-2xl">
                     <div className="text-[8px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Detection Log</div>
                     <div className="space-y-2">
                       {logs.slice(0, 3).map((log, i) => (
                         <motion.div 
                           initial={{ x: -10, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: i * 0.1 }}
                           key={log.id} 
                           className="flex items-center gap-3"
                         >
                            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                              <Car size={12} />
                            </div>
                            <div className="text-[9px] font-black text-white/80 font-mono tracking-tighter">{log.plateNumber}</div>
                         </motion.div>
                       ))}
                     </div>
                   </div>

                   <div className="flex gap-4">
                      <ControlButton icon={<Settings size={20} />} active />
                      <ControlButton icon={<Maximize2 size={20} />} />
                      <button className="bg-rose-600 text-white p-5 rounded-3xl shadow-xl shadow-rose-900/40 hover:bg-rose-500 transition-all">
                        <Radio size={24} className="animate-pulse" />
                      </button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
                {CAMERAS.map((cam, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={cam.id} 
                    className={cn(
                      "aspect-video bg-slate-900 rounded-[2rem] border-4 border-white shadow-lg relative overflow-hidden cursor-pointer hover:border-blue-500/30 transition-all group",
                      selectedCam?.id === cam.id && "border-blue-600"
                    )}
                    onClick={() => {
                      setSelectedCam(cam);
                      setViewMode('single');
                    }}
                  >
                    <div className="absolute inset-0 pattern-grid-white/[0.03]" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         cam.status === 'online' ? "bg-emerald-500" : "bg-rose-500"
                       )} />
                       <span className="text-[8px] font-black text-white uppercase tracking-widest">{cam.name}</span>
                    </div>
                    {cam.status === 'offline' && (
                       <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">NO SIGNAL</p>
                       </div>
                    )}
                  </motion.div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function GateControl({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm group hover:bg-white/20 transition-all">
      <div className="flex items-center gap-3">
        <Lock size={16} className="text-blue-200" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{label}</span>
      </div>
      <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{status}</span>
    </div>
  );
}

function ControlButton({ icon, active }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <button className={cn(
      "p-5 rounded-3xl backdrop-blur-md border transition-all",
      active ? "bg-white/20 border-white/40 text-white" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
    )}>
      {icon}
    </button>
  );
}
