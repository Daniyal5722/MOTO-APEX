'use client';
// APEX MOTO RUSH — 3D Motorcycle Garage & Customization
import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { BIKES, BikeId, getBike } from '@/data/bikes';
import { getTotalStars, getCompletedLevels, unlockBike } from '@/storage/saveManager';
import { soundManager } from '@/game/audio/SoundManager';
import { BikeViewer3D } from '@/components/garage/BikeViewer3D';

export const GarageModal: React.FC = () => {
  const { save, currentBikeId, selectBike, navigate, setSave } = useGameStore();
  const [selectedPreviewId, setSelectedPreviewId] = useState<BikeId>(currentBikeId);

  const previewBike = getBike(selectedPreviewId);
  const isCurrentlySelected = selectedPreviewId === currentBikeId;
  const totalStars = getTotalStars(save);
  const completedLevels = getCompletedLevels(save);

  // Check if preview bike is unlocked
  const isUnlocked = (() => {
    if (save.unlockedBikes.includes(selectedPreviewId)) return true;
    const cond = previewBike.unlock;
    if (cond.type === 'default') return true;
    if (cond.type === 'stars' && totalStars >= (cond.value ?? 0)) return true;
    if (cond.type === 'levels' && completedLevels >= (cond.value ?? 0)) return true;
    return false;
  })();

  const handleSelectBike = (bikeId: BikeId) => {
    soundManager.playClick();
    setSelectedPreviewId(bikeId);
  };

  const handleEquipBike = () => {
    if (!isUnlocked) {
      soundManager.playBrake();
      return;
    }
    soundManager.playStunt(2);
    // Ensure it's in unlocked list in save
    let updatedSave = save;
    if (!save.unlockedBikes.includes(selectedPreviewId)) {
      updatedSave = unlockBike(save, selectedPreviewId);
      setSave(updatedSave);
    }
    selectBike(selectedPreviewId);
  };

  const renderStatBar = (label: string, value: number, max: number = 10, color: string) => {
    const pct = Math.min(Math.max((value / max) * 100, 5), 100);
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-zinc-400">{label}</span>
          <span className="font-bold text-zinc-200">{value} / {max}</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Background radial glow matching bike primary color */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(circle at 60% 40%, ${previewBike.colors.bodyPrimary}, transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Bar */}
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
            3D MOTORCYCLE GARAGE
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/80 border border-amber-500/30 px-4 py-1.5 rounded-full">
          <span className="text-amber-400">★</span>
          <span className="font-mono font-bold text-amber-300 text-sm">{totalStars}</span>
          <span className="text-xs text-zinc-500 font-mono">STARS EARNED</span>
        </div>
      </header>

      {/* Main Garage Layout: 3D Turntable on Left/Center, Detailed Specs & Unlock on Right */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto w-full items-center overflow-y-auto">
        {/* 3D Turntable Viewport */}
        <div className="lg:col-span-7 h-72 sm:h-96 lg:h-[500px] relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-black/90 backdrop-blur-md overflow-hidden flex flex-col justify-between p-5 shadow-2xl">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-xs font-mono tracking-widest uppercase px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
                TIER {previewBike.tier} PROTO-SPEC
              </span>
              <h3 className="text-3xl font-black italic text-white tracking-wide mt-2">
                {previewBike.name}
              </h3>
              <p className="text-sm text-zinc-400 italic">{previewBike.tagline}</p>
            </div>

            {isCurrentlySelected && (
              <span className="px-3 py-1 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CURRENTLY EQUIPPED
              </span>
            )}
          </div>

          {/* Real-time 3D Model Rendering */}
          <div className="absolute inset-0 z-0">
            <BikeViewer3D bike={previewBike} interactive={true} />
          </div>

          <div className="relative z-10 text-xs text-zinc-400 max-w-md bg-zinc-950/80 backdrop-blur-md p-3 rounded-xl border border-zinc-800">
            {previewBike.description}
          </div>
        </div>

        {/* Right Column: Bike Selector Cards & Performance Stats */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Bike Selection Ribbon */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              CHOOSE MACHINE:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {BIKES.map((bike) => {
                const isSelected = bike.id === selectedPreviewId;
                const isBikeUnlocked =
                  save.unlockedBikes.includes(bike.id) ||
                  bike.unlock.type === 'default' ||
                  (bike.unlock.type === 'stars' && totalStars >= (bike.unlock.value ?? 0)) ||
                  (bike.unlock.type === 'levels' && completedLevels >= (bike.unlock.value ?? 0));

                return (
                  <button
                    key={bike.id}
                    onClick={() => handleSelectBike(bike.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800'
                    }`}
                  >
                    {!isBikeUnlocked && (
                      <span className="absolute top-1 right-1 text-[10px]">🔒</span>
                    )}
                    <span className="text-xs font-black italic tracking-wider block">
                      {bike.name}
                    </span>
                    <span
                      className="w-3.5 h-3.5 rounded-full mt-1.5 border border-white/20"
                      style={{ backgroundColor: bike.colors.bodyPrimary }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Performance Radar Stats */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3.5 backdrop-blur-md">
            <h4 className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase">
              SPECIFICATION METRICS:
            </h4>
            {renderStatBar('TOP SPEED', previewBike.stats.speed, 10, '#EF4444')}
            {renderStatBar('ACCELERATION', previewBike.stats.acceleration, 10, '#F59E0B')}
            {renderStatBar('HANDLING', previewBike.stats.handling, 10, '#10B981')}
            {renderStatBar('STABILITY', previewBike.stats.stability, 10, '#3B82F6')}
            {renderStatBar('AIR AGILITY / FLIPS', previewBike.stats.airControl, 10, '#8B5CF6')}
          </div>

          {/* Equip / Unlock Action */}
          <div>
            {isUnlocked ? (
              <button
                onClick={handleEquipBike}
                disabled={isCurrentlySelected}
                className={`w-full py-4 rounded-xl font-black italic tracking-wide text-base transition-all duration-200 ${
                  isCurrentlySelected
                    ? 'bg-zinc-800 text-zinc-500 cursor-default border border-zinc-700'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-black hover:from-amber-400 hover:to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-[0.98]'
                }`}
              >
                {isCurrentlySelected ? 'EQUIPPED IN RACE' : 'SELECT & EQUIP BIKE'}
              </button>
            ) : (
              <div className="p-4 rounded-xl border border-red-900/50 bg-red-950/20 text-center space-y-2">
                <div className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                  🔒 LOCKED MACHINE
                </div>
                <div className="text-sm font-semibold text-zinc-200">
                  {previewBike.unlock.description}
                </div>
                {previewBike.unlock.type === 'stars' && (
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-amber-500 h-full"
                      style={{
                        width: `${Math.min((totalStars / (previewBike.unlock.value ?? 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 border-t border-zinc-900 bg-zinc-950/80 text-zinc-500 text-xs text-center font-mono">
        Drag motorcycle in 3D to inspect frame geometry, aerodynamic fairing, and neon hub assemblies.
      </footer>
    </div>
  );
};
