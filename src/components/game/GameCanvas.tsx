'use client';
// APEX MOTO RUSH — High-Performance Game Canvas Renderer
// Renders 2D physics simulation with 3D-shaded motorcycle & rider, layered parallax biomes,
// glowing neon obstacle lasers, particle emitters, checkpoint beacons, and finish line gates.

import React, { useEffect, useRef } from 'react';
import { GameEngineState, BikePhysicsState } from '@/game/GameEngine';
import { LevelDefinition, WorldDefinition } from '@/data/levels';
import { BikeDefinition } from '@/data/bikes';

interface GameCanvasProps {
  gameState: GameEngineState | null;
  level: LevelDefinition;
  world: WorldDefinition;
  bike: BikeDefinition;
  cameraX: number;
  cameraY: number;
  zoom: number;
}

// Parallax Background
function drawParallaxBackground(
  ctx: CanvasRenderingContext2D,
  world: WorldDefinition,
  camX: number,
  W: number,
  H: number
): void {
  // Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, world.skyColors[0]);
  skyGrad.addColorStop(0.65, world.skyColors[1]);
  skyGrad.addColorStop(1, world.backgroundColor);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Far Mountains / Cyber Towers (Parallax 0.08)
  const farOffset = (camX * 0.08) % 400;
  ctx.fillStyle = world.skyColors[1] + '40';
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = -400; x < W + 400; x += 180) {
    const px = x - farOffset;
    ctx.lineTo(px, H * 0.35 + Math.sin(x * 0.01) * 60);
    ctx.lineTo(px + 90, H * 0.22 + Math.cos(x * 0.012) * 50);
    ctx.lineTo(px + 180, H * 0.35 + Math.sin(x * 0.01) * 60);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Mid Layer Hills / Cyber Structures (Parallax 0.25)
  const midOffset = (camX * 0.25) % 300;
  ctx.fillStyle = world.groundColor + '60';
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = -300; x < W + 300; x += 140) {
    const px = x - midOffset;
    ctx.lineTo(px, H * 0.52 + Math.sin(x * 0.02) * 40);
    ctx.lineTo(px + 70, H * 0.42 + Math.cos(x * 0.025) * 35);
    ctx.lineTo(px + 140, H * 0.52 + Math.sin(x * 0.02) * 40);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Sun / Moon / Cyber Nexus Orb in sky
  ctx.beginPath();
  ctx.arc(W * 0.75 - (camX * 0.02) % (W + 200), H * 0.22, 45, 0, Math.PI * 2);
  const sunGrad = ctx.createRadialGradient(
    W * 0.75 - (camX * 0.02) % (W + 200),
    H * 0.22,
    5,
    W * 0.75 - (camX * 0.02) % (W + 200),
    H * 0.22,
    45
  );
  sunGrad.addColorStop(0, world.accentColor + 'CC');
  sunGrad.addColorStop(0.5, world.accentColor + '40');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.fill();
}

