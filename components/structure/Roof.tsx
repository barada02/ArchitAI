
import React, { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { ComponentConfig } from '../../types/blueprint';
import { useBuildingAnimation } from '../../hooks/useBuildingAnimation';

interface RoofProps {
  config: ComponentConfig;
  renderDelay?: number;
}

const Roof: React.FC<RoofProps> = ({ config, renderDelay = 0 }) => {
  const meshRef = useBuildingAnimation(renderDelay);
  
  const { size, position, rotation, color, shape } = config;
  
  // Dimensions
  const width = Math.max(0.1, size?.x || 3);
  const height = Math.max(0.1, size?.y || 2);
  const depth = Math.max(0.1, size?.z || 3);

  // --- GEOMETRY FACTORY ---
  
  // 1. GABLE ROOF (Prism)
  // We use ExtrudeGeometry to ensure a perfect triangle shape that doesn't look "standing up".
  const gableGeometry = useMemo(() => {
    const s = new THREE.Shape();
    // Create a Triangle Base: (-0.5, -0.5) -> (0.5, -0.5) -> (0, 0.5)
    // This fits in a 1x1 square centered at 0.
    s.moveTo(-0.5, -0.5);
    s.lineTo(0.5, -0.5);
    s.lineTo(0, 0.5);
    s.lineTo(-0.5, -0.5);
    
    // Extrude along Z axis (depth 1)
    // Center the extrusion so the mesh origin is in the middle of the volume
    const geom = new THREE.ExtrudeGeometry(s, { 
      depth: 1, 
      bevelEnabled: false 
    });
    geom.center(); 
    return geom;
  }, []);

  // 2. PYRAMID ROOF
  // We use a 4-sided Cone.
  // Standard Cone is circular. 4-sided cone is a square pyramid rotated 45 deg.
  // We use radius = 0.707 (approx 1/sqrt(2)) so that when rotated 45deg, the width matches 1 unit.
  const pyramidGeometry = useMemo(() => {
    const geom = new THREE.ConeGeometry(0.7071, 1, 4);
    // Rotate geometry 45 degrees so flat sides align with world axes
    geom.rotateY(Math.PI / 4); 
    return geom;
  }, []);

  let RenderedGeometry;
  let finalRotation = [rotation?.x || 0, rotation?.y || 0, rotation?.z || 0];
  let finalScale = [width, height, depth];

  if (shape === 'prism') {
    // Smart Gable Logic: Align Ridge with the LONGEST side of the house
    const isLandscape = width > depth;
    
    if (isLandscape) {
      // House is wider (X) than deep (Z). Ridge should run along X.
      // Default Extrude is along Z. We rotate Y by 90deg to align with X.
      finalRotation = [0, Math.PI / 2, 0];
      // Swap Scale axes because we rotated the object
      // Local X (Triangle Width) -> World Z (Depth)
      // Local Z (Extrude Length) -> World X (Width)
      finalScale = [depth, height, width];
    } else {
      // House is deeper (Z) than wide (X). Ridge runs along Z.
      // Default Extrude aligns with Z.
      finalRotation = [0, 0, 0];
      finalScale = [width, height, depth];
    }
    
    RenderedGeometry = <primitive object={gableGeometry} />;
  
  } else if (shape === 'pyramid') {
    // Rectangular Pyramid Logic:
    // The geometry is a Unit Cube Pyramid (1x1x1).
    // We simply stretch it to the building dimensions.
    RenderedGeometry = <primitive object={pyramidGeometry} />;
    
  } else if (shape === 'cylinder') {
    // Conical Tower Roof
    // Use standard cone
    RenderedGeometry = <coneGeometry args={[width, height, 32]} />;
    // Reset scale to 1 because args handled it, or strict mode:
    // If we use unit cone, we would scale. But legacy uses args.
    // Let's stick to args for Cylinder to avoid breaking towers.
    finalScale = [1, 1, 1]; 

  } else {
    // Flat / Box fallback
    RenderedGeometry = <boxGeometry args={[width, height, depth]} />;
    finalScale = [1, 1, 1];
  }

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[finalRotation[0], finalRotation[1], finalRotation[2]]}
      scale={[finalScale[0], finalScale[1], finalScale[2]]}
      castShadow
      receiveShadow
    >
      {RenderedGeometry}
      
      <meshStandardMaterial color={color || '#2c3e50'} roughness={0.9} />
      
      <Edges 
        threshold={15} 
        color="#1a252f" 
      />
    </mesh>
  );
};

export default Roof;
