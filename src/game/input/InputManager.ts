// APEX MOTO RUSH — Centralized Input Manager
// Handles touch, pointer, and keyboard with responsive mapping and dedicated Jump support.

export type InputKey = 'accelerate' | 'brake' | 'rotateBack' | 'rotateFront' | 'jump' | 'pause' | 'respawn';

export interface InputState {
  accelerate: boolean;
  brake: boolean;
  rotateBack: boolean;
  rotateFront: boolean;
  jump: boolean;
  pause: boolean;
  respawn: boolean;
}

type InputListener = (state: InputState) => void;

const KEYBOARD_MAP: Record<string, InputKey> = {
  // Gas / Acceleration
  ArrowUp: 'accelerate',
  w: 'accelerate',
  W: 'accelerate',

  // Brake / Reverse
  ArrowDown: 'brake',
  s: 'brake',
  S: 'brake',

  // Lean Back (Counter-Clockwise / Wheelie)
  ArrowLeft: 'rotateBack',
  a: 'rotateBack',
  A: 'rotateBack',
  q: 'rotateBack',
  Q: 'rotateBack',

  // Lean Forward (Clockwise / Stoppie)
  ArrowRight: 'rotateFront',
  d: 'rotateFront',
  D: 'rotateFront',
  e: 'rotateFront',
  E: 'rotateFront',

  // Dedicated Jump
  ' ': 'jump',
  Space: 'jump',
  Spacebar: 'jump',
  j: 'jump',
  J: 'jump',
  Enter: 'jump',

  // System
  Escape: 'pause',
  p: 'pause',
  P: 'pause',
  r: 'respawn',
  R: 'respawn',
};

class InputManager {
  private state: InputState = {
    accelerate: false,
    brake: false,
    rotateBack: false,
    rotateFront: false,
    jump: false,
    pause: false,
    respawn: false,
  };

  private touchAccelerate = false;
  private touchBrake = false;
  private touchRotateBack = false;
  private touchRotateFront = false;
  private touchJump = false;

  private listeners: Set<InputListener> = new Set();
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyupHandler: ((e: KeyboardEvent) => void) | null = null;
  private blurHandler: (() => void) | null = null;
  private active = false;

  private pauseCallbacks: Set<() => void> = new Set();
  private respawnCallbacks: Set<() => void> = new Set();

  subscribe(listener: InputListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onPause(cb: () => void): () => void {
    this.pauseCallbacks.add(cb);
    return () => this.pauseCallbacks.delete(cb);
  }

  onRespawn(cb: () => void): () => void {
    this.respawnCallbacks.add(cb);
    return () => this.respawnCallbacks.delete(cb);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  private getState(): InputState {
    return {
      accelerate: this.state.accelerate || this.touchAccelerate,
      brake: this.state.brake || this.touchBrake,
      rotateBack: this.state.rotateBack || this.touchRotateBack,
      rotateFront: this.state.rotateFront || this.touchRotateFront,
      jump: this.state.jump || this.touchJump,
      pause: false,
      respawn: false,
    };
  }

  getCurrentState(): InputState {
    return this.getState();
  }

  poll(): InputState {
    return this.getState();
  }

  mount(): void {
    if (this.active || typeof window === 'undefined') return;
    this.active = true;

    this.keydownHandler = (e: KeyboardEvent) => {
      const key = KEYBOARD_MAP[e.key] || (e.code === 'Space' ? 'jump' : undefined);
      if (!key) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
      }
      if (key === 'pause') {
        this.pauseCallbacks.forEach((cb) => cb());
        return;
      }
      if (key === 'respawn') {
        this.respawnCallbacks.forEach((cb) => cb());
        return;
      }
      if (!this.state[key]) {
        this.state[key] = true;
        this.notify();
      }
    };

    this.keyupHandler = (e: KeyboardEvent) => {
      const key = KEYBOARD_MAP[e.key] || (e.code === 'Space' ? 'jump' : undefined);
      if (!key) return;
      if (key === 'pause' || key === 'respawn') return;
      if (this.state[key]) {
        this.state[key] = false;
        this.notify();
      }
    };

    this.blurHandler = () => {
      this.state = {
        accelerate: false,
        brake: false,
        rotateBack: false,
        rotateFront: false,
        jump: false,
        pause: false,
        respawn: false,
      };
      this.touchAccelerate = false;
      this.touchBrake = false;
      this.touchRotateBack = false;
      this.touchRotateFront = false;
      this.touchJump = false;
      this.notify();
    };

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
    window.addEventListener('blur', this.blurHandler);
  }

  unmount(): void {
    if (!this.active) return;
    this.active = false;
    if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
    if (this.keyupHandler) window.removeEventListener('keyup', this.keyupHandler);
    if (this.blurHandler) window.removeEventListener('blur', this.blurHandler);
    this.listeners.clear();
    this.pauseCallbacks.clear();
    this.respawnCallbacks.clear();

    this.state = {
      accelerate: false,
      brake: false,
      rotateBack: false,
      rotateFront: false,
      jump: false,
      pause: false,
      respawn: false,
    };
    this.touchAccelerate = false;
    this.touchBrake = false;
    this.touchRotateBack = false;
    this.touchRotateFront = false;
    this.touchJump = false;
  }

  // Touch control setters
  setTouchAccelerate(val: boolean): void {
    this.touchAccelerate = val;
    this.notify();
  }

  setTouchBrake(val: boolean): void {
    this.touchBrake = val;
    this.notify();
  }

  setTouchRotateBack(val: boolean): void {
    this.touchRotateBack = val;
    this.notify();
  }

  setTouchRotateFront(val: boolean): void {
    this.touchRotateFront = val;
    this.notify();
  }

  setTouchJump(val: boolean): void {
    this.touchJump = val;
    this.notify();
  }

  clearAllTouch(): void {
    this.touchAccelerate = false;
    this.touchBrake = false;
    this.touchRotateBack = false;
    this.touchRotateFront = false;
    this.touchJump = false;
    this.notify();
  }
}

export const inputManager = new InputManager();
