// APEX MOTO RUSH — World & Level Definitions

export type WorldId = 'desert-canyon' | 'jungle-ruins' | 'industrial-zone';
export type TerrainPoint = [number, number]; // [x, y] world coordinates

export interface TerrainSegment {
  points: TerrainPoint[];
  friction?: number;
  type?: 'ground' | 'ramp' | 'platform' | 'gap';
}

export interface MovingPlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  motion: 'horizontal' | 'vertical';
  range: number;
  speed: number;
  phase?: number; // 0-1 start phase
}

export interface RotatingObstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotationSpeed: number; // radians/s
  startAngle?: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
}

export interface LevelFinish {
  x: number;
  y: number;
}

export interface LevelStarThresholds {
  one: number;   // time in seconds — must finish under this
  two: number;
  three: number; // fastest threshold
}

export interface LevelDefinition {
  id: string;
  worldId: WorldId;
  levelNumber: number;
  name: string;
  description: string;
  starThresholds: LevelStarThresholds;
  terrain: TerrainSegment[];
  movingPlatforms: MovingPlatform[];
  rotatingObstacles: RotatingObstacle[];
  checkpoints: Checkpoint[];
  finish: LevelFinish;
  spawnX: number;
  spawnY: number;
  gravity: number;
  cameraZoom: number;
  targetScore: number; // for 3-star score
}

export interface WorldDefinition {
  id: WorldId;
  name: string;
  subtitle: string;
  description: string;
  backgroundColor: string;
  skyColors: [string, string];
  groundColor: string;
  accentColor: string;
  fogColor: string;
  levels: string[]; // level IDs
}

// ─── WORLDS ────────────────────────────────────────────────────────────────

export const WORLDS: WorldDefinition[] = [
  {
    id: 'desert-canyon',
    name: 'DESERT CANYON',
    subtitle: 'World 1',
    description: 'Sun-scorched rock and endless sky. The canyon tests your nerve before it tests your skill.',
    backgroundColor: '#3D1A00',
    skyColors: ['#FF6B35', '#FFB347'],
    groundColor: '#8B5E3C',
    accentColor: '#E8560A',
    fogColor: '#FF8C42',
    levels: ['dc-01', 'dc-02', 'dc-03', 'dc-04', 'dc-05'],
  },
  {
    id: 'jungle-ruins',
    name: 'JUNGLE RUINS',
    subtitle: 'World 2',
    description: 'Ancient stone and relentless green. Navigate crumbling bridges and vine-draped paths.',
    backgroundColor: '#0A1A0A',
    skyColors: ['#1A3A1A', '#2D5A27'],
    groundColor: '#2D5016',
    accentColor: '#39D353',
    fogColor: '#1A3A1A',
    levels: ['jr-01', 'jr-02', 'jr-03', 'jr-04', 'jr-05'],
  },
  {
    id: 'industrial-zone',
    name: 'INDUSTRIAL ZONE',
    subtitle: 'World 3',
    description: 'Steel catwalks and machinery in motion. Timing is everything when the factory never sleeps.',
    backgroundColor: '#0D0D14',
    skyColors: ['#14141E', '#1A1A2E'],
    groundColor: '#2C2C3E',
    accentColor: '#E8560A',
    fogColor: '#14141E',
    levels: ['iz-01', 'iz-02', 'iz-03', 'iz-04', 'iz-05'],
  },
];

// ─── LEVEL TERRAIN HELPERS ─────────────────────────────────────────────────

// Generate a smooth hill terrain
const hill = (startX: number, peakX: number, endX: number, groundY: number, peakHeight: number, steps = 12): TerrainPoint[] => {
  const pts: TerrainPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = startX + (endX - startX) * t;
    const midT = (x - startX) / (endX - startX);
    const heightFactor = Math.sin(midT * Math.PI);
    const y = groundY + heightFactor * peakHeight;
    pts.push([x, y]);
  }
  return pts;
};

