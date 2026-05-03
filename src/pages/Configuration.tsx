/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParking } from '../hooks/useParking';
import { 
  Settings, Save, RotateCcw, AlertTriangle, 
  Info, ShieldAlert, Activity, RefreshCw, 
  Power, FileText, Globe 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Configuration() {
  const { config, updateConfig, resetData } = useParking();
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateConfig(localConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all parking logs? This cannot be undone.')) {
      resetData();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">System Configuration</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage infrastructure, pricing, and hardware integrations.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={cn(
              "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg",
              isSaved ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
            )}
          >
            {isSaved ? <ShieldAlert size={16} /> : <Save size={16} />}
            {isSaved ? 'SAVED' : 'SAVE ALL CHANGES'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pricing & Maintenance */}
        <div className="lg:col-span-1 space-y-8">
          {/* Pricing Matrix */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <Settings size={20} />
              </div>
              <h3 className="font-black text-slate-800 tracking-tighter uppercase">Pricing Matrix</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Base (Car)</label>
                  <input 
                    type="number" 
                    value={localConfig.baseRateCar}
                    onChange={e => setLocalConfig({...localConfig, baseRateCar: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Hourly (Car)</label>
                  <input 
                    type="number" 
                    value={localConfig.hourlyRateCar}
                    onChange={e => setLocalConfig({...localConfig, hourlyRateCar: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Base (Motor)</label>
                  <input 
                    type="number" 
                    value={localConfig.baseRateMotorcycle}
                    onChange={e => setLocalConfig({...localConfig, baseRateMotorcycle: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Hourly (Motor)</label>
                  <input 
                    type="number" 
                    value={localConfig.hourlyRateMotorcycle}
                    onChange={e => setLocalConfig({...localConfig, hourlyRateMotorcycle: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Free Buffer (Mins)</label>
                <input 
                  type="number" 
                  value={localConfig.freeBufferMinutes}
                  onChange={e => setLocalConfig({...localConfig, freeBufferMinutes: Number(e.target.value)})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 text-rose-600 p-2 rounded-xl">
                <RotateCcw size={20} />
              </div>
              <h3 className="font-black text-rose-900 text-xs uppercase tracking-widest">Danger Zone</h3>
            </div>
            <p className="text-[10px] text-rose-700 font-bold uppercase leading-relaxed tracking-tight">
              RESETTING WILL PURGE ALL TRANSACTIONS. PROCEED WITH EXTREME CAUTION.
            </p>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
            >
              Reset Data
            </button>
          </div>
        </div>

        {/* Company Profile Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                <Globe size={20} />
              </div>
              <h3 className="font-black text-slate-800 tracking-tighter uppercase">Company Profile</h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                  <img src={localConfig.companyLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Settings className="text-white" size={24} />
                  </div>
                </div>
                <input 
                  type="text" 
                  value={localConfig.companyLogoUrl}
                  onChange={e => setLocalConfig({...localConfig, companyLogoUrl: e.target.value})}
                  className="w-full text-[10px] font-mono bg-slate-50 border border-slate-100 rounded px-2 py-1"
                  placeholder="Logo URL"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Company Name</label>
                <input 
                  type="text" 
                  value={localConfig.companyName}
                  onChange={e => setLocalConfig({...localConfig, companyName: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Address</label>
                <textarea 
                  value={localConfig.companyAddress}
                  onChange={e => setLocalConfig({...localConfig, companyAddress: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Phone</label>
                <input 
                  type="text" 
                  value={localConfig.companyPhone}
                  onChange={e => setLocalConfig({...localConfig, companyPhone: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Hardware & Network Connectivity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 tracking-tighter uppercase">Hardware & Network</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connect Manless Stations, Barriers & Printers</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">LAN ACTIVE</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* LAN Configuration */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  LAN Configuration
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Static Server IP</label>
                    <input 
                      type="text" 
                      value={localConfig.serverIp}
                      onChange={e => setLocalConfig({...localConfig, serverIp: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-mono text-xs font-bold focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Network Gateway</label>
                    <input 
                      type="text" 
                      value={localConfig.gateway}
                      onChange={e => setLocalConfig({...localConfig, gateway: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-mono text-xs font-bold focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Gate Hardware */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                  Controller Settings
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Gate IP</label>
                      <input 
                        type="text" 
                        value={localConfig.gateControllerIp}
                        onChange={e => setLocalConfig({...localConfig, gateControllerIp: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-mono text-xs font-bold focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Port</label>
                      <input 
                        type="number" 
                        value={localConfig.gateControllerPort}
                        onChange={e => setLocalConfig({...localConfig, gateControllerPort: Number(e.target.value)})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-mono text-xs font-bold focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Manless Station IP</label>
                    <input 
                      type="text" 
                      value={localConfig.manlessStationIp}
                      onChange={e => setLocalConfig({...localConfig, manlessStationIp: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-mono text-xs font-bold focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Printer Setup */}
              <div className="space-y-6 md:col-span-2 pt-4 border-t border-slate-50">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Peripherals Output</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Thermal Printer Protocol</label>
                    <div className="flex gap-2">
                      {['thermal', 'dot-matrix', 'laser'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setLocalConfig({...localConfig, printerType: type as any})}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                            localConfig.printerType === type 
                              ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                              : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                          )}
                        >
                          {type.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">USB/Serial COM Port</label>
                    <select 
                      value={localConfig.printerPort}
                      onChange={e => setLocalConfig({...localConfig, printerPort: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-600 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="COM1">COM 1 (Standard)</option>
                      <option value="COM2">COM 2</option>
                      <option value="USB001">USB 001</option>
                      <option value="LPT1">LPT 1 (Legacy)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Test Action */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <button className="py-3 px-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                <RefreshCw size={14} />
                Ping Controller
              </button>
              <button className="py-3 px-4 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-100 hover:bg-orange-100 transition-all flex items-center justify-center gap-2">
                <Power size={14} />
                Trigger Gate
              </button>
              <button className="py-3 px-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                <FileText size={14} />
                Test Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
