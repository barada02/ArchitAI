
import React from 'react';
import { Edges } from '@react-three/drei';
import { ComponentConfig } from '../../types/blueprint';
import { useBuildingAnimation } from '../../hooks/useBuildingAnimation';

interface BlockProps {
  config: ComponentConfig;
  renderDelay?: number;
}

const Block: React.FC<BlockProps> = ({ config, renderDelay = 0 }) => {
  const meshRef = useBuildingAnimation(renderDelay);
  
  const { size, position, rotation, color, material, shape = 'box' } = config;
  
  // Dimensions
  const width = size?.x || 1;
  const height = size?.y || 1;
  const depth = size?.z || 1;

  // Material Logic
  const isGlass = material === 'glass';
  const isStone = material === 'concrete' || material === 'stone';
  const isWood = material === 'wood';

  // Physical properties for PBR (Physically Based Rendering)
  const materialProps = {
    color: color || '#ffffff',
    roughness: isGlass ? 0.05 : isStone ? 0.9 : 0.6,
    metalness: isGlass ? 0.1 : isStone ? 0.1 : 0.0,
    transmission: isGlass ? 0.9 : 0, // Glass transparency
    thickness: isGlass ? 0.5 : 0,    // Refraction depth
    transparent: isGlass,
    opacity: isGlass ? 0.7 : 1,
    emissive: isGlass ? color : '#000000', // Windows glow slightly
    emissiveIntensity: isGlass ? 0.8 : 0,
  };

  const outlineColor = isGlass ? '#ffffff' : '#2c3e50';

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation?.x || 0, rotation?.y || 0, rotation?.z || 0]}
      castShadow
      receiveShadow
      scale={[0, 0, 0]} 
    >
      {/* Dynamic Geometry Switch */}
      {shape === 'cylinder' ? (
        // Cylinder: args = [radiusTop, radiusBottom, height, radialSegments]
        // We use size.x for Top Radius, size.z for Bottom Radius
        <cylinderGeometry args={[width, depth, height, 16]} />
      ) : shape === 'prism' ? (
        // Prism: Cylinder with 3 segments
        // Rotate 30deg (PI/6) to align flat side usually, but dependent on use
        <cylinderGeometry args={[width/2, width/2, height, 3]} /> 
      ) : (
        // Default Box
        <boxGeometry args={[width, height, depth]} />
      )}

      {/* Advanced Material */}
      <meshPhysicalMaterial {...materialProps} />

      {/* Stylized Edges (The "Blizzard" Look) */}
      <Edges 
        threshold={15} // Only show edges on sharp angles
        color={outlineColor}
        scale={1.01} // Slight offset to prevent z-fighting
      />
    </mesh>
  );
};

export default Block;
