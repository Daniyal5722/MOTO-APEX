// APEX MOTO RUSH — Core Game Physics Engine
// High-performance 2D physics simulation with fixed timestep, wheel suspension,
// terrain collision, moving platforms, rotating obstacle hazards, stunt detection, and checkpoints.

import { LevelDefinition } from '@/data/levels';
import { BikePhysicsConfig } from '@/data/bikes';
import { StuntSystem, StuntEvent } from '@/game/systems/StuntSystem';
import { calculateStars } from '@/game/systems/StarSystem';
import { inputManager } from '@/game/input/InputManager';
import { soundManager } from '@/game/audio/SoundManager';

export interface Vec2 { x: number; y: number; }

export interface WheelState {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  onGround: boolean;
  suspensionCompression: number;
}

export interface BikePhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  frontWheel: WheelState;
  rearWheel: WheelState;
  isInAir: boolean;
  crashed: boolean;
  facingRight: boolean;
  speed: number;
}

export interface PlatformState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ObstacleState {
  id: string;
  x: number;
  y: number;
  angle: number;
  width: number;
  height: number;
}

export interface CheckpointState {
  id: string;
  x: number;
  y: number;
  activated: boolean;
}

export interface GameEngineState {
  bike: BikePhysicsState;
  platforms: PlatformState[];
  obstacles: ObstacleState[];
  checkpoints: CheckpointState[];
  finishReached: boolean;
  elapsedTimeMs: number;
  score: number;
  combo: number;
  multiplier: number;
  stuntEvents: StuntEvent[];
  totalStunts: number;
  currentCheckpointIndex: number;
  respawnX: number;
  respawnY: number;
}

const FIXED_DT = 1 / 60;
const MAX_DT = 1 / 20;
const PHYSICS_SUBSTEPS = 2;

interface TerrainLine {
  x1: number; y1: number;
  x2: number; y2: number;
  friction: number;
}

function buildTerrainLines(level: LevelDefinition): TerrainLine[] {
  const lines: TerrainLine[] = [];
  for (const seg of level.terrain) {
    const pts = seg.points;
    const friction = seg.friction ?? 1.0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      lines.push({ x1, y1, x2, y2, friction });
    }
  }
  return lines;
}

function closestPointOnSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): { x: number; y: number; t: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { x: ax, y: ay, t: 0 };
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return { x: ax + t * dx, y: ay + t * dy, t };
}

export class GameEngine {
  private level: LevelDefinition;
  private bikeConfig: BikePhysicsConfig;
  private terrainLines: TerrainLine[] = [];
  private stuntSystem = new StuntSystem();

  private state: GameEngineState;
  private accumulator = 0;
  private lastTimestamp = 0;
  private rafId: number | null = null;
  private running = false;
  private paused = false;
  private jumpCooldown = 0;

  private onStateUpdate: (state: GameEngineState) => void;
  private onCrash: () => void;
  private onCheckpoint: (index: number) => void;
  private onFinish: (stars: 0|1|2|3, timeMs: number, score: number, combo: number, stunts: number) => void;
  private onStunt: (events: StuntEvent[]) => void;

  constructor(
    level: LevelDefinition,
    bikeConfig: BikePhysicsConfig,
    callbacks: {
      onStateUpdate: (state: GameEngineState) => void;
      onCrash: () => void;
      onCheckpoint: (index: number) => void;
      onFinish: (stars: 0|1|2|3, timeMs: number, score: number, combo: number, stunts: number) => void;
      onStunt: (events: StuntEvent[]) => void;
    }
  ) {
    this.level = level;
    this.bikeConfig = bikeConfig;
    this.onStateUpdate = callbacks.onStateUpdate;
    this.onCrash = callbacks.onCrash;
    this.onCheckpoint = callbacks.onCheckpoint;
    this.onFinish = callbacks.onFinish;
    this.onStunt = callbacks.onStunt;

    this.terrainLines = buildTerrainLines(level);
    this.state = this.buildInitialState();
  }

