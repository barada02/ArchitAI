
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

// Easing function: EaseOutBack (gives the bouncy effect)
const easeOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export const useBuildingAnimation = (delay: number = 0) => {
  const meshRef = useRef<Mesh>(null);
  const timer = useRef(0);
  const duration = 0.6; // How long the pop takes

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    timer.current += delta;
    
    // Calculate progress
    // We start animating only after 'delay' seconds have passed
    let progress = (timer.current - delay) / duration;
    
    // Clamp between 0 and 1
    progress = Math.min(Math.max(progress, 0), 1);

    if (progress < 1) {
       const scaleValue = easeOutBack(progress);
       meshRef.current.scale.set(scaleValue, scaleValue, scaleValue);
    } else {
       // Ensure it stays at exactly 1 after animation finishes
       meshRef.current.scale.set(1, 1, 1);
    }
  });

  return meshRef;
};
