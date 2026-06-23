/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, BattleBoss, LeaderboardEntry } from '../types';
import { BATTLE_BOSSES } from '../data';
import { getLeaderboard, playSound } from '../utils';
import { Play, ShieldAlert, Swords, Trophy, Users, Zap, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GravityChamberBattleProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export default function GravityChamberBattle({ profile, setProfile }: GravityChamberBattleProps) {
  const [activeTab, setActiveTab] = useState<'pve' | 'multiplayer' | 'leaderboard'>('pve');
  
  // PvE Boss states
  const [bosses, setBosses] = useState<BattleBoss[]>(() => {
    const savedBosses = localStorage.getItem('db_fit_bosses');
    return savedBosses ? JSON.parse(savedBosses) : BATTLE_BOSSES;
  });
  const [selectedBossId, setSelectedBossId] = useState<string>('raditz');
  const [userDamageInput, setUserDamageInput] = useState<number>(15);
  const [bossFightStatus, setBossFightStatus] = useState<'idle' | 'deal' | 'won' | 'fail'>('idle');

  // Simulated Multiplayer Lobby state
  const [multiActive, setMultiActive] = useState(false);
  const [lobbyTimer, setLobbyTimer] = useState(30);
  const [userMultiReps, setUserMultiReps] = useState(0);
  const [competitors, setCompetitors] = useState([
    { name: 'Krillin', characterId: 'goku', reps: 0, bp: 2400 },
    { name: 'Yamcha', characterId: 'goku', reps: 0, bp: 800 },
    { name: 'Chaozu', characterId: 'piccolo', reps: 0, bp: 600 }
  ]);

  // Sync bosses to local storage
  useEffect(() => {
    localStorage.setItem('db_fit_bosses', JSON.stringify(bosses));
  }, [bosses]);

  // Simulate multiplayer competitors doing reps
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (multiActive && lobbyTimer > 0) {
      interval = setInterval(() => {
        setLobbyTimer(prev => prev - 1);
        
        // Competitors occasionally do a push up
        setCompetitors(curr => curr.map(comp => {
          const doRep = Math.random() > 0.45;
          return {
            ...comp,
            reps: comp.reps + (doRep ? Math.floor(Math.random() * 2) + 1 : 0)
          };
        }));
      }, 1000);
    } else if (lobbyTimer === 0 && multiActive) {
      setMultiActive(false);
      
      // Calculate finish position
      const finalStandings = [
        { name: profile.name || 'Petarung Anda', reps: userMultiReps, isUser: true },
        ...competitors.map(c => ({ name: c.name, reps: c.reps, isUser: false }))
      ].sort((a, b) => b.reps - a.reps);

      const userRankIndex = finalStandings.findIndex(p => p.isUser);
      const earnedZPoints = userRankIndex === 0 ? 100 : userRankIndex === 1 ? 50 : 25;
      
      playSound('success');
      alert(`BATTLE SELESAI!\nPosisi Anda: Peringkat #${userRankIndex + 1} dengan ${userMultiReps} reps!\nMendapatkan +${earnedZPoints} Poin Z-Points!`);
      
      setProfile(prev => ({
        ...prev,
        zPoints: prev.zPoints + earnedZPoints
      }));
    }
    return () => clearInterval(interval);
  }, [multiActive, lobbyTimer]);

  const leaderboard = getLeaderboard(profile);
  const selectedBoss = bosses.find(b => b.id === selectedBossId) || bosses[0];

  // Fight Boss mechanics
  const handleAttackBoss = () => {
    if (profile.battlePower < selectedBoss.bpRequired) {
      alert(`Kekuatan Tempurmu (${profile.battlePower} BP) belum cukup! Butuh minimal ${selectedBoss.bpRequired} BP untuk menantang ${selectedBoss.name}!`);
      return;
    }

    if (userDamageInput <= 0) {
      alert('Masukkan reps push-up yang Anda selesaikan!');
      return;
    }

    playSound('powerup');
    
    // Formula: damage = reps * 3
    const damageDealt = userDamageInput * 5;
    const nextHp = Math.max(0, selectedBoss.currentHp - damageDealt);

    setBosses(prev => prev.map(b => {
      if (b.id === selectedBoss.id) {
        return { ...b, currentHp: nextHp };
      }
      return b;
    }));

    if (nextHp === 0) {
      playSound('levelup');
      setBossFightStatus('won');
      setProfile(prev => ({
        ...prev,
        zPoints: prev.zPoints + selectedBoss.rewardZPoints
      }));
    } else {
      playSound('beep');
      setBossFightStatus('deal');
      setTimeout(() => setBossFightStatus('idle'), 1500);
    }
  };

  const handleResetBoss = (id: string) => {
    setBosses(prev => prev.map(b => {
      if (b.id === id) {
        const template = BATTLE_BOSSES.find(tb => tb.id === id);
        return { ...b, currentHp: template ? template.maxHp : b.maxHp };
      }
      return b;
    }));
    setBossFightStatus('idle');
  };

  return (
    <div className="w-full text-slate-100 text-left">
      
      {/* Category selector tabs */}
      <div className="flex border-b border-zinc-800 mb-6 gap-2">
        <button 
          onClick={() => { setActiveTab('pve'); playSound('beep'); }}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'pve' ? 'border-b-2 border-orange-500 text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Swords className="w-4 h-4" />
          Pertarungan Bos (RPG)
        </button>
        <button 
          onClick={() => { setActiveTab('multiplayer'); playSound('beep'); }}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'multiplayer' ? 'border-b-2 border-orange-500 text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Multiplayer Live (Co-op)
        </button>
        <button 
          onClick={() => { setActiveTab('leaderboard'); playSound('beep'); }}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer ${
            activeTab === 'leaderboard' ? 'border-b-2 border-orange-500 text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Peringkat Global (Leaderboard)
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* PvE Section */}
        {activeTab === 'pve' && (
          <motion.div 
            key="pve-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            {/* List of Bosses Left */}
            <div className="lg:col-span-5 bento-card p-4 space-y-2 max-h-[500px] overflow-y-auto">
              <h3 className="text-xs font-mono text-zinc-400 tracking-wider uppercase mb-3 px-1">Daftar Lawan Bertarung</h3>
              
              {bosses.map((boss) => {
                const isBeaten = boss.currentHp === 0;
                const isLocked = profile.battlePower < boss.bpRequired;

                return (
                  <button 
                    key={boss.id}
                    onClick={() => { setSelectedBossId(boss.id); playSound('beep'); }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                      selectedBossId === boss.id 
                        ? 'border-orange-500 bg-orange-600/5' 
                        : 'border-zinc-850 hover:border-zinc-700 bg-zinc-950/25'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-1 w-full text-slate-200">
                        {boss.name}
                        {isBeaten && <Check className="w-4 h-4 text-emerald-400" />}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        HP: {boss.currentHp} / {boss.maxHp}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      {isLocked ? (
                        <span className="text-[9px] text-red-500 font-black animate-pulse uppercase">BUTUH {boss.bpRequired} BP</span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-bold font-mono">+{boss.rewardZPoints} ZP</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Boss Fight Detail arena Right */}
            <div className="lg:col-span-7 bento-card orange-glow scouter-border p-6 flex flex-col justify-between min-h-[460px] relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none"></div>

              <div>
                <span className="text-orange-500 text-[10px] font-mono uppercase tracking-widest leading-none">Arena Pertempuran</span>
                <h3 className="text-2xl font-black text-slate-100 tracking-tight mt-1 leading-none">{selectedBoss.name}</h3>
                
                <p className="text-xs text-zinc-400 font-serif italic mt-3 border-l-2 border-zinc-750 pl-3">
                  "{selectedBoss.flavorText}"
                </p>

                {/* HP Tracker Bar */}
                <div className="mt-6 p-4 bg-zinc-950/80 border border-zinc-850 rounded-xl relative">
                  <div className="flex justify-between items-center mb-1 text-xs font-mono">
                    <span className="text-zinc-500 uppercase">HP Target</span>
                    <span className="font-bold text-slate-200">{selectedBoss.currentHp} / {selectedBoss.maxHp}</span>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-3.5 relative overflow-hidden">
                    <motion.div 
                      className={`h-full ${selectedBoss.currentHp === 0 ? 'bg-zinc-600' : 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500'}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(selectedBoss.currentHp / selectedBoss.maxHp) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Combat Action Interface */}
              <div className="mt-8">
                {selectedBoss.currentHp === 0 ? (
                  <div className="bg-emerald-950/30 border border-emerald-500/20 p-5 rounded-xl text-center">
                    <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                    <h4 className="text-base font-bold text-emerald-400 leading-snug">KAWAN LAWAN TELAH DIKALAHKAN!</h4>
                    <p className="text-xs text-zinc-400 mt-1">Anda mendapatkan imbalan {selectedBoss.rewardZPoints} Z-Points! Latih kemampuanmu lebih keras!</p>
                    <button 
                      onClick={() => handleResetBoss(selectedBoss.id)}
                      className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      PULIHKAN LAWAN & BERTARUNG LAGI
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-850">
                    <h4 className="text-xs font-mono text-zinc-400 uppercase mb-3">Serang dengan Reps Push-up Baru</h4>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-2.5">
                        <span className="text-xs font-mono text-zinc-400 px-2">Jumlah Reps:</span>
                        <input 
                          type="number"
                          value={userDamageInput}
                          onChange={(e) => setUserDamageInput(Math.max(1, parseInt(e.target.value) || 0))}
                          className="flex-1 bg-transparent text-slate-100 font-mono font-bold text-center focus:outline-none"
                        />
                      </div>

                      <button 
                        onClick={handleAttackBoss}
                        className="bg-orange-600 hover:bg-orange-500 text-slate-100 font-extrabold px-6 py-3 rounded-lg text-sm flex items-center justify-center gap-2 tracking-wide transition-all active:scale-[0.98] cursor-pointer"
                      >
                        SERANG DAN DAMAGE BOS (-{userDamageInput * 5} HP)
                      </button>
                    </div>

                    <p className="text-[10px] font-mono text-zinc-500 mt-2 text-center italic">
                      *Damage: 1 set push-up dihitung reps dikali 5 daya hancur Ki. Minimal butuh kekuatan syaraf petarung!
                    </p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* Multiplayer Live Section */}
        {activeTab === 'multiplayer' && (
          <motion.div 
            key="multi-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bento-card orange-glow relative overflow-hidden p-6 min-h-[400px] text-center flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="max-w-md mx-auto">
              <span className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-1 block">TURNAMEN MULTIPLAYER REAL-TIME (Simulasi Aktif)</span>
              <h3 className="text-2xl font-black text-slate-100 mt-1 leading-none">Piala Bela Diri Sejagat Raya</h3>
              <p className="text-xs text-zinc-400 mt-2">
                Raksasa bela diri berkumpul untuk kompetisi push-up! Mulai turnamen 30 detik untuk bertanding dengan petarung lain secara real-time!
              </p>
            </div>

            {!multiActive ? (
              <div className="my-8 max-w-sm mx-auto bg-zinc-950 p-6 rounded-2xl border border-zinc-850">
                <Users className="w-12 h-12 text-orange-500 mx-auto mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-200">Siap bertanding push-up?</h4>
                <p className="text-[11px] text-zinc-500 mt-1 mb-5">Anda akan tergabung dalam lobby penantang legendaris seketika!</p>
                <button 
                  onClick={() => {
                    setUserMultiReps(0);
                    setLobbyTimer(30);
                    setCompetitors(c => c.map(comp => ({ ...comp, reps: 0 })));
                    setMultiActive(true);
                    playSound('powerup');
                  }}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-slate-100 font-bold font-mono text-sm shadow-md rounded-xl cursor-pointer"
                >
                  GABUNG LOBBY BERTARUNG
                </button>
              </div>
            ) : (
              <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* User Active tracker and button tap */}
                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-850 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">JUMLAH REPS ANDA</span>
                    <div className="text-6xl font-mono font-black text-slate-100 my-4 select-none">{userMultiReps}</div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        setUserMultiReps(p => p + 1);
                        playSound('beep');
                      }}
                      className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-slate-100 font-black tracking-wider text-sm rounded-xl cursor-pointer shadow-lg active:scale-95"
                    >
                      HITUNG PUSH-UP REPS!
                    </button>
                    <span className="text-[10px] font-mono text-zinc-500 block leading-none">Atau letakkan wajah di lantai dan hidung menekan tombol untuk melatih otot nyata.</span>
                  </div>
                </div>

                {/* Scoreboard rivals list */}
                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-850 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">DAFTAR PAPAN SKOR</span>
                      <span className="text-xs font-mono font-bold text-yellow-500 animate-pulse">Sisa Waktu: {lobbyTimer}s</span>
                    </div>

                    <div className="space-y-2 text-left">
                      {/* Current Score listings */}
                      {[
                        { name: profile.name || 'Petarung Anda', reps: userMultiReps, isUser: true },
                        ...competitors
                      ].sort((a,b) => b.reps - a.reps).map((p, idx) => (
                        <div 
                          key={p.name}
                          className={`p-2.5 rounded-lg border font-mono text-xs flex justify-between items-center ${
                            (p as any).isUser ? 'border-orange-500 bg-orange-600/10 font-bold' : 'border-zinc-800'
                          }`}
                        >
                          <span>#{idx + 1} {p.name}</span>
                          <span className="text-slate-100 font-bold">{p.reps} Reps</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[9px] font-mono text-zinc-500 text-center leading-normal mt-3">
                    *Para penantang dikomputasi secara real-time via sync data. Pertahankan posisimu teratas!
                  </p>
                </div>

              </div>
            )}

            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl max-w-md mx-auto text-center">
              <span className="text-[10px] font-mono text-zinc-500 leading-normal">
                Pemenang pertama mendapat +100 ZP, kedua +50 ZP, dan ketiga +25 ZP untuk ditukar di Toko Capsule Corp!
              </span>
            </div>

          </motion.div>
        )}

        {/* Global Leaderboard Section */}
        {activeTab === 'leaderboard' && (
          <motion.div 
            key="leaderboard-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bento-card orange-glow p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-100 tracking-tight">Kekuatan Alam Semesta</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Urutan petarung pusaran galaksi berdasarkan kekuatan tempur Battle Power (BP)</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>

            <div className="space-y-2.5">
              {leaderboard.map((entry) => (
                <div 
                  key={entry.id}
                  className={`p-3.5 rounded-xl border flex justify-between items-center transition-all ${
                    entry.isCurrentUser 
                      ? 'border-orange-500 bg-orange-600/15 ring-1 ring-orange-500/25' 
                      : 'border-zinc-850 bg-zinc-950/30'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-xs ${
                      entry.rank === 1 ? 'bg-yellow-500 text-zinc-950 font-extrabold shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
                      entry.rank === 2 ? 'bg-zinc-400 text-zinc-950 font-bold' :
                      entry.rank === 3 ? 'bg-amber-700 text-zinc-950 font-bold' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {entry.rank}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                        {entry.name}
                        {entry.isCurrentUser && <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-md font-mono uppercase font-black uppercase tracking-wider">Anda</span>}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        Bentuk: <span className="text-zinc-400 font-bold">{entry.transformationName}</span> | Total Push-Up: {entry.totalPushUps}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs text-zinc-500 block leading-none">BATTLE POWER</span>
                    <span className="text-sm font-black text-orange-400 mt-1 block">
                      {entry.battlePower.toLocaleString('id-ID')} BP
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] font-mono text-zinc-500 text-center leading-normal mt-6">
              *TIPS: Lakukan reps push-up di ruang gravitasi tinggi untuk melipatgandakan kekuatan tempur (BP) Anda demi menggeser dominasi tak terhingga Vegeta dan Goku!
            </p>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
