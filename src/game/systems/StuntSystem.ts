// APEX MOTO RUSH — Stunt System
// Detects backflips, frontflips, multi-rotations, and calculates stunt scoring

export interface StuntEvent {
  name: string;
  points: number;
  type: 'backflip' | 'frontflip' | 'multi' | 'clean_land';
}

export class StuntSystem {
  private airRotationAccumulated = 0; // total radians while in air
  private prevRotation = 0;
  private wasInAir = false;
  private airTime = 0;
  private flipsInAir = 0;
  private rotationDirection: 'back' | 'front' | null = null;

  private pendingStunts: StuntEvent[] = [];

  reset(): void {
    this.airRotationAccumulated = 0;
    this.prevRotation = 0;
    this.wasInAir = false;
    this.airTime = 0;
    this.flipsInAir = 0;
    this.rotationDirection = null;
    this.pendingStunts = [];
  }

  update(
    rotation: number,      // current bike rotation in radians
    isInAir: boolean,      // true when both wheels off ground
    deltaTime: number
  ): StuntEvent[] {
    const events: StuntEvent[] = [];

    if (isInAir) {
      this.airTime += deltaTime;

      // Calculate delta rotation
      let deltaRot = rotation - this.prevRotation;

      // Normalize delta to [-PI, PI]
      while (deltaRot > Math.PI) deltaRot -= Math.PI * 2;
      while (deltaRot < -Math.PI) deltaRot += Math.PI * 2;

      // Detect direction on first movement
      if (this.rotationDirection === null && Math.abs(deltaRot) > 0.01) {
        this.rotationDirection = deltaRot < 0 ? 'back' : 'front';
      }

      this.airRotationAccumulated += Math.abs(deltaRot);

      // Check for completed flips (every 2*PI = one full rotation)
      const completedFlips = Math.floor(this.airRotationAccumulated / (Math.PI * 2));
      if (completedFlips > this.flipsInAir) {
        this.flipsInAir = completedFlips;
      }

      this.wasInAir = true;
    } else {
      // Just landed
      if (this.wasInAir && this.flipsInAir > 0 && this.airTime > 0.3) {
        const dir = this.rotationDirection;

        if (this.flipsInAir === 1) {
          events.push({
            name: dir === 'back' ? 'BACKFLIP!' : 'FRONTFLIP!',
            points: dir === 'back' ? 500 : 500,
            type: dir === 'back' ? 'backflip' : 'frontflip',
          });
        } else if (this.flipsInAir === 2) {
          events.push({
            name: dir === 'back' ? 'DOUBLE BACK!' : 'DOUBLE FRONT!',
            points: 1500,
            type: 'multi',
          });
        } else if (this.flipsInAir === 3) {
          events.push({
            name: 'TRIPLE FLIP!',
            points: 3500,
            type: 'multi',
          });
        } else if (this.flipsInAir >= 4) {
          events.push({
            name: `${this.flipsInAir}x ROTATION!`,
            points: 1000 * this.flipsInAir,
            type: 'multi',
          });
        }

        // Clean landing bonus (landed upright-ish)
        const normalizedRot = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const isUprightish = normalizedRot < 0.3 || normalizedRot > Math.PI * 2 - 0.3;
        if (isUprightish && this.flipsInAir >= 1) {
          events.push({
            name: 'CLEAN LAND!',
            points: 200,
            type: 'clean_land',
          });
        }
      }

      // Reset air tracking
      this.airRotationAccumulated = 0;
      this.airTime = 0;
      this.flipsInAir = 0;
      this.rotationDirection = null;
      this.wasInAir = false;
    }

    this.prevRotation = rotation;
    return events;
  }

  getFlipsInAir(): number {
    return this.flipsInAir;
  }

  getAirRotationRadians(): number {
    return this.airRotationAccumulated;
  }

  isInProgress(): boolean {
    return this.wasInAir && this.flipsInAir > 0;
  }
}
