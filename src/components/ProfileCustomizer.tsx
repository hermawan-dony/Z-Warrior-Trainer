/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { CHARACTERS } from '../data';
import { playSound } from '../utils';
import { Award, CheckCircle2, Shield, User, UserPlus } from 'lucide-react';

interface ProfileCustomizerProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export default function ProfileCustomizer({ profile, setProfile }: ProfileCustomizerProps) {
  const [editingName, setEditingName] = useState(profile.name);
  const [editingTarget, setEditingTarget] = useState(profile.dailyTarget);
  const [selectedTitle, setSelectedTitle] = useState('Earthling Trainer');

  // List of unlockable earned titles based on Battle Power BP thresholds
  const titles = [
    { title: 'Earthling Trainer', minBP: 0 },
    { title: 'Z-Fighter Recruit', minBP: 100 },
    { title: 'Gravity Chamber Pioneer', minBP: 400 },
    { title: 'King Kai\'s Favorite', minBP: 1200 },
    { title: 'Saiyan Legend', minBP: 4000 },
    { title: 'Universe 7 Champion', minBP: 10000 },
    { title: 'Godly Acolyte', minBP: 25000 },
    { title: 'Grand Priest Apprentice', minBP: 80000 },
    { title: 'Kaioshin Guardian', minBP: 150000 }
  ];

  const handleSaveProfile = () => {
    if (!editingName.trim()) {
      alert('Nama petarung tidak boleh kosong!');
      return;
    }

    playSound('success');
    setProfile(prev => ({
      ...prev,
      name: editingName,
      dailyTarget: editingTarget
    }));
    alert('DATA PROFIL BERHASIL DIPERBAHARUI!');
  };

  // Find max reps in a single session
  const maxSingleSet = profile.history.length > 0 
    ? Math.max(...profile.history.map(s => s.reps))
    : 0;

  const totalReps = profile.history.reduce((sum, s) => sum + s.reps, 0);

  const activeChar = CHARACTERS.find(c => c.id === profile.characterId) || CHARACTERS[0];
  const activeT = activeChar.transformations.slice().reverse().find(t => profile.battlePower >= t.threshold) || activeChar.transformations[0];

  return (
    <div className="w-full text-slate-100 text-left space-y-6">
      
      {/* Profile Header section */}
      <h2 className="text-xl font-bold tracking-tight mb-2 border-l-3 border-orange-500 pl-3">
        Kustomisasi Profil Petarung Anda
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Profile Card left */}
        <div className="md:col-span-8 bento-card p-6 space-y-5">
          
          <div className="space-y-4">
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase">Nama Petarung (Username)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Contoh: Son Goku"
                  className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm font-sans font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Target Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase">Target Push-up Harian (Reps)</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="number"
                  value={editingTarget}
                  onChange={(e) => setEditingTarget(Math.max(10, parseInt(e.target.value) || 0))}
                  className="w-32 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm font-mono font-bold text-center focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-zinc-500 font-mono">Reps (Min: 10)</span>
              </div>
            </div>

            {/* Title Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 uppercase block">Gelar Julukan Petarung Anda</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {titles.map((t) => {
                  const isEarned = profile.battlePower >= t.minBP;
                  const isEquipped = selectedTitle === t.title;

                  return (
                    <button
                      key={t.title}
                      disabled={!isEarned}
                      onClick={() => {
                        setSelectedTitle(t.title);
                        playSound('beep');
                      }}
                      className={`p-2.5 border rounded-xl font-mono text-[11px] text-left transition-all ${
                        !isEarned 
                          ? 'border-zinc-850/50 bg-zinc-950/20 text-zinc-650 cursor-not-allowed opacity-40' 
                          : isEquipped 
                            ? 'border-orange-500 bg-orange-600/10 text-orange-400 font-bold' 
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400 cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span>🏆 {t.title}</span>
                        {!isEarned && <span className="text-[8px] text-zinc-500 block">Kunci: {t.minBP} BP</span>}
                        {isEarned && isEquipped && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-zinc-850 flex justify-end">
            <button 
              onClick={handleSaveProfile}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-slate-100 font-bold font-mono text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              SIMPAN PERUBAHAN DATA PROFIL
            </button>
          </div>

        </div>

        {/* Profile Card Stats right */}
        <div className="md:col-span-4 bento-card orange-glow p-6 flex flex-col justify-between">
          
          <div className="text-center relative">
            
            {/* Avatar block with border glow */}
            <div className="w-24 h-24 rounded-full bg-zinc-950 border-2 border-orange-500 mx-auto flex items-center justify-center text-4xl shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient opacity-10"></div>
              {profile.characterId === 'goku' ? '🧑‍🚀' : 
               profile.characterId === 'vegeta' ? '👤' : 
               profile.characterId === 'gohan' ? '🧒' : 
               profile.characterId === 'trunks' ? '🗡️' : '👽'}
            </div>

            <h3 className="text-base font-black text-slate-100 mt-4 leading-none">{profile.name}</h3>
            
            {/* Equipped Julukan */}
            <span className="text-[10px] font-mono text-amber-500 font-bold mt-1.5 inline-block px-2.5 py-0.5 bg-yellow-900/10 border border-yellow-500/20 rounded-md">
              Julukan: {selectedTitle}
            </span>

            <div className="mt-6 pt-5 border-t border-zinc-850 text-left space-y-4">
              
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500">Karakter Utama:</span>
                <span className="font-bold text-slate-300">{activeChar.name}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500">Tingkat Bentuk:</span>
                <span className="font-bold text-slate-300">{activeT.name}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500">Kekuatan Tempur (BP):</span>
                <span className="font-black text-orange-500">{profile.battlePower.toLocaleString('id-ID')} BP</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500">Reps Set Tertinggi:</span>
                <span className="font-bold text-emerald-400">{maxSingleSet} reps / set</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500">Jumlah Akumulasi:</span>
                <span className="font-bold text-slate-300">{totalReps} push-up</span>
              </div>

            </div>

          </div>

          <div className="mt-6 p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-center flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Awan Pelindung Kapsul Korp</span>
          </div>

        </div>

      </div>

    </div>
  );
}
