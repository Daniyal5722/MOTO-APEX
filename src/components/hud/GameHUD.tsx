'use client';
// APEX MOTO RUSH — Game HUD
import { useEffect, useState } from 'react';
import { GameEngineState } from '@/game/GameEngine';

interface GameHUDProps {
  engineState: GameEngineState | null;
  levelName: string;
  levelNumber: number;
  onPause: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const centis = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
}

function StuntPopup({ message, points }: { message: string; points: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(t);
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div className="absolute top-28 inset-x-0 flex flex-col items-center pointer-events-none z-20 animate-pulse">
      <div
        className="text-3xl font-black tracking-widest text-yellow-300 drop-shadow-lg"
        style={{ textShadow: '0 0 20px rgba(245, 197, 24, 0.8), 0 2px 4px rgba(0,0,0,0.8)', fontFamily: 'Barlow Condensed, sans-serif' }}
      >
        {message}
      </div>
      <div
        className="text-xl font-bold text-orange-300 mt-1"
        style={{ textShadow: '0 0 12px rgba(232, 86, 10, 0.8)' }}
      >
        +{points.toLocaleString()}
      </div>
    </div>
  );
}

export function GameHUD({ engineState, levelName, levelNumber, onPause }: GameHUDProps) {
  const state = engineState;
  const stuntEvent = state?.stuntEvents?.[0];

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {/* Top Bar */}
      <div
        className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
      >
        {/* Level info */}
        <div className="flex flex-col">
          <span className="text-[10px] text-orange-400 font-bold tracking-widest uppercase opacity-80">Level {levelNumber}</span>
          <span className="text-white text-sm font-bold tracking-wide" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            {levelName}
          </span>
        </div>

        {/* Timer */}
        <div className="text-center">
          <div
            className="text-2xl font-black text-white tabular-nums tracking-wider"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', textShadow: '0 0 10px rgba(232,86,10,0.6)' }}
          >
            {formatTime(state?.elapsedTimeMs ?? 0)}
          </div>
        </div>

        {/* Pause button */}
        <button
          aria-label="Pause game"
          onClick={onPause}
          className="pointer-events-auto w-11 h-11 rounded-xl bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold active:scale-90 transition-transform"
        >
          ⏸
        </button>
      </div>

      {/* Score + Combo */}
      <div className="absolute top-16 left-4 flex flex-col gap-1 mt-1">
        <div
          className="text-xl font-black text-white tabular-nums"
          style={{ fontFamily: 'Barlow Condensed, sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
        >
          {(state?.score ?? 0).toLocaleString()}
        </div>
        {(state?.multiplier ?? 1) > 1 && (
          <div
            className="text-sm font-bold text-yellow-300 animate-pulse"
            style={{ textShadow: '0 0 8px rgba(245, 197, 24, 0.6)' }}
          >
            ×{state?.multiplier} COMBO
          </div>
        )}
      </div>

      {/* Stunt popup */}
      {stuntEvent && (
        <StuntPopup
          key={stuntEvent.name + (state?.elapsedTimeMs ?? 0)}
          message={stuntEvent.name}
          points={stuntEvent.points * (state?.multiplier ?? 1)}
        />
      )}

      {/* Air rotation indicator */}
      {state?.bike.isInAir && (
        <div className="absolute top-28 right-4 text-right">
          <div className="text-xs text-orange-300 font-bold tracking-wider opacity-70">IN AIR</div>
        </div>
      )}
    </div>
  );
}
