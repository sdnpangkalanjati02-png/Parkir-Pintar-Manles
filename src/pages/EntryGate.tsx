/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useParking } from '../hooks/useParking';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Bike, Printer, CheckCircle2, Ticket, Info, ParkingCircle, Camera, Scan, RefreshCw, X, QrCode } from 'lucide-react';
import { ParkingLog } from '../types';
import { cn } from '../lib/utils';
import { Html5Qrcode } from 'html5-qrcode';

export default function EntryGate() {
  const { entry, logs } = useParking();
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle'>('car');
  const [ticket, setTicket] = useState<ParkingLog | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSimulatingANPR, setIsSimulatingANPR] = useState(false);

  // Camera Detection State
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'plate' | 'qr'>('plate');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ParkingLog | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const startCamera = async (mode: 'plate' | 'qr' = 'plate') => {
    setCameraMode(mode);
    setScanResult(null);
    try {
      if (mode === 'plate') {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } else {
        // QR Mode
        const html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleQrSuccess(decodedText);
          },
          () => {}
        );
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please ensure camera permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(err => console.error("QR Stop error", err));
      html5QrCodeRef.current = null;
    }
    setShowCamera(false);
    setIsScanning(false);
  };

  const handleQrSuccess = (decodedText: string) => {
    const found = logs.find(l => l.ticketCode === decodedText);
    if (found) {
      setScanResult(found);
      setIsScanning(false);
      // We keep camera open briefly to show success, then stop
      setTimeout(() => stopCamera(), 1500);
    } else {
      setPlate(decodedText); // Fallback to plate if it's not a known ticket
      stopCamera();
    }
  };

  const simulateDetection = () => {
    if (!showCamera || isScanning) return;
    setIsScanning(true);
    
    // Simulate AI Plate Recognition
    setTimeout(() => {
      const regions = ['B', 'D', 'F', 'L', 'N', 'DK', 'AA', 'T'];
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];
      const randomNumber = Math.floor(1000 + Math.random() * 8999);
      const randomSuffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                          (Math.random() > 0.5 ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : '');
      
      setPlate(`${randomRegion} ${randomNumber} ${randomSuffix}`);
      setIsScanning(false);
      stopCamera();
    }, 2000);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleSimulateANPR = () => {
    setIsSimulatingANPR(true);
    setPlate('');
    
    setTimeout(() => {
      const regions = ['B', 'D', 'F', 'L', 'N', 'DK', 'AA', 'T'];
      const randomRegion = regions[Math.floor(Math.random() * regions.length)];
      const randomNumber = Math.floor(1000 + Math.random() * 8999);
      const randomSuffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                          String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                          (Math.random() > 0.5 ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : '');
      
      setPlate(`${randomRegion} ${randomNumber} ${randomSuffix}`);
      setIsSimulatingANPR(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate) return;

    setIsPrinting(true);
    // Simulate printing delay
    setTimeout(() => {
      const newTicket = entry(plate, vehicleType);
      setTicket(newTicket);
      setIsPrinting(false);
      setPlate('');
    }, 1500);
  };

  const handleReset = () => {
    setTicket(null);
    setScanResult(null);
  };

  const keyboard = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', 'DEL'
  ];

  const handleKeyPress = (key: string) => {
    if (key === 'DEL') {
      setPlate(prev => prev.slice(0, -1));
    } else if (plate.length < 10) {
      setPlate(prev => prev + key);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border-8 border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ParkingCircle size={200} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">ParkPintar Manless Entry</h2>
            <p className="text-slate-400 font-medium">Automatic Ticketing & Plate Recognition</p>
          </div>

          {!ticket && !scanResult ? (
            <div className="w-full space-y-8">
              {/* Vehicle Selection */}
              <div className="flex gap-4">
                <button
                  onClick={() => setVehicleType('car')}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                    vehicleType === 'car' ? "bg-blue-600 border-blue-400" : "bg-slate-800 border-slate-700 opacity-60"
                  )}
                >
                  <Car size={48} />
                  <span className="font-bold uppercase tracking-widest text-sm">Automobile</span>
                </button>
                <button
                  onClick={() => setVehicleType('motorcycle')}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                    vehicleType === 'motorcycle' ? "bg-blue-600 border-blue-400" : "bg-slate-800 border-slate-700 opacity-60"
                  )}
                >
                  <Bike size={48} />
                  <span className="font-bold uppercase tracking-widest text-sm">Two Wheeler</span>
                </button>
              </div>

              {/* Smart Detection / Detection Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Recognition Method
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { if(showCamera && cameraMode === 'plate') stopCamera(); else startCamera('plate'); }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                        showCamera && cameraMode === 'plate' ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-400"
                      )}
                    >
                      {showCamera && cameraMode === 'plate' ? <X size={12} /> : <Camera size={12} />}
                      {showCamera && cameraMode === 'plate' ? "Close ALPR" : "Plate AI"}
                    </button>
                    <button 
                      onClick={() => { if(showCamera && cameraMode === 'qr') stopCamera(); else startCamera('qr'); }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                        showCamera && cameraMode === 'qr' ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-400"
                      )}
                    >
                      {showCamera && cameraMode === 'qr' ? <X size={12} /> : <QrCode size={12} />}
                      {showCamera && cameraMode === 'qr' ? "Close Scanner" : "Scan Ticket"}
                    </button>
                    {!showCamera && (
                      <button 
                        onClick={handleSimulateANPR}
                        disabled={isSimulatingANPR}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                          isSimulatingANPR ? "bg-blue-600 text-white animate-pulse" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        )}
                      >
                        <Scan size={12} />
                        Simulate ANPR
                      </button>
                    )}
                    {!showCamera && (
                      <button 
                        onClick={() => setPlate('')}
                        className="bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 hover:text-slate-300"
                      >
                        <RefreshCw size={12} /> Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  {showCamera ? (
                    <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      {cameraMode === 'plate' ? (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div id="qr-reader" className="w-full h-full" />
                      )}
                      
                      {/* Scanning Overlays */}
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Corners */}
                        <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                        <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                        
                        {/* Scan Line */}
                        <AnimatePresence>
                          {(isScanning || cameraMode === 'qr') && (
                            <motion.div 
                              initial={{ top: '10%' }}
                              animate={{ top: '90%' }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="absolute left-4 right-4 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]"
                            />
                          )}
                        </AnimatePresence>

                        {/* Status Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isScanning ? (
                            <div className="bg-blue-600/90 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-sm border border-blue-400">
                              <RefreshCw className="animate-spin" size={20} />
                              <span className="font-bold tracking-widest text-sm uppercase">AI Analyzing Plate...</span>
                            </div>
                          ) : scanResult ? (
                            <div className="bg-emerald-600/90 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-sm border border-emerald-400">
                              <CheckCircle2 size={20} />
                              <span className="font-bold tracking-widest text-sm uppercase">Ticket Found!</span>
                            </div>
                          ) : cameraMode === 'plate' ? (
                            <button 
                              onClick={simulateDetection}
                              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20 flex flex-col items-center gap-2 transition-all pointer-events-auto group"
                            >
                              <Scan size={32} className="group-hover:scale-110 transition-transform" />
                              <span className="font-bold uppercase tracking-widest text-xs">Run ALPR Auto-Detect</span>
                            </button>
                          ) : (
                            <div className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px]">
                              Align QR Code within the box
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats Info */}
                      <div className="absolute bottom-4 left-6 right-6 flex justify-between text-[10px] font-mono font-bold text-blue-400 opacity-60 z-20">
                        <span>FPS: 60.0</span>
                        <span>THRESHOLD: 0.85</span>
                        <span>LATENCY: 12ms</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-700 text-center relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] border border-slate-700 rounded-full">
                          Manual Plate Entry
                        </div>
                        <div className="text-5xl font-black font-mono tracking-[0.2em] h-16 flex items-center justify-center relative overflow-hidden">
                          {isSimulatingANPR ? (
                            <motion.div 
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="text-2xl text-blue-400 tracking-widest z-10"
                            >
                              PROCESSING...
                            </motion.div>
                          ) : (
                            <div className="z-10">
                              {plate || <span className="opacity-20">B 1234 ABC</span>}
                            </div>
                          )}
                          
                          {/* Scan Line Effect during simulation */}
                          <AnimatePresence>
                            {isSimulatingANPR && (
                              <>
                                <motion.div 
                                  initial={{ top: '-10%' }}
                                  animate={{ top: '110%' }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                  className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] z-20"
                                />
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: [0, 0.2, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="absolute inset-0 bg-blue-500/10 z-0"
                                />
                              </>
                            )}
                          </AnimatePresence>

                          {/* Flash Effect on Completion */}
                          <AnimatePresence>
                            {!isSimulatingANPR && plate && (
                              <motion.div 
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-white z-30"
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* On-Screen Keyboard */}
                      <div className="grid grid-cols-10 gap-2 p-2 bg-slate-800/50 rounded-2xl">
                        {keyboard.map(key => (
                          <button
                            key={key}
                            onClick={() => handleKeyPress(key)}
                            className="h-10 bg-slate-700 rounded-lg font-bold text-xs hover:bg-slate-600 active:scale-95 transition-all text-slate-200"
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={!plate || isPrinting}
                onClick={handleSubmit}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all",
                  isPrinting ? "bg-slate-700" : "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/50"
                )}
              >
                {isPrinting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Printer size={24} />
                    </motion.div>
                    PRINTING TICKET...
                  </>
                ) : (
                  <>
                    <Ticket size={24} />
                    GENERATE TICKET
                  </>
                )}
              </button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white text-slate-900 p-8 rounded-3xl shadow-xl w-full max-w-sm flex flex-col items-center"
              >
                {/* Use either the new ticket or the scanned result */}
                {(() => {
                  const data = ticket || scanResult;
                  if (!data) return null;
                  return (
                    <>
                      <div className="text-center mb-6">
                        <h3 className="font-black text-2xl tracking-tighter">PARKPINTAR</h3>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-y border-slate-100 py-1 mb-4">
                          {ticket ? 'ENTRY TICKET - MANLESS' : 'REPRINT / VALIDATE TICKET'}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border-4 border-slate-900 mb-6">
                        <QRCode value={data.ticketCode} size={150} />
                      </div>

                      <div className="w-full space-y-4 mb-8">
                        <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase">Ticket ID</span>
                          <span className="font-mono font-bold text-lg">{data.ticketCode}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase">Plate Number</span>
                          <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-sm font-black tracking-widest">{data.plateNumber}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">ENTRY TIME</span>
                          <span className="font-bold text-sm">{new Date(data.entryTime).toLocaleString()}</span>
                        </div>
                        {data.status === 'exited' && (
                          <div className="bg-rose-50 p-2 rounded-lg text-center">
                            <span className="text-[10px] text-rose-400 font-bold block mb-1">STATUS</span>
                            <span className="font-bold text-sm text-rose-600 uppercase tracking-wider">Already Exited</span>
                          </div>
                        )}
                      </div>

                      <div className={cn(
                        "flex items-center gap-2 font-bold text-sm mb-6",
                        data.status === 'parked' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {data.status === 'parked' && <CheckCircle2 size={20} />}
                        {ticket ? 'GATE OPENING...' : data.status === 'parked' ? 'TICKET VALID' : 'TICKET EXPIRED'}
                      </div>

                      <button
                        onClick={handleReset}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                      >
                        FINISH
                      </button>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Info size={18} className="text-blue-600" />
            Integrasi Hardware
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Sistem ini mendukung integrasi protokol <code className="bg-slate-100 px-1 rounded">TCP/IP</code> untuk Gate Barrier dan <code className="bg-slate-100 px-1 rounded">Wiegand</code> untuk sensor Loop kendaraan.
          </p>
        </div>
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-2">Kamera ANPR</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Simulasi plat nomor manual di atas dapat digantikan dengan stream RTSP dari kamera IP untuk otomasi pengenalan plat (AI/OCR).
          </p>
        </div>
      </div>
    </div>
  );
}
