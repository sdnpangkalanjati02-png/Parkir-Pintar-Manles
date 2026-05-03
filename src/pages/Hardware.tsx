/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParking } from '../hooks/useParking';
import { 
  Cpu, Plus, Settings, Trash2, 
  RefreshCw, Power, Wifi, WifiOff,
  Box, Printer, Camera, CreditCard,
  CheckCircle2, AlertCircle, Save,
  LogIn, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { HardwareType, HardwareDevice, Branch } from '../types';

export default function Hardware() {
  const { 
    hardware, 
    branches, 
    currentBranchId, 
    addHardware, 
    updateHardware, 
    deleteHardware,
    updateBranch 
  } = useParking();

  const currentBranch = branches.find(b => b.id === currentBranchId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<HardwareDevice | null>(null);

  const deviceIcons: Record<HardwareType, any> = {
    gate: Power,
    manless_entry: LogIn,
    manless_exit: LogOut,
    printer: Printer,
    camera: Camera,
    rfid_reader: CreditCard
  };

  const [newDevice, setNewDevice] = useState<Partial<HardwareDevice>>({
    name: '',
    type: 'gate',
    ipAddress: '192.168.1.',
    port: 8080,
    status: 'offline',
    branchId: currentBranchId
  });

  const handleAdd = () => {
    if (newDevice.name && newDevice.ipAddress) {
      addHardware(newDevice as Omit<HardwareDevice, 'id'>);
      setShowAddModal(false);
      setNewDevice({
        name: '',
        type: 'gate',
        ipAddress: '192.168.1.',
        port: 8080,
        status: 'offline',
        branchId: currentBranchId
      });
    }
  };

  const toggleBranchMode = (mode: Branch['mode']) => {
    if (currentBranch) {
      updateBranch({ ...currentBranch, mode });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Hardware Integration</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage IOT Devices & Branch Service Modes</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={16} />
          Register Device
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch Mode Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                <Box size={20} />
              </div>
              <h3 className="font-black text-slate-800 tracking-tighter uppercase">Service Mode</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'manual', label: 'Manual POS', desc: 'Staff handles entry & exit manually.' },
                { id: 'automatic', label: 'Manless System', desc: 'Fully automated using manless stations.' },
                { id: 'hybrid', label: 'Hybrid Mode', desc: 'Automatic entry with manual POS exit.' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => toggleBranchMode(mode.id as any)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all group relative overflow-hidden",
                    currentBranch?.mode === mode.id 
                      ? "border-blue-600 bg-blue-50/50" 
                      : "border-slate-50 hover:border-slate-200 bg-slate-50/30"
                  )}
                >
                  <div className="relative z-10">
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-widest mb-1",
                      currentBranch?.mode === mode.id ? "text-blue-600" : "text-slate-400"
                    )}>
                      {mode.label}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 leading-tight">
                      {mode.desc}
                    </div>
                  </div>
                  {currentBranch?.mode === mode.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600">
                      <CheckCircle2 size={24} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 font-black text-[10px] uppercase tracking-widest">
              <AlertCircle size={14} />
              Protocol Note
            </div>
            <p className="text-[10px] text-amber-600 font-medium leading-relaxed italic">
              * Manless mode requires static IP configuration for all connected gate controllers. Make sure HTTP Port 8080 is open in your local network.
            </p>
          </div>
        </div>

        {/* Hardware Devices List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hardware.map((device) => {
              const Icon = deviceIcons[device.type] || Cpu;
              return (
                <motion.div
                  layout
                  key={device.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm group hover:border-blue-200 transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-2xl transition-colors",
                        device.status === 'online' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                      )}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{device.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{device.type.replace('_', ' ')}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300" />
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest",
                             device.status === 'online' ? "text-emerald-500" : "text-rose-500"
                           )}>{device.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteHardware(device.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400">ENDPOINT</span>
                      <span className="font-bold text-slate-700">{device.ipAddress}:{device.port}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                         <RefreshCw size={14} />
                         Ping
                       </button>
                       <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all">
                         <Power size={14} />
                         Trigger
                       </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {hardware.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <WifiOff size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">No hardware connected to this branch</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">New Hardware</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Register a new peripheral device</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Device Name</label>
                    <input 
                      type="text" 
                      value={newDevice.name}
                      onChange={e => setNewDevice({...newDevice, name: e.target.value})}
                      placeholder="e.g. South Entry Gate"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Device Type</label>
                      <select 
                        value={newDevice.type}
                        onChange={e => setNewDevice({...newDevice, type: e.target.value as any})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="gate">Barrier Gate</option>
                        <option value="manless_entry">Manless Entry</option>
                        <option value="manless_exit">Manless Exit</option>
                        <option value="printer">POS Printer</option>
                        <option value="camera">LPR Camera</option>
                        <option value="rfid_reader">RFID Reader</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">IP Address</label>
                      <input 
                        type="text" 
                        value={newDevice.ipAddress}
                        onChange={e => setNewDevice({...newDevice, ipAddress: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-mono text-xs font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">HTTP Port</label>
                      <input 
                        type="number" 
                        value={newDevice.port}
                        onChange={e => setNewDevice({...newDevice, port: Number(e.target.value)})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAdd}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