// 3D-Style Motorcycle & Rider
function drawBike(
  ctx: CanvasRenderingContext2D,
  bike: BikeDefinition,
  state: BikePhysicsState,
  scale: number,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number
): void {
  const { x, y, angle, frontWheel, rearWheel, facingRight } = state;
  const colors = bike.colors;
  const wr = frontWheel.radius * scale;
  const wheelBase = 1.2 * scale;
  const halfWB = wheelBase / 2;

  // Draw Wheels first
  const drawWheel = (wheel: typeof frontWheel, isRear: boolean) => {
    const wx = toScreenX(wheel.x);
    const wy = toScreenY(wheel.y);

    ctx.save();
    ctx.translate(wx, wy);

    // Tire outer shadow & tread
    ctx.beginPath();
    ctx.arc(0, 0, wr, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Rim
    ctx.beginPath();
    ctx.arc(0, 0, wr * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = colors.wheelRim;
    ctx.fill();

    // Brake disc
    if (isRear) {
      ctx.beginPath();
      ctx.arc(0, 0, wr * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#71717a';
      ctx.fill();
    }

    // Spokes
    ctx.rotate(wheel.rotation);
    ctx.strokeStyle = colors.mechanicalAccent;
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * wr * 0.62, Math.sin(a) * wr * 0.62);
      ctx.stroke();
    }

    // Hub center
    ctx.beginPath();
    ctx.arc(0, 0, wr * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#d4d4d8';
    ctx.fill();

    ctx.restore();
  };

  drawWheel(rearWheel, true);
  drawWheel(frontWheel, false);

  // Bike Body & Rider
  const bx = toScreenX(x);
  const by = toScreenY(y);

  ctx.save();
  ctx.translate(bx, by);
  // Screen Y is inverted, so clockwise rotation is -angle
  ctx.rotate(-angle);
  if (!facingRight) ctx.scale(-1, 1);

  // Suspension Forks connecting wheels to frame
  const rearScreenX = -halfWB;
  const rearScreenY = wr * 1.05 * (1 - rearWheel.suspensionCompression * 0.3);
  const frontScreenX = halfWB;
  const frontScreenY = wr * 1.05 * (1 - frontWheel.suspensionCompression * 0.3);

  ctx.strokeStyle = colors.mechanicalAccent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Rear swingarm
  ctx.moveTo(-halfWB * 0.3, 0);
  ctx.lineTo(rearScreenX, rearScreenY);
  // Front fork
  ctx.moveTo(halfWB * 0.4, -wr * 0.8);
  ctx.lineTo(frontScreenX, frontScreenY);
  ctx.stroke();

  // Engine Block
  ctx.fillStyle = '#27272a';
  ctx.fillRect(-halfWB * 0.4, -wr * 0.2, halfWB * 0.8, wr * 0.6);
  ctx.strokeStyle = colors.mechanicalAccent;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-halfWB * 0.4, -wr * 0.2, halfWB * 0.8, wr * 0.6);

  // Exhaust Pipe
  ctx.strokeStyle = colors.exhaust;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-halfWB * 0.2, wr * 0.2);
  ctx.lineTo(-halfWB * 0.9, wr * 0.05);
  ctx.stroke();

  // Main Chassis Fairing / Tank
  ctx.beginPath();
  ctx.moveTo(-halfWB * 0.7, -wr * 0.4); // tail
  ctx.lineTo(-halfWB * 0.2, -wr * 0.55); // seat base
  ctx.lineTo(halfWB * 0.2, -wr * 0.95);  // tank top
  ctx.lineTo(halfWB * 0.75, -wr * 0.7);  // front headlight cowl
  ctx.lineTo(halfWB * 0.6, -wr * 0.1);   // front lower
  ctx.lineTo(-halfWB * 0.4, 0);          // belly
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(-halfWB, -wr, halfWB, wr * 0.5);
  bodyGrad.addColorStop(0, colors.bodyPrimary);
  bodyGrad.addColorStop(0.6, colors.bodySecondary);
  bodyGrad.addColorStop(1, colors.bodyPrimary);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.strokeStyle = colors.mechanicalAccent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Seat
  ctx.fillStyle = colors.seat;
  ctx.beginPath();
  ctx.moveTo(-halfWB * 0.6, -wr * 0.42);
  ctx.lineTo(-halfWB * 0.05, -wr * 0.58);
  ctx.lineTo(halfWB * 0.05, -wr * 0.45);
  ctx.lineTo(-halfWB * 0.55, -wr * 0.35);
  ctx.closePath();
  ctx.fill();

  // Handlebars
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(halfWB * 0.35, -wr * 0.85);
  ctx.lineTo(halfWB * 0.42, -wr * 1.15);
  ctx.stroke();

  // Headlight Glow (Laser White)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(halfWB * 0.78, -wr * 0.65, 4, 0, Math.PI * 2);
  ctx.fill();

  // RIDER (Helmet, Torso, Legs)
  // Torso
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.moveTo(-halfWB * 0.25, -wr * 0.6); // hip
  ctx.lineTo(halfWB * 0.05, -wr * 1.3);  // neck
  ctx.lineTo(halfWB * 0.2, -wr * 1.25);  // chest
  ctx.lineTo(-halfWB * 0.1, -wr * 0.55); // waist
  ctx.closePath();
  ctx.fill();

  // Helmet
  ctx.fillStyle = colors.bodyPrimary;
  ctx.beginPath();
  ctx.arc(halfWB * 0.12, -wr * 1.55, wr * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Visor (Neon Chrome)
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(halfWB * 0.28, -wr * 1.55, wr * 0.18, -Math.PI / 4, Math.PI / 4);
  ctx.fill();

  // Arms to handlebars
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(halfWB * 0.08, -wr * 1.25);
  ctx.lineTo(halfWB * 0.4, -wr * 1.15);
  ctx.stroke();

  // Legs / Boots to footpegs
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-halfWB * 0.2, -wr * 0.6);
  ctx.lineTo(-halfWB * 0.05, -wr * 0.1);
  ctx.stroke();

  ctx.restore();
}

