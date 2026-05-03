/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParking } from '../hooks/useParking';
import { 
  DollarSign, Car, Bike, Clock, Info, 
  ShieldCheck, ArrowRight, Save, RotateCcw,
  Zap, Ticket, Moon
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function FareSettings() {
  const { config, updateConfig } = useParking();
  const [formData, setFormData] = useState(config);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateConfig(formData);
      setIsSaving(false);
    }, 800);
  };

  const handleReset = () => {
    setFormData(config);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <DollarSign size={12} />
            Revenue & Fares
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Fare Configuration</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Configure detailed per-hour parking rates and penalty charges</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Car Fares */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Car size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Mobil (Car) Rates</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pricing for 4-wheel vehicles</p>
              </div>
            </div>

            <div className="space-y-4">
              <RateInput 
                label="Base Rate (First Hour)" 
                value={formData.baseRateCar} 
                onChange={(v) => setFormData(d => ({ ...d, baseRateCar: v }))} 
              />
              <RateInput 
                label="Hourly Rate (After First Hour)" 
                value={formData.hourlyRateCar} 
                onChange={(v) => setFormData(d => ({ ...d, hourlyRateCar: v }))} 
              />
              <RateInput 
                label="Maximum Daily Rate" 
                value={formData.maxDailyRateCar} 
                onChange={(v) => setFormData(d => ({ ...d, maxDailyRateCar: v }))} 
              />
            </div>
          </div>

          {/* Motorcycle Fares */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Bike size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Motor (Bike) Rates</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pricing for 2-wheel vehicles</p>
              </div>
            </div>

            <div className="space-y-4">
              <RateInput 
                label="Base Rate (First Hour)" 
                value={formData.baseRateMotorcycle} 
                onChange={(v) => setFormData(d => ({ ...d, baseRateMotorcycle: v }))} 
              />
              <RateInput 
                label="Hourly Rate (After First Hour)" 
                value={formData.hourlyRateMotorcycle} 
                onChange={(v) => setFormData(d => ({ ...d, hourlyRateMotorcycle: v }))} 
              />
              <RateInput 
                label="Maximum Daily Rate" 
                value={formData.maxDailyRateMotorcycle} 
                onChange={(v) => setFormData(d => ({ ...d, maxDailyRateMotorcycle: v }))} 
              />
            </div>
          </div>

          {/* Additional Charges */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 lg:col-span-1 relative overflow-hidden group">
             <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Special Charges</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Penalties and extra services</p>
              </div>
            </div>

            <div className="space-y-4">
              <RateInput 
                label="Lost Ticket Charge" 
                value={formData.lostTicketCharge} 
                icon={<Ticket size={14} />}
                onChange={(v) => setFormData(d => ({ ...d, lostTicketCharge: v }))} 
              />
              <RateInput 
                label="Overnight Stay Charge" 
                value={formData.overnightCharge} 
                icon={<Moon size={14} />}
                onChange={(v) => setFormData(d => ({ ...d, overnightCharge: v }))} 
              />
            </div>
          </div>

          {/* Time Configuration */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 lg:col-span-1 relative overflow-hidden">
             <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 text-blue-400 rounded-2xl">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">Time Logic</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Buffer and rounding rules</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Free Buffer (Minutes)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={formData.freeBufferMinutes}
                    onChange={(e) => setFormData(d => ({ ...d, freeBufferMinutes: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 uppercase tracking-widest">MIN</span>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                  * Note: Hourly rates are calculated after the first hour completes. 
                  The free buffer applies from the moment of entry.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pb-12">
          <button 
            type="button"
            onClick={handleReset}
            className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Discard
          </button>
          <button 
            type="submit"
            disabled={isSaving}
            className={cn(
              "bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-blue-200",
              isSaving && "opacity-50 cursor-not-allowed scale-95"
            )}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating Network...
              </>
            ) : (
              <>
                <Save size={16} />
                Deploy Fare Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function RateInput({ label, value, onChange, icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon || <DollarSign size={16} />}
        </div>
        <input 
          type="number" 
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase tracking-widest">IDR</span>
      </div>
    </div>
  );
}
