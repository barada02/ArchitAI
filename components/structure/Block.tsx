
import React from 'react';
import { ComponentConfig } from '../../types/blueprint';
import { useBuildingAnimation } from '../../hooks/useBuildingAnimation';

interface BlockProps {
  config: ComponentConfig;
}

const Block: React.FC<BlockProps> = ({ config }) => {
  const meshRef = useBuildingAnimation(config.delay);
  
  const { size, position, rotation, color, material } = config;
  const width = size?.x || 1;
  const height = size?.y || 1;
  const depth = size?.z || 1;

  // Basic material properties based on type
  const roughness = material === 'glass' ? 0.1 : 0.8;
  const metalness = material === 'glass' ? 0.9 : 0.1;
  const opacity = material === 'glass' ? 0.6 : 1;
  const transparent = material === 'glass';

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation?.x || 0, rotation?.y || 0, rotation?.z || 0]}
      castShadow
      receiveShadow
      // Initial scale 0 handled by the hook, but good practice to set initial prop too
      scale={[0, 0, 0]} 
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial 
        color={color || '#ffffff'} 
        roughness={roughness} 
        metalness={metalness}
        transparent={transparent}
        opacity={opacity}
      />
    </mesh>
  );
};

export default Block;
