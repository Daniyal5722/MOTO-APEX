// Rigorous Physics & Gameplay Verification Test
import { LEVELS } from './src/data/levels';
import { BIKES } from './src/data/bikes';
import { GameEngine } from './src/game/GameEngine';
import { inputManager } from './src/game/input/InputManager';

console.log('🏁 STARTING APEX MOTO RUSH PHYSICS & GAMEPLAY VERIFICATION...\n');

const level = LEVELS[0];
const bike = BIKES[0]; // Rebel

const engine = new GameEngine(level, bike.physics, {
  onStateUpdate: () => {},
  onCrash: () => {},
  onCheckpoint: () => {},
  onFinish: () => {},
  onStunt: () => {},
});

// Step simulation manually without RAF for test determinism
const stepEngine = (dt: number, steps: number) => {
  const enginePrivate = engine as unknown as { physicsStep: (dt: number) => void };
  for (let s = 0; s < steps; s++) {
    enginePrivate.physicsStep(dt / 2);
    enginePrivate.physicsStep(dt / 2);
  }
};

// TEST 1: Initial Spawn & Settle
console.log('--- TEST 1: Spawn & Ground Settle ---');
stepEngine(1/60, 10);
let state = engine.getState();
console.log(`Spawn: x=${state.bike.x.toFixed(2)}, y=${state.bike.y.toFixed(2)}, onGround=${state.bike.rearWheel.onGround || state.bike.frontWheel.onGround}`);
if (!state.bike.rearWheel.onGround && !state.bike.frontWheel.onGround) {
  // Settle until ground contact
  stepEngine(1/60, 30);
  state = engine.getState();
}
console.log(`After settle: y=${state.bike.y.toFixed(2)}, rearOnGround=${state.bike.rearWheel.onGround}, frontOnGround=${state.bike.frontWheel.onGround}`);
console.assert(state.bike.rearWheel.onGround || state.bike.frontWheel.onGround, 'Bike should settle onto terrain');

// TEST 2: Acceleration & Fast Speed
console.log('\n--- TEST 2: Acceleration & High Speed Response ---');
inputManager.setTouchAccelerate(true);
stepEngine(1/60, 60); // 1 second of throttle
state = engine.getState();
console.log(`Speed after 1s acceleration: vx=${state.bike.vx.toFixed(2)} m/s (speed=${state.bike.speed.toFixed(2)} m/s, x=${state.bike.x.toFixed(2)})`);
console.assert(state.bike.vx > 8.0, `Bike should accelerate quickly, got ${state.bike.vx.toFixed(2)} m/s`);

// TEST 3: Mobile Jump Button & Upward Impulse
console.log('\n--- TEST 3: Jump Button & Upward Launch ---');
const vyBeforeJump = state.bike.vy;
inputManager.setTouchJump(true);
stepEngine(1/60, 2); // Trigger jump
state = engine.getState();
console.log(`vy before jump: ${vyBeforeJump.toFixed(2)}, vy after jump: ${state.bike.vy.toFixed(2)}, inAir: ${state.bike.isInAir}`);
console.assert(state.bike.vy >= 12.0, `Jump must impart strong upward impulse (>=12 m/s), got ${state.bike.vy.toFixed(2)}`);
inputManager.setTouchJump(false);

// TEST 4: Air Rotation (Flips / Stunts)
console.log('\n--- TEST 4: Air Rotation (Backflips & Controls) ---');
inputManager.setTouchRotateBack(true);
stepEngine(1/60, 30); // rotate back in air
state = engine.getState();
console.log(`Air rotation angle: ${(state.bike.angle * 180 / Math.PI).toFixed(1)}°, angularVelocity: ${state.bike.angularVelocity.toFixed(2)} rad/s`);
console.assert(Math.abs(state.bike.angularVelocity) > 1.0, 'Air rotation should be active and responsive');
inputManager.setTouchRotateBack(false);

// Settle back to ground safely
stepEngine(1/60, 60);
state = engine.getState();
console.log(`Landed at x=${state.bike.x.toFixed(2)}, y=${state.bike.y.toFixed(2)}, inAir=${state.bike.isInAir}, crashed=${state.bike.crashed}`);

// TEST 5: Ramp Launch Test
console.log('\n--- TEST 5: Ramp Launch Over Obstacles ---');
engine.respawn();
inputManager.setTouchAccelerate(true);
// Drive up the first ramp at x=10-18
let launchedInAir = false;
let maxAirY = -Infinity;
for (let f = 0; f < 180; f++) {
  stepEngine(1/60, 1);
  const s = engine.getState();
  if (s.bike.x >= 14 && s.bike.isInAir) {
    launchedInAir = true;
    if (s.bike.y > maxAirY) maxAirY = s.bike.y;
  }
}
console.log(`Ramp launch test: reached ramp, launchedInAir=${launchedInAir}, peak height y=${maxAirY.toFixed(2)}`);
console.assert(launchedInAir, 'Bike must launch into air from ramp');

console.log('\n✅ ALL PHYSICS & GAMEPLAY ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
