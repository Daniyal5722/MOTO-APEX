// APEX MOTO RUSH — Original Motorcycle Definitions

export type BikeId = 'rebel' | 'striker' | 'dirtpaw' | 'phantom' | 'apex-x';

export interface BikeStats {
  speed: number;
  acceleration: number;
  handling: number;
  stability: number;
  airControl: number;
}

export interface BikeUnlockCondition {
  type: 'default' | 'stars' | 'levels' | 'score';
  value?: number;
  description: string;
}

export interface BikeColors {
  bodyPrimary: string;
  bodySecondary: string;
  mechanicalAccent: string;
  wheelRim: string;
  seat: string;
  exhaust: string;
}

export interface BikePhysicsConfig {
  mass: number;
  motorMaxTorque: number;
  brakeTorque: number;
  maxSpeed: number;
  wheelRadius: number;
  wheelFriction: number;
  suspensionStiffness: number;
  suspensionDamping: number;
  airRotationSpeed: number;
}

export interface BikeDefinition {
  id: BikeId;
  name: string;
  tagline: string;
  description: string;
  stats: BikeStats;
  colors: BikeColors;
  physics: BikePhysicsConfig;
  unlock: BikeUnlockCondition;
  tier: 1 | 2 | 3 | 4 | 5;
}

export const BIKES: BikeDefinition[] = [
  {
    id: 'rebel',
    name: 'REBEL',
    tagline: 'Your first weapon.',
    description: 'Forged for riders who are just finding their edge. The Rebel is balanced, forgiving, and deceptively fast when pushed.',
    tier: 1,
    stats: { speed: 5, acceleration: 5, handling: 6, stability: 7, airControl: 5 },
    colors: {
      bodyPrimary: '#C0392B',
      bodySecondary: '#1C1C1C',
      mechanicalAccent: '#BDC3C7',
      wheelRim: '#2C3E50',
      seat: '#2C2C2C',
      exhaust: '#7F8C8D',
    },
    physics: {
      mass: 140, motorMaxTorque: 380, brakeTorque: 220, maxSpeed: 28,
      wheelRadius: 0.35, wheelFriction: 1.2, suspensionStiffness: 28,
      suspensionDamping: 3.5, airRotationSpeed: 3.6,
    },
    unlock: { type: 'default', description: 'Available from the start' },
  },
  {
    id: 'striker',
    name: 'STRIKER',
    tagline: 'Street bred. Track tested.',
    description: 'The Striker is built for pavement dominance. Aggressive front geometry and a punchy engine deliver raw velocity.',
    tier: 2,
    stats: { speed: 7, acceleration: 7, handling: 6, stability: 6, airControl: 5 },
    colors: {
      bodyPrimary: '#E8560A',
      bodySecondary: '#2C3E50',
      mechanicalAccent: '#F5C518',
      wheelRim: '#E8560A',
      seat: '#1A1A1A',
      exhaust: '#95A5A6',
    },
    physics: {
      mass: 150, motorMaxTorque: 460, brakeTorque: 260, maxSpeed: 34,
      wheelRadius: 0.33, wheelFriction: 1.1, suspensionStiffness: 32,
      suspensionDamping: 3.8, airRotationSpeed: 3.4,
    },
    unlock: { type: 'stars', value: 10, description: 'Earn 10 stars' },
  },
  {
    id: 'dirtpaw',
    name: 'DIRTPAW',
    tagline: 'No trail too rough.',
    description: 'High clearance, long suspension travel, and tires wider than ambition. The Dirtpaw turns chaos into traction.',
    tier: 3,
    stats: { speed: 6, acceleration: 6, handling: 8, stability: 8, airControl: 7 },
    colors: {
      bodyPrimary: '#27AE60',
      bodySecondary: '#784212',
      mechanicalAccent: '#F39C12',
      wheelRim: '#1C1C1C',
      seat: '#2E4053',
      exhaust: '#7F8C8D',
    },
    physics: {
      mass: 135, motorMaxTorque: 420, brakeTorque: 240, maxSpeed: 31,
      wheelRadius: 0.42, wheelFriction: 1.5, suspensionStiffness: 22,
      suspensionDamping: 4.2, airRotationSpeed: 4.2,
    },
    unlock: { type: 'levels', value: 10, description: 'Complete 10 levels' },
  },
  {
    id: 'phantom',
    name: 'PHANTOM',
    tagline: 'Speed is silence.',
    description: "A machine built around aerodynamic obsession. The Phantom's sculpted body delivers raw velocity with surgical precision.",
    tier: 4,
    stats: { speed: 9, acceleration: 8, handling: 7, stability: 6, airControl: 6 },
    colors: {
      bodyPrimary: '#1A1A2E',
      bodySecondary: '#16213E',
      mechanicalAccent: '#00B4D8',
      wheelRim: '#0077B6',
      seat: '#0D0D0D',
      exhaust: '#ADB5BD',
    },
    physics: {
      mass: 145, motorMaxTorque: 540, brakeTorque: 290, maxSpeed: 40,
      wheelRadius: 0.31, wheelFriction: 0.9, suspensionStiffness: 38,
      suspensionDamping: 4.0, airRotationSpeed: 3.5,
    },
    unlock: { type: 'stars', value: 25, description: 'Earn 25 stars' },
  },
  {
    id: 'apex-x',
    name: 'APEX-X',
    tagline: 'The pinnacle.',
    description: 'There is nothing beyond the Apex-X. Every component exists for a singular purpose: to defy what is physically possible on two wheels.',
    tier: 5,
    stats: { speed: 10, acceleration: 10, handling: 9, stability: 7, airControl: 9 },
    colors: {
      bodyPrimary: '#F5C518',
      bodySecondary: '#1A1208',
      mechanicalAccent: '#FFFFFF',
      wheelRim: '#F5C518',
      seat: '#0D0D0D',
      exhaust: '#C0C0C0',
    },
    physics: {
      mass: 130, motorMaxTorque: 650, brakeTorque: 340, maxSpeed: 48,
      wheelRadius: 0.32, wheelFriction: 1.0, suspensionStiffness: 40,
      suspensionDamping: 4.5, airRotationSpeed: 4.5,
    },
    unlock: { type: 'stars', value: 40, description: 'Earn 40 stars' },
  },
];

export const getBike = (id: BikeId): BikeDefinition => {
  const bike = BIKES.find((b) => b.id === id);
  if (!bike) return BIKES[0];
  return bike;
};

export const DEFAULT_BIKE_ID: BikeId = 'rebel';
