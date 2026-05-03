/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { LogIn, User, Lock, AlertCircle, RefreshCw, ParkingCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Username atau password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-900/20 mb-4">
            <ParkingCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">ParkirPintar</h1>
          <p className="text-slate-400 mt-2">Manless Management System Login</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-sm animate-shake">
                <AlertCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all"
                  placeholder="Masukkan username"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-slate-900/10"
            >
              {isSubmitting ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-x-8 gap-y-4">
            <div className="text-[10px] text-slate-400">
              <div className="font-black text-slate-600 uppercase mb-0.5 tracking-tighter">Admin</div>
              <div className="font-mono">User: admin / Pass: password123</div>
            </div>
            <div className="text-[10px] text-slate-400">
              <div className="font-black text-slate-600 uppercase mb-0.5 tracking-tighter">Karyawan</div>
              <div className="font-mono">User: karyawan</div>
            </div>
            <div className="text-[10px] text-slate-400">
              <div className="font-black text-slate-600 uppercase mb-0.5 tracking-tighter">Keuangan</div>
              <div className="font-mono">User: keuangan</div>
            </div>
            <div className="text-[10px] text-slate-400">
              <div className="font-black text-slate-600 uppercase mb-0.5 tracking-tighter">Direktur</div>
              <div className="font-mono">User: direktur</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
