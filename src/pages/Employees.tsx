/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useParking } from '../hooks/useParking';
import { 
  Users, UserPlus, Search, Trash2, Printer, 
  ShieldCheck, Briefcase, Phone, CreditCard,
  X, ChevronRight, Camera, Download, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Employee } from '../types';

export default function Employees() {
  const { employees, addEmployee, deleteEmployee } = useParking();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showCard, setShowCard] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    position: '',
    department: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.employeeId.includes(searchQuery) ||
    e.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee({
      ...formData,
      joinDate: new Date(formData.joinDate).getTime()
    });
    setIsAdding(false);
    setFormData({ 
      employeeId: '', name: '', position: '', 
      department: '', phone: '', joinDate: new Date().toISOString().split('T')[0] 
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 no-print">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Users size={12} />
            Human Resources
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Employee Directory</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manage staff credentials and generate integrated ID cards</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 shrink-0"
          >
            <UserPlus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        <AnimatePresence mode="popLayout">
          {filteredEmployees.map((e) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              key={e.id}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-slate-900 opacity-[0.03] transition-transform group-hover:scale-110" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 relative overflow-hidden">
                   {e.photoUrl ? (
                     <img src={e.photoUrl} alt={e.name} className="w-full h-full object-cover" />
                   ) : (
                     <Camera size={24} />
                   )}
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => {
                      setSelectedEmployee(e);
                      setShowCard(true);
                    }}
                    className="p-3 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Print ID Card"
                  >
                    <Printer size={18} />
                  </button>
                   <button 
                    onClick={() => deleteEmployee(e.id)}
                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{e.name}</h3>
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{e.employeeId}</div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                    {e.position}
                  </div>
                  <div className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                    {e.department}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{e.phone}</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedEmployee(e);
                    setShowCard(true);
                  }}
                  className="text-[10px] font-black text-slate-900 uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  Generate Card
                  <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && !isAdding && (
         <div className="bg-slate-50 rounded-[3rem] p-20 border border-slate-100 border-dashed text-center space-y-4 no-print">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-sm border border-slate-100">
              <Users size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">No Employees Found</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Register staff members to manage credentials</p>
            </div>
          </div>
      )}

      {/* Add Employee Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
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
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-0 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Staff Registration</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID No.</label>
                    <input 
                      required
                      type="text"
                      value={formData.employeeId}
                      onChange={e => setFormData(d => ({ ...d, employeeId: e.target.value.toUpperCase() }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                      placeholder="EMP-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                      placeholder="Employee Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Position</label>
                    <input 
                      required
                      type="text"
                      value={formData.position}
                      onChange={e => setFormData(d => ({ ...d, position: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                      placeholder="Security Staff"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <input 
                      required
                      type="text"
                      value={formData.department}
                      onChange={e => setFormData(d => ({ ...d, department: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                      placeholder="Operations"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                    <input 
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                      placeholder="0812..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Join Date</label>
                    <input 
                      required
                      type="date"
                      value={formData.joinDate}
                      onChange={e => setFormData(d => ({ ...d, joinDate: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 mt-4"
                >
                  <ShieldCheck size={18} />
                  Confirm Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ID Card Modal */}
      <AnimatePresence>
        {showCard && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCard(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm no-print"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden no-print"
             >
                <div className="p-8 pb-0 flex justify-between items-center no-print">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Credential Preview</h3>
                  <button 
                    onClick={() => setShowCard(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* The actual card is styled for CSS printing */}
                  <div className="employee-card-print bg-slate-900 w-full aspect-[1/1.58] rounded-3xl overflow-hidden shadow-2xl relative mx-auto max-w-[320px]">
                     {/* Blue stripe */}
                     <div className="absolute top-0 left-0 right-0 h-24 bg-blue-600" />
                     <div className="absolute inset-0 pattern-grid-white/[0.05]" />
                     
                     <div className="relative z-10 pt-12 flex flex-col items-center">
                        <div className="text-[10px] font-black text-white/60 tracking-[0.3em] uppercase mb-1">Parking Authority</div>
                        <div className="text-lg font-black text-white tracking-widest uppercase mb-8">Integrated Pass</div>

                        <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-2xl mb-6">
                           <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                              {selectedEmployee.photoUrl ? (
                                <img src={selectedEmployee.photoUrl} alt={selectedEmployee.name} className="w-full h-full object-cover" />
                              ) : (
                                <Camera size={32} className="text-slate-300" />
                              )}
                           </div>
                        </div>

                        <div className="text-center space-y-1 mb-8">
                           <h4 className="text-xl font-black text-white uppercase tracking-tight">{selectedEmployee.name}</h4>
                           <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{selectedEmployee.position}</div>
                        </div>

                        <div className="w-full px-8 space-y-4">
                           <div className="flex justify-between border-b border-white/10 pb-2">
                             <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">ID NO</span>
                             <span className="text-[10px] font-black text-white tracking-widest">{selectedEmployee.employeeId}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/10 pb-2">
                             <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">DEPT</span>
                             <span className="text-[10px] font-black text-white tracking-widest">{selectedEmployee.department}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/10 pb-2">
                             <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">ISSUED</span>
                             <span className="text-[10px] font-black text-white tracking-widest">
                               {new Date(selectedEmployee.joinDate).toLocaleDateString()}
                             </span>
                           </div>
                        </div>

                        <div className="mt-10 mb-8 p-3 bg-white rounded-xl">
                           <QrCode size={48} className="text-slate-900" />
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 no-print">
                     <button 
                       onClick={handlePrint}
                       className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                     >
                        <Printer size={16} />
                        Print Integrated Card
                     </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .employee-card-print, .employee-card-print * {
            visibility: visible;
          }
          .employee-card-print {
            position: fixed;
            left: 0;
            top: 0;
            width: 8cm !important;
            height: 12.6cm !important;
            box-shadow: none !important;
            border-radius: 0.5cm !important;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
