// APEX MOTO RUSH — Versioned LocalStorage Save Manager

import { BikeId, DEFAULT_BIKE_ID } from '@/data/bikes';
import { ALL_LEVEL_IDS } from '@/data/levels';

export const SAVE_VERSION = 2;
export const SAVE_KEY = 'apexMotoRush_save_v2';

export interface LevelResult {
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  bestTimeMs: number;    // milliseconds
  bestScore: number;
  bestCombo: number;
  attempts: number;
}

export interface GameSettings {
  musicEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quality: 'low' | 'medium' | 'high';
  reducedMotion: boolean;
}

export interface GameStatistics {
  totalLevelsCompleted: number;
  totalStars: number;
  totalCrashes: number;
  totalStunts: number;
  highestComboMultiplier: number;
  totalDistanceMeters: number;
  bikesUnlocked: number;
  totalPlayTimeMs: number;
  backflipsCompleted: number;
  frontflipsCompleted: number;
}

export interface GameSave {
  version: number;
  saveDate: string;
  selectedBike: BikeId;
  unlockedBikes: BikeId[];
  levels: Record<string, LevelResult>;
  settings: GameSettings;
  statistics: GameStatistics;
  tutorialCompleted: boolean;
}

const DEFAULT_LEVEL_RESULT: LevelResult = {
  completed: false,
  stars: 0,
  bestTimeMs: 0,
  bestScore: 0,
  bestCombo: 0,
  attempts: 0,
};

const DEFAULT_SETTINGS: GameSettings = {
  musicEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quality: 'high',
  reducedMotion: false,
};

const DEFAULT_STATISTICS: GameStatistics = {
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
};

function buildDefaultSave(): GameSave {
  const levels: Record<string, LevelResult> = {};
  ALL_LEVEL_IDS.forEach((id) => {
    levels[id] = { ...DEFAULT_LEVEL_RESULT };
  });
  return {
    version: SAVE_VERSION,
    saveDate: new Date().toISOString(),
    selectedBike: DEFAULT_BIKE_ID,
    unlockedBikes: [DEFAULT_BIKE_ID],
    levels,
    settings: { ...DEFAULT_SETTINGS },
    statistics: { ...DEFAULT_STATISTICS },
    tutorialCompleted: false,
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function loadSave(): GameSave {
  if (!isBrowser()) return buildDefaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return buildDefaultSave();
    const parsed = JSON.parse(raw) as Partial<GameSave>;

    // Version migration
    if (!parsed.version || parsed.version < SAVE_VERSION) {
      const fresh = buildDefaultSave();
      // Preserve what we can from old save
      if (parsed.levels) {
        Object.keys(parsed.levels).forEach((id) => {
          if (fresh.levels[id] && parsed.levels![id]) {
            fresh.levels[id] = { ...fresh.levels[id], ...parsed.levels![id] };
          }
        });
      }
      if (parsed.unlockedBikes) fresh.unlockedBikes = parsed.unlockedBikes as BikeId[];
      if (parsed.selectedBike) fresh.selectedBike = parsed.selectedBike as BikeId;
      saveGame(fresh);
      return fresh;
    }

    // Ensure all level IDs exist (handles new levels added in patches)
    const save = { ...buildDefaultSave(), ...parsed } as GameSave;
    ALL_LEVEL_IDS.forEach((id) => {
      if (!save.levels[id]) save.levels[id] = { ...DEFAULT_LEVEL_RESULT };
    });
    return save;
  } catch {
    // Corrupted save — return defaults
    return buildDefaultSave();
  }
}

export function saveGame(save: GameSave): void {
  if (!isBrowser()) return;
  try {
    save.saveDate = new Date().toISOString();
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Storage full or blocked — silently fail
  }
}

export function resetSave(): GameSave {
  if (isBrowser()) {
    localStorage.removeItem(SAVE_KEY);
  }
  const fresh = buildDefaultSave();
  saveGame(fresh);
  return fresh;
}

export function saveLevelResult(
  save: GameSave,
  levelId: string,
  result: { timeMs: number; score: number; combo: number; stars: 0 | 1 | 2 | 3; stunts: number }
): GameSave {
  const existing = save.levels[levelId] || { ...DEFAULT_LEVEL_RESULT };
  const wasCompleted = existing.completed;

  const updated: LevelResult = {
    completed: result.stars > 0,
    stars: Math.max(existing.stars, result.stars) as 0 | 1 | 2 | 3,
    bestTimeMs: existing.bestTimeMs === 0 || (result.stars > 0 && result.timeMs < existing.bestTimeMs)
      ? result.timeMs
      : existing.bestTimeMs,
    bestScore: Math.max(existing.bestScore, result.score),
    bestCombo: Math.max(existing.bestCombo, result.combo),
    attempts: existing.attempts + 1,
  };

  const newSave: GameSave = {
    ...save,
    levels: { ...save.levels, [levelId]: updated },
  };

  // Update statistics
  const stats = { ...save.statistics };
  if (!wasCompleted && result.stars > 0) {
    stats.totalLevelsCompleted++;
  }
  stats.totalStars = Object.values(newSave.levels).reduce((sum, l) => sum + l.stars, 0);
  stats.totalStunts += result.stunts;
  stats.highestComboMultiplier = Math.max(stats.highestComboMultiplier, result.combo);
  newSave.statistics = stats;

  saveGame(newSave);
  return newSave;
}

export function unlockBike(save: GameSave, bikeId: BikeId): GameSave {
  if (save.unlockedBikes.includes(bikeId)) return save;
  const newSave: GameSave = {
    ...save,
    unlockedBikes: [...save.unlockedBikes, bikeId],
  };
  newSave.statistics = { ...newSave.statistics, bikesUnlocked: newSave.unlockedBikes.length };
  saveGame(newSave);
  return newSave;
}

export function selectBike(save: GameSave, bikeId: BikeId): GameSave {
  const newSave: GameSave = { ...save, selectedBike: bikeId };
  saveGame(newSave);
  return newSave;
}

export function saveSettings(save: GameSave, settings: Partial<GameSettings>): GameSave {
  const newSave: GameSave = { ...save, settings: { ...save.settings, ...settings } };
  saveGame(newSave);
  return newSave;
}

export function incrementCrashes(save: GameSave): GameSave {
  const newSave: GameSave = {
    ...save,
    statistics: { ...save.statistics, totalCrashes: save.statistics.totalCrashes + 1 },
  };
  saveGame(newSave);
  return newSave;
}

export function recordFlip(save: GameSave, type: 'back' | 'front'): GameSave {
  const stats = { ...save.statistics };
  if (type === 'back') stats.backflipsCompleted++;
  else stats.frontflipsCompleted++;
  stats.totalStunts++;
  const newSave: GameSave = { ...save, statistics: stats };
  saveGame(newSave);
  return newSave;
}

export function getTotalStars(save: GameSave): number {
  return Object.values(save.levels).reduce((sum, l) => sum + l.stars, 0);
}

export function getCompletedLevels(save: GameSave): number {
  return Object.values(save.levels).filter((l) => l.completed).length;
}

export function isLevelUnlocked(save: GameSave, levelId: string, levelIndex: number): boolean {
  if (levelIndex === 0) return true; // First level always unlocked
  // Level is unlocked if previous level is completed
  const levelIds = Object.keys(save.levels);
  const idx = levelIds.indexOf(levelId);
  if (idx <= 0) return true;
  const prevId = levelIds[idx - 1];
  return save.levels[prevId]?.completed ?? false;
}
