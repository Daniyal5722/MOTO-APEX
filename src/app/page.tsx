'use client';
// APEX MOTO RUSH — Root Application Entry
import React, { useSyncExternalStore } from 'react';
import { useGameStore } from '@/store/gameStore';
import { MainMenu } from '@/components/ui/MainMenu';
import { LevelSelectModal } from '@/components/ui/LevelSelectModal';
import { GarageModal } from '@/components/ui/GarageModal';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { StatsModal } from '@/components/ui/StatsModal';
import { GameView } from '@/components/game/GameView';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const { screen } = useGameStore();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className="tracking-widest uppercase text-xs text-amber-500 font-bold">
            IGNITING ENGINES...
          </span>
        </div>
      </div>
    );
  }

  // Active Gameplay View
  if (
    screen === 'playing' ||
    screen === 'paused' ||
    screen === 'crashed' ||
    screen === 'levelComplete'
  ) {
    return <GameView />;
  }

  // UI Navigation Screens
  switch (screen) {
    case 'levelSelect':
      return <LevelSelectModal />;
    case 'garage':
      return <GarageModal />;
    case 'settings':
      return <SettingsModal />;
    case 'statistics':
      return <StatsModal />;
    case 'menu':
    default:
      return <MainMenu />;
  }
}