  private buildInitialState(): GameEngineState {
    const spawnX = this.level.spawnX;
    const spawnY = this.level.spawnY;
    const wr = this.bikeConfig.wheelRadius;
    const wheelBase = 1.2;

    return {
      bike: {
        x: spawnX,
        y: spawnY,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
        frontWheel: {
          x: spawnX + wheelBase / 2,
          y: spawnY - wr * 1.2,
          radius: wr,
          rotation: 0,
          onGround: false,
          suspensionCompression: 0,
        },
        rearWheel: {
          x: spawnX - wheelBase / 2,
          y: spawnY - wr * 1.2,
          radius: wr,
          rotation: 0,
          onGround: false,
          suspensionCompression: 0,
        },
        isInAir: true,
        crashed: false,
        facingRight: true,
        speed: 0,
      },
      platforms: this.level.movingPlatforms.map(p => ({
        id: p.id, x: p.x, y: p.y, width: p.width, height: p.height
      })),
      obstacles: this.level.rotatingObstacles.map(o => ({
        id: o.id, x: o.x, y: o.y, angle: o.startAngle ?? 0, width: o.width, height: o.height
      })),
      checkpoints: this.level.checkpoints.map(c => ({
        id: c.id, x: c.x, y: c.y, activated: false
      })),
      finishReached: false,
      elapsedTimeMs: 0,
      score: 0,
      combo: 0,
      multiplier: 1,
      stuntEvents: [],
      totalStunts: 0,
      currentCheckpointIndex: -1,
      respawnX: spawnX,
      respawnY: spawnY,
    };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTimestamp = performance.now();
    this.stuntSystem.reset();
    inputManager.mount();
    this.loop(performance.now());
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    inputManager.unmount();
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.lastTimestamp = performance.now();
  }

  respawn(): void {
    const { respawnX, respawnY } = this.state;
    const wr = this.bikeConfig.wheelRadius;
    const wheelBase = 1.2;
    this.stuntSystem.reset();
    this.state = {
      ...this.state,
      bike: {
        x: respawnX,
        y: respawnY,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
        frontWheel: {
          x: respawnX + wheelBase / 2,
          y: respawnY - wr * 1.2,
          radius: wr,
          rotation: 0,
          onGround: false,
          suspensionCompression: 0,
        },
        rearWheel: {
          x: respawnX - wheelBase / 2,
          y: respawnY - wr * 1.2,
          radius: wr,
          rotation: 0,
          onGround: false,
          suspensionCompression: 0,
        },
        isInAir: true,
        crashed: false,
        facingRight: true,
        speed: 0,
      },
      combo: 0,
      multiplier: 1,
      stuntEvents: [],
    };
  }

  private loop = (timestamp: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.loop);

    if (this.paused) {
      this.lastTimestamp = timestamp;
      return;
    }

    let dt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    dt = Math.min(dt, MAX_DT);

    // Update timer & cooldowns
    this.state.elapsedTimeMs += dt * 1000;
    this.jumpCooldown = Math.max(0, this.jumpCooldown - dt);

    // Update moving platforms
    this.updatePlatforms(this.state.elapsedTimeMs / 1000);

    // Update rotating obstacles
    this.updateObstacles(dt);

    // Fixed timestep physics
    this.accumulator += dt;
    while (this.accumulator >= FIXED_DT) {
      this.physicsStep(FIXED_DT / PHYSICS_SUBSTEPS);
      this.physicsStep(FIXED_DT / PHYSICS_SUBSTEPS);
      this.accumulator -= FIXED_DT;
    }

    // Stunt detection
    const stuntEvents = this.stuntSystem.update(
      this.state.bike.angle,
      this.state.bike.isInAir,
      dt
    );

    if (stuntEvents.length > 0) {
      this.state.stuntEvents = stuntEvents;
      this.state.totalStunts += stuntEvents.filter(e => e.type !== 'clean_land').length;
      stuntEvents.forEach(e => {
        this.state.score += e.points * this.state.multiplier;
      });
      this.state.combo++;
      this.state.multiplier = Math.min(10, 1 + Math.floor(this.state.combo / 2));
      this.onStunt(stuntEvents);
    } else {
      this.state.stuntEvents = [];
    }