// Draw Terrain
function drawTerrain(
  ctx: CanvasRenderingContext2D,
  level: LevelDefinition,
  world: WorldDefinition,
  scale: number,
  canvasH: number,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number
): void {
  for (const seg of level.terrain) {
    const pts = seg.points;
    if (pts.length < 2) continue;

    const startX = toScreenX(pts[0][0]);
    const startY = toScreenY(pts[0][1]);

    // Ground fill
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(toScreenX(pts[i][0]), toScreenY(pts[i][1]));
    }
    const endX = toScreenX(pts[pts.length - 1][0]);
    ctx.lineTo(endX, canvasH + 200);
    ctx.lineTo(startX, canvasH + 200);
    ctx.closePath();

    const groundGrad = ctx.createLinearGradient(0, startY, 0, canvasH + 200);
    groundGrad.addColorStop(0, world.groundColor);
    groundGrad.addColorStop(0.35, world.groundColor + 'DD');
    groundGrad.addColorStop(1, world.backgroundColor);
    ctx.fillStyle = groundGrad;
    ctx.fill();

    // Top Surface Line (Neon Glow)
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(toScreenX(pts[i][0]), toScreenY(pts[i][1]));
    }
    ctx.strokeStyle = world.accentColor;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Texture Dash on surface
    ctx.strokeStyle = '#ffffff40';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 16]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// Draw Moving Platforms
function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  state: GameEngineState,
  world: WorldDefinition,
  scale: number,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number
): void {
  for (const p of state.platforms) {
    const sx = toScreenX(p.x);
    const sy = toScreenY(p.y);
    const sw = p.width * scale;
    const sh = p.height * scale;

    // Platform Body
    ctx.fillStyle = '#18181b';
    ctx.fillRect(sx, sy, sw, sh);

    // Neon Accent Top Strip
    ctx.fillStyle = world.accentColor;
    ctx.fillRect(sx, sy, sw, 4);

    // Border
    ctx.strokeStyle = world.accentColor + '99';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);

    // Hydraulic cables / Thrusters
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(sx + sw * 0.2, sy + sh, 6, 12);
    ctx.fillRect(sx + sw * 0.8 - 6, sy + sh, 6, 12);
  }
}

// Draw Rotating Obstacles
function drawObstacles(
  ctx: CanvasRenderingContext2D,
  state: GameEngineState,
  world: WorldDefinition,
  scale: number,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number
): void {
  for (const obs of state.obstacles) {
    const sx = toScreenX(obs.x);
    const sy = toScreenY(obs.y);
    const sw = obs.width * scale;
    const sh = obs.height * scale;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-obs.angle);

    // Hazard Blade Bar
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);

    // Neon Laser Glow
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-sw / 2, -sh / 2, sw, sh);

    // Center Core
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }
}

