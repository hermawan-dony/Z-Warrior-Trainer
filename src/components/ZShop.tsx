/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../types';
import { CHARACTERS, GRAVITY_CHAMBERS } from '../data';
import { playSound } from '../utils';
import { Award, CheckCircle2, Lock, Sparkles, Zap } from 'lucide-react';

interface ZShopProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export default function ZShop({ profile, setProfile }: ZShopProps) {
  
  const handleUnlockCharacter = (id: string, cost: number) => {
    if (profile.zPoints < cost) {
      alert('Poin latihan Z-Points Anda tidak cukup! Ayo kumpulkan lebih banyak reps push-up!');
      return;
    }
    
    playSound('levelup');
    setProfile(prev => ({
      ...prev,
      zPoints: prev.zPoints - cost,
      unlockedCharacterIds: [...prev.unlockedCharacterIds, id]
    }));
  };

  const handleUnlockChamber = (id: string, cost: number) => {
    if (profile.zPoints < cost) {
      alert('Poin latihan Z-Points Anda tidak cukup! Terus lakukan push-up untuk mengumpulkan Ki!');
      return;
    }
    
    playSound('levelup');
    setProfile(prev => ({
      ...prev,
      zPoints: prev.zPoints - cost,
      unlockedGravityIds: [...prev.unlockedGravityIds, id]
    }));
  };

  const handleSelectCharacter = (id: string) => {
    playSound('beep');
    setProfile(prev => ({
      ...prev,
      characterId: id
    }));
  };

  const handleSelectChamber = (id: string) => {
    playSound('beep');
    setProfile(prev => ({
      ...prev,
      currentGravityId: id
    }));
  };

  return (
    <div className="w-full text-slate-100 text-left">
      
      {/* Shop Header banner */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 mb-6 relative overflow-hidden shadow-xl border-b-2 border-red-800">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <span className="text-yellow-300 font-mono text-[10px] tracking-widest uppercase mb-1 block">Toko Saiyan Warrior Trainer (Z-Points)</span>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2 leading-none">
          RUANG PERSENTASE KEKUATAN
        </h2>
        <p className="text-xs text-orange-200 max-w-lg">
          Lakukan push-up, dapatkan Z-Points, tukarkan untuk membuka petarung Saiyan atau menaikkan berat gaya gravitasi untuk meningkatkan multiplier BP latihanmu!
        </p>

        {/* Floating Balance */}
        <div className="mt-4 sm:absolute sm:top-6 sm:right-6 sm:mt-0 bg-slate-950/80 border border-yellow-400 p-3 rounded-xl flex items-center gap-2.5">
          <div className="text-right">
            <span className="text-[9px] font-mono text-zinc-500 block leading-none">SALDO ANDA:</span>
            <span className="text-xl font-mono font-black text-yellow-400">{profile.zPoints} ZP</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-zinc-950 font-black">
            Z
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Unlock Characters Left */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <h3 className="text-base font-bold tracking-tight mb-2 border-l-3 border-orange-500 pl-2.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Buka Petarung & Karakter Lain
          </h3>

          <div className="space-y-4">
            {CHARACTERS.map(char => {
              const isUnlocked = profile.unlockedCharacterIds.includes(char.id);
              const isSelected = profile.characterId === char.id;

              return (
                <div 
                  key={char.id}
                  className={`p-4 bento-card flex items-center justify-between gap-4 transition-all ${
                    isSelected ? 'border-orange-500 scouter-border ring-2 ring-orange-500/10 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-3xl">
                      {char.id === 'goku' ? '🧑‍🚀' : 
                       char.id === 'vegeta' ? '👤' : 
                       char.id === 'gohan' ? '🧒' : 
                       char.id === 'trunks' ? '🗡️' : '👽'}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        {char.name}
                        {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1 leading-normal max-w-xs">{char.description}</p>
                      <span className="text-[9px] font-mono text-zinc-400 block mt-1 leading-none">
                        Base BP: <strong className="text-zinc-300 font-bold">{char.baseBP}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {/* Actions */}
                    {isUnlocked ? (
                      isSelected ? (
                        <span className="px-3 py-1.5 bg-orange-600/10 border border-orange-500 text-orange-400 text-xs font-mono font-bold rounded-lg block">
                          AKTIF
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSelectCharacter(char.id)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:text-slate-100 text-zinc-300 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer"
                        >
                          PILIH
                        </button>
                      )
                    ) : (
                      <button 
                        onClick={() => handleUnlockCharacter(char.id, char.cost)}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-black font-mono rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Lock className="w-3 h-3" />
                        {char.cost} ZP
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gravity Chambers Right */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <h3 className="text-base font-bold tracking-tight mb-2 border-l-3 border-orange-500 pl-2.5 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-orange-500" />
            Menaikkan Gaya Gravitasi (Multiplier)
          </h3>

          <div className="space-y-4">
            {GRAVITY_CHAMBERS.map(g => {
              const isUnlocked = profile.unlockedGravityIds.includes(g.id);
              const isSelected = profile.currentGravityId === g.id;

              return (
                <div 
                  key={g.id}
                  className={`p-4 bento-card flex items-center justify-between gap-4 transition-all ${
                    isSelected ? 'border-orange-500 scouter-border ring-2 ring-orange-500/10 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center font-mono text-amber-500 text-xs font-black leading-none">
                      <span>{g.gravityFactor}x</span>
                      <span className="text-[7px] text-zinc-500 tracking-tighter mt-1">GRAVITY</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        {g.name}
                        {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1 leading-normal max-w-xs">{g.description}</p>
                      <span className="text-[9px] font-mono text-zinc-400 block mt-1 leading-none">
                        Bonus Multiplier: <strong className="text-amber-400 font-bold">{g.multiplier.toFixed(1)}x</strong> BP
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {/* Actions */}
                    {isUnlocked ? (
                      isSelected ? (
                        <span className="px-3 py-1.5 bg-orange-600/10 border border-orange-500 text-orange-400 text-xs font-mono font-bold rounded-lg block">
                          AKTIF
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSelectChamber(g.id)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:text-slate-100 text-zinc-300 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer"
                        >
                          PILIH
                        </button>
                      )
                    ) : (
                      <button 
                        onClick={() => handleUnlockChamber(g.id, g.cost)}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-zinc-950 text-xs font-black font-mono rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Lock className="w-3 h-3" />
                        {g.cost} ZP
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
