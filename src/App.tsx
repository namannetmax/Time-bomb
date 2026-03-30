/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Calendar, Clock, Play, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export default function App() {
  const [targetDate, setTargetDate] = useState<string>('');
  const [targetTime, setTargetTime] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const calculateTimeLeft = useCallback(() => {
    if (!targetDate || !targetTime) return null;

    const target = new Date(`${targetDate}T${targetTime}`);
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      if (!isFinished) {
        setIsFinished(true);
        setIsActive(false);
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.log("Audio play blocked by browser:", err));
        }
      }
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalSeconds: 0,
      };
    }

    setIsFinished(false);

    const seconds = Math.floor((difference / 1000) % 60);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    const totalHours = Math.floor(difference / (1000 * 60 * 60));
    const totalMinutes = Math.floor(difference / (1000 * 60));
    const totalSeconds = Math.floor(difference / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      totalHours,
      totalMinutes,
      totalSeconds,
    };
  }, [targetDate, targetTime, isFinished]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      const update = () => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);
      };
      
      update();
      interval = setInterval(update, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, calculateTimeLeft]);

  const handleStart = () => {
    if (targetDate && targetTime) {
      setIsActive(true);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(null);
    setTargetDate('');
    setTargetTime('');
    setIsFinished(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isFinished ? 'bg-red-950' : 'bg-[#0A0A0A]'} text-red-500 font-mono selection:bg-red-500 selection:text-black overflow-hidden`}>
      {/* Alarm Sound */}
      <audio 
        ref={audioRef} 
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" 
        loop 
      />
      
      {/* Background Grid/Wires Effect */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ff0000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 left-1/4 w-px h-full bg-red-500 blur-[1px]"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-red-500 blur-[1px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center justify-center min-h-screen relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-yellow-400 text-black font-black uppercase tracking-tighter text-sm mb-6 transform -skew-x-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Timer className="w-4 h-4" />
            <span>Danger: Temporal Detonator</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Countdown <span className="text-red-600">Active</span>
          </h1>
        </motion.div>

        {/* Controls */}
        {!isActive && !timeLeft && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#151515] p-8 rounded-none border-4 border-[#222] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative"
          >
            {/* Decorative Wires */}
            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-red-600"></div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-blue-600"></div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-red-600 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Set Target Date
                </label>
                <input 
                  type="date" 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-[#333] text-red-500 focus:outline-none focus:border-red-600 transition-all uppercase text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-red-600 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Set Target Time
                </label>
                <input 
                  type="time" 
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-[#333] text-red-500 focus:outline-none focus:border-red-600 transition-all uppercase text-sm"
                />
              </div>
              <button 
                onClick={handleStart}
                disabled={!targetDate || !targetTime}
                className="w-full py-4 bg-red-600 text-black font-black uppercase tracking-widest text-lg hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-all active:translate-y-1 active:shadow-none shadow-[0_4px_0px_0px_rgba(153,27,27,1)]"
              >
                Arm Device
              </button>
            </div>
          </motion.div>
        )}

        {/* Countdown Display */}
        <AnimatePresence mode="wait">
          {timeLeft && (
            <motion.div 
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="w-full flex flex-col items-center"
            >
              {/* Main Timer Display */}
              <div className={`relative p-8 md:p-12 bg-[#050505] border-8 border-[#1A1A1A] shadow-[0_0_50px_rgba(220,38,38,0.2)] rounded-lg mb-12 ${isFinished ? 'animate-pulse' : ''}`}>
                
                {/* Danger Stripes */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#facc15,#facc15_10px,#000_10px,#000_20px)]"></div>
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#facc15,#facc15_10px,#000_10px,#000_20px)]"></div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 py-8">
                  {[
                    { label: 'DD', value: timeLeft.days },
                    { label: 'HH', value: timeLeft.hours },
                    { label: 'MM', value: timeLeft.minutes },
                    { label: 'SS', value: timeLeft.seconds },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center">
                      <div className="relative">
                        {/* Background LED segments effect */}
                        <span className="text-6xl md:text-8xl font-black text-red-950 absolute inset-0 select-none opacity-20">88</span>
                        <span className={`text-6xl md:text-8xl font-black tracking-tighter tabular-nums relative z-10 ${isFinished ? 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]'}`}>
                          {String(item.value).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-red-500 mt-2 tracking-[0.3em]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breakdown Stats - Industrial Look */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
                {[
                  { label: 'Total Hours', value: timeLeft.totalHours.toLocaleString() },
                  { label: 'Total Minutes', value: timeLeft.totalMinutes.toLocaleString() },
                  { label: 'Total Seconds', value: timeLeft.totalSeconds.toLocaleString() },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#111] border-2 border-[#222] p-4 flex flex-col items-center">
                    <span className="text-xl font-bold text-red-700 tabular-nums">{stat.value}</span>
                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Reset/Abort Button */}
              <button 
                onClick={handleReset}
                className="group flex items-center gap-3 px-8 py-4 bg-[#111] border-2 border-red-900 text-red-600 hover:bg-red-900 hover:text-black transition-all active:scale-95 font-black uppercase tracking-[0.2em] text-sm"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-[-180deg] transition-transform duration-500" />
                <span>Abort Mission</span>
              </button>

              {isFinished && (
                <motion.div 
                  initial={{ opacity: 0, scale: 2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-red-600/20 backdrop-blur-sm pointer-events-none"
                >
                  <div className="bg-red-600 text-black px-12 py-6 text-6xl md:text-9xl font-black uppercase tracking-tighter transform -rotate-6 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
                    Detonated
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none opacity-20">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">
            System: Omega Protocol 0.1
          </p>
        </div>
      </div>
    </div>
  );
}