const flat = (x1: number, x2: number, y: number): TerrainPoint[] => [[x1, y], [x2, y]];

// ─── DESERT CANYON LEVELS ──────────────────────────────────────────────────

const DC_GROUND = -2.0; // Y coordinate of main ground

export const LEVELS: LevelDefinition[] = [

  // ── DC-01: Warm-Up Ridge ─────────────────────────────────────────────────
  {
    id: 'dc-01',
    worldId: 'desert-canyon',
    levelNumber: 1,
    name: 'Warm-Up Ridge',
    description: 'A gentle canyon slope to get your wheels spinning.',
    starThresholds: { one: 120, two: 75, three: 55 },
    spawnX: 0,
    spawnY: DC_GROUND + 1.5,
    gravity: -20,
    cameraZoom: 10,
    targetScore: 2000,
    terrain: [
      { points: flat(-2, 10, DC_GROUND), type: 'ground' },
      { points: [...hill(10, 14, 18, DC_GROUND, 2.5)], type: 'ramp' },
      { points: flat(18, 28, DC_GROUND), type: 'ground' },
      { points: [...hill(28, 32, 36, DC_GROUND, 3.5)], type: 'ramp' },
      { points: flat(36, 50, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [],
    rotatingObstacles: [],
    checkpoints: [
      { id: 'cp1', x: 20, y: DC_GROUND + 1.5 },
      { id: 'cp2', x: 40, y: DC_GROUND + 1.5 },
    ],
    finish: { x: 50, y: DC_GROUND + 1.5 },
  },

  // ── DC-02: Canyon Gaps ───────────────────────────────────────────────────
  {
    id: 'dc-02',
    worldId: 'desert-canyon',
    levelNumber: 2,
    name: 'Canyon Gaps',
    description: 'Short platforms over deep drops. Watch the spacing.',
    starThresholds: { one: 150, two: 90, three: 65 },
    spawnX: 0,
    spawnY: DC_GROUND + 1.5,
    gravity: -20,
    cameraZoom: 10,
    targetScore: 3500,
    terrain: [
      { points: flat(-2, 12, DC_GROUND), type: 'ground' },
      // Gap 1
      { points: flat(15, 22, DC_GROUND), type: 'platform' },
      // Gap 2
      { points: flat(26, 34, DC_GROUND), type: 'platform' },
      // Rising ramp to next section
      { points: [...hill(34, 38, 42, DC_GROUND, 3.0)], type: 'ramp' },
      { points: flat(42, 56, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [],
    rotatingObstacles: [],
    checkpoints: [
      { id: 'cp1', x: 22, y: DC_GROUND + 1.5 },
      { id: 'cp2', x: 44, y: DC_GROUND + 1.5 },
    ],
    finish: { x: 56, y: DC_GROUND + 1.5 },
  },

  // ── DC-03: Moving Stones ─────────────────────────────────────────────────
  {
    id: 'dc-03',
    worldId: 'desert-canyon',
    levelNumber: 3,
    name: 'Moving Stones',
    description: 'Ancient boulders shift in the canyon wind. Time your crossings.',
    starThresholds: { one: 180, two: 110, three: 80 },
    spawnX: 0,
    spawnY: DC_GROUND + 1.5,
    gravity: -20,
    cameraZoom: 10,
    targetScore: 5000,
    terrain: [
      { points: flat(-2, 14, DC_GROUND), type: 'ground' },
      { points: flat(20, 30, DC_GROUND), type: 'ground' },
      { points: [...hill(30, 34, 38, DC_GROUND, 2.5)], type: 'ramp' },
      { points: flat(38, 55, DC_GROUND - 0.5), type: 'ground' },
      { points: [...hill(55, 60, 65, DC_GROUND - 0.5, 4.0)], type: 'ramp' },
      { points: flat(65, 75, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [
      { id: 'mp1', x: 14, y: DC_GROUND + 0.3, width: 5, height: 0.4, motion: 'horizontal', range: 3, speed: 1.8, phase: 0 },
      { id: 'mp2', x: 14, y: DC_GROUND + 0.3, width: 5, height: 0.4, motion: 'horizontal', range: 3, speed: 1.8, phase: 0.5 },
    ],
    rotatingObstacles: [],
    checkpoints: [
      { id: 'cp1', x: 32, y: DC_GROUND + 1.5 },
      { id: 'cp2', x: 58, y: DC_GROUND + 1.5 },
    ],
    finish: { x: 75, y: DC_GROUND + 1.5 },
  },

  // ── DC-04: Stunt Ridge ───────────────────────────────────────────────────
  {
    id: 'dc-04',
    worldId: 'desert-canyon',
    levelNumber: 4,
    name: 'Stunt Ridge',
    description: 'Big ramps, big air. This is where legends are forged.',
    starThresholds: { one: 200, two: 130, three: 95 },
    spawnX: 0,
    spawnY: DC_GROUND + 1.5,
    gravity: -20,
    cameraZoom: 9,
    targetScore: 8000,
    terrain: [
      { points: flat(-2, 8, DC_GROUND), type: 'ground' },
      { points: [...hill(8, 13, 18, DC_GROUND, 5.0)], type: 'ramp' },
      { points: flat(18, 22, DC_GROUND + 5.0), type: 'platform' },
      { points: [[22, DC_GROUND + 5.0], [27, DC_GROUND]], type: 'ramp' },
      { points: flat(27, 35, DC_GROUND), type: 'ground' },
      { points: [...hill(35, 41, 47, DC_GROUND, 6.0)], type: 'ramp' },
      { points: flat(47, 52, DC_GROUND + 6.0), type: 'platform' },
      { points: [[52, DC_GROUND + 6.0], [58, DC_GROUND]], type: 'ramp' },
      { points: flat(58, 75, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [],
    rotatingObstacles: [],
    checkpoints: [
      { id: 'cp1', x: 20, y: DC_GROUND + 6 },
      { id: 'cp2', x: 50, y: DC_GROUND + 7 },
    ],
    finish: { x: 75, y: DC_GROUND + 1.5 },
  },

  // ── DC-05: Canyon Boss ───────────────────────────────────────────────────
  {
    id: 'dc-05',
    worldId: 'desert-canyon',
    levelNumber: 5,
    name: 'Canyon Boss',
    description: 'Everything at once. Gaps, ramps, movers. Prove yourself.',
    starThresholds: { one: 240, two: 160, three: 120 },
    spawnX: 0,
    spawnY: DC_GROUND + 1.5,
    gravity: -20,
    cameraZoom: 9,
    targetScore: 12000,
    terrain: [
      { points: flat(-2, 10, DC_GROUND), type: 'ground' },
      { points: [...hill(10, 14, 18, DC_GROUND, 4.0)], type: 'ramp' },
      { points: flat(24, 34, DC_GROUND), type: 'platform' },
      { points: [...hill(34, 39, 44, DC_GROUND, 5.5)], type: 'ramp' },
      { points: flat(44, 55, DC_GROUND + 5.5), type: 'platform' },
      { points: [[55, DC_GROUND + 5.5], [62, DC_GROUND]], type: 'ramp' },
      { points: flat(62, 80, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [
      { id: 'mp1', x: 18, y: DC_GROUND + 0.3, width: 4.5, height: 0.4, motion: 'horizontal', range: 2.5, speed: 2.5, phase: 0 },
    ],
    rotatingObstacles: [
      { id: 'ro1', x: 50, y: DC_GROUND + 7, width: 6, height: 0.3, rotationSpeed: 1.5, startAngle: 0 },
    ],
    checkpoints: [
      { id: 'cp1', x: 26, y: DC_GROUND + 1.5 },
      { id: 'cp2', x: 50, y: DC_GROUND + 7 },
    ],
    finish: { x: 80, y: DC_GROUND + 1.5 },
  },

  // ── JUNGLE RUINS LEVELS ─────────────────────────────────────────────────

  {
    id: 'jr-01',
    worldId: 'jungle-ruins',
    levelNumber: 1,
    name: 'Vine Crossing',
    description: 'Mossy bridges over ancient ravines. The jungle swallows the careless.',
    starThresholds: { one: 160, two: 100, three: 72 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -19, cameraZoom: 10,
    targetScore: 4000,
    terrain: [
      { points: flat(-2, 10, DC_GROUND), type: 'ground' },
      { points: [...hill(10, 15, 20, DC_GROUND, 3.0)], type: 'ramp' },
      { points: flat(20, 30, DC_GROUND), type: 'ground' },
      { points: flat(34, 44, DC_GROUND - 0.8), type: 'platform' },
      { points: flat(48, 62, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [
      { id: 'mp1', x: 30, y: DC_GROUND + 0.3, width: 3.5, height: 0.4, motion: 'vertical', range: 2, speed: 1.2, phase: 0 },
    ],
    rotatingObstacles: [],
    checkpoints: [{ id: 'cp1', x: 36, y: DC_GROUND + 0.2 }, { id: 'cp2', x: 52, y: DC_GROUND + 1.5 }],
    finish: { x: 62, y: DC_GROUND + 1.5 },
  },

  {
    id: 'jr-02',
    worldId: 'jungle-ruins',
    levelNumber: 2,
    name: 'Temple Approach',
    description: 'Crumbling stone steps lead upward. Mind the gaps between ancient blocks.',
    starThresholds: { one: 180, two: 115, three: 85 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -19, cameraZoom: 10,
    targetScore: 5500,
    terrain: [
      { points: flat(-2, 8, DC_GROUND), type: 'ground' },
      { points: flat(10, 18, DC_GROUND + 1.5), type: 'platform' },
      { points: flat(20, 28, DC_GROUND + 3.0), type: 'platform' },
      { points: flat(30, 42, DC_GROUND + 4.5), type: 'platform' },
      { points: [[42, DC_GROUND + 4.5], [50, DC_GROUND]], type: 'ramp' },
      { points: flat(50, 65, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [],
    rotatingObstacles: [],
    checkpoints: [{ id: 'cp1', x: 32, y: DC_GROUND + 6 }, { id: 'cp2', x: 54, y: DC_GROUND + 1.5 }],
    finish: { x: 65, y: DC_GROUND + 1.5 },
  },

  {
    id: 'jr-03',
    worldId: 'jungle-ruins',
    levelNumber: 3,
    name: 'Ruin Gauntlet',
    description: 'Spinning trap gates guard the inner temple. React fast.',
    starThresholds: { one: 210, two: 140, three: 100 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -19, cameraZoom: 9,
    targetScore: 7000,
    terrain: [
      { points: flat(-2, 14, DC_GROUND), type: 'ground' },
      { points: [...hill(14, 18, 22, DC_GROUND, 3.5)], type: 'ramp' },
      { points: flat(22, 50, DC_GROUND), type: 'ground' },
      { points: [...hill(50, 56, 62, DC_GROUND, 5.0)], type: 'ramp' },
      { points: flat(62, 78, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [
      { id: 'mp1', x: 35, y: DC_GROUND + 0.3, width: 5, height: 0.4, motion: 'horizontal', range: 4, speed: 2.2, phase: 0 },
    ],
    rotatingObstacles: [
      { id: 'ro1', x: 30, y: DC_GROUND + 3, width: 5, height: 0.3, rotationSpeed: 2.0, startAngle: 0 },
      { id: 'ro2', x: 45, y: DC_GROUND + 3, width: 5, height: 0.3, rotationSpeed: -1.8, startAngle: Math.PI / 2 },
    ],
    checkpoints: [{ id: 'cp1', x: 26, y: DC_GROUND + 1.5 }, { id: 'cp2', x: 55, y: DC_GROUND + 1.5 }],
    finish: { x: 78, y: DC_GROUND + 1.5 },
  },

  {
    id: 'jr-04',
    worldId: 'jungle-ruins',
    levelNumber: 4,
    name: 'Overgrown Highway',
    description: 'Speed through collapsed archways on a cracked road.',
    starThresholds: { one: 200, two: 125, three: 90 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -19, cameraZoom: 10,
    targetScore: 9000,
    terrain: [
      { points: flat(-2, 80, DC_GROUND), type: 'ground' },
      { points: [...hill(20, 25, 30, DC_GROUND, 4.0)], type: 'ramp' },
      { points: [...hill(45, 52, 59, DC_GROUND, 5.5)], type: 'ramp' },
    ],
    movingPlatforms: [],
    rotatingObstacles: [
      { id: 'ro1', x: 38, y: DC_GROUND + 2, width: 4, height: 0.3, rotationSpeed: 2.5, startAngle: 0 },
      { id: 'ro2', x: 62, y: DC_GROUND + 2, width: 4, height: 0.3, rotationSpeed: -2.0, startAngle: Math.PI },
    ],
    checkpoints: [{ id: 'cp1', x: 32, y: DC_GROUND + 1.5 }, { id: 'cp2', x: 60, y: DC_GROUND + 1.5 }],
    finish: { x: 80, y: DC_GROUND + 1.5 },
  },

  {
    id: 'jr-05',
    worldId: 'jungle-ruins',
    levelNumber: 5,
    name: 'Temple Summit',
    description: 'The apex of the jungle ruins. Only the elite reach the top.',
    starThresholds: { one: 260, two: 175, three: 130 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -19, cameraZoom: 9,
    targetScore: 15000,
    terrain: [
      { points: flat(-2, 8, DC_GROUND), type: 'ground' },
      { points: flat(12, 20, DC_GROUND + 2), type: 'platform' },
      { points: flat(24, 32, DC_GROUND + 4), type: 'platform' },
      { points: flat(36, 50, DC_GROUND + 6), type: 'platform' },
      { points: [...hill(50, 56, 62, DC_GROUND + 6, -2.0)], type: 'ramp' },
      { points: flat(62, 80, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [
      { id: 'mp1', x: 8, y: DC_GROUND + 1.8, width: 3, height: 0.4, motion: 'horizontal', range: 2, speed: 2.5, phase: 0 },
      { id: 'mp2', x: 20, y: DC_GROUND + 3.8, width: 3, height: 0.4, motion: 'vertical', range: 1.5, speed: 1.8, phase: 0.3 },
    ],
    rotatingObstacles: [
      { id: 'ro1', x: 43, y: DC_GROUND + 9, width: 6, height: 0.3, rotationSpeed: 2.2, startAngle: 0 },
    ],
    checkpoints: [
      { id: 'cp1', x: 25, y: DC_GROUND + 5 },
      { id: 'cp2', x: 46, y: DC_GROUND + 7.5 },
    ],
    finish: { x: 80, y: DC_GROUND + 1.5 },
  },

  // ── INDUSTRIAL ZONE LEVELS ───────────────────────────────────────────────

  {
    id: 'iz-01',
    worldId: 'industrial-zone',
    levelNumber: 1,
    name: 'Factory Floor',
    description: 'Steel and concrete. The machines never stop — neither should you.',
    starThresholds: { one: 180, two: 115, three: 85 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -21, cameraZoom: 10,
    targetScore: 5000,
    terrain: [
      { points: flat(-2, 70, DC_GROUND), type: 'ground' },
      { points: [...hill(15, 20, 25, DC_GROUND, 3.0)], type: 'ramp' },
      { points: [...hill(40, 47, 54, DC_GROUND, 4.5)], type: 'ramp' },
    ],
    movingPlatforms: [
      { id: 'mp1', x: 28, y: DC_GROUND + 0.3, width: 5, height: 0.4, motion: 'horizontal', range: 5, speed: 3.0, phase: 0 },
    ],
    rotatingObstacles: [],
    checkpoints: [{ id: 'cp1', x: 30, y: DC_GROUND + 1.5 }, { id: 'cp2', x: 56, y: DC_GROUND + 1.5 }],
    finish: { x: 70, y: DC_GROUND + 1.5 },
  },

  {
    id: 'iz-02',
    worldId: 'industrial-zone',
    levelNumber: 2,
    name: 'Conveyor Run',
    description: 'Fast-moving platforms demand perfect timing. Never brake, never doubt.',
    starThresholds: { one: 200, two: 130, three: 95 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -21, cameraZoom: 10,
    targetScore: 7000,
    terrain: [
      { points: flat(-2, 12, DC_GROUND), type: 'ground' },
      { points: flat(30, 42, DC_GROUND), type: 'ground' },
      { points: flat(55, 75, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [
      { id: 'mp1', x: 12, y: DC_GROUND + 0.3, width: 4, height: 0.4, motion: 'horizontal', range: 6, speed: 3.5, phase: 0 },
      { id: 'mp2', x: 12, y: DC_GROUND + 0.3, width: 4, height: 0.4, motion: 'horizontal', range: 6, speed: 3.5, phase: 0.5 },
      { id: 'mp3', x: 42, y: DC_GROUND + 0.3, width: 4, height: 0.4, motion: 'horizontal', range: 6, speed: 3.0, phase: 0.25 },
    ],
    rotatingObstacles: [],
    checkpoints: [{ id: 'cp1', x: 34, y: DC_GROUND + 1.5 }, { id: 'cp2', x: 57, y: DC_GROUND + 1.5 }],
    finish: { x: 75, y: DC_GROUND + 1.5 },
  },

  {
    id: 'iz-03',
    worldId: 'industrial-zone',
    levelNumber: 3,
    name: 'Gear Works',
    description: 'Spinning gears and hydraulic arms. Read the rhythm, find your window.',
    starThresholds: { one: 230, two: 155, three: 115 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -21, cameraZoom: 9,
    targetScore: 9500,
    terrain: [
      { points: flat(-2, 75, DC_GROUND), type: 'ground' },
      { points: [...hill(12, 17, 22, DC_GROUND, 4.0)], type: 'ramp' },
      { points: [...hill(38, 45, 52, DC_GROUND, 5.0)], type: 'ramp' },
      { points: [...hill(58, 63, 68, DC_GROUND, 3.5)], type: 'ramp' },
    ],
    movingPlatforms: [],
    rotatingObstacles: [
      { id: 'ro1', x: 28, y: DC_GROUND + 3, width: 5, height: 0.35, rotationSpeed: 2.8, startAngle: 0 },
      { id: 'ro2', x: 50, y: DC_GROUND + 4, width: 6, height: 0.35, rotationSpeed: -2.2, startAngle: Math.PI / 4 },
      { id: 'ro3', x: 65, y: DC_GROUND + 3, width: 4.5, height: 0.35, rotationSpeed: 3.0, startAngle: Math.PI / 2 },
    ],
    checkpoints: [{ id: 'cp1', x: 25, y: DC_GROUND + 1.5 }, { id: 'cp2', x: 55, y: DC_GROUND + 1.5 }],
    finish: { x: 75, y: DC_GROUND + 1.5 },
  },

  {
    id: 'iz-04',
    worldId: 'industrial-zone',
    levelNumber: 4,
    name: 'Catwalk Sprint',
    description: 'Elevated metal walkways high above the factory floor. Do not fall.',
    starThresholds: { one: 220, two: 145, three: 108 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -21, cameraZoom: 9,
    targetScore: 11000,
    terrain: [
      { points: flat(-2, 8, DC_GROUND), type: 'ground' },
      { points: [[8, DC_GROUND], [14, DC_GROUND + 5]], type: 'ramp' },
      { points: flat(14, 30, DC_GROUND + 5), type: 'platform' },
      { points: flat(33, 50, DC_GROUND + 5), type: 'platform' },
      { points: flat(53, 70, DC_GROUND + 5), type: 'platform' },
      { points: [[70, DC_GROUND + 5], [76, DC_GROUND]], type: 'ramp' },
      { points: flat(76, 85, DC_GROUND), type: 'ground' },
    ],
    movingPlatforms: [
      { id: 'mp1', x: 30, y: DC_GROUND + 5.3, width: 2.5, height: 0.4, motion: 'vertical', range: 2, speed: 2.0, phase: 0 },
      { id: 'mp2', x: 50, y: DC_GROUND + 5.3, width: 2.5, height: 0.4, motion: 'vertical', range: 2, speed: 2.0, phase: 0.5 },
    ],
    rotatingObstacles: [],
    checkpoints: [{ id: 'cp1', x: 20, y: DC_GROUND + 6.5 }, { id: 'cp2', x: 56, y: DC_GROUND + 6.5 }],
    finish: { x: 85, y: DC_GROUND + 1.5 },
  },

  {
    id: 'iz-05',
    worldId: 'industrial-zone',
    levelNumber: 5,
    name: 'Apex Shutdown',
    description: 'The final machine. Maximum everything. Only the APEX-X worthy finish here.',
    starThresholds: { one: 300, two: 200, three: 150 },
    spawnX: 0, spawnY: DC_GROUND + 1.5, gravity: -21, cameraZoom: 8.5,
    targetScore: 20000,
    terrain: [
      { points: flat(-2, 8, DC_GROUND), type: 'ground' },
      { points: [...hill(8, 14, 20, DC_GROUND, 5.0)], type: 'ramp' },
      { points: flat(20, 26, DC_GROUND + 5), type: 'platform' },
      { points: flat(30, 36, DC_GROUND + 5), type: 'platform' },
      { points: flat(40, 55, DC_GROUND + 8), type: 'platform' },
      { points: [[55, DC_GROUND + 8], [63, DC_GROUND]], type: 'ramp' },
      { points: flat(63, 90, DC_GROUND), type: 'ground' },
      { points: [...hill(70, 77, 84, DC_GROUND, 4.5)], type: 'ramp' },
    ],
    movingPlatforms: [
      { id: 'mp1', x: 26, y: DC_GROUND + 5.3, width: 3, height: 0.4, motion: 'horizontal', range: 2, speed: 3.0, phase: 0 },
      { id: 'mp2', x: 36, y: DC_GROUND + 5.3, width: 3, height: 0.4, motion: 'vertical', range: 3, speed: 2.5, phase: 0.3 },
    ],
    rotatingObstacles: [
      { id: 'ro1', x: 42, y: DC_GROUND + 11, width: 7, height: 0.35, rotationSpeed: 2.5, startAngle: 0 },
      { id: 'ro2', x: 75, y: DC_GROUND + 3, width: 5, height: 0.35, rotationSpeed: -3.2, startAngle: Math.PI / 3 },
    ],
    checkpoints: [
      { id: 'cp1', x: 23, y: DC_GROUND + 6.5 },
      { id: 'cp2', x: 48, y: DC_GROUND + 9.5 },
      { id: 'cp3', x: 70, y: DC_GROUND + 1.5 },
    ],
    finish: { x: 90, y: DC_GROUND + 1.5 },
  },
];

export const getLevel = (id: string): LevelDefinition | undefined =>
  LEVELS.find((l) => l.id === id);

export const getWorldLevels = (worldId: WorldId): LevelDefinition[] =>
  LEVELS.filter((l) => l.worldId === worldId);

export const getWorld = (id: WorldId): WorldDefinition | undefined =>
  WORLDS.find((w) => w.id === id);

export const ALL_LEVEL_IDS = LEVELS.map((l) => l.id);