    // Check checkpoints
    this.checkCheckpoints();

    // Check finish
    this.checkFinish();

    this.onStateUpdate({ ...this.state });
  };

  private updatePlatforms(time: number): void {
    this.level.movingPlatforms.forEach((def, i) => {
      const platform = this.state.platforms[i];
      if (!platform) return;
      const phase = (def.phase ?? 0) * Math.PI * 2;
      if (def.motion === 'horizontal') {
        platform.x = def.x + Math.sin(time * def.speed + phase) * def.range;
      } else {
        platform.y = def.y + Math.sin(time * def.speed + phase) * def.range;
      }
    });
  }

  private updateObstacles(dt: number): void {
    this.level.rotatingObstacles.forEach((def, i) => {
      const obs = this.state.obstacles[i];
      if (!obs) return;
      obs.angle += def.rotationSpeed * dt;
    });
  }

  private physicsStep(dt: number): void {
    const bike = this.state.bike;
    const cfg = this.bikeConfig;
    const input = inputManager.poll();

    if (bike.crashed) {
      // Damped motion after crash
      bike.vx *= 0.95;
      bike.vy += -25 * dt;
      bike.x += bike.vx * dt;
      bike.y += bike.vy * dt;
      bike.angle += bike.angularVelocity * dt;
      bike.angularVelocity *= 0.96;
      return;
    }

    // Apply gravity (downward)
    const gravity = this.level.gravity || -20;
    bike.vy += gravity * dt;

    // Wheel positions relative to body
    const wheelBase = 1.2;
    const cosA = Math.cos(bike.angle);
    const sinA = Math.sin(bike.angle);
    const halfWB = wheelBase / 2;

    // Wheel attachment points on frame
    const rearAttach = { x: bike.x - cosA * halfWB, y: bike.y - sinA * halfWB };
    const frontAttach = { x: bike.x + cosA * halfWB, y: bike.y + sinA * halfWB };

    const suspLen = cfg.wheelRadius * 1.3;

    // Target positions pointing downwards perpendicular to frame
    const rearWheelTarget = {
      x: rearAttach.x + sinA * suspLen,
      y: rearAttach.y - cosA * suspLen,
    };
    const frontWheelTarget = {
      x: frontAttach.x + sinA * suspLen,
      y: frontAttach.y - cosA * suspLen,
    };

    const rearGroundY = this.getGroundY(rearWheelTarget.x, rearWheelTarget.y, cfg.wheelRadius);
    const frontGroundY = this.getGroundY(frontWheelTarget.x, frontWheelTarget.y, cfg.wheelRadius);

    const rearOnGround = rearGroundY !== null;
    const frontOnGround = frontGroundY !== null;

    bike.frontWheel.onGround = frontOnGround;
    bike.rearWheel.onGround = rearOnGround;
    bike.isInAir = !rearOnGround && !frontOnGround;

    // Ground response
    if (rearOnGround || frontOnGround) {
      if (rearOnGround && rearGroundY !== null) {
        const penetration = rearGroundY - rearWheelTarget.y;
        if (penetration > 0) {
          bike.y += penetration * 0.75;
          bike.vy = Math.max(0, bike.vy);
          bike.rearWheel.suspensionCompression = Math.min(1, penetration / (suspLen * 0.5));
        } else {
          bike.rearWheel.suspensionCompression = 0;
        }
      }

      if (frontOnGround && frontGroundY !== null) {
        const penetration = frontGroundY - frontWheelTarget.y;
        if (penetration > 0) {
          bike.y += penetration * 0.75;
          bike.vy = Math.max(0, bike.vy);
          bike.frontWheel.suspensionCompression = Math.min(1, penetration / (suspLen * 0.5));
        } else {
          bike.frontWheel.suspensionCompression = 0;
        }
      }

      // Rolling resistance (smooth momentum preservation)
      bike.vx *= 0.998;

      // Align bike angle gently to slope
      const terrainSlope = this.getTerrainAngle(bike.x);
      const angleDiff = terrainSlope - bike.angle;
      bike.angle += angleDiff * 0.14;
      bike.angularVelocity *= 0.82;

      // Natural ramp vertical lift
      if (terrainSlope > 0.1 && bike.vx > 5) {
        bike.vy = Math.max(bike.vy, bike.vx * Math.sin(terrainSlope) * 0.9);
      }

      // Throttle acceleration (fast, punchy response)
      if (input.accelerate) {
        if (bike.vx < cfg.maxSpeed) {
          const accel = (cfg.motorMaxTorque / cfg.mass) * 5.0;
          bike.vx += accel * dt;
        }
      }

      // Brake / Reverse
      if (input.brake) {
        if (bike.vx > 0.5) {
          bike.vx -= (cfg.brakeTorque / cfg.mass) * 2.2 * dt;
        } else if (bike.vx > -6) {
          bike.vx -= 12 * dt;
        }
      }

      // Jump Impulse (Mobile Jump Button or Spacebar)
      if (input.jump && this.jumpCooldown <= 0) {
        bike.vy = Math.max(bike.vy + 13.0, 14.5);
        bike.vx += 3.5;
        this.jumpCooldown = 0.28;
        bike.frontWheel.onGround = false;
        bike.rearWheel.onGround = false;
        bike.isInAir = true;
        soundManager.playJump();
      }

      // Ground lean (wheelie / stoppie balance)
      if (input.rotateBack) {
        bike.angularVelocity += (cfg.airRotationSpeed * 1.6) * dt;
      }
      if (input.rotateFront) {
        bike.angularVelocity -= (cfg.airRotationSpeed * 1.6) * dt;
      }
      bike.angle += bike.angularVelocity * dt;
      bike.angularVelocity *= 0.88;
    } else {
      // In-Air Rotation (flips, tricks & recovery)
      bike.rearWheel.suspensionCompression = 0;
      bike.frontWheel.suspensionCompression = 0;

      if (input.rotateBack) {
        bike.angularVelocity += cfg.airRotationSpeed * 2.2 * dt;
      }
      if (input.rotateFront) {
        bike.angularVelocity -= cfg.airRotationSpeed * 2.2 * dt;
      }

      // Air Jump / In-air boost (if player hit ramp lip)
      if (input.jump && this.jumpCooldown <= 0 && bike.speed > 5) {
        bike.vy += 4.5;
        this.jumpCooldown = 0.5;
      }

      bike.angularVelocity *= 0.985;
      bike.angle += bike.angularVelocity * dt;
      bike.vx *= 0.999;
    }

    // Integrate position
    bike.x += bike.vx * dt;
    bike.y += bike.vy * dt;

    // Wheel rotation
    const wheelCirc = 2 * Math.PI * cfg.wheelRadius;
    const rotPerMeter = (2 * Math.PI) / wheelCirc;
    bike.rearWheel.rotation += bike.vx * dt * rotPerMeter;
    bike.frontWheel.rotation += bike.vx * dt * rotPerMeter;

    // Actual wheel coordinates for rendering
    bike.rearWheel.x = rearAttach.x + sinA * (suspLen * (1 - bike.rearWheel.suspensionCompression * 0.3));
    bike.rearWheel.y = rearAttach.y - cosA * (suspLen * (1 - bike.rearWheel.suspensionCompression * 0.3));
    bike.frontWheel.x = frontAttach.x + sinA * (suspLen * (1 - bike.frontWheel.suspensionCompression * 0.3));
    bike.frontWheel.y = frontAttach.y - cosA * (suspLen * (1 - bike.frontWheel.suspensionCompression * 0.3));

    bike.speed = Math.sqrt(bike.vx * bike.vx + bike.vy * bike.vy);

    // Obstacle Hazard Collisions
    for (const obs of this.state.obstacles) {
      const dx = bike.x - obs.x;
      const dy = bike.y - obs.y;
      const cosO = Math.cos(-obs.angle);
      const sinO = Math.sin(-obs.angle);
      const localX = dx * cosO - dy * sinO;
      const localY = dx * sinO + dy * cosO;
      const hw = obs.width / 2;
      const hh = obs.height / 2 + 0.35;
      if (Math.abs(localX) < hw && Math.abs(localY) < hh) {
        bike.crashed = true;
        this.state.combo = 0;
        this.state.multiplier = 1;
        this.stuntSystem.reset();
        this.onCrash();
        return;
      }
    }

    // Crash detection: landing upside down
    const absAngle = Math.abs(bike.angle % (Math.PI * 2));
    const normalizedAngle = absAngle > Math.PI ? Math.PI * 2 - absAngle : absAngle;
    if (!bike.isInAir && normalizedAngle > 1.35) {
      bike.crashed = true;
      this.state.combo = 0;
      this.state.multiplier = 1;
      this.stuntSystem.reset();
      this.onCrash();
      return;
    }

    // Fallen off bottom of track into canyon
    if (bike.y < -18) {
      bike.crashed = true;
      this.state.combo = 0;
      this.state.multiplier = 1;
      this.stuntSystem.reset();
      this.onCrash();
    }
  }

  private getGroundY(wx: number, wy: number, wheelRadius: number): number | null {
    let highestGroundY: number | null = null;

    // Check terrain segments
    for (const line of this.terrainLines) {
      // Check if wx is within horizontal range of segment with margin
      const minX = Math.min(line.x1, line.x2) - wheelRadius;
      const maxX = Math.max(line.x1, line.x2) + wheelRadius;
      if (wx < minX || wx > maxX) continue;

      const cp = closestPointOnSegment(wx, wy, line.x1, line.y1, line.x2, line.y2);
      const targetCenterY = cp.y + wheelRadius;
      // Wheel can touch if it's within tolerance above/below terrain surface
      if (wy <= targetCenterY + 0.35 && wy >= cp.y - 0.5) {
        if (targetCenterY > (highestGroundY ?? -Infinity)) {
          highestGroundY = targetCenterY;
        }
      }
    }

    // Check platforms
    for (const platform of this.state.platforms) {
      const px = platform.x;
      const py = platform.y;
      const pw = platform.width;
      if (wx >= px - wheelRadius * 0.5 && wx <= px + pw + wheelRadius * 0.5) {
        const targetCenterY = py + wheelRadius;
        if (wy <= targetCenterY + 0.4 && wy >= py - 0.4) {
          if (targetCenterY > (highestGroundY ?? -Infinity)) {
            highestGroundY = targetCenterY;
          }
        }
      }
    }

    return highestGroundY;
  }

  private getTerrainAngle(x: number): number {
    for (const line of this.terrainLines) {
      if (x >= Math.min(line.x1, line.x2) && x <= Math.max(line.x1, line.x2)) {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        return Math.atan2(dy, dx);
      }
    }
    return 0;
  }

  private checkCheckpoints(): void {
    const bike = this.state.bike;
    this.state.checkpoints.forEach((cp, i) => {
      if (cp.activated) return;
      const dist = Math.sqrt((bike.x - cp.x) ** 2 + (bike.y - cp.y) ** 2);
      if (dist < 2.0) {
        cp.activated = true;
        this.state.currentCheckpointIndex = i;
        this.state.respawnX = cp.x;
        this.state.respawnY = cp.y + 1.2;
        this.onCheckpoint(i);
      }
    });
  }

  private checkFinish(): void {
    if (this.state.finishReached) return;
    const bike = this.state.bike;
    const finish = this.level.finish;
    const dist = Math.sqrt((bike.x - finish.x) ** 2 + (bike.y - finish.y) ** 2);
    if (dist < 2.5) {
      this.state.finishReached = true;
      const stars = calculateStars(this.level, this.state.elapsedTimeMs, this.state.score);
      this.onFinish(stars, this.state.elapsedTimeMs, this.state.score, this.state.combo, this.state.totalStunts);
    }
  }

  getState(): GameEngineState {
    return this.state;
  }
}
