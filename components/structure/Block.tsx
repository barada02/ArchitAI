
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
  const width = Math.max(0.01, size?.x || 1);
  const height = Math.max(0.01, size?.y || 1);
  const depth = Math.max(0.01, size?.z || 1);

  // Material Logic
  const isGlass = material === 'glass';
  const isStone = material === 'concrete' || material === 'stone';
  const isWood = material === 'wood';

  // Base props
  const baseColor = color || '#ffffff';
  
  // Logic: Use StandardMaterial for solids (opacity 1) and Physical for Glass
  // This prevents "Ghosting" artifacts on solid walls.

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

      {/* Advanced Material Switching */}
      {isGlass ? (
        <meshPhysicalMaterial 
          color={baseColor}
          roughness={0.05}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
          transparent={true}
          opacity={0.6}
          emissive={baseColor}
          emissiveIntensity={0.5}
        />
      ) : (
        <meshStandardMaterial 
          color={baseColor}
          roughness={isStone ? 0.9 : 0.6}
          metalness={0.1}
        />
      )}

      {/* Stylized Edges (The "Blizzard" Look) */}
      <Edges 
        threshold={15} // Only show edges on sharp angles
        color={isGlass ? '#ffffff' : '#1a252f'}
        scale={1.005} // Slight offset to prevent z-fighting
      />
    </mesh>
  );
};

export default Block;
