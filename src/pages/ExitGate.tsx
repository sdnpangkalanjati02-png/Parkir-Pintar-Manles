/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParking } from '../hooks/useParking';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, Smartphone, Banknote, 
  Search, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, Printer, RefreshCw,
  LogOut, Timer, Wallet, Camera, X, QrCode
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Html5Qrcode } from 'html5-qrcode';

export default function ExitGate() {
  const { exit, logs } = useParking();
  const [ticketCode, setTicketCode] = useState('');
  const [activeStage, setActiveStage] = useState<'input' | 'payment' | 'confirmation' | 'success'>('input');
  const [foundLog, setFoundLog] = useState<{ log: any, fare: number } | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return logs.filter(l => 
      l.status === 'parked' && 
      (l.ticketCode.toLowerCase().includes(query) || l.plateNumber.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [logs, searchQuery]);

  const calculateFare = (entryTime: number) => {
    const durationMs = Date.now() - entryTime;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const durationHours = Math.ceil(durationMinutes / 60) || 1;
    return 3000 + (Math.max(0, durationHours - 1) * 5000);
  };

  const selectVehicle = (log: any) => {
    setTicketCode(log.ticketCode);
    setSearchQuery('');
    const fare = calculateFare(log.entryTime);
    setFoundLog({ log, fare });
    setActiveStage('payment');
  };
  const [countdown, setCountdown] = useState(5);
  const [showScanner, setShowScanner] = useState(false);
  const html5QrCodeRef = React.useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setError('');
    try {
      const html5QrCode = new Html5Qrcode("exit-qr-reader");
      html5QrCodeRef.current = html5QrCode;
      setShowScanner(true);
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleQrSuccess(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setError("Unable to access camera for scanning.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {
        console.error(e);
      }
    }
    setShowScanner(false);
  };

  const handleQrSuccess = (decodedText: string) => {
    setTicketCode(decodedText);
    
    // Auto trigger search
    const targetLog = logs.find(l => l.ticketCode === decodedText && l.status === 'parked');
    
    if (targetLog) {
      const fare = calculateFare(targetLog.entryTime);
      setFoundLog({ log: targetLog, fare });
      
      // Delay to show success in camera before closing
      setTimeout(() => {
        stopScanner();
        setActiveStage('payment');
      }, 1000);
    } else {
      stopScanner();
      setError('Invalid or expired ticket scanned.');
    }
  };

  React.useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);
  const [pendingPaymentInfo, setPendingPaymentInfo] = useState<{ method: 'cash' | 'e-money' | 'qris', details?: any } | null>(null);

  const [lastReceipt, setLastReceipt] = useState<{ log: any, fare: number } | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeStage === 'confirmation' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (activeStage === 'confirmation' && countdown === 0) {
      if (pendingPaymentInfo) {
        handleAutoConclusion(pendingPaymentInfo.method);
      }
    }
    return () => clearInterval(timer);
  }, [activeStage, countdown, pendingPaymentInfo]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetLog = logs.find(l => (l.ticketCode === ticketCode || l.plateNumber === ticketCode) && l.status === 'parked');
    
    if (!targetLog) {
      setError('Ticket not found or already exited.');
      return;
    }

    const fare = calculateFare(targetLog.entryTime);
    setFoundLog({ log: targetLog, fare });
    setActiveStage('payment');
  };

  const handlePayment = (method: 'cash' | 'e-money' | 'qris') => {
    const result = exit(ticketCode, method);
    if (result) {
      setLastReceipt({ log: result.log, fare: result.fare });
      setActiveStage('success');
      
      // Auto-printing sequence
      setIsPrinting(true);
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
        // Reset after printing to prepare for next vehicle
        setTimeout(() => {
          reset();
        }, 1500);
      }, 1500);
    }
  };

  const handleAutoConclusion = (method: 'cash' | 'e-money' | 'qris') => {
    handlePayment(method);
  };

  const handleDigitalPayment = async (method: 'e-money' | 'qris') => {
    if (!foundLog) return;
    
    setIsProcessingPayment(true);
    setError('');

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketCode: foundLog.log.ticketCode,
          amount: foundLog.fare,
          plateNumber: foundLog.log.plateNumber,
          vehicleType: foundLog.log.vehicleType
        }),
      });

      if (!response.ok) throw new Error('Failed to create payment session');
      
      const { token } = await response.json();

      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(token, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            setPendingPaymentInfo({ method, details: result });
            setCountdown(5);
            setActiveStage('confirmation');
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            setError('Payment is pending. Please complete the transaction.');
          },
          onError: (result: any) => {
            console.error('Payment error:', result);
            setError('Payment failed. Please try again.');
          },
          onClose: () => {
            console.log('User closed payment window');
          }
        });
      } else {
        setError('Payment gateway (Snap.js) not loaded. Check your internet or configuration.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment service unavailable.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 1500);
  };

  const reset = () => {
    setTicketCode('');
    setFoundLog(null);
    setLastReceipt(null);
    setActiveStage('input');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Printable Receipt (Hidden from screen) */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] p-8 text-black font-mono">
        <div className="max-w-xs mx-auto border-2 border-black p-6 space-y-4">
          <div className="text-center border-b-2 border-black pb-4">
            <h2 className="text-2xl font-black">PARKPINTAR</h2>
            <p className="text-xs font-bold uppercase tracking-widest mt-1">Struk Pembayaran Parkir</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>TICKET:</span>
              <span className="font-bold">{lastReceipt?.log.ticketCode}</span>
            </div>
            <div className="flex justify-between">
              <span>PLAT:</span>
              <span className="font-bold">{lastReceipt?.log.plateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>MASUK:</span>
              <span>{lastReceipt?.log.entryTime && format(lastReceipt.log.entryTime, 'dd/MM/yy HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span>KELUAR:</span>
              <span>{lastReceipt?.log.exitTime && format(lastReceipt.log.exitTime, 'dd/MM/yy HH:mm')}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-black pt-2">
              <span>METODE:</span>
              <span className="uppercase">{lastReceipt?.log.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center border-t-2 border-black pt-4">
            <div className="text-xs font-bold mb-1">TOTAL BAYAR</div>
            <div className="text-2xl font-black">Rp {lastReceipt?.fare.toLocaleString()}</div>
          </div>
          
          <div className="text-center text-[10px] mt-6 leading-tight">
            TERIMA KASIH ATAS KUNJUNGAN ANDA<br />
            SIMPAN STRUK SEBAGAI BUKTI PEMBAYARAN SAH
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl min-h-[500px] flex flex-col items-center print:hidden">
        <div className="flex items-center gap-3 mb-10 w-full justify-center">
          <div className="bg-slate-900 p-2 rounded-lg text-white">
            <LogOut size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Checkout Terminal</h2>
        </div>

        <AnimatePresence mode="wait">
          {activeStage === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md space-y-6"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Scan or Enter Ticket</h3>
                <p className="text-sm text-slate-400">Please provide your entry ticket code to calculate fare.</p>
              </div>

              {showScanner ? (
                <div className="space-y-4">
                  <div className="relative aspect-square max-w-[300px] mx-auto bg-black rounded-3xl overflow-hidden border-4 border-blue-500 shadow-xl group">
                    <div id="exit-qr-reader" className="w-full h-full" />
                    
                    {/* Visual Overlays */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {/* Scanning Box Outline */}
                      <div className="absolute inset-[15%] border-2 border-blue-500/50 rounded-2xl relative">
                        {/* Corners */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                        {/* Scan Line */}
                        <motion.div 
                          initial={{ top: '0%' }}
                          animate={{ top: '100%' }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                          className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_blue]"
                        />
                      </div>

                      {/* Success Overlay */}
                      <AnimatePresence>
                        {foundLog && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-emerald-600/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white p-6 text-center"
                          >
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-lg">
                              <CheckCircle2 size={32} />
                            </div>
                            <div>
                              <p className="font-black text-lg tracking-tighter">TICKET VALID</p>
                              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">{foundLog.log.plateNumber}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold text-white/70 uppercase tracking-[0.2em] border border-white/10">
                          Align QR code to read
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={stopScanner}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <X size={18} />
                    Back to Manual Input
                  </button>
                </div>
              ) : (
                <form onSubmit={handleScan} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={ticketCode}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setTicketCode(val);
                        setSearchQuery(val);
                      }}
                      placeholder="PK-XXXXXX or Plate #"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-5 text-2xl font-mono font-bold tracking-widest focus:border-blue-500 focus:ring-0 outline-none transition-all uppercase"
                      autoFocus
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={startScanner}
                        className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                        title="Scan QR"
                      >
                        <QrCode size={24} />
                      </button>
                      <Search size={24} className="text-slate-200 mr-2" />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-rose-600 text-sm font-bold bg-rose-50 p-4 rounded-xl border border-rose-100">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!ticketCode}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-blue-200 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    CALCULATE FARE
                    <ArrowRight size={24} />
                  </button>
                </form>
              )}

              {/* Dynamic Search Results */}
              <AnimatePresence>
                {filteredLogs.length > 0 && !showScanner && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full space-y-2 !mt-4"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Matching Active Records</div>
                    {filteredLogs.map((log) => (
                      <button
                        key={log.ticketCode}
                        onClick={() => selectVehicle(log)}
                        className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all group group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-50 p-2 rounded-xl text-slate-400 group-hover:text-blue-500 transition-colors">
                            {log.vehicleType === 'car' ? <LogOut size={20} /> : <Timer size={20} />}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-slate-800">{log.plateNumber}</div>
                            <div className="text-[10px] font-mono text-slate-400">{log.ticketCode}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-300 uppercase">Entered</div>
                          <div className="text-xs font-bold text-slate-600">{format(log.entryTime, 'HH:mm')}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeStage === 'payment' && foundLog && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full grid grid-cols-1 md:grid-cols-2 gap-10"
            >
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Parking Summary</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Timer size={16} /> Duration
                      </div>
                      <span className="font-bold text-slate-800">
                        {Math.ceil((Date.now() - foundLog.log.entryTime) / (1000 * 60 * 60))} Hours
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <CreditCard size={16} /> Plate
                      </div>
                      <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-xs font-bold tracking-widest uppercase">
                        {foundLog.log.plateNumber}
                      </span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 mt-4 pt-4 flex justify-between items-end">
                      <span className="text-sm font-bold text-slate-400">TOTAL FARE</span>
                      <span className="text-3xl font-black text-blue-600">Rp {foundLog.fare.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl">
                  <ShieldCheck size={16} />
                  SECURE PAYMENT PROCESSING ACTIVE
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Select Payment Method</h4>
                {error && (
                  <div className="flex items-center gap-2 text-rose-600 text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 mb-2">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
                <button
                  onClick={() => handleDigitalPayment('qris')}
                  disabled={isProcessingPayment}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-white transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600">
                      {isProcessingPayment ? <RefreshCw className="animate-spin" size={24} /> : <Smartphone size={24} />}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-800">QRIS / E-Wallet</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OVO, GoPay, Dana</div>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600" />
                </button>
                <button
                  onClick={() => handleDigitalPayment('e-money')}
                  disabled={isProcessingPayment}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-white transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600">
                      {isProcessingPayment ? <RefreshCw className="animate-spin" size={24} /> : <CreditCard size={24} />}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-800">Electronic Money</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Flazz, TapCash, Brizzi</div>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600" />
                </button>
                <button
                  onClick={() => handlePayment('cash')}
                  disabled={isProcessingPayment}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-white transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600">
                      <Banknote size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-800">Cash / Manual</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pay at counter</div>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600" />
                </button>
                
                <button 
                  onClick={reset}
                  className="w-full mt-4 text-slate-400 text-sm font-bold hover:text-slate-600"
                >
                  Cancel and Back
                </button>
              </div>
            </motion.div>
          )}

          {activeStage === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 relative">
                <ShieldCheck size={40} />
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-blue-100"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={238.76}
                    strokeDashoffset={238.76 - (238.76 * countdown / 5)}
                    className="text-blue-600 transition-all duration-1000 ease-linear"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800">PEMBAYARAN DIVERIFIKASI</h3>
                <p className="text-slate-500 font-medium">Transaksi digital Anda telah berhasil diproses.</p>
              </div>

              <div className="w-full bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider text-left">Metode</div>
                  <div className="text-slate-800 font-black text-right uppercase">{pendingPaymentInfo?.method}</div>
                  
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider text-left">Order ID</div>
                  <div className="text-slate-800 font-mono text-[11px] text-right truncate pl-4">{pendingPaymentInfo?.details?.order_id}</div>
                  
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider text-left">Total Bayar</div>
                  <div className="text-blue-600 font-black text-lg text-right">Rp {foundLog?.fare.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Mengarahkan ke Struk dalam</div>
                <div className="text-4xl font-black text-slate-900">{countdown}</div>
              </div>

              <button
                onClick={() => setCountdown(0)}
                className="text-blue-600 text-sm font-bold hover:underline"
              >
                Lewati Tunggu & Cetak Sekarang
              </button>
            </motion.div>
          )}

          {activeStage === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="bg-emerald-100 p-8 rounded-full text-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={80} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">PAYMENT SUCCESSFUL!</h3>
                <p className="text-slate-500 font-medium max-w-sm">
                  The exit barrier will open now. Please drive safely and thank you for visiting.
                </p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-warning-100 w-full max-w-xs space-y-2">
                <div className="flex items-center justify-center gap-2 text-warning-700 font-bold animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  GATE BARRIER OPENING...
                </div>
              </div>

              <div className="flex gap-4 w-full justify-center">
                 <button 
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className={cn(
                    "px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 transition-all hover:bg-slate-800 disabled:opacity-50",
                    isPrinting && "ring-4 ring-slate-100"
                  )}
                >
                  {isPrinting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      PRINTING...
                    </>
                  ) : (
                    <>
                      <Printer size={20} />
                      PRINT RECEIPT
                    </>
                  )}
                </button>
                <button 
                  onClick={reset}
                   className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                >
                  DONE
                </button>
              </div>

              <AnimatePresence>
                {isPrinting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-50"
                  >
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="font-bold text-sm tracking-wide">Preparing receipt, please wait...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Wallet size={20} />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm">Integrasi Pembayaran Digital</h4>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              Modul integrasi ke API <code className="bg-white/50 px-1 rounded">DOKU</code>, <code className="bg-white/50 px-1 rounded">Xendit</code>, atau <code className="bg-white/50 px-1 rounded">Midtrans</code> tersedia untuk otomasi penagihan non-pengguna.
            </p>
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex items-start gap-4">
          <div className="bg-purple-600 p-2 rounded-lg text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-purple-900 text-sm">Audit & Keamanan</h4>
            <p className="text-xs text-purple-700 mt-1 leading-relaxed">
              Setiap transaksi dicatat dengan snapshot kamera untuk kebutuhan forensic audit. Data dienkripsi end-to-end.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
