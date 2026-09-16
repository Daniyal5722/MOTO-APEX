'use client';
// APEX MOTO RUSH — Crash Screen Overlay
import React, { useEffect } from 'react';
import { soundManager } from '@/game/audio/SoundManager';

interface CrashModalProps {
  onRespawn: () => void;
  onRestartLevel: () => void;
  onQuit: () => void;
  hasCheckpoint: boolean;
}

export const CrashModal: React.FC<CrashModalProps> = ({
  onRespawn,
  onRestartLevel,
  onQuit,
  hasCheckpoint,
}) => {
  // Listen for 'R' key to instantly respawn
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
        soundManager.playClick();
        onRespawn();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRespawn]);

  return (
    <div className="absolute inset-0 z-50 bg-red-950/40 backdrop-blur-sm flex items-center justify-center p-4 select-none font-sans">
      <div className="relative w-full max-w-sm rounded-2xl border border-red-500/40 bg-zinc-950/90 p-6 shadow-[0_0_40px_rgba(239,68,68,0.3)] text-center space-y-5 animate-in zoom-in-95 duration-100">
        <div className="space-y-1">
          <div className="inline-block p-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-3xl mb-1 animate-bounce">
            💥
          </div>
          <h2 className="text-4xl font-black italic text-red-500 uppercase tracking-wider drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
            WIPEOUT!
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Rider lost balance • Physics impact critical
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onRespawn();
            }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black italic tracking-wide text-base shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>⚡</span> {hasCheckpoint ? 'RESPAWN CHECKPOINT' : 'TRY AGAIN'}
            <span className="text-xs opacity-75 font-mono ml-1">[R / SPACE]</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestartLevel();
            }}
            className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-bold text-xs tracking-wider transition-all"
          >
            RESTART FROM START
          </button>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onQuit();
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
        >
          QUIT TO MENU
        </button>
      </div>
    </div>
  );
};
