// APEX MOTO RUSH — Star System
// Calculates 1/2/3 stars based on time and score

import { LevelDefinition } from '@/data/levels';

export function calculateStars(
  level: LevelDefinition,
  timeMs: number,
  score: number
): 0 | 1 | 2 | 3 {
  const timeSec = timeMs / 1000;

  // Failed to finish = 0 stars (called externally, this assumes completion)
  // 3 stars: under three-star time threshold + score target
  if (timeSec <= level.starThresholds.three && score >= level.targetScore) {
    return 3;
  }
  // 2 stars: under two-star time threshold
  if (timeSec <= level.starThresholds.two) {
    return 2;
  }
  // 1 star: finished (any time)
  if (timeSec <= level.starThresholds.one) {
    return 1;
  }
  // Technically finished but over limit — still 1 star
  return 1;
}

export function getStarRating(
  stars: 0 | 1 | 2 | 3
): { emoji: string; label: string; color: string } {
  switch (stars) {
    case 3: return { emoji: '⭐⭐⭐', label: 'PERFECT', color: '#F5C518' };
    case 2: return { emoji: '⭐⭐', label: 'GREAT', color: '#E8560A' };
    case 1: return { emoji: '⭐', label: 'CLEAR', color: '#95A5A6' };
    default: return { emoji: '', label: 'FAILED', color: '#E74C3C' };
  }
}
