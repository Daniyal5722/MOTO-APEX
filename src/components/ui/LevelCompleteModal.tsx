'use client';
// APEX MOTO RUSH — Level Complete Victory Modal
import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getLevel, LEVELS } from '@/data/levels';
import { soundManager } from '@/game/audio/SoundManager';

interface LevelCompleteModalProps {
  onNextLevel: () => void;
  onRetry: () => void;
  onLevelSelect: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  onNextLevel,
  onRetry,
  onLevelSelect,
}) => {
  const {
    currentLevelId,
    levelResultStars,
    levelResultTime,
    levelResultScore,
    levelResultCombo,
    levelResultStunts,
  } = useGameStore();

  const [revealedStars, setRevealedStars] = useState<number>(0);
  const currentLevel = currentLevelId ? getLevel(currentLevelId) : null;

  // Staggered star reveal animations & sound effects
  useEffect(() => {
    soundManager.playVictory();

    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i <= levelResultStars; i++) {
      timers.push(
        setTimeout(() => {
          setRevealedStars(i);
          soundManager.playStar(i - 1);
        }, 500 + i * 400)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [levelResultStars]);

  const formatTime = (ms: number) => {
    const totalSecs = ms / 1000;
    const mins = Math.floor(totalSecs / 60);
    const secs = (totalSecs % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
  };

  // Check if there is a next level
  const currentIdx = LEVELS.findIndex((l) => l.id === currentLevelId);
  const hasNext = currentIdx >= 0 && currentIdx < LEVELS.length - 1;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/40 bg-zinc-950/95 p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Title */}
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            CHALLENGE CONQUERED
          </span>
          <h2 className="text-3xl font-black italic text-white uppercase tracking-wide">
            {currentLevel ? currentLevel.name : 'LEVEL FINISHED'}
          </h2>
        </div>

        {/* 3 Animated Stars Display */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= revealedStars;
            return (
              <div
                key={starIdx}
                className={`text-5xl transition-all duration-300 transform ${
                  isEarned
                    ? 'text-amber-400 scale-125 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)] animate-bounce'
                    : 'text-zinc-800 scale-90'
                }`}
              >
                ★
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl font-mono text-left">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">FINAL TIME</div>
            <div className="text-lg font-bold text-amber-300">
              {formatTime(levelResultTime)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">TOTAL SCORE</div>
            <div className="text-lg font-bold text-zinc-100">
              {levelResultScore.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">MAX COMBO</div>
            <div className="text-sm font-bold text-emerald-400">
              {levelResultCombo}x MULTIPLIER
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">STUNTS LANDED</div>
            <div className="text-sm font-bold text-purple-400">
              {levelResultStunts} STUNTS
            </div>
          </div>
        </div>

        {/* Target Time Comparison */}
        {currentLevel && (
          <div className="text-xs font-mono text-zinc-500 flex justify-around border-t border-zinc-900 pt-2">
            <span>★ 3-Star: &lt;{currentLevel.starThresholds.three}s</span>
            <span>★ 2-Star: &lt;{currentLevel.starThresholds.two}s</span>
            <span>★ 1-Star: &lt;{currentLevel.starThresholds.one}s</span>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {hasNext ? (
            <button
              onClick={() => {
                soundManager.playClick();
                onNextLevel();
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black italic tracking-wide text-base shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              NEXT LEVEL ➔
            </button>
          ) : (
            <div className="text-xs font-mono text-amber-400 py-1 font-bold">
              🏆 ALL LEVELS COMPLETED! YOU ARE AN APEX CHAMPION!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                soundManager.playClick();
                onRetry();
              }}
              className="py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs tracking-wider transition-all"
            >
              🔄 RETRY
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onLevelSelect();
              }}
              className="py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs tracking-wider transition-all"
            >
              🏁 LEVEL SELECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
