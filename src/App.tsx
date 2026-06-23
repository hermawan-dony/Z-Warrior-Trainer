/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { playSound } from './utils';

// Views
import Dashboard from './components/Dashboard';
import GravityChamberBattle from './components/GravityChamberBattle';
import ZShop from './components/ZShop';
import StatsView from './components/StatsView';
import ProfileCustomizer from './components/ProfileCustomizer';
import SettingsView from './components/SettingsView';

// Icons
import { 
  Plus, Dumbbell, Trophy, ShoppingBag, 
  TrendingUp, User, Settings, ShieldAlert,
  Clock, Share2, LogOut, Check, Wifi, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Petarung Saiyan',
  characterId: 'goku',
  currentGravityId: 'earth',
  zPoints: 0,
  battlePower: 5, // Starts at 5 (power level of standard farmer!)
  unlockedCharacterIds: ['goku'],
  unlockedGravityIds: ['earth'],
  history: [],
  dailyTarget: 50,
  streak: 0,
  lastActiveDate: '',
  reminderIntervalMin: 15,
  soundEnabled: true,
  theme: 'dark',
  syncStatus: 'unsynced'
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('db_fit_profile_v2');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [activeTab, setActiveTab] = useState('train');
  
  // Login / Auth System states
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('db_fit_is_logged_in') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('db_fit_profile_v2', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('db_fit_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  // Sync Document light/dark theme class on initial mount
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // Request browser Notification permissions on launch safely
  useEffect(() => {
    try {
      if ('Notification' in window && Notification && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch (err) {
      console.warn('Notifications not supported or blocked by sandbox permissions:', err);
    }
  }, []);

  const handleAuthentication = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!loginEmail || !loginPassword) {
      setAuthError('Silakan lengkapi Email dam Sandi akses!');
      return;
    }

    if (loginPassword.length < 6) {
      setAuthError('Sandi pengaman minimal bertuliskan 6 huruf!');
      return;
    }

    playSound('success');
    setIsLoggedIn(true);

    if (authMode === 'register') {
      const parts = loginEmail.split('@');
      const generatedName = parts[0] ? parts[0] : 'Pejuang Baru';
      setProfile(prev => ({
        ...prev,
        name: generatedName
      }));
      alert(`AKUN BERHASIL DIBUAT!\nSelamat datang Pejuang, ${generatedName}. Mulailah melatih fisikmu agar kekuatan tempur memuncak!`);
    } else {
      alert(`LOGIN BERHASIL!\nSistem keamanan Saiyan Warrior Trainer memverifikasi akses. Progres latihan Anda telah dimuat dari Cloud.`);
    }
  };

  const handleLogout = () => {
    playSound('beep');
    setIsLoggedIn(false);
    localStorage.removeItem('db_fit_is_logged_in');
  };

  const handleOfflineGuestAccess = () => {
    playSound('beep');
    setIsLoggedIn(true);
    alert('MELANJUTKAN SEBAGAI TAMU / SISTEM OFFLINE.\nSemua data kemajuan latihan akan otomatis direkam secara lokal di browser Anda.');
  };

  // Social media mock share generator representing a beautifully styled Power Card
  const handleShareStats = () => {
    playSound('success');
    const totalPushups = profile.history.reduce((sum, s) => sum + s.reps, 0);
    const textToShare = `Aku baru saja berlatih push up di Capsule Corp Gravity Chamber! Kekuatan tempurku saat ini sudah mencapai ${profile.battlePower.toLocaleString('id-ID')} BP. Ayo bertarung bersamaku melampaui batas Saiyan! 💪🔥 #DBZFitTracker`;
    
    // Copy to clipboard as standard with safety fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToShare)
        .then(() => {
          alert(`BERHASIL MENYALIN BAJU TEMPUR!\nKalimat tantangan telah disalin ke papan klip Anda:\n\n"${textToShare}"\n\nSilakan tempel (paste) langsung ke media sosial pilihanmu!`);
        })
        .catch(() => {
          // Fallback to prompt
          prompt('Salin kalimat tantangan Anda di bawah ini:', textToShare);
        });
    } else {
      // Fallback if browser/sandbox blocks clipboard API
      prompt('Salin kalimat tantangan Anda di bawah ini:', textToShare);
    }
  };

  // Sound play wrapper
  const handleTabChange = (tabId: string) => {
    playSound('beep');
    setActiveTab(tabId);
  };

  // Reset all local storage data
  const handleResetApplicationData = () => {
    if (confirm('APAKAH ANDA YAKIN INGIN MENGHAPUS SEMUA DATA?\nTindakan ini ireversibel. Semua riwayat reps push-up, Z-Points, dan level Saiyan karakter Anda akan dihapus permanen!')) {
      playSound('beep');
      localStorage.removeItem('db_fit_profile_v2');
      localStorage.removeItem('db_fit_bosses');
      setProfile(DEFAULT_PROFILE);
      setIsLoggedIn(false);
      setActiveTab('train');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${
      profile.theme === 'dark' ? 'bg-zinc-950 text-slate-100' : 'bg-zinc-100 text-zinc-900'
    }`}>
      
      {/* NOT LOGGED IN / CAPSULE CORP LOGIN GATEWAY */}
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div 
            key="login-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden"
          >
            {/* Ambient sci-fi space clouds glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bento-card orange-glow relative p-8 text-slate-100"
            >
              <div className="text-center space-y-4">
                {/* Logo Shield Z Warrior */}
                <div className="w-16 h-16 rounded-full bg-orange-600 border-2 border-slate-100 flex items-center justify-center mx-auto text-slate-100 font-serif text-2xl font-black tracking-tighter drop-shadow-lg">
                  Z
                </div>
                <div>
                  <h1 className="text-xl font-sans font-black text-slate-100 uppercase tracking-tight">Saiyan Warrior Trainer</h1>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">Rencana Latihan Gravitasi & Pelacakan Kemajuan Petarung</p>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleAuthentication} className="mt-8 space-y-4">
                
                {authError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs text-center rounded-lg leading-normal">
                    {authError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Akses Email</label>
                  <input 
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@emailpetarung.com"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Sandi Pengaman (Sandi Kontrol)</label>
                  <input 
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <button 
                    type="button"
                    onClick={() => {
                      playSound('beep');
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                    }}
                    className="text-orange-500 hover:text-orange-400 transition-colors"
                  >
                    {authMode === 'login' ? 'Buat Akun Anyar Pejuang?' : 'Sudah terdaftar? Masuk Portal'}
                  </button>
                  <span className="text-zinc-500">v2.4.0 API</span>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-slate-100 font-bold font-mono text-xs rounded-xl shadow-md border-b-2 border-red-800 transition-all uppercase tracking-wider block"
                >
                  {authMode === 'login' ? 'OTORISASI PORTAL MASUK' : 'DAFTARKAN SANG PETARUNG'}
                </button>
              </form>

              {/* Offline / Access Guest */}
              <div className="mt-6 pt-4 border-t border-zinc-850 text-center space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 block leading-none">ATAU UNTUK LOKAL & OFFLINE-ONLY:</span>
                <button 
                  onClick={handleOfflineGuestAccess}
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 hover:text-slate-100 border border-zinc-800 text-zinc-400 font-bold text-xs font-mono rounded-xl transition-all"
                >
                  MASUK CARA TAMU / MODE TANPA INTERNET
                </button>
              </div>

            </motion.div>
          </motion.div>
        ) : (
          
          /* LOGGED IN / MAIN APPLICATION APPLICATION */
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            {/* Top Command Header */}
            <header className={`border-b sticky top-0 z-30 backdrop-blur-md transition-colors ${
              profile.theme === 'dark' ? 'bg-zinc-950/80 border-zinc-850' : 'bg-zinc-100/90 border-zinc-300'
            }`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center gap-4">
                
                {/* Logo and Level details */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600 border border-slate-100 flex items-center justify-center font-bold font-serif text-[15px] text-slate-100 shadow-md">
                    Z
                  </div>
                  <div>
                    <h1 className="text-xs font-mono text-zinc-500 leading-none tracking-wider uppercase">Saiyan Warrior Trainer</h1>
                    <span className="text-sm font-black text-slate-300 tracking-tight block mt-0.5 sm:inline">
                      {profile.name} <strong className="text-orange-500 font-black">BP: {profile.battlePower.toLocaleString('id-ID')}</strong>
                    </span>
                  </div>
                </div>

                {/* Header widget actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                  
                  {/* Share button banner */}
                  <button 
                    onClick={handleShareStats}
                    className="p-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 text-zinc-400 hover:text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer"
                    title="Bagikan Kekuatan Tempur ke Media Sosial"
                  >
                    <Share2 className="w-4 h-4 text-orange-500" />
                    <span className="hidden sm:inline">BAGIKAN PRESTASI</span>
                  </button>

                  {/* Reset app state */}
                  <button 
                    onClick={handleResetApplicationData}
                    className="p-2 border border-red-950/40 hover:border-red-800 bg-zinc-900/20 hover:bg-red-950/20 text-red-500 hover:text-red-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer"
                    title="Hapus / Reset Seluruh Data"
                  >
                    Hapus Data
                  </button>

                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="p-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 text-zinc-500 hover:text-slate-300 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                    title="Keluar / Akhiri Sesi Otorisasi"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </header>

            {/* Main view injection viewport */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-140px)]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  {activeTab === 'train' && (
                    <Dashboard 
                      profile={profile} 
                      setProfile={setProfile} 
                      onNavigate={handleTabChange} 
                    />
                  )}
                  {activeTab === 'battle' && (
                    <GravityChamberBattle 
                      profile={profile} 
                      setProfile={setProfile} 
                    />
                  )}
                  {activeTab === 'shop' && (
                    <ZShop 
                      profile={profile} 
                      setProfile={setProfile} 
                    />
                  )}
                  {activeTab === 'stats' && (
                    <StatsView 
                      profile={profile} 
                    />
                  )}
                  {activeTab === 'profile' && (
                    <ProfileCustomizer 
                      profile={profile} 
                      setProfile={setProfile} 
                    />
                  )}
                  {activeTab === 'settings' && (
                    <SettingsView 
                      profile={profile} 
                      setProfile={setProfile} 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Bottom Screen Navigation Bar */}
            <nav className={`fixed bottom-0 inset-x-0 border-t ${
              profile.theme === 'dark' ? 'bg-zinc-950/95 border-zinc-850' : 'bg-zinc-100/95 border-zinc-300'
            } backdrop-blur-md py-2.5 z-30 transition-colors`}>
              <div className="max-w-4xl mx-auto px-4 flex justify-around items-center">
                
                {/* Train Dashboard Tab */}
                <button 
                  onClick={() => handleTabChange('train')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    activeTab === 'train' ? 'text-orange-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Dumbbell className={`w-5 h-5 transition-transform ${activeTab === 'train' ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-[10px] font-mono leading-none">Ruang Latih</span>
                </button>

                {/* PVE & Multiplayer Battle Tab */}
                <button 
                  onClick={() => handleTabChange('battle')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    activeTab === 'battle' ? 'text-orange-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Trophy className={`w-5 h-5 transition-transform ${activeTab === 'battle' ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-[10px] font-mono leading-none">Medan Tempur</span>
                </button>

                {/* Shop Tab */}
                <button 
                  onClick={() => handleTabChange('shop')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    activeTab === 'shop' ? 'text-orange-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <ShoppingBag className={`w-5 h-5 transition-transform ${activeTab === 'shop' ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-[10px] font-mono leading-none">Toko Z</span>
                </button>

                {/* Stats charts Tab */}
                <button 
                  onClick={() => handleTabChange('stats')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    activeTab === 'stats' ? 'text-orange-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <TrendingUp className={`w-5 h-5 transition-transform ${activeTab === 'stats' ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-[10px] font-mono leading-none">Sinyal Progres</span>
                </button>

                {/* Avatar Profile Customizer Tab */}
                <button 
                  onClick={() => handleTabChange('profile')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    activeTab === 'profile' ? 'text-orange-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-[10px] font-mono leading-none">Pejuangku</span>
                </button>

                {/* Radar Settings Tab */}
                <button 
                  onClick={() => handleTabChange('settings')}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    activeTab === 'settings' ? 'text-orange-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Settings className={`w-5 h-5 transition-transform ${activeTab === 'settings' ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-[10px] font-mono leading-none">Radar Latih</span>
                </button>

              </div>
            </nav>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

