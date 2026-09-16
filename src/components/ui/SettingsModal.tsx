'use client';
// APEX MOTO RUSH — Game Settings Modal
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { soundManager } from '@/game/audio/SoundManager';
import { saveGame, SAVE_VERSION, LevelResult, GameSave } from '@/storage/saveManager';
import { ALL_LEVEL_IDS } from '@/data/levels';
import { DEFAULT_BIKE_ID } from '@/data/bikes';

export const SettingsModal: React.FC = () => {
  const { save, updateSettings, setSave, navigate } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const toggleVibration = () => {
    soundManager.playClick();
    updateSettings({ vibrationEnabled: !save.settings.vibrationEnabled });
  };

  const setQuality = (q: 'low' | 'medium' | 'high') => {
    soundManager.playClick();
    updateSettings({ quality: q });
  };

  const handleResetSave = () => {
    soundManager.playCrash();
    const levels: Record<string, LevelResult> = {};
    ALL_LEVEL_IDS.forEach((id) => {
      levels[id] = { completed: false, stars: 0, bestTimeMs: 0, bestScore: 0, bestCombo: 0, attempts: 0 };
    });
    const freshSave: GameSave = {
      version: SAVE_VERSION,
      saveDate: new Date().toISOString(),
      selectedBike: DEFAULT_BIKE_ID,
      unlockedBikes: [DEFAULT_BIKE_ID],
      levels,
      settings: { ...save.settings },
      statistics: {
        totalLevelsCompleted: 0,
        totalStars: 0,
        totalCrashes: 0,
        totalStunts: 0,
        highestComboMultiplier: 1,
        totalDistanceMeters: 0,
        bikesUnlocked: 1,
        totalPlayTimeMs: 0,
        backflipsCompleted: 0,
        frontflipsCompleted: 0,
      },
      tutorialCompleted: false,
    };
    saveGame(freshSave);
    setSave(freshSave);
    setShowResetConfirm(false);
  };

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
            SETTINGS & PREFERENCES
          </h2>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-6 py-8 overflow-y-auto space-y-6">
        {/* Audio Preferences */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4 backdrop-blur-md">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            AUDIO ENGINE
          </h3>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/60">
            <div>
              <div className="font-bold text-sm text-zinc-200">Sound Effects (SFX)</div>
              <div className="text-xs text-zinc-500">Engine roar, brakes, jumps, crashes, stunts</div>
            </div>
            <button
              onClick={toggleSound}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                save.settings.soundEnabled
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {save.settings.soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-bold text-sm text-zinc-200">Music (BGM)</div>
              <div className="text-xs text-zinc-500">Cyber ambient synth pulse bassline</div>
            </div>
            <button
              onClick={toggleMusic}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                save.settings.musicEnabled
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {save.settings.musicEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </section>

        {/* Gameplay & Visuals */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4 backdrop-blur-md">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            GRAPHICS & HAPTICS
          </h3>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/60">
            <div>
              <div className="font-bold text-sm text-zinc-200">Haptic Vibration</div>
              <div className="text-xs text-zinc-500">Vibrate on mobile stunt landing and crashes</div>
            </div>
            <button
              onClick={toggleVibration}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                save.settings.vibrationEnabled
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {save.settings.vibrationEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-bold text-sm text-zinc-200">Rendering Profile</div>
              <div className="text-xs text-zinc-500">Canvas particle density and detail</div>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-all ${
                    save.settings.quality === q
                      ? 'bg-zinc-700 text-amber-400 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Save Data Management */}
        <section className="rounded-2xl border border-red-950/60 bg-red-950/20 p-5 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
            DANGER ZONE
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-zinc-200">Reset All Career Progress</div>
              <div className="text-xs text-zinc-500">Clears stars, bike unlocks, records and restarts fresh</div>
            </div>
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetSave}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-colors"
                >
                  CONFIRM
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-mono"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-1.5 rounded-lg border border-red-800/80 bg-red-900/30 hover:bg-red-900/60 text-red-300 font-mono text-xs font-bold transition-colors"
              >
                RESET DATA
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 border-t border-zinc-900 bg-zinc-950/80 text-zinc-500 text-xs text-center font-mono">
        All settings are saved automatically to your device.
      </footer>
    </div>
  );
};
