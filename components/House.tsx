import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

const House: React.FC = () => {
  // Refs for individual parts to animate them independently
  const wallsRef = useRef<Mesh>(null);
  const roofRef = useRef<Mesh>(null);
  const doorFrameRef = useRef<Mesh>(null);
  const doorRef = useRef<Mesh>(null);
  const windowLeftRef = useRef<Mesh>(null);
  const windowRightRef = useRef<Mesh>(null);
  const stepRef = useRef<Mesh>(null);
  
  // Timer to track animation progress since mount
  const timer = useRef(0);

  // Easing function for "pop" effect (EaseOutBack)
  const easeOutBack = (x: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  // Easing function for smooth rise (EaseOutCubic)
  const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);

  // Helper to get normalized progress (0 to 1) for a specific time window
  const getProgress = (currentTime: number, start: number, duration: number) => {
    return Math.min(Math.max((currentTime - start) / duration, 0), 1);
  };

  useFrame((state, delta) => {
    timer.current += delta;
    const t = timer.current;

    // --- PHASE 1: Walls Rise (0.0s - 0.8s) ---
    if (wallsRef.current) {
      const progress = easeOutCubic(getProgress(t, 0, 0.8));
      wallsRef.current.scale.set(1, progress, 1);
      // Adjust position to grow from bottom up (Pivot correction)
      // Original Y is 1.5, Height is 3. We want bottom at 0.
      wallsRef.current.position.y = 1.5 * progress; 
    }

    // --- PHASE 2: Doorstep Slides Out (0.5s - 1.0s) ---
    if (stepRef.current) {
      const progress = easeOutCubic(getProgress(t, 0.5, 0.5));
      stepRef.current.scale.set(progress, progress, progress);
    }

    // --- PHASE 3: Roof Drops/Pops In (0.8s - 1.4s) ---
    if (roofRef.current) {
      const progress = easeOutBack(getProgress(t, 0.8, 0.6));
      roofRef.current.scale.set(progress, progress, progress);
    }

    // --- PHASE 4: Door & Frame Pop In (1.2s - 1.7s) ---
    const doorProgress = easeOutBack(getProgress(t, 1.2, 0.5));
    if (doorFrameRef.current) doorFrameRef.current.scale.set(1, doorProgress, 1);
    if (doorRef.current) doorRef.current.scale.set(doorProgress, doorProgress, 1);

    // --- PHASE 5: Windows Pop In (1.4s - 2.0s) ---
    const winLeftProgress = easeOutBack(getProgress(t, 1.4, 0.5));
    if (windowLeftRef.current) windowLeftRef.current.scale.set(winLeftProgress, winLeftProgress, winLeftProgress);

    const winRightProgress = easeOutBack(getProgress(t, 1.5, 0.5));
    if (windowRightRef.current) windowRightRef.current.scale.set(winRightProgress, winRightProgress, winRightProgress);
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Base Structure (White Walls) */}
      <mesh ref={wallsRef} castShadow receiveShadow position={[0, 0, 0]} scale={[1, 0, 1]}>
        <boxGeometry args={[5, 3, 4]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>

      {/* 3. Roof (Dark Pyramid) */}
      <mesh ref={roofRef} castShadow receiveShadow position={[0, 3.75, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0,0,0]}>
        <coneGeometry args={[4, 1.5, 4]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.9} />
      </mesh>

      {/* 4. Door Frame */}
      <mesh ref={doorFrameRef} position={[0, 1.1, 2.05]} scale={[1,0,1]}>
        <boxGeometry args={[1.4, 2.2, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 4. Door */}
      <mesh ref={doorRef} position={[0, 1.1, 2.1]} scale={[0,0,1]}>
        <boxGeometry args={[1.2, 2.1, 0.05]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      
      {/* 5. Left Window */}
      <mesh ref={windowLeftRef} position={[-1.5, 2, 2.05]} scale={[0,0,0]}>
         <planeGeometry args={[1, 1]} />
         <meshStandardMaterial color="#87CEEB" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* 5. Right Window */}
       <mesh ref={windowRightRef} position={[1.5, 2, 2.05]} scale={[0,0,0]}>
         <planeGeometry args={[1, 1]} />
         <meshStandardMaterial color="#87CEEB" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* 2. Doorstep */}
      <mesh ref={stepRef} position={[0, 0.1, 2.3]} receiveShadow scale={[0,0,0]}>
        <boxGeometry args={[1.6, 0.2, 0.6]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
    </group>
  );
};

export default House;