'use client';
// APEX MOTO RUSH — Pause Menu Modal
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { soundManager } from '@/game/audio/SoundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onRestartLevel: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestartCheckpoint,
  onRestartLevel,
  onQuit,
}) => {
  const { save, updateSettings } = useGameStore();

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
    <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900/95 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-500">
            SESSION SUSPENDED
          </span>
          <h2 className="text-3xl font-black italic text-white uppercase tracking-wider">
            GAME PAUSED
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black italic tracking-wide text-base shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95"
          >
            RESUME RACE ▶
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestartCheckpoint();
            }}
            className="w-full py-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🚩</span> RESTART CHECKPOINT
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestartLevel();
            }}
            className="w-full py-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🔄</span> RESTART LEVEL
          </button>
        </div>

        {/* Quick Audio Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={toggleSound}
            className={`py-2 rounded-lg border text-xs font-mono transition-all ${
              save.settings.soundEnabled
                ? 'border-zinc-700 bg-zinc-800 text-zinc-300'
                : 'border-red-900 bg-red-950/40 text-red-400'
            }`}
          >
            {save.settings.soundEnabled ? '🔊 SFX ON' : '🔇 SFX OFF'}
          </button>
          <button
            onClick={toggleMusic}
            className={`py-2 rounded-lg border text-xs font-mono transition-all ${
              save.settings.musicEnabled
                ? 'border-zinc-700 bg-zinc-800 text-zinc-300'
                : 'border-red-900 bg-red-950/40 text-red-400'
            }`}
          >
            {save.settings.musicEnabled ? '🎵 BGM ON' : '🔇 BGM OFF'}
          </button>
        </div>

        {/* Exit Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onQuit();
          }}
          className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-red-400 hover:border-red-900/40 text-xs font-mono transition-all"
        >
          QUIT TO MENU
        </button>
      </div>
    </div>
  );
};
