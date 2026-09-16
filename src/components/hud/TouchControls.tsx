'use client';
// APEX MOTO RUSH — Mobile-First Touch Controls Component
// Ergonomically designed cluster: Left (Lean Back, Lean Fwd, Brake), Right (Jump, Gas).
// Zero overlap across all screen sizes, pointer capture, and immediate tactile visual feedback.

import React, { useCallback, useEffect } from 'react';
import { inputManager } from '@/game/input/InputManager';

interface TouchButtonProps {
  label: string;
  icon: React.ReactNode;
  inputKey: 'accelerate' | 'brake' | 'rotateBack' | 'rotateFront' | 'jump';
  className?: string;
}

function TouchButton({ label, icon, inputKey, className = '' }: TouchButtonProps) {
  const setInput = useCallback((val: boolean) => {
    switch (inputKey) {
      case 'accelerate': inputManager.setTouchAccelerate(val); break;
      case 'brake': inputManager.setTouchBrake(val); break;
      case 'rotateBack': inputManager.setTouchRotateBack(val); break;
      case 'rotateFront': inputManager.setTouchRotateFront(val); break;
      case 'jump': inputManager.setTouchJump(val); break;
    }
  }, [inputKey]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setInput(true);
  }, [setInput]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setInput(false);
  }, [setInput]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setInput(false);
  }, [setInput]);

  return (
    <button
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      className={`
        select-none touch-none
        flex flex-col items-center justify-center
        rounded-2xl font-black italic tracking-wider
        shadow-lg backdrop-blur-md border
        active:scale-90 transition-all duration-75
        ${className}
      `}
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      <span className="text-xl sm:text-2xl leading-none drop-shadow">{icon}</span>
      <span className="text-[10px] sm:text-xs mt-1 leading-none uppercase font-mono">{label}</span>
    </button>
  );
}

interface TouchControlsProps {
  onPause: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = () => {
  useEffect(() => {
    return () => {
      inputManager.clearAllTouch();
    };
  }, []);

  return (
    <div
      className="absolute inset-x-0 bottom-0 flex items-end justify-between px-3 sm:px-6 pointer-events-none z-30"
      style={{
        paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
      }}
    >
      {/* Left Cluster: Tilt & Brake */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Tilt row */}
        <div className="flex gap-2">
          <TouchButton
            label="BACK"
            icon="↺"
            inputKey="rotateBack"
            className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-900/80 border-zinc-750 text-zinc-200 active:bg-zinc-700"
          />
          <TouchButton
            label="FWD"
            icon="↻"
            inputKey="rotateFront"
            className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-900/80 border-zinc-750 text-zinc-200 active:bg-zinc-700"
          />
        </div>
        {/* Brake row */}
        <TouchButton
          label="BRAKE"
          icon="◀"
          inputKey="brake"
          className="w-[120px] sm:w-[136px] h-12 sm:h-14 bg-red-950/70 border-red-500/50 text-red-300 active:bg-red-900/90 shadow-red-950/40"
        />
      </div>

      {/* Right Cluster: Dedicated Jump + Gas */}
      <div className="flex flex-col gap-2 items-end pointer-events-auto">
        {/* Jump Button */}
        <TouchButton
          label="JUMP"
          icon="⤊"
          inputKey="jump"
          className="w-16 h-14 sm:w-20 sm:h-16 bg-gradient-to-t from-amber-600/90 to-yellow-500/90 border-yellow-300 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] active:brightness-125"
        />
        {/* Gas Button */}
        <TouchButton
          label="GAS"
          icon="▶"
          inputKey="accelerate"
          className="w-[120px] sm:w-[136px] h-14 sm:h-16 bg-gradient-to-r from-orange-600 to-amber-500 border-amber-400/80 text-black shadow-[0_0_20px_rgba(234,88,12,0.45)] active:brightness-125 font-black text-sm"
        />
      </div>
    </div>
  );
};
