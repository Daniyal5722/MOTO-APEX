'use client';
// APEX MOTO RUSH — 3D Motorcycle Garage Inspection Viewer
// Uses Three.js WebGL directly for flawless React 19 compatibility, 60fps performance, and interactive 360 drag/orbit

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BikeDefinition } from '@/data/bikes';

interface BikeViewer3DProps {
  bike: BikeDefinition;
  interactive?: boolean;
}

export const BikeViewer3D: React.FC<BikeViewer3DProps> = ({ bike, interactive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const bikeGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 1.4, 3.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(bike.colors.mechanicalAccent, 2.5, 10);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const groundGlow = new THREE.PointLight(bike.colors.bodyPrimary, 1.5, 6);
    groundGlow.position.set(0, -0.6, 0);
    scene.add(groundGlow);

    // Floor platform (cyber garage disc)
    const discGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.1, 48);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x111625,
      metalness: 0.8,
      roughness: 0.3,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.7;
    disc.receiveShadow = true;
    scene.add(disc);

    // Glowing rim ring on platform
    const ringGeo = new THREE.TorusGeometry(2.1, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: bike.colors.bodyPrimary });
    const platformRing = new THREE.Mesh(ringGeo, ringMat);
    platformRing.rotation.x = Math.PI / 2;
    platformRing.position.y = -0.64;
    scene.add(platformRing);

    // Build Procedural 3D Motorcycle
    const bikeGroup = new THREE.Group();
    bikeGroupRef.current = bikeGroup;
    scene.add(bikeGroup);

    const primaryMat = new THREE.MeshStandardMaterial({
      color: bike.colors.bodyPrimary,
      metalness: 0.85,
      roughness: 0.2,
    });

    const secondaryMat = new THREE.MeshStandardMaterial({
      color: bike.colors.bodySecondary,
      metalness: 0.9,
      roughness: 0.25,
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: bike.colors.mechanicalAccent,
      metalness: 0.95,
      roughness: 0.15,
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.85,
      metalness: 0.1,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: bike.colors.wheelRim,
      metalness: 0.9,
      roughness: 0.2,
    });

    const seatMat = new THREE.MeshStandardMaterial({
      color: bike.colors.seat,
      roughness: 0.9,
      metalness: 0.05,
    });

    const exhaustMat = new THREE.MeshStandardMaterial({
      color: bike.colors.exhaust,
      metalness: 0.95,
      roughness: 0.1,
    });

    const wheelRadius = 0.42;
    const wheelWidth = 0.18;
    const wheelBase = 1.4;

    // Helper for creating detailed wheels
    const createWheel = (xPos: number) => {
      const wheelG = new THREE.Group();
      wheelG.position.set(xPos, 0, 0);

      // Tire
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 28);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheelG.add(tire);

      // Inner Rim
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.68, wheelRadius * 0.68, wheelWidth + 0.01, 24);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelG.add(rim);

      // Brake Disc
      const discBrakeGeo = new THREE.CylinderGeometry(wheelRadius * 0.5, wheelRadius * 0.5, 0.02, 20);
      discBrakeGeo.rotateZ(Math.PI / 2);
      const discBrake = new THREE.Mesh(discBrakeGeo, metalMat);
      discBrake.position.x = 0.06;
      wheelG.add(discBrake);

      // 5 Spokes
      for (let i = 0; i < 5; i++) {
        const spokeGeo = new THREE.BoxGeometry(0.04, wheelRadius * 1.2, 0.03);
        const spoke = new THREE.Mesh(spokeGeo, rimMat);
        spoke.rotation.x = (i * Math.PI) / 2.5;
        wheelG.add(spoke);
      }

      return wheelG;
    };

    // Rear and Front Wheels
    const rearWheel = createWheel(-wheelBase / 2);
    const frontWheel = createWheel(wheelBase / 2);
    bikeGroup.add(rearWheel);
    bikeGroup.add(frontWheel);

    // Frame / Chassis Center
    const frameGeo = new THREE.BoxGeometry(0.7, 0.35, 0.28);
    const frame = new THREE.Mesh(frameGeo, secondaryMat);
    frame.position.set(-0.05, 0.3, 0);
    frame.rotation.z = -0.15;
    bikeGroup.add(frame);

    // Engine Block
    const engineGeo = new THREE.BoxGeometry(0.45, 0.32, 0.25);
    const engine = new THREE.Mesh(engineGeo, metalMat);
    engine.position.set(-0.1, 0.12, 0);
    bikeGroup.add(engine);

    // Cylinder Heads
    for (let c = -0.08; c <= 0.08; c += 0.08) {
      const cylGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12);
      const cyl = new THREE.Mesh(cylGeo, metalMat);
      cyl.position.set(-0.12, 0.25, c);
      cyl.rotation.z = 0.3;
      bikeGroup.add(cyl);
    }

    // Fuel Tank (Aerodynamic wedge)
    const tankGeo = new THREE.BoxGeometry(0.55, 0.25, 0.3);
    const tank = new THREE.Mesh(tankGeo, primaryMat);
    tank.position.set(0.12, 0.52, 0);
    tank.rotation.z = -0.22;
    bikeGroup.add(tank);

    // Seat
    const seatGeo = new THREE.BoxGeometry(0.45, 0.1, 0.24);
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(-0.35, 0.44, 0);
    seat.rotation.z = 0.12;
    bikeGroup.add(seat);

    // Rear Tail Cowl
    const tailGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
    tailGeo.rotateZ(Math.PI / 2.3);
    const tail = new THREE.Mesh(tailGeo, primaryMat);
    tail.position.set(-0.65, 0.5, 0);
    bikeGroup.add(tail);

    // Front Fork / Suspension
    const forkLeftGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.85, 12);
    const forkLeft = new THREE.Mesh(forkLeftGeo, metalMat);
    forkLeft.position.set(wheelBase / 2 - 0.08, 0.35, 0.12);
    forkLeft.rotation.z = -0.38;
    bikeGroup.add(forkLeft);

    const forkRight = forkLeft.clone();
    forkRight.position.z = -0.12;
    bikeGroup.add(forkRight);

    // Handlebars
    const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 12);
    const bar = new THREE.Mesh(barGeo, metalMat);
    bar.position.set(0.32, 0.72, 0);
    bar.rotation.x = Math.PI / 2;
    bikeGroup.add(bar);

    // Grips
    const gripGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12);
    const gripL = new THREE.Mesh(gripGeo, tireMat);
    gripL.position.set(0.32, 0.72, 0.28);
    gripL.rotation.x = Math.PI / 2;
    bikeGroup.add(gripL);

    const gripR = gripL.clone();
    gripR.position.z = -0.28;
    bikeGroup.add(gripR);

    // Headlight (Cyber LED)
    const lightGeo = new THREE.BoxGeometry(0.1, 0.14, 0.22);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x66ccff,
      emissiveIntensity: 0.8,
    });
    const headlight = new THREE.Mesh(lightGeo, lightMat);
    headlight.position.set(0.48, 0.58, 0);
    headlight.rotation.z = -0.35;
    bikeGroup.add(headlight);

    // Exhaust Pipe
    const exhaustGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.8, 14);
    exhaustGeo.rotateZ(Math.PI / 2.4);
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.position.set(-0.35, 0.18, 0.18);
    bikeGroup.add(exhaust);

    // Swingarm (Rear Suspension)
    const swingGeo = new THREE.BoxGeometry(0.65, 0.08, 0.05);
    const swingL = new THREE.Mesh(swingGeo, secondaryMat);
    swingL.position.set(-0.38, 0.08, 0.12);
    swingL.rotation.z = -0.2;
    bikeGroup.add(swingL);

    const swingR = swingL.clone();
    swingR.position.z = -0.12;
    bikeGroup.add(swingR);

    // Camera target
    camera.lookAt(0, 0.1, 0);

    // Interaction / Drag logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = 0.008;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !interactive) return;
      const deltaX = e.clientX - previousMousePosition.x;
      bikeGroup.rotation.y += deltaX * 0.012;
      rotationVelocity = deltaX * 0.002;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        bikeGroup.rotation.y += rotationVelocity;
        rotationVelocity *= 0.96; // slow down drag inertia
        if (Math.abs(rotationVelocity) < 0.004) {
          rotationVelocity = 0.005; // continuous idle turntable spin
        }
      }

      // Wheels gentle spin
      rearWheel.rotation.z += 0.02;
      frontWheel.rotation.z += 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [bike, interactive]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute top-2 left-3 pointer-events-none text-xs tracking-wider uppercase text-zinc-500 font-mono">
        360° Interactive Turntable (Drag to Rotate)
      </div>
    </div>
  );
};
