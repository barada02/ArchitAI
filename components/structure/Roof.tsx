
import React from 'react';
import { ComponentConfig } from '../../types/blueprint';
import { useBuildingAnimation } from '../../hooks/useBuildingAnimation';

interface RoofProps {
  config: ComponentConfig;
}

const Roof: React.FC<RoofProps> = ({ config }) => {
  const meshRef = useBuildingAnimation(config.delay);
  
  const { size, position, rotation, color } = config;
  // For ConeGeometry: radius, height, radialSegments
  // We map x/z to radius (approx) and y to height
  const radius = size?.x ? size.x / 1.4 : 3; 
  const height = size?.y || 2;

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation?.x || 0, rotation?.y || 0, rotation?.z || 0]}
      castShadow
      receiveShadow
      scale={[0, 0, 0]}
    >
      <coneGeometry args={[radius, height, 4]} /> {/* 4 segments = Pyramid */}
      <meshStandardMaterial color={color || '#2c3e50'} roughness={0.9} />
    </mesh>
  );
};

export default Roof;
