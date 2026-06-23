/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UserProfile } from '../types';
import { GRAVITY_CHAMBERS } from '../data';
import { exportToCSV, exportToPDF } from '../utils';
import { FileDown, Calendar, Award, Zap, TrendingUp, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsViewProps {
  profile: UserProfile;
}

export default function StatsView({ profile }: StatsViewProps) {
  const [selectedRange, setSelectedRange] = useState<'weekly' | 'monthly'>('weekly');

  const history = profile.history;

  // Calculate stats
  const totalRepsAllTime = history.reduce((sum, s) => sum + s.reps, 0);
  const totalSetsAllTime = history.length;
  const avgRepsPerSet = totalSetsAllTime > 0 ? Math.round(totalRepsAllTime / totalSetsAllTime) : 0;
  
  // Calculate average daily reps (over unique active days)
  const uniqueDates = Array.from(new Set(history.map(s => s.timestamp.substring(0, 10))));
  const avgRepsPerDay = uniqueDates.length > 0 ? Math.round(totalRepsAllTime / uniqueDates.length) : 0;

  // Process chart data for past 7 days (Weekly view)
  const getWeeklyChartData = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dataMap: { [key: string]: number } = {};
    
    // Seed past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoString = d.toISOString().substring(0, 10);
      dataMap[isoString] = 0;
    }

    // Accumulate actual history
    history.forEach(session => {
      const dateStr = session.timestamp.substring(0, 10);
      if (dataMap[dateStr] !== undefined) {
        dataMap[dateStr] += session.reps;
      }
    });

    // Formulate final format for Recharts
    return Object.keys(dataMap).map(dateStr => {
      const d = new Date(dateStr);
      const dayName = days[d.getDay()];
      return {
        tanggal: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        hari: dayName.substring(0, 3), // e.g. "Sen"
        'Repetisi Pushup': dataMap[dateStr],
        bp: Math.round(dataMap[dateStr] * 1.5)
      };
    });
  };

  const chartData = getWeeklyChartData();

  return (
    <div className="w-full text-slate-100 text-left">
      
      {/* Upper Cards grid */}
      <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        Analisis Latihan Gravitasi
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        
        <div className="bento-card p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Push-up</span>
          <span className="text-3xl font-mono font-black text-orange-500 mt-2">{totalRepsAllTime}</span>
          <span className="text-[9px] font-mono text-zinc-400 mt-1">Selesai sepanjang waktu</span>
        </div>

        <div className="bento-card p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Jumlah Set Latihan</span>
          <span className="text-3xl font-mono font-black text-amber-500 mt-2">{totalSetsAllTime}</span>
          <span className="text-[9px] font-mono text-zinc-400 mt-1">Set berhasil disimpan</span>
        </div>

        <div className="bento-card p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Rata-rata / Set</span>
          <span className="text-3xl font-mono font-black text-emerald-500 mt-2">{avgRepsPerSet}</span>
          <span className="text-[9px] font-mono text-zinc-400 mt-1">Push-up tiap set latihan</span>
        </div>

        <div className="bento-card p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Rata-rata Harian</span>
          <span className="text-3xl font-mono font-black text-blue-500 mt-2">{avgRepsPerDay}</span>
          <span className="text-[9px] font-mono text-zinc-400 mt-1">Berdasarkan hari aktif</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Weekly Chart center */}
        <div className="lg:col-span-8 bento-card orange-glow p-6 flex flex-col justify-between">
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-mono text-zinc-400 tracking-wider uppercase">Visualisasi Progres</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Grafik volume repetisi latihan per hari</p>
            </div>
            
            <div className="flex gap-1.5 p-1 bg-zinc-950 rounded-lg border border-zinc-850">
              <button 
                onClick={() => setSelectedRange('weekly')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  selectedRange === 'weekly' ? 'bg-orange-600 text-slate-100' : 'text-zinc-400 hover:text-slate-300'
                }`}
              >
                7 Hari Terakhir
              </button>
            </div>
          </div>

          {/* Recharts chart render area */}
          <div className="h-64 w-full bg-zinc-950 rounded-xl p-2 border border-zinc-850 flex items-center justify-center">
            {totalRepsAllTime === 0 ? (
              <div className="text-center p-6 text-zinc-500 font-mono text-xs">
                Belum ada data progres untuk divisualisasikan. <br />
                Ayo lengkapi set push-up pertamamu!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="hari" 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#f4f4f5', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#ea580c', fontSize: '12px' }}
                  />
                  <Bar 
                    dataKey="Repetisi Pushup" 
                    fill="#ea580c" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Export section under chart */}
          <div className="mt-6 p-4 bg-zinc-950 rounded-xl border border-zinc-850 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-left">
              <span className="text-xs font-mono text-zinc-400 block">Ekspor Progres Tempur</span>
              <p className="text-[10px] text-zinc-500 mt-1">Unduh latihanmu untuk rekam progres Capsule Corp</p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => exportToCSV(history)}
                className="flex-1 sm:flex-initial bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:text-slate-100 text-zinc-300 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                EKSPOR CSV
              </button>
              
              <button 
                onClick={() => exportToPDF(profile)}
                className="flex-1 sm:flex-initial bg-orange-600 hover:bg-orange-500 text-slate-100 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4 animate-bounce" />
                EKSPOR PDF
              </button>
            </div>
          </div>

        </div>

        {/* History sets table Right */}
        <div className="lg:col-span-4 bento-card p-6 flex flex-col">
          <h3 className="text-sm font-mono text-zinc-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <History className="w-4 h-4 text-orange-500" />
            Riwayat Set Latihan
          </h3>
          
          <div className="flex-1 min-h-[300px] max-h-[360px] overflow-y-auto pr-1 space-y-2">
            {history.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 font-mono text-xs text-center">
                Belum ada set push-up tercatat saat ini.
              </div>
            ) : (
              history.slice().reverse().map((session) => {
                const chamber = GRAVITY_CHAMBERS.find(c => c.id === session.chamberId) || GRAVITY_CHAMBERS[0];
                const date = new Date(session.timestamp);
                const showDate = date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
                const showTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div 
                    key={session.id}
                    className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center gap-2"
                  >
                    <div>
                      <span className="text-lg font-mono font-black text-slate-100">
                        {session.reps} reps
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 block leading-none mt-1">
                        ⏱️ Istirahat: {session.restTimeSec}s | {chamber.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-orange-500 font-mono block">
                        +{Math.round(session.reps * chamber.multiplier * 1.5)} BP
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 block leading-none mt-1">
                        {showDate} {showTime}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
        </div>

      </div>

    </div>
  );
}
