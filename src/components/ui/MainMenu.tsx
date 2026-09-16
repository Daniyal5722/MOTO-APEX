'use client';
// APEX MOTO RUSH — High-Octane Main Menu
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { getBike } from '@/data/bikes';
import { LEVELS } from '@/data/levels';
import { getTotalStars } from '@/storage/saveManager';
import { soundManager } from '@/game/audio/SoundManager';
import { BikeViewer3D } from '@/components/garage/BikeViewer3D';

export const MainMenu: React.FC = () => {
  const { save, currentBikeId, navigate, startLevel, updateSettings } = useGameStore();
  const currentBike = getBike(currentBikeId);
  const totalStars = getTotalStars(save);

  // Find next playable level
  const getNextPlayableLevel = () => {
    for (const lvl of LEVELS) {
      if (!save.levels[lvl.id]?.completed) {
        return lvl.id;
      }
    }
    return LEVELS[0].id;
  };

  const handleQuickPlay = () => {
    soundManager.playClick();
    startLevel(getNextPlayableLevel());
  };

  const toggleSound = () => {
    soundManager.playClick();
    const newSound = !save.settings.soundEnabled;
    soundManager.setSoundEnabled(newSound);
    updateSettings({ soundEnabled: newSound });
  };

  const toggleMusic = () => {
    soundManager.playClick();
    const newMusic = !save.settings.musicEnabled;
    soundManager.setMusicEnabled(newMusic);
    updateSettings({ musicEnabled: newMusic });
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Background Ambience / Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            ⚡
          </div>
          <div>
            <span className="font-black italic tracking-wider text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
              APEX MOTO
            </span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              RUSH
            </span>
          </div>
        </div>

        {/* Header Stats & Quick Toggles */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-inner">
            <span className="text-amber-400 text-base">★</span>
            <span className="font-mono font-bold text-amber-300 text-sm">{totalStars}</span>
            <span className="text-xs text-zinc-500 font-mono">/ 45</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              title="Toggle SFX"
              className={`p-2 rounded-lg border transition-all text-xs font-mono flex items-center gap-1 ${
                save.settings.soundEnabled
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'border-red-900/60 bg-red-950/40 text-red-400'
              }`}
            >
              {save.settings.soundEnabled ? '🔊 SFX' : '🔇 SFX'}
            </button>
            <button
              onClick={toggleMusic}
              title="Toggle Music"
              className={`p-2 rounded-lg border transition-all text-xs font-mono flex items-center gap-1 ${
                save.settings.musicEnabled
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'border-red-900/60 bg-red-950/40 text-red-400'
              }`}
            >
              {save.settings.musicEnabled ? '🎵 BGM' : '🔇 BGM'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Center Area: 3D Bike Feature & Action Menu */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 px-6 lg:px-12 py-4 max-w-7xl mx-auto w-full">
        {/* Left Column: Game Title, Hero Callouts & Main Buttons */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Physics Stunt Racing
            </div>
            <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tight text-white leading-none">
              DEFY <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
                GRAVITY.
              </span>
            </h1>
            <p className="mt-3 text-zinc-400 text-sm max-w-md">
              Master balance, execute precision flips, conquer moving obstacles, and smash world records across 3 extreme racing biomes.
            </p>
          </div>

          {/* Core Action Buttons */}
          <div className="flex flex-col gap-3 max-w-sm">
            <button
              onClick={handleQuickPlay}
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] active:scale-[0.98]"
            >
              <div className="px-6 py-4 rounded-[10px] bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-between font-black italic tracking-wide text-lg text-black group-hover:from-amber-400 group-hover:to-orange-500 transition-colors">
                <span>RACE NOW</span>
                <span className="text-2xl group-hover:translate-x-1.5 transition-transform duration-200">▶</span>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  soundManager.playClick();
                  navigate('levelSelect');
                }}
                className="px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 font-bold text-sm tracking-wide transition-all hover:border-zinc-500 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🏁</span> LEVELS
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  navigate('garage');
                }}
                className="px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 font-bold text-sm tracking-wide transition-all hover:border-zinc-500 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🏍️</span> GARAGE
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  soundManager.playClick();
                  navigate('settings');
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-medium text-xs tracking-wider transition-all"
              >
                ⚙ SETTINGS
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  navigate('statistics');
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-medium text-xs tracking-wider transition-all"
              >
                📊 STATS
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Interactive Bike Showcase */}
        <div className="lg:col-span-7 h-72 sm:h-96 lg:h-[480px] relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-black/80 backdrop-blur-md overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
          {/* Active Bike Info Overlay */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-xs font-mono tracking-widest text-amber-500 uppercase">
                Tier {currentBike.tier} Machine
              </span>
              <h3 className="text-2xl font-black italic text-white tracking-wide">
                {currentBike.name}
              </h3>
              <p className="text-xs text-zinc-400 italic mt-0.5">{currentBike.tagline}</p>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                navigate('garage');
              }}
              className="text-xs font-mono font-bold text-amber-400 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              CHANGE BIKE ➔
            </button>
          </div>

          {/* Three.js 3D Viewer */}
          <div className="absolute inset-0 z-0">
            <BikeViewer3D bike={currentBike} />
          </div>

          {/* Quick Stat Badges */}
          <div className="relative z-10 grid grid-cols-4 gap-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-2.5 rounded-xl">
            <div>
              <div className="text-[10px] text-zinc-500 font-mono">SPEED</div>
              <div className="font-bold text-xs text-zinc-200">{currentBike.stats.speed}/10</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-mono">ACCEL</div>
              <div className="font-bold text-xs text-zinc-200">{currentBike.stats.acceleration}/10</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-mono">AGILITY</div>
              <div className="font-bold text-xs text-zinc-200">{currentBike.stats.airControl}/10</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-mono">CONTROL</div>
              <div className="font-bold text-xs text-zinc-200">{currentBike.stats.handling}/10</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Controls reminder */}
      <footer className="relative z-10 px-6 py-3 border-t border-zinc-900 bg-zinc-950/80 text-zinc-500 text-xs flex flex-wrap items-center justify-between font-mono">
        <div className="flex items-center gap-4">
          <span>🎮 [D / ➔] Accelerate</span>
          <span>[A / ⬅] Brake</span>
          <span>[W / ⬆] Lean Back</span>
          <span>[S / ⬇] Lean Forward</span>
          <span>[R] Respawn</span>
        </div>
        <div className="text-zinc-600">v2.0 • Cross-Platform Web & Mobile</div>
      </footer>
    </div>
  );
};
