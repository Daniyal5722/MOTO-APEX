'use client';
// APEX MOTO RUSH — Level Select Screen
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { WORLDS, WorldId, getWorldLevels } from '@/data/levels';
import { getTotalStars, isLevelUnlocked } from '@/storage/saveManager';
import { soundManager } from '@/game/audio/SoundManager';

export const LevelSelectModal: React.FC = () => {
  const { save, navigate, startLevel } = useGameStore();
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>('desert-canyon');

  const totalStars = getTotalStars(save);
  const currentLevels = getWorldLevels(selectedWorldId);

  const formatTime = (ms: number) => {
    if (!ms || ms === 0) return '--:--.--';
    const totalSecs = ms / 1000;
    const mins = Math.floor(totalSecs / 60);
    const secs = (totalSecs % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
  };

  const handleSelectLevel = (levelId: string, unlocked: boolean) => {
    if (!unlocked) {
      soundManager.playBrake();
      return;
    }
    soundManager.playClick();
    startLevel(levelId);
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Background styling */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-600/10 via-zinc-950 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundManager.playClick();
              navigate('menu');
            }}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-sm transition-colors flex items-center gap-1.5"
          >
            ◀ BACK
          </button>
          <h2 className="text-2xl font-black italic tracking-wide text-white uppercase">
            SELECT LEVEL
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/80 border border-amber-500/30 px-4 py-1.5 rounded-full">
          <span className="text-amber-400 text-base">★</span>
          <span className="font-mono font-bold text-amber-300 text-sm">{totalStars}</span>
          <span className="text-xs text-zinc-500 font-mono">STARS</span>
        </div>
      </header>

      {/* World Tabs */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-6 pt-6">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 overflow-x-auto">
          {WORLDS.map((world) => {
            const isSelected = world.id === selectedWorldId;
            return (
              <button
                key={world.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedWorldId(world.id);
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span>{world.name}</span>
                <span className="text-xs opacity-75 font-mono">({world.subtitle})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level Cards Grid */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-6 py-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentLevels.map((lvl, index) => {
            const unlocked = isLevelUnlocked(save, lvl.id, index);
            const levelResult = save.levels[lvl.id];
            const stars = levelResult?.stars ?? 0;
            const bestTime = levelResult?.bestTimeMs ?? 0;

            return (
              <div
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.id, unlocked)}
                className={`relative group rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                  unlocked
                    ? 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-850 hover:border-amber-500/60 cursor-pointer shadow-lg hover:shadow-amber-500/10 active:scale-[0.98]'
                    : 'border-zinc-900 bg-zinc-950/60 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-500">
                      LEVEL {lvl.levelNumber}
                    </span>
                    {unlocked ? (
                      <div className="flex items-center gap-1 text-base">
                        {[1, 2, 3].map((starIdx) => (
                          <span
                            key={starIdx}
                            className={starIdx <= stars ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' : 'text-zinc-700'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-xs font-mono">🔒 LOCKED</span>
                    )}
                  </div>

                  <h4 className="text-lg font-black italic tracking-wide text-zinc-100 group-hover:text-amber-400 transition-colors">
                    {lvl.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{lvl.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="text-zinc-500">
                    BEST: <span className="text-zinc-300 font-bold">{formatTime(bestTime)}</span>
                  </div>

                  {unlocked ? (
                    <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                      PLAY ▶
                    </span>
                  ) : (
                    <span className="text-zinc-600">Complete prev</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Hint */}
      <footer className="relative z-10 px-6 py-3 border-t border-zinc-900 bg-zinc-950/80 text-zinc-500 text-xs text-center font-mono">
        Earn 3 stars on levels by beating target times and landing massive stunt combos!
      </footer>
    </div>
  );
};
