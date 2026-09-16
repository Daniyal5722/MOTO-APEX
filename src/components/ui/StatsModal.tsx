'use client';
// APEX MOTO RUSH — Career Statistics Screen
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { getTotalStars, getCompletedLevels } from '@/storage/saveManager';
import { soundManager } from '@/game/audio/SoundManager';

export const StatsModal: React.FC = () => {
  const { save, navigate } = useGameStore();
  const totalStars = getTotalStars(save);
  const completedLevels = getCompletedLevels(save);
  const stats = save.statistics;

  const statCards = [
    { label: 'TOTAL STARS', value: `${totalStars} / 45`, icon: '★', color: 'text-amber-400' },
    { label: 'LEVELS BEATEN', value: `${completedLevels} / 15`, icon: '🏁', color: 'text-emerald-400' },
    { label: 'BIKES UNLOCKED', value: `${save.unlockedBikes.length} / 5`, icon: '🏍️', color: 'text-blue-400' },
    { label: 'TOTAL STUNTS', value: stats.totalStunts.toLocaleString(), icon: '✨', color: 'text-purple-400' },
    { label: 'BACKFLIPS', value: stats.backflipsCompleted.toLocaleString(), icon: '🔄', color: 'text-pink-400' },
    { label: 'FRONTFLIPS', value: stats.frontflipsCompleted.toLocaleString(), icon: '🔂', color: 'text-indigo-400' },
    { label: 'PEAK COMBO', value: `${stats.highestComboMultiplier}x`, icon: '🔥', color: 'text-orange-400' },
    { label: 'TOTAL WIPEOUTS', value: stats.totalCrashes.toLocaleString(), icon: '💥', color: 'text-red-400' },
  ];

  return (
    <div className="relative w-full h-screen bg-zinc-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-black pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundManager.playClick();
              navigate('menu');
            }}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-sm transition-colors flex items-center gap-1.5"
          >
            ◀ MENU
          </button>
          <h2 className="text-2xl font-black italic tracking-wide text-white uppercase">
            CAREER RECORDS & STATS
          </h2>
        </div>
      </header>

      {/* Stats Grid */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-6 py-8 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-between backdrop-blur-md shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{card.icon}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  {card.label}
                </span>
              </div>
              <div className={`text-2xl font-black font-mono tracking-tight ${card.color}`}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 border-t border-zinc-900 bg-zinc-950/80 text-zinc-500 text-xs text-center font-mono">
        Rider Career Profile • Data synced across sessions
      </footer>
    </div>
  );
};
