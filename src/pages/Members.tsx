/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParking } from '../hooks/useParking';
import { 
  Users, UserPlus, Search, Trash2, Edit3, 
  ShieldCheck, Calendar, CreditCard, ChevronRight,
  X, Car, Bike, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Member } from '../types';

export default function Members() {
  const { members, addMember, deleteMember, updateMember } = useParking();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    plateNumber: '',
    phone: '',
    vehicleType: 'car' as 'car' | 'motorcycle',
    expiryDate: '' 
  });

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMember({
      ...formData,
      expiryDate: new Date(formData.expiryDate).getTime()
    });
    setIsAdding(false);
    setFormData({ name: '', plateNumber: '', phone: '', vehicleType: 'car', expiryDate: '' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Users size={12} />
            Privileged Access
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Parking Members</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manage registered vehicles and seasonal parking passes</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 shrink-0"
          >
            <UserPlus size={16} />
            Register Member
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMembers.map((m) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              key={m.id}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
            >
              <div className={cn(
                "absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] transition-transform group-hover:scale-110",
                m.status === 'active' ? "bg-emerald-600" : "bg-rose-600"
              )} />
              
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "p-4 rounded-2xl border",
                  m.vehicleType === 'car' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                )}>
                  {m.vehicleType === 'car' ? <Car size={20} /> : <Bike size={20} />}
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => deleteMember(m.id)}
                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{m.name}</h3>
                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{m.plateNumber}</div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                    m.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", m.status === 'active' ? "bg-emerald-500" : "bg-rose-500")} />
                    {m.status}
                  </div>
                  <div className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100">
                    Expiry: {new Date(m.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{m.phone}</span>
                </div>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                  Manage Tier
                  <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && !isAdding && (
         <div className="bg-slate-50 rounded-[3rem] p-20 border border-slate-100 border-dashed text-center space-y-4">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-sm border border-slate-100">
              <Users size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">No Members Found</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start registering vehicles for seasonal parking access</p>
            </div>
          </div>
      )}

      {/* Registration Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-0 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">New Registration</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                    placeholder="Owner Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plate Number</label>
                    <input 
                      required
                      type="text"
                      value={formData.plateNumber}
                      onChange={e => setFormData(d => ({ ...d, plateNumber: e.target.value.toUpperCase() }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                      placeholder="B 1234 XYZ"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                    <input 
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                      placeholder="0812..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle</label>
                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                      {(['car', 'motorcycle'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData(d => ({ ...d, vehicleType: t }))}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                            formData.vehicleType === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          {t === 'car' ? <Car size={14} /> : <Bike size={14} />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valid Until</label>
                    <input 
                      required
                      type="date"
                      value={formData.expiryDate}
                      onChange={e => setFormData(d => ({ ...d, expiryDate: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 mt-4"
                >
                  <ShieldCheck size={18} />
                  Authorize Access Pass
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
