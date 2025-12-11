
import React from 'react';
import { Edges } from '@react-three/drei';
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
  // If it's a pyramid/cone, radius is roughly half the width
  const radius = size?.x ? size.x / 1.4 : 3; 
  const height = size?.y || 2;
  const depth = size?.z || 3;
  const width = size?.x || 3;

  const isPrism = shape === 'prism';
  const isCylinder = shape === 'cylinder';
  const isBox = shape === 'box'; 

  // Geometry Selection
  let Geometry = <coneGeometry args={[radius, height, 4]} />; // Default Pyramid (4 sides)

  if (isPrism) {
    // A-Frame / Gable
    Geometry = <cylinderGeometry args={[width/2, width/2, height, 3]} />;
  } else if (isCylinder) {
    // Conical Tower Roof
    Geometry = <coneGeometry args={[radius, height, 32]} />;
  } else if (isBox) {
    // Sometimes 'box' shape is passed for flat roofs or explicit pyramid logic from architect
    // If height is small, it's flat
    if (height < 0.5) {
        Geometry = <boxGeometry args={[width, height, depth]} />;
    } else {
        // Assume Pyramid for box shape with height
        Geometry = <coneGeometry args={[width/1.4, height, 4]} />;
    }
  }

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation?.x || 0, rotation?.y || 0, rotation?.z || 0]}
      castShadow
      receiveShadow
      scale={[0, 0, 0]}
    >
      {Geometry}
      
      <meshStandardMaterial color={color || '#2c3e50'} roughness={0.9} />
      
      {/* Stylized Outline */}
      <Edges 
        threshold={15} 
        color="#1a252f" 
      />
    </mesh>
  );
};

export default Roof;
