/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PushUpSession, Character } from '../types';
import { CHARACTERS, GRAVITY_CHAMBERS } from '../data';
import { playSound, getTodayProgress } from '../utils';
import { Play, Pause, Plus, RefreshCw, SwatchBook, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNavigate: (view: string) => void;
}

export default function Dashboard({ profile, setProfile, onNavigate }: DashboardProps) {
  const [manualReps, setManualReps] = useState<number>(20);
  const [showChinTracker, setShowChinTracker] = useState(false);
  const [chinReps, setChinReps] = useState(0);
  
  // Timer States
  const [timerSeconds, setTimerSeconds] = useState(profile.reminderIntervalMin * 60);
  const [timerActive, setTimerActive] = useState(true);
  
  // Rest Timer States
  const [restSeconds, setRestSeconds] = useState(30);
  const [restActive, setRestActive] = useState(false);
  const [restInitial, setRestInitial] = useState(30);

  // Level Up / Transformation Notification
  const [isTransforming, setIsTransforming] = useState<string | null>(null);

  // Active Character and Transformation details
  const activeChar = CHARACTERS.find(c => c.id === profile.characterId) || CHARACTERS[0];
  const transformations = activeChar.transformations;
  
  // Find current active transformation based on current Battle Power
  const activeT = transformations.slice().reverse().find(t => profile.battlePower >= t.threshold) || transformations[0];
  
  // Find next transformation
  const currentTransIndex = transformations.findIndex(t => t.id === activeT.id);
  const nextT = currentTransIndex < transformations.length - 1 ? transformations[currentTransIndex + 1] : null;
  const progressToNext = nextT 
    ? ((profile.battlePower - activeT.threshold) / (nextT.threshold - activeT.threshold)) * 100
    : 100;

  const activeChamber = GRAVITY_CHAMBERS.find(g => g.id === profile.currentGravityId) || GRAVITY_CHAMBERS[0];

  // Tick the 15-min push-up reminder
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            // Timer Finished! Play loud alert sound and trigger notification
            playSound('levelup');
            triggerPushNotification();
            alert('WAKTUNYA PUSH UP! Jangan biarkan tubuhmu kaku, tembuslah batas gravitasimu!');
            return profile.reminderIntervalMin * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, profile.reminderIntervalMin]);

  // Tick the rest timer
  useEffect(() => {
    let restInterval: NodeJS.Timeout;
    if (restActive && restSeconds > 0) {
      restInterval = setInterval(() => {
        setRestSeconds(prev => {
          if (prev <= 1) {
            setRestActive(false);
            playSound('rest_done');
            return 0;
          }
           // Sound ticks for last 3 seconds
          if (prev <= 4) {
            playSound('beep');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restInterval);
  }, [restActive, restSeconds]);

  // Trigger HTML5 notification safely if granted
  const triggerPushNotification = () => {
    try {
      if ('Notification' in window && Notification && Notification.permission === 'granted') {
        new Notification('Remon Push Up (Saiyan Trainer)', {
          body: 'Setiap kemajuan meningkatkan kekuatan karaktermu! Saatnya latihan!'
        });
      }
    } catch (err) {
      console.warn('Unable to trigger browser notification:', err);
    }
  };

  // Human friendly timer format
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save Workout Set handler
  const saveWorkout = (repsCount: number) => {
    if (repsCount <= 0) return;
    
    // Play sweet charge sound
    playSound('powerup');
    
    const chamberMult = activeChamber.multiplier;
    // Base BP earned = reps * chamber multiplier * standard factor (e.g. 1.5)
    const bpEarned = Math.round(repsCount * chamberMult * 1.5);
    const zPointsEarned = repsCount; // 1 Z-Point per rep

    // Check if we will trigger a transformation
    const newBattlePower = profile.battlePower + bpEarned;
    const oldT = activeChar.transformations.slice().reverse().find(t => profile.battlePower >= t.threshold) || activeChar.transformations[0];
    const newT = activeChar.transformations.slice().reverse().find(t => newBattlePower >= t.threshold) || activeChar.transformations[0];

    if (newT.id !== oldT.id) {
       // TRANSFORMED! Trigger cool state
       setIsTransforming(newT.name);
       playSound('levelup');
       setTimeout(() => setIsTransforming(null), 4000);
    }

    const newSession: PushUpSession = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      reps: repsCount,
      chamberId: activeChamber.id,
      restTimeSec: restInitial
    };

    // Calculate streak
    const todayStr = new Date().toISOString().slice(0, 10);
    let newStreak = profile.streak;
    if (profile.lastActiveDate) {
      const lastDate = new Date(profile.lastActiveDate);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Reset
      }
    } else {
      newStreak = 1;
    }

    setProfile(prev => ({
      ...prev,
      zPoints: prev.zPoints + zPointsEarned,
      battlePower: newBattlePower,
      history: [...prev.history, newSession],
      streak: newStreak,
      lastActiveDate: todayStr,
      syncStatus: 'unsynced'
    }));

    // Trigger Rest Timer
    setRestActive(true);
    setRestSeconds(prev => restInitial);

    // Reset Reminder
    setTimerSeconds(profile.reminderIntervalMin * 60);
  };

  const skipTimer = () => {
    setTimerSeconds(profile.reminderIntervalMin * 60);
    playSound('beep');
  };

  return (
    <div className="w-full relative">
      {/* Transformation Alert Overlay */}
      <AnimatePresence>
        {isTransforming && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-48 h-48 rounded-full border-4 border-yellow-400 absolute animate-ping opacity-60"></div>
            <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-yellow-500/20 to-amber-600/30 blur-2xl absolute"></div>
            
            <span className="text-yellow-400 text-sm font-mono tracking-widest uppercase mb-4 animate-pulse">
              WARNING: PECAHANKAN BATAS KEKUATAN!
            </span>
            <h1 className="text-5xl md:text-7xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 tracking-tight leading-none mb-6">
              TRANSFORMASI!
            </h1>
            <p className="text-2xl text-slate-100 font-sans font-extrabold max-w-md">
              {profile.name} berhasil bangkit menjadi <br />
              <span className="text-3xl text-yellow-300 font-black tracking-wide animate-pulse">{isTransforming}</span>
            </p>
            <p className="text-slate-400 text-sm font-mono mt-8">
              Kapasitas Ki meningkat drastis!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest Timer Modal */}
      <AnimatePresence>
        {restActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border-2 border-orange-500/50 rounded-2xl p-6 w-full max-w-md text-center shadow-2xl relative overflow-hidden"
            >
              {/* Pulsing energy pool back */}
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-orange-600/10 to-transparent pointer-events-none"></div>
              
              <h3 className="text-sm font-mono text-orange-400 tracking-wider uppercase mb-2">PEMULIHAN KI (Waktu Istirahat)</h3>
              <div className="text-6xl font-mono font-extrabold text-slate-100 my-6 animate-pulse">
                {formatTime(restSeconds)}
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 mb-6 relative overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-orange-500 to-yellow-400 h-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(restSeconds / restInitial) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              <p className="text-xs text-slate-400 mb-6 italic">
                Sisa waktu untuk meregenerasi stamina otot dan mengatur pernapasan agar stamina Anda prima di set berikutnya!
              </p>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setRestSeconds(prev => Math.max(0, prev - 10))}
                  className="px-4 py-2 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-mono rounded-lg transition-colors"
                >
                  Selesaikan Cepat (-10s)
                </button>
                <button 
                  onClick={() => {
                    setRestActive(false);
                    playSound('rest_done');
                  }}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-slate-100 text-xs font-bold font-mono rounded-lg transition-colors"
                >
                  LEWATI ISTIRAHAT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main interactive center (bobbing avatar + input) */}
        <div className="lg:col-span-7 bento-card orange-glow scouter-border relative overflow-hidden p-6">
          
          {/* Active Chamber Background overlay */}
          <div className="absolute top-0 right-0 w-48 h-12 bg-orange-500/10 border-l border-b border-orange-500/20 text-orange-400 text-[10px] font-mono tracking-widest uppercase flex items-center justify-center rounded-bl-xl">
            {activeChamber.name} ({activeChamber.gravityFactor}x G)
          </div>

          <h2 className="text-xs font-mono text-zinc-500 tracking-widest uppercase mb-4">Gravity Training Chamber</h2>
          
          {/* Custom cartoon vector animation of Goku/Vegeta doing pushups */}
          <div className={`h-64 rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-slate-950 border border-zinc-800 p-4`}>
            
            {/* Visual background element representing energy or planet gravity */}
            <div className="absolute inset-0 opacity-20 bg-grid-pattern pointer-events-none"></div>
            
            {/* Bobbing pushup character render containing glowing aura based on transformation */}
            <div className="relative flex flex-col items-center justify-center w-full h-full">
              
              {/* Glowing Aura Effect */}
              <div 
                className="absolute w-44 h-44 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none transition-all duration-700"
                style={{ backgroundColor: activeT.particlesColor || 'rgba(234, 88, 12, 0.4)' }}
              ></div>

              {/* Simple CSS-drawn anime pushup stick character */}
              <motion.div 
                animate={{ 
                  y: showChinTracker ? [20, -25, 20] : [10, -5, 10],
                  scaleY: showChinTracker ? [0.95, 1, 0.95] : [1, 1, 1]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: showChinTracker ? 2.5 : 3.5, 
                  ease: 'easeInOut' 
                }}
                className="flex flex-col items-center relative z-10"
              >
                {/* Character hairs / features stylized depending on selection */}
                <div className="flex justify-center space-x-1 mb-1">
                  {/* Avatar/Emoji representation of character */}
                  <span className={`text-6xl filter drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]`}>
                    {profile.characterId === 'goku' ? '🧑‍🚀' : 
                     profile.characterId === 'vegeta' ? '👤' : 
                     profile.characterId === 'gohan' ? '🧒' : 
                     profile.characterId === 'trunks' ? '🗡️' : '👽'}
                  </span>
                </div>
                
                {/* Bodily stance holding push up */}
                <div className="w-40 h-3 bg-gradient-to-r from-orange-500 via-blue-600 to-indigo-500 rounded-full relative shadow-lg">
                  {/* arms supporting */}
                  <div className="absolute -bottom-4 left-6 w-2 h-5 bg-zinc-400 rounded-sm origin-top transform rotate-12"></div>
                  <div className="absolute -bottom-4 right-10 w-2 h-5 bg-zinc-400 rounded-sm origin-top transform rotate-12"></div>
                </div>
                
                {/* Shadow */}
                <div className="w-48 h-1.5 bg-black/40 rounded-full blur-sm mt-3"></div>
              </motion.div>
              
              {/* Dynamic Aura Sparks or Ki Particles */}
              <div className="absolute inset-x-0 bottom-4 flex justify-around pointer-events-none">
                <div className="w-1.5 h-6 bg-yellow-400/50 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-8 bg-orange-500/40 rounded-full animate-bounce"></div>
                <div className="w-1 h-5 bg-cyan-400/50 rounded-full animate-bounce delay-300"></div>
              </div>

              {/* Character transformation details */}
              <div className="absolute bottom-3 left-4 text-left">
                <span className="text-[10px] font-mono text-zinc-500 block leading-none">Petarung</span>
                <span className="font-bold text-slate-200 text-sm leading-tight block">{activeChar.name}</span>
                <span className={`text-xs font-mono font-bold ${activeT.color} leading-none block mt-0.5`}>
                  ⚡ {activeT.name}
                </span>
              </div>
              
              <div className="absolute bottom-3 right-4 text-right">
                <span className="text-[10px] font-mono text-zinc-500 block leading-none">Kekuatan Tempur</span>
                <span className="font-mono font-black text-orange-400 text-sm leading-tight block">
                  {profile.battlePower.toLocaleString('id-ID')} BP
                </span>
                <span className="text-[9px] font-mono text-zinc-400 block leading-none mt-0.5">
                  Multiplier: {activeChamber.multiplier.toFixed(1)}x BP
                </span>
              </div>

            </div>
          </div>

          {/* Level Progression Bar */}
          <div className="mt-5 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-end text-xs font-mono mb-2">
              <div className="text-zinc-400">
                Gelar: <span className="font-bold text-slate-100">{activeT.title}</span>
              </div>
              <div className="text-zinc-400">
                {nextT ? (
                  <>
                    Ke {nextT.name}: <span className="text-amber-400 font-bold">{Math.round(profile.battlePower)}</span> / <span className="font-bold">{nextT.threshold} BP</span>
                  </>
                ) : (
                  <span className="text-yellow-400 font-bold">BATAS KEKUATAN MAKSIMAL!</span>
                )}
              </div>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-2.5 relative overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            {nextT && (
              <p className="text-[10px] font-mono text-zinc-500 mt-1.5 text-center italic">
                *Butuh {nextT.threshold - Math.round(profile.battlePower)} BP lagi untuk melampaui batas dan terbangun menjadi {nextT.name}!
              </p>
            )}
          </div>

          {/* Training Action Input Center */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-stretch">
            
            {/* Chin/Nose Tap Training Activation */}
            <button 
              onClick={() => {
                setChinReps(0);
                setShowChinTracker(true);
                playSound('beep');
              }}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-slate-100 font-bold px-4 py-3.5 rounded-xl border-b-2 border-red-800 text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Swords className="w-5 h-5 animate-pulse" />
              MODE SENSOR DAGU/HIDUNG
            </button>

            {/* Manual input */}
            <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
              <span className="text-xs font-mono text-zinc-400 px-2 uppercase">Manual:</span>
              <input 
                type="number" 
                value={manualReps}
                onChange={(e) => setManualReps(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg text-slate-100 text-center font-mono font-bold text-sm py-1.5 focus:outline-none focus:border-orange-500"
              />
              <button 
                onClick={() => saveWorkout(manualReps)}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 rounded-lg p-2 transition-colors flex items-center justify-center"
                title="Simpan Set"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Chin target input overlays modal/view */}
          <AnimatePresence>
            {showChinTracker && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col justify-between p-6 text-center"
              >
                {/* Close Button Top */}
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowChinTracker(false)}
                    className="text-slate-400 hover:text-slate-200 font-mono text-xs px-4 py-2 border border-slate-800 rounded-lg bg-zinc-900"
                  >
                    Batalkan Mode
                  </button>
                </div>

                {/* Subtitle instructions */}
                <div className="max-w-md mx-auto">
                  <span className="text-orange-500 text-xs font-mono uppercase tracking-widest leading-none">Sensor Sentuh Dagu / Hidung</span>
                  <h3 className="text-xl font-bold text-slate-100 mt-2 leading-snug">Letakkan Perangkat di Bawah Wajah</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sentuh lingkaran target di bawah dengan dagu atau hidung Anda setiap kali berhasil melakukan push-up ke bawah terendah.
                  </p>
                </div>

                {/* Giant counting and Target Area */}
                <div className="flex flex-col items-center justify-center my-auto py-6">
                  
                  {/* Reps Counter */}
                  <div className="text-8xl md:text-9xl font-mono font-black text-slate-100 my-4 tracking-tight drop-shadow-[0_0_20px_rgba(249,115,22,0.3)] select-none">
                    {chinReps}
                  </div>
                  
                  {/* Giant Touch Target Button */}
                  <motion.button 
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      setChinReps(prev => prev + 1);
                      playSound('beep');
                      try {
                        if (navigator.vibrate) {
                          navigator.vibrate(50); // Haptic vibration on tap
                        }
                      } catch (vibrateErr) {
                        console.warn('Vibrate not permitted or supported in this context:', vibrateErr);
                      }
                    }}
                    className="w-56 h-56 rounded-full bg-gradient-to-b from-orange-500 to-red-600 shadow-lg border-4 border-slate-100 flex items-center justify-center text-slate-100 font-black text-lg select-none uppercase tracking-wide cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                  >
                    TEKAN DI SINI
                  </motion.button>
                </div>

                {/* Finish target bottom */}
                <div className="max-w-md mx-auto w-full pb-4">
                  <button 
                    disabled={chinReps === 0}
                    onClick={() => {
                      saveWorkout(chinReps);
                      setShowChinTracker(false);
                    }}
                    className={`w-full py-4 rounded-xl text-slate-100 font-black tracking-wide text-sm transition-all shadow-md ${
                      chinReps > 0 
                        ? 'bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99] cursor-pointer' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    SELESAIKAN SET & REGENERASI KI (+{chinReps} Reps)
                  </button>
                  <p className="text-[10px] font-mono text-zinc-500 mt-2">
                    Menyelesaikan set secara otomatis akan menyinkronkan data dan membuka porsi istirahat.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 15 Minute Reminder Timer & Stats Widgets Right */}
        <div className="lg:col-span-5 h-full flex flex-col gap-6">
          
          {/* 15 Minute Interval Reminder Visual */}
          <div className="bento-card orange-glow relative overflow-hidden p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-mono text-zinc-400 tracking-wider uppercase">Alarm Pengingat</h3>
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className={`${timerActive ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75`}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">{timerActive ? 'Aktif' : 'Jeda'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-4 bg-zinc-950 px-4 rounded-xl border border-zinc-850">
              <div className="text-center">
                <span className="text-[10px] font-mono text-zinc-500 block leading-none mb-1">SET BERIKUTNYA DALAM:</span>
                <span className="text-3xl font-mono font-bold text-yellow-500">{formatTime(timerSeconds)}</span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setTimerActive(!timerActive)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-slate-300 p-2.5 rounded-lg border border-zinc-700 transition-colors"
                  title={timerActive ? 'Jauhkan Sementara (Pause)' : 'Mulai Kembali'}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button 
                  onClick={skipTimer}
                  className="bg-zinc-800 hover:bg-zinc-700 text-slate-300 p-2.5 rounded-lg border border-zinc-700 transition-colors"
                  title="Atur Ulang Waktu"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-[10px] font-mono text-zinc-500 leading-normal mt-3">
              *TIPS: Atur jeda interval latihan di menu <strong className="text-zinc-400 font-normal">Pengaturan</strong> secara fleksibel sesuai kemampuan tubuhmu.
            </p>
          </div>

          {/* Quick Daily Stats Widget */}
          <div className="bento-card text-left p-6">
            <h3 className="text-xs font-mono text-zinc-400 tracking-wider uppercase mb-3">Statistik Hari Ini</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                <span className="text-[9px] font-mono text-zinc-500 block leading-none mb-1">TOTAL HARI INI</span>
                <span className="text-3xl font-mono font-black text-emerald-400">
                  {getTodayProgress(profile.history)}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 block mt-1">reps push up</span>
              </div>
              
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850">
                <span className="text-[9px] font-mono text-zinc-500 block leading-none mb-1">STREAK AKTIF</span>
                <span className="text-3xl font-mono font-black text-red-500">
                  ⚡ {profile.streak}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 block mt-1">hari berturut-turut</span>
              </div>
            </div>

            {/* Daily target indicator */}
            <div className="mt-4 p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
              <div className="flex justify-between items-center text-xs font-mono mb-1 text-zinc-400">
                <span>Target Harian: {profile.dailyTarget} reps</span>
                <span className="text-emerald-400">
                  {Math.round((getTodayProgress(profile.history) / profile.dailyTarget) * 100)}%
                </span>
              </div>
              <div className="w-full bg-zinc-855 rounded-full h-1.5 relative overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (getTodayProgress(profile.history) / profile.dailyTarget) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Quick action buttons redirect */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button 
                onClick={() => onNavigate('stats')}
                className="py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-[11px] font-mono text-zinc-300 rounded-lg flex items-center justify-center gap-1"
              >
                Grafik Progres
              </button>
              <button 
                onClick={() => onNavigate('shop')}
                className="py-1.5 bg-yellow-600 hover:bg-yellow-500 text-[11px] font-mono font-bold text-zinc-950 rounded-lg flex items-center justify-center gap-1"
              >
                Tukar Z-Points
              </button>
            </div>

          </div>

          {/* Quick Active Mission */}
          <div className="bento-card relative overflow-hidden flex-1 p-6">
            <h3 className="text-xs font-mono text-zinc-400 tracking-wider uppercase mb-1">Misi Harian Tersedia</h3>
            <span className="text-[9px] font-mono text-zinc-500 block mb-3 leading-none">Dapatkan Z-Points Tambahan</span>
            
            <div className="space-y-2.5">
              <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center gap-3">
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-300">Pemanasan King Kai</h4>
                  <p className="text-[10px] text-zinc-500">Lakukan set pushup minimal 15 reps sekali jalan</p>
                </div>
                {getTodayProgress(profile.history) >= 15 ? (
                  <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 bg-emerald-900/10 rounded-md border border-emerald-500/20">Selesai</span>
                ) : (
                  <span className="text-[9px] font-mono text-amber-500 px-1.5 py-0.5 bg-yellow-900/10 rounded-md border border-yellow-500/20">Aktif</span>
                )}
              </div>

              <div className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center gap-3">
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-300">Ketahanan Ruang 100 G</h4>
                  <p className="text-[10px] text-zinc-500">Kumpulkan total 50 reps latihan kumulatif hari ini</p>
                </div>
                {getTodayProgress(profile.history) >= 50 ? (
                  <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 bg-emerald-900/10 rounded-md border border-emerald-500/20">Selesai</span>
                ) : (
                  <span className="text-[9px] font-mono text-amber-500 px-1.5 py-0.5 bg-yellow-900/10 rounded-md border border-yellow-500/20">Aktif</span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
