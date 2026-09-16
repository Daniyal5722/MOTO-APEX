'use client';
// APEX MOTO RUSH — Active Game Session Orchestrator
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getLevel, getWorld, LEVELS, WORLDS, LevelDefinition, WorldDefinition } from '@/data/levels';
import { getBike } from '@/data/bikes';
import { GameEngine, GameEngineState } from '@/game/GameEngine';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameHUD } from '@/components/hud/GameHUD';
import { TouchControls } from '@/components/hud/TouchControls';
import { PauseModal } from '@/components/ui/PauseModal';
import { CrashModal } from '@/components/ui/CrashModal';
import { LevelCompleteModal } from '@/components/ui/LevelCompleteModal';
import { soundManager } from '@/game/audio/SoundManager';
import { saveLevelResult, incrementCrashes } from '@/storage/saveManager';
import { inputManager } from '@/game/input/InputManager';

export const GameView: React.FC = () => {
  const {
    currentLevelId,
    currentBikeId,
    screen,
    save,
    navigate,
    pauseGame,
    resumeGame,
    startLevel,
    finishLevel,
    setSave,
  } = useGameStore();

  const level: LevelDefinition = (currentLevelId ? getLevel(currentLevelId) : undefined) ?? getLevel(LEVELS[0].id) ?? LEVELS[0];
  const world: WorldDefinition = (level ? getWorld(level.worldId) : undefined) ?? getWorld('desert-canyon') ?? WORLDS[0];
  const bike = getBike(currentBikeId);

  const engineRef = useRef<GameEngine | null>(null);
  const [engineState, setEngineState] = useState<GameEngineState | null>(null);
  const [camera, setCamera] = useState({ x: level.spawnX, y: level.spawnY });

  // Camera & Audio update loop
  const updateLoopRef = useRef<number | null>(null);

  const handleStateUpdate = useCallback((state: GameEngineState) => {
    setEngineState(state);

    // Audio engine modulation
    const speedRatio = Math.min(state.bike.speed / bike.physics.maxSpeed, 1.2);
    const input = inputManager.poll();
    soundManager.updateEngine(speedRatio, input.accelerate);

    // Camera follow with lookahead
    setCamera((prev) => {
      const targetX = state.bike.x + state.bike.vx * 0.22;
      const targetY = state.bike.y + state.bike.vy * 0.12;
      return {
        x: prev.x + (targetX - prev.x) * 0.12,
        y: prev.y + (targetY - prev.y) * 0.12,
      };
    });
  }, [bike.physics.maxSpeed]);

  const handleCrash = useCallback(() => {
    soundManager.stopEngine();
    soundManager.playCrash();
    if (save.settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 200]);
    }
    const updated = incrementCrashes(save);
    setSave(updated);
    useGameStore.getState().navigate('crashed');
  }, [save, setSave]);

  const handleCheckpoint = useCallback(() => {
    soundManager.playCheckpoint();
    if (save.settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(60);
    }
  }, [save.settings.vibrationEnabled]);

  const handleFinish = useCallback((stars: 0|1|2|3, timeMs: number, score: number, combo: number, stunts: number) => {
    soundManager.stopEngine();
    soundManager.playVictory();

    // Persist result
    const updatedSave = saveLevelResult(save, level.id, {
      stars,
      timeMs,
      score,
      combo,
      stunts,
    });
    setSave(updatedSave);

    finishLevel(stars, timeMs, score, combo, stunts);
  }, [save, level.id, setSave, finishLevel]);

  const handleStunt = useCallback(() => {
    const highestMultiplier = engineRef.current?.getState().multiplier || 1;
    soundManager.playStunt(highestMultiplier);
    if (save.settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  }, [save.settings.vibrationEnabled]);

  // Initialize and start engine
  useEffect(() => {
    if (!level) return;

    soundManager.startEngine();
    if (save.settings.musicEnabled) {
      soundManager.startMusic();
    }

    const engine = new GameEngine(level, bike.physics, {
      onStateUpdate: handleStateUpdate,
      onCrash: handleCrash,
      onCheckpoint: handleCheckpoint,
      onFinish: handleFinish,
      onStunt: handleStunt,
    });

    engineRef.current = engine;
    engine.start();

    // Reset camera position to spawn
    const spawnX = level.spawnX;
    const spawnY = level.spawnY;
    requestAnimationFrame(() => {
      setCamera({ x: spawnX, y: spawnY });
    });

    const animRef = updateLoopRef;
    return () => {
      engine.stop();
      engineRef.current = null;
      soundManager.stopEngine();
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
    // eslint-react-hooks/exhaustive-deps disabled for engine lifecycle tied to level/bike setup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id, bike.id]);

  // Pause / Resume sync
  useEffect(() => {
    if (!engineRef.current) return;
    if (screen === 'paused') {
      engineRef.current.pause();
      soundManager.stopEngine();
    } else if (screen === 'playing') {
      engineRef.current.resume();
      soundManager.startEngine();
    }
  }, [screen]);

  // Keyboard shortcut listener for Pause (Escape / P) and Respawn (R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (screen === 'playing') {
          soundManager.playClick();
          pauseGame();
        } else if (screen === 'paused') {
          soundManager.playClick();
          resumeGame();
        }
      } else if ((e.key === 'r' || e.key === 'R') && screen === 'playing') {
        soundManager.playClick();
        engineRef.current?.respawn();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, pauseGame, resumeGame]);

  // Handlers for UI Modals
  const handleResume = () => {
    resumeGame();
  };

  const handleRestartCheckpoint = () => {
    engineRef.current?.respawn();
    resumeGame();
    soundManager.startEngine();
  };

  const handleRestartLevel = () => {
    startLevel(level.id);
  };

  const handleQuitToMenu = () => {
    soundManager.stopEngine();
    navigate('menu');
  };

  const handleNextLevel = () => {
    const currentIdx = LEVELS.findIndex((l) => l.id === level.id);
    if (currentIdx >= 0 && currentIdx < LEVELS.length - 1) {
      startLevel(LEVELS[currentIdx + 1].id);
    } else {
      navigate('levelSelect');
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none font-sans">
      {/* 2D / 3D Mixed Physics & Scenery Canvas */}
      <div className="absolute inset-0">
        <GameCanvas
          gameState={engineState}
          level={level}
          world={world}
          bike={bike}
          cameraX={camera.x}
          cameraY={camera.y}
          zoom={level.cameraZoom || 10}
        />
      </div>

      {/* In-Game HUD (Timer, Score, Speed, Combo, Pause Button) */}
      <GameHUD
        engineState={engineState}
        levelName={level.name}
        levelNumber={level.levelNumber}
        onPause={pauseGame}
      />

      {/* Mobile Touch Controls */}
      <TouchControls onPause={pauseGame} />

      {/* Pause Menu Modal Overlay */}
      {screen === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestartCheckpoint={handleRestartCheckpoint}
          onRestartLevel={handleRestartLevel}
          onQuit={handleQuitToMenu}
        />
      )}

      {/* Crash Modal Overlay */}
      {screen === 'crashed' && (
        <CrashModal
          onRespawn={handleRestartCheckpoint}
          onRestartLevel={handleRestartLevel}
          onQuit={handleQuitToMenu}
          hasCheckpoint={Boolean(engineState && engineState.currentCheckpointIndex >= 0)}
        />
      )}

      {/* Level Complete Victory Modal Overlay */}
      {screen === 'levelComplete' && (
        <LevelCompleteModal
          onNextLevel={handleNextLevel}
          onRetry={handleRestartLevel}
          onLevelSelect={() => navigate('levelSelect')}
        />
      )}
    </div>
  );
};
