/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { playSound } from '../utils';
import { Cloud, Download, Eye, HelpCircle, Import, Moon, Shield, Sparkles, Sun, Volume2, VolumeX } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export default function SettingsView({ profile, setProfile }: SettingsViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [dailyReminderHour, setDailyReminderHour] = useState('08:00');

  // Flexible Reminder interval in minutes
  const intervals = [1, 5, 10, 15, 30, 45, 60];

  const handleIntervalChange = (min: number) => {
    playSound('beep');
    setProfile(prev => ({
      ...prev,
      reminderIntervalMin: min
    }));
  };

  const toggleSound = () => {
    const isEnabled = !profile.soundEnabled;
    setProfile(prev => ({
      ...prev,
      soundEnabled: isEnabled
    }));
    if (isEnabled) {
      playSound('beep');
    }
  };

  const handleThemeChange = (selectedTheme: 'dark' | 'light') => {
    playSound('beep');
    setProfile(prev => ({
      ...prev,
      theme: selectedTheme
    }));
    
    // Set appropriate document styles
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Google Fit cloud synchronization simulation
  const handleGoogleFitSync = () => {
    playSound('powerup');
    setIsSyncing(true);
    setSyncDone(false);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      playSound('success');
      
      setProfile(prev => ({
        ...prev,
        syncStatus: 'synced'
      }));

      setTimeout(() => setSyncDone(false), 3000);
    }, 2800);
  };

  // Export local database as backup JSON file
  const handleExportBackup = () => {
    playSound('beep');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `CC_GravityFit_Cadangan_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  // Import local training database backup
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed.name && parsed.history) {
            playSound('levelup');
            setProfile(parsed);
            alert('CADANGAN DATA BERHASIL DIIMPOR!\nSeluruh kemajuan petarung, Z-Points, dan riwayat push-up telah dipulihkan.');
          } else {
            alert('Format file cadangan tidak valid!');
          }
        } catch (err) {
          alert('Gagal mendata file cadangan!');
        }
      };
    }
  };

  return (
    <div className="w-full text-slate-100 text-left space-y-6">
      
      {/* Settings Header banner */}
      <h2 className="text-xl font-bold tracking-tight mb-2 border-l-3 border-orange-500 pl-3">
        Pengaturan Radar Pelatihan Saiyan Warrior
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Interval Reminder customization Left */}
        <div className="bento-card p-6 space-y-5">
          <div>
            <h3 className="text-sm font-mono text-zinc-400 tracking-wider uppercase mb-1">⏰ Waktu Jeda Interval Remon</h3>
            <p className="text-[11px] text-zinc-500">Mengingatkan Anda melakukan reps push-up secara berkala sesuai jeda pilihan</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {intervals.map((item) => (
              <button 
                key={item}
                onClick={() => handleIntervalChange(item)}
                className={`py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  profile.reminderIntervalMin === item 
                    ? 'bg-orange-600 text-slate-100 border border-orange-500' 
                    : 'bg-zinc-950 hover:bg-zinc-850 hover:text-slate-200 text-zinc-400 border border-zinc-900'
                }`}
              >
                {item} Min
              </button>
            ))}
          </div>

          <p className="text-[10px] font-mono text-zinc-500 italic leading-snug">
            *Rekomendasi: Gunakan <strong className="text-amber-500 font-normal">1 menit</strong> untuk pengetesan alarm, atau <strong className="text-amber-500 font-normal">15 menit</strong> untuk porsi latihan terstruktur reguler.
          </p>

          {/* Daily Alert Hour */}
          <div className="pt-2">
            <h4 className="text-xs font-mono text-zinc-400 uppercase mb-2">🔔 Pengingat Harian (Pukul)</h4>
            <div className="flex gap-3 max-w-xs">
              <input 
                type="time" 
                value={dailyReminderHour}
                onChange={(e) => {
                  setDailyReminderHour(e.target.value);
                  playSound('beep');
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-lg text-slate-100 font-mono text-sm p-2 w-32 focus:outline-none focus:border-orange-500 text-center"
              />
              <button 
                onClick={() => {
                  playSound('success');
                  alert(`Pengingat harian diatur aktif pada: Pukul ${dailyReminderHour} setiap hari! Tetap konsisten melatih fisikmu!`);
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-slate-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>

        {/* Sync / Sound Right */}
        <div className="bento-card p-6 space-y-5">
          
          {/* Sounds */}
          <div>
            <h3 className="text-sm font-mono text-zinc-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
              {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-orange-500" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              Suara Alarm & Efek Pertarungan
            </h3>
            
            <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-850">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-200">Musik Ki Power Up</span>
                <p className="text-[10px] text-zinc-500 leading-none mt-1">Menggunakan nada gelombang Web Audio API mandiri</p>
              </div>

              <button 
                onClick={toggleSound}
                className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all ${
                  profile.soundEnabled ? 'bg-orange-600 text-slate-100' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {profile.soundEnabled ? 'SUARA AKTIF' : 'SUARA BISU (MUTE)'}
              </button>
            </div>
          </div>

          {/* Theme customiser selection */}
          <div>
            <h3 className="text-sm font-mono text-zinc-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
              {profile.theme === 'dark' ? <Moon className="w-4 h-4 text-orange-500" /> : <Sun className="w-4 h-4 text-yellow-500" />}
              Pariasi Skema Warna (Mode Gelap)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                  profile.theme === 'dark' 
                    ? 'border-orange-500 bg-orange-600/10 text-orange-400' 
                    : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                MODE GELAP / DEEP CANVAS
              </button>

              <button 
                onClick={() => handleThemeChange('light')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                  profile.theme === 'light' 
                    ? 'border-orange-500 bg-orange-600/10 text-orange-400' 
                    : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Sun className="w-4 h-4" />
                MODE TERANG / MONOKROM
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Google Fit Integration Sync banner */}
      <div className="bento-card relative overflow-hidden p-6 text-left">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <span className="text-cyan-400 text-[10px] font-mono uppercase tracking-widest leading-none">Sinkronisasi Awan & Google Fit</span>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Cloud className="w-5 h-5 text-cyan-400" />
              Sinergi Latihan Google Fit & Sinkronisasi Cadangan
            </h3>
            <p className="text-xs text-zinc-500 max-w-xl">
              Hubungkan secara instan data reps push-up ke portal Google Fit Anda! Kami mengonseptualisasikan sinkronisasi database untuk mengubah pengulangan menjadi data kalori dan waktu aktif di portal eksternal secara otomatis.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <button 
              disabled={isSyncing}
              onClick={handleGoogleFitSync}
              className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-bold font-mono text-sm shadow-md transition-all ${
                isSyncing 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed animate-pulse' 
                  : syncDone 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-100' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-100 cursor-pointer active:scale-95'
              }`}
            >
              {isSyncing ? 'SINKRONISASI KI CLOUD...' : syncDone ? 'SINKRONISASI COCOK! (OK)' : 'SINKRONKAN KE GOOGLE FIT'}
            </button>
          </div>
        </div>

        {/* Sync Status label indicator */}
        <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
          <span>Status Sinkronisasi Saat Ini:</span>
          {profile.syncStatus === 'synced' ? (
            <span className="text-emerald-400 font-bold">● Terhubung dengan Aman (Mode Awan Aktif)</span>
          ) : (
            <span className="text-amber-500 font-bold">● Belum Sinkron (Hanya Penyimpanan Lokal Terenkripsi)</span>
          )}
        </div>
      </div>

      {/* Backup and Restore File System */}
      <div className="bento-card p-6 text-left">
        <h3 className="text-sm font-mono text-zinc-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-orange-500" />
          Sistem Cadangan & Keamanan Data (Mode Offline Aktif)
        </h3>
        <p className="text-xs text-zinc-500 mb-5 leading-normal">
          Aplikasi ini dirancang menggunakan sistem database <strong className="text-zinc-400 font-normal">Offline-First</strong> yang menyimpan seluruh level petarung Anda di memori internal browser (<code className="text-zinc-400">localStorage</code>). Anda tetap bisa latihan, naik tingkat dan bertarung meski tanpa koneksi internet sama sekali! Gunakan menu di bawah untuk backup data latihan Anda:
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleExportBackup}
            className="flex-1 py-3 text-xs font-mono font-bold border border-zinc-700 bg-zinc-950 hover:bg-zinc-850 hover:text-slate-100 text-zinc-300 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            UNDUH FILE CADANGAN (JSON)
          </button>

          <label className="flex-1 py-3 text-xs font-mono font-bold border border-zinc-700 bg-zinc-950 hover:bg-zinc-850 text-zinc-300 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-center relative overflow-hidden">
            <Import className="w-4 h-4" />
            PULIHKAN CADANGAN LAMA
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportBackup} 
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      </div>

    </div>
  );
}
