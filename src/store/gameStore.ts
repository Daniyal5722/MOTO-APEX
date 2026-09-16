// APEX MOTO RUSH — Global Game State (Zustand)
import { create } from 'zustand';
import { BikeId } from '@/data/bikes';
import { GameSave, GameSettings, loadSave, saveGame } from '@/storage/saveManager';

export type GameScreen =
  | 'menu'
  | 'levelSelect'
  | 'garage'
  | 'playing'
  | 'paused'
  | 'crashed'
  | 'levelComplete'
  | 'settings'
  | 'tutorial'
  | 'statistics'
  | 'loading'
  | 'bikeUnlock';

export type GameState = {
  // Navigation
  screen: GameScreen;
  previousScreen: GameScreen;

  // Current session
  currentLevelId: string | null;
  currentBikeId: BikeId;
  score: number;
  combo: number;
  multiplier: number;
  elapsedTimeMs: number;
  isTimerRunning: boolean;
  stuntMessage: string;
  stuntPoints: number;
  currentCheckpointIndex: number;

  // Level complete results
  levelResultStars: 0 | 1 | 2 | 3;
  levelResultTime: number;
  levelResultScore: number;
  levelResultCombo: number;
  levelResultStunts: number;

  // Persistence
  save: GameSave;

  // Newly unlocked bike (for unlock animation)
  newlyUnlockedBikeId: BikeId | null;

  // Actions
  navigate: (screen: GameScreen) => void;
  startLevel: (levelId: string) => void;
  resumeGame: () => void;
  pauseGame: () => void;
  setCrashed: () => void;
  finishLevel: (stars: 0 | 1 | 2 | 3, timeMs: number, score: number, combo: number, stunts: number) => void;
  addScore: (points: number) => void;
  addStunt: (name: string, points: number) => void;
  incrementCombo: () => void;
  breakCombo: () => void;
  setElapsedTime: (ms: number) => void;
  setCheckpoint: (index: number) => void;
  selectBike: (id: BikeId) => void;
  setSave: (save: GameSave) => void;
  clearStuntMessage: () => void;
  setNewlyUnlockedBike: (id: BikeId | null) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
};

const COMBO_MULTIPLIERS = [1, 1, 2, 3, 4, 5, 7, 10];

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  previousScreen: 'menu',
  currentLevelId: null,
  currentBikeId: 'rebel',
  score: 0,
  combo: 0,
  multiplier: 1,
  elapsedTimeMs: 0,
  isTimerRunning: false,
  stuntMessage: '',
  stuntPoints: 0,
  currentCheckpointIndex: -1,
  levelResultStars: 0,
  levelResultTime: 0,
  levelResultScore: 0,
  levelResultCombo: 0,
  levelResultStunts: 0,
  save: loadSave(),
  newlyUnlockedBikeId: null,

  navigate: (screen) => {
    set((state) => ({ screen, previousScreen: state.screen }));
  },

  startLevel: (levelId) => {
    const save = get().save;
    set({
      screen: 'playing',
      currentLevelId: levelId,
      currentBikeId: save.selectedBike,
      score: 0,
      combo: 0,
      multiplier: 1,
      elapsedTimeMs: 0,
      isTimerRunning: true,
      stuntMessage: '',
      stuntPoints: 0,
      currentCheckpointIndex: -1,
      levelResultStars: 0,
      levelResultTime: 0,
      levelResultScore: 0,
      levelResultCombo: 0,
      levelResultStunts: 0,
    });
  },

  resumeGame: () => {
    set({ screen: 'playing', isTimerRunning: true });
  },

  pauseGame: () => {
    set({ screen: 'paused', isTimerRunning: false });
  },

  setCrashed: () => {
    set({ combo: 0, multiplier: 1, stuntMessage: '', stuntPoints: 0 });
  },

  finishLevel: (stars, timeMs, score, combo, stunts) => {
    set({
      screen: 'levelComplete',
      isTimerRunning: false,
      levelResultStars: stars,
      levelResultTime: timeMs,
      levelResultScore: score,
      levelResultCombo: combo,
      levelResultStunts: stunts,
    });
  },

  addScore: (points) => {
    const { multiplier } = get();
    set((state) => ({ score: state.score + points * multiplier }));
  },

  addStunt: (name, points) => {
    const { multiplier } = get();
    const total = points * multiplier;
    set((state) => ({
      stuntMessage: name,
      stuntPoints: total,
      score: state.score + total,
    }));
    // Clear stunt message after 2s
    setTimeout(() => {
      if (get().stuntMessage === name) {
        set({ stuntMessage: '', stuntPoints: 0 });
      }
    }, 2000);
  },

  incrementCombo: () => {
    set((state) => {
      const newCombo = state.combo + 1;
      const multiplierIndex = Math.min(newCombo, COMBO_MULTIPLIERS.length - 1);
      return { combo: newCombo, multiplier: COMBO_MULTIPLIERS[multiplierIndex] };
    });
  },

  breakCombo: () => {
    set({ combo: 0, multiplier: 1 });
  },

  setElapsedTime: (ms) => {
    set({ elapsedTimeMs: ms });
  },

  setCheckpoint: (index) => {
    set({ currentCheckpointIndex: index });
  },

  selectBike: (id) => {
    set((state) => {
      const newSave = { ...state.save, selectedBike: id };
      saveGame(newSave);
      return { currentBikeId: id, save: newSave };
    });
  },

  setSave: (save) => {
    set({ save });
  },

  clearStuntMessage: () => {
    set({ stuntMessage: '', stuntPoints: 0 });
  },

  setNewlyUnlockedBike: (id) => {
    set({ newlyUnlockedBikeId: id });
  },

  updateSettings: (settings) => {
    set((state) => {
      const newSettings = { ...state.save.settings, ...settings };
      const newSave = { ...state.save, settings: newSettings };
      saveGame(newSave);
      return { save: newSave };
    });
  },
}));