// Draw Checkpoints
function drawCheckpoints(
  ctx: CanvasRenderingContext2D,
  state: GameEngineState,
  scale: number,
  time: number,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number
): void {
  for (const cp of state.checkpoints) {
    const sx = toScreenX(cp.x);
    const sy = toScreenY(cp.y);

    const isActivated = cp.activated;
    const color = isActivated ? '#10b981' : '#f59e0b';

    // Vertical Holographic Beam
    ctx.fillStyle = isActivated ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.15)';
    ctx.fillRect(sx - 12, sy - 80, 24, 80);

    // Post
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx, sy - 70);
    ctx.stroke();

    // Banner Flag
    const wave = Math.sin(time * 6) * 4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 70);
    ctx.lineTo(sx + 30 + wave, sy - 55);
    ctx.lineTo(sx, sy - 40);
    ctx.closePath();
    ctx.fill();

    // Ring base
    ctx.beginPath();
    ctx.ellipse(sx, sy, 16, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Draw Finish Gate
function drawFinish(
  ctx: CanvasRenderingContext2D,
  level: LevelDefinition,
  scale: number,
  time: number,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number
): void {
  const fx = toScreenX(level.finish.x);
  const fy = toScreenY(level.finish.y);

  // Finish Archway Posts
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(fx - 15, fy);
  ctx.lineTo(fx - 15, fy - 110);
  ctx.lineTo(fx + 15, fy - 110);
  ctx.lineTo(fx + 15, fy);
  ctx.stroke();

  // Checkered Overhead Sign
  ctx.fillStyle = '#000000';
  ctx.fillRect(fx - 24, fy - 125, 48, 20);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FINISH', fx, fy - 111);

  // Strobe beacon light
  const pulse = Math.abs(Math.sin(time * 8));
  ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`;
  ctx.beginPath();
  ctx.arc(fx, fy - 132, 6, 0, Math.PI * 2);
  ctx.fill();
}

// Draw Dust & Tire Sparks
function drawDustParticles(
  ctx: CanvasRenderingContext2D,
  bike: BikePhysicsState,
  scale: number,
  time: number,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number
): void {
  if (bike.isInAir || Math.abs(bike.vx) < 3) return;

  const rx = toScreenX(bike.rearWheel.x);
  const ry = toScreenY(bike.rearWheel.y);

  for (let i = 0; i < 4; i++) {
    const phase = (time * 6 + i * 0.25) % 1;
    const px = rx - (bike.facingRight ? 1 : -1) * (phase * 40);
    const py = ry - 2 + phase * 10;
    const alpha = (1 - phase) * 0.45;
    const size = phase * 8 + 2;

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
    ctx.fill();
  }
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  level,
  world,
  bike,
  cameraX,
  cameraY,
  zoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const stateRef = useRef(gameState);
  const timeRef = useRef(0);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let frameId: number;

    const renderLoop = () => {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext('2d');
        if (ctx) {
          const state = stateRef.current;
          timeRef.current += 1 / 60;
          const time = timeRef.current;

          const dpr = window.devicePixelRatio || 1;
          const W = c.width / dpr;
          const H = c.height / dpr;

          // Reset transform to DPR
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, W, H);

          // Scale calculation: pixels per meter
          const scale = (zoom || 10) * 3.8;

          // Coordinate conversion functions
          const camOffX = W / 2 - cameraX * scale;
          const camOffY = H * 0.62 + cameraY * scale;

          const toScreenX = (wx: number) => camOffX + wx * scale;
          const toScreenY = (wy: number) => camOffY - wy * scale;

          // Parallax Sky & Background
          drawParallaxBackground(ctx, world, cameraX * scale, W, H);

          // Terrain
          drawTerrain(ctx, level, world, scale, H, toScreenX, toScreenY);

          if (state) {
            // Moving Platforms
            drawPlatforms(ctx, state, world, scale, toScreenX, toScreenY);

            // Rotating Hazard Blades
            drawObstacles(ctx, state, world, scale, toScreenX, toScreenY);

            // Checkpoints
            drawCheckpoints(ctx, state, scale, time, toScreenX, toScreenY);

            // Finish Gate
            drawFinish(ctx, level, scale, time, toScreenX, toScreenY);

            // Tire Dust / Sparks
            drawDustParticles(ctx, state.bike, scale, time, toScreenX, toScreenY);

            // 3D-Shaded Motorcycle & Rider
            drawBike(ctx, bike, state.bike, scale, toScreenX, toScreenY);
          }
        }
      }
      frameId = requestAnimationFrame(renderLoop);
      animRef.current = frameId;
    };

    frameId = requestAnimationFrame(renderLoop);
    animRef.current = frameId;

    return () => {
      ro.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [level, world, bike, cameraX, cameraY, zoom]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block select-none"
      style={{ touchAction: 'none' }}
    />
  );
};
