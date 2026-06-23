/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { PushUpSession, UserProfile, LeaderboardEntry } from './types';
import { CHARACTERS, GRAVITY_CHAMBERS } from './data';

// --- SOUND UTILITIES (Web Audio API) ---
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: 'beep' | 'powerup' | 'success' | 'levelup' | 'rest_done') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } 
    else if (type === 'powerup') {
      // Ascending pitch for Ki charge!
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 1.2);
      
      gain.gain.setValueAtTime(0.005, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } 
    else if (type === 'success') {
      // Fun ascending major triad
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);
        gain.gain.setValueAtTime(0.08, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.3);
      });
    } 
    else if (type === 'levelup') {
      // Big dramatic power-up / explosion of Ki
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(100, now);
      osc1.frequency.linearRampToValueAtTime(900, now + 1.5);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(102, now);
      osc2.frequency.linearRampToValueAtTime(905, now + 1.5);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);
    }
    else if (type === 'rest_done') {
      // Nice chime bells
      const freqs = [587.33, 659.25, 783.99, 880.00]; // D5, E5, G5, A5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    }
  } catch (e) {
    console.warn('Audio is blocked or not sustained:', e);
  }
}

// --- EXPORT TO CSV ---
export function exportToCSV(history: PushUpSession[]) {
  if (!history || history.length === 0) {
    alert('Log latihan kosong!');
    return;
  }

  const headers = ['ID', 'Sensasi Waktu/Tanggal', 'Jumlah Push-up (Reps)', 'Ruang Gravitasi', 'Istirahat (detik)', 'BP Dihasilkan'];
  
  const rows = history.map((session, index) => {
    const date = new Date(session.timestamp).toLocaleString('id-ID');
    const chamber = GRAVITY_CHAMBERS.find(c => c.id === session.chamberId);
    const chamberName = chamber ? `${chamber.name} (${chamber.gravityFactor}x)` : 'Biasa';
    const multiplier = chamber ? chamber.multiplier : 1.0;
    const bpEarned = Math.round(session.reps * multiplier * 1.5);
    
    return [
      index + 1,
      `"${date}"`,
      session.reps,
      `"${chamberName}"`,
      session.restTimeSec,
      bpEarned
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `DBZ_PushUp_Training_Log_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- EXPORT TO PDF ---
export function exportToPDF(profile: UserProfile) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('id-ID');
  
  // Header
  doc.setFillColor(234, 88, 12); // Orange #ea580c (Capsule Corp Orange)
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('KAPSEL KORP TRAINING REPORT', 14, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rencana Latihan Gravitasi - Dicetak: ${dateStr}`, 14, 28);
  
  // Profile Cards Block
  doc.setTextColor(17, 24, 39); // Deep Grey
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Daftar Profil Petarung:', 14, 52);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Character info
  const char = CHARACTERS.find(c => c.id === profile.characterId) || CHARACTERS[0];
  const activeT = char.transformations.slice().reverse().find(t => profile.battlePower >= t.threshold) || char.transformations[0];
  const chamber = GRAVITY_CHAMBERS.find(g => g.id === profile.currentGravityId) || GRAVITY_CHAMBERS[0];

  doc.text(`Nama Petarung: ${profile.name}`, 14, 60);
  doc.text(`Karakter Pilihan: ${char.name}`, 14, 66);
  doc.text(`Tingkat Transformasi: ${activeT.name} (${activeT.title})`, 14, 72);
  doc.text(`Kekuatan Tempur (Battle Power): ${profile.battlePower.toLocaleString('id-ID')} BP`, 14, 78);
  
  doc.text(`Z-Points: ${profile.zPoints} ZP`, 110, 60);
  doc.text(`Gaya Gravitasi Aktif: ${chamber.name} (${chamber.gravityFactor}x)`, 110, 66);
  doc.text(`Streak Latihan: ${profile.streak} Hari`, 110, 72);
  
  // Workout progress
  const todayReps = getTodayProgress(profile.history);
  doc.text(`Target Harian: ${profile.dailyTarget} Push-ups (Hari ini: ${todayReps})`, 110, 78);

  // Line Spacer
  doc.setDrawColor(229, 231, 235);
  doc.line(14, 85, 196, 85);
  
  // Statistics heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Riwayat Set Latihan:', 14, 96);
  
  // Columns Table
  doc.setFillColor(31, 41, 55); // Dark grey
  doc.rect(14, 102, 182, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('No', 18, 107.5);
  doc.text('Waktu / Tanggal', 30, 107.5);
  doc.text('Reps (Pushup)', 90, 107.5);
  doc.text('Ruang Gravitasi', 125, 107.5);
  doc.text('Istirahat', 175, 107.5);
  
  // Render Rows
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'normal');
  
  let yPos = 116;
  const recentHistory = profile.history.slice(-10).reverse(); // top 10 sessions

  if (recentHistory.length === 0) {
    doc.text('Belum ada riwayat tercatat. Silakan mulai push-up untuk mencatatkan progres!', 14, 116);
  } else {
    recentHistory.forEach((session, idx) => {
      if (yPos > 270) return; // Prevent overflow on simple single page
      
      const sChamber = GRAVITY_CHAMBERS.find(c => c.id === session.chamberId) || GRAVITY_CHAMBERS[0];
      const sDateStr = new Date(session.timestamp).toLocaleString('id-ID', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.text(`${idx + 1}`, 18, yPos);
      doc.text(sDateStr, 30, yPos);
      doc.text(`${session.reps} Reps`, 90, yPos);
      doc.text(`${sChamber.name} (${sChamber.gravityFactor}x)`, 125, yPos);
      doc.text(`${session.restTimeSec} Detik`, 175, yPos);
      
      // Divider
      doc.setDrawColor(243, 244, 246);
      doc.line(14, yPos + 3, 196, yPos + 3);
      yPos += 8;
    });
  }

  // Footer / Banner quote
  doc.setDrawColor(234, 88, 12);
  doc.line(14, 260, 196, 260);
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(75, 85, 99);
  doc.text('"Berlatihlah lebih keras daripada kemarin! Jangan takut gravity yang berat, tembuslah batas super saiyan-mu!"', 105, 268, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('KAPSEL KORP FIT - SON GOKU GRAVITY SYSTEM', 105, 275, { align: 'center' });
  
  doc.save(`DBZ_PushUp_Training_Report_${char.name.replace(' ', '_')}.pdf`);
}

export function getTodayProgress(history: PushUpSession[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return history
    .filter(s => s.timestamp.slice(0, 10) === today)
    .reduce((sum, s) => sum + s.reps, 0);
}

// Get standard list of leaderboard rivals containing actual user
export function getLeaderboard(profile: UserProfile): LeaderboardEntry[] {
  const userChar = CHARACTERS.find(c => c.id === profile.characterId) || CHARACTERS[0];
  const userTrans = userChar.transformations.slice().reverse().find(t => profile.battlePower >= t.threshold) || userChar.transformations[0];
  const totalUserPushUps = profile.history.reduce((sum, s) => sum + s.reps, 0);

  const rivals: Omit<LeaderboardEntry, 'rank'>[] = [
    { id: 'g_rival_1', name: 'Vegeta', characterId: 'vegeta', transformationName: 'Ultra Ego', battlePower: 260000, totalPushUps: 1850 },
    { id: 'g_rival_2', name: 'Gohan', characterId: 'gohan', transformationName: 'Gohan Beast', battlePower: 245000, totalPushUps: 1400 },
    { id: 'g_rival_3', name: 'Krillin', characterId: 'goku', transformationName: 'Earthling Trainer', battlePower: 800, totalPushUps: 650 },
    { id: 'g_rival_4', name: 'Piccolo', characterId: 'piccolo', transformationName: 'Orange Piccolo', battlePower: 125000, totalPushUps: 1350 },
    { id: 'g_rival_5', name: 'Future Trunks', characterId: 'trunks', transformationName: 'Super Saiyan Rage', battlePower: 85000, totalPushUps: 900 },
    { id: 'g_rival_6', name: 'Tien Shinhan', characterId: 'piccolo', transformationName: 'Base Form', battlePower: 1200, totalPushUps: 800 },
    { id: 'g_rival_7', name: 'Yamcha', characterId: 'goku', transformationName: 'Base Form', battlePower: 120, totalPushUps: 15 },
    { id: 'g_rival_8', name: 'Master Roshi', characterId: 'goku', transformationName: 'Kaio-Ken Elite', battlePower: 4500, totalPushUps: 450 },
    { id: 'user', name: profile.name || 'Petarung Baru', characterId: profile.characterId, transformationName: userTrans.name, battlePower: profile.battlePower, totalPushUps: totalUserPushUps, isCurrentUser: true }
  ];

  // Sort by battle power descending
  return rivals
    .sort((a, b) => b.battlePower - a.battlePower)
    .map((rival, index) => ({
      ...rival,
      rank: index + 1
    }));
}
