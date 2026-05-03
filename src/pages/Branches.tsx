/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParking } from '../hooks/useParking';
import { 
  Globe, Plus, Search, MapPin, Hash, 
  Settings2, Trash2, Edit3, CheckCircle2,
  Car, Bike, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Branch } from '../types';

export default function Branches() {
  const { branches, addBranch, updateBranch, currentBranchId, setCurrentBranchId } = useParking();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [formData, setFormData] = useState<Omit<Branch, 'id'>>({
    name: '',
    location: '',
    code: '',
    status: 'active',
    mode: 'manual',
    capacity: { car: 100, motorcycle: 100 }
  });

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateBranch({ ...formData, id: editingBranch.id } as Branch);
    } else {
      addBranch(formData);
    }
    handleClose();
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      location: branch.location,
      code: branch.code,
      status: branch.status,
      mode: branch.mode,
      capacity: branch.capacity
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingBranch(null);
    setFormData({
      name: '',
      location: '',
      code: '',
      status: 'active',
      mode: 'manual',
      capacity: { car: 100, motorcycle: 100 }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Region Management</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage your parking branches across various locations</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text"
               placeholder="Search regions..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
             />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={16} />
            Add Branch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <motion.div
            layout
            key={branch.id}
            className={cn(
              "bg-white rounded-[2.5rem] p-8 border transition-all relative group",
              currentBranchId === branch.id ? "border-blue-500 ring-2 ring-blue-500/10 shadow-xl" : "border-slate-100 shadow-sm hover:shadow-md"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-4 rounded-2xl",
                branch.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
              )}>
                <Globe size={24} />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleEdit(branch)}
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                   onClick={() => setCurrentBranchId(branch.id)}
                   className={cn(
                     "p-2 rounded-xl transition-all",
                     currentBranchId === branch.id ? "text-emerald-500 bg-emerald-50" : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
                   )}
                >
                  <CheckCircle2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Region Code: {branch.code}</div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{branch.name}</h3>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <MapPin size={14} />
                  <span className="text-xs font-bold uppercase tracking-wide">{branch.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Car size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Cars</span>
                  </div>
                  <div className="text-lg font-black text-slate-800">{branch.capacity.car}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <Bike size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Bikes</span>
                  </div>
                  <div className="text-lg font-black text-slate-800">{branch.capacity.motorcycle}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  branch.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                  {branch.status === 'active' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                  {branch.status}
                </div>
                <div className="text-slate-400">
                  Mode: <span className="text-slate-800">{branch.mode}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                    {editingBranch ? 'Edit Region' : 'Nework Expansion'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure your branch operational parameters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Branch Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Location / Address</label>
                      <input 
                        required
                        type="text" 
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Region Code</label>
                        <input 
                          required
                          type="text" 
                          value={formData.code}
                          onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-bold text-slate-700 uppercase focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                        <select 
                          value={formData.status}
                          onChange={e => setFormData({...formData, status: e.target.value as any})}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Maintenance</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Operation Mode</label>
                      <select 
                        value={formData.mode}
                        onChange={e => setFormData({...formData, mode: e.target.value as any})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="manual">Manual POS (Cashier)</option>
                        <option value="automatic">Automatic (Manless)</option>
                        <option value="hybrid">Hybrid System</option>
                      </select>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Capacity Settings</div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 ml-1">
                              <Car size={12} className="text-blue-500" />
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Car Slot</label>
                            </div>
                            <input 
                              type="number" 
                              value={formData.capacity.car}
                              onChange={e => setFormData({...formData, capacity: {...formData.capacity, car: Number(e.target.value)}})}
                              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 ml-1">
                              <Bike size={12} className="text-indigo-500" />
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bike Slot</label>
                            </div>
                            <input 
                              type="number" 
                              value={formData.capacity.motorcycle}
                              onChange={e => setFormData({...formData, capacity: {...formData.capacity, motorcycle: Number(e.target.value)}})}
                              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none"
                            />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    {editingBranch ? 'Update Region' : 'Deploy Branch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
