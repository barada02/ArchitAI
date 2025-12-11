
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
  const width = Math.max(0.1, size?.x || 3);
  const height = Math.max(0.1, size?.y || 2);
  const depth = Math.max(0.1, size?.z || 3);

  const isPrism = shape === 'prism';
  const isCylinder = shape === 'cylinder';
  const isBox = shape === 'box'; 

  // Geometry Selection
  let Geometry = <coneGeometry args={[width/2, height, 4]} />; // Default Fallback

  if (isPrism) {
    // A-Frame / Gable (Cylinder with 3 sides)
    Geometry = <cylinderGeometry args={[width/2, width/2, height, 3]} />;
  } else if (isCylinder) {
    // Conical Tower Roof
    Geometry = <coneGeometry args={[width, height, 32]} />;
  } else if (isBox) {
    // Logic: 'Box' shape in architect often denotes a generic roof block.
    // If it's a pyramid (Square Cone), it needs 4 sides.
    // NOTE: Architect engine now passes a rotation of PI/4 for pyramids so they align with walls.
    
    if (height < 0.5) {
        // Flat Roof
        Geometry = <boxGeometry args={[width, height, depth]} />;
    } else {
        // Pyramid
        // ConeGeometry args: radius, height, radialSegments
        // Calculate radius to encompass the square base (half diagonal) or just use width/2 for inscribed.
        // Using width/1.414 (approx sqrt 2) is circumscribed, width/2 is inscribed. 
        // Architect engine sends a sized-up width (1.5x) so we can just use width/2 here comfortably.
        Geometry = <coneGeometry args={[width/2, height, 4]} />;
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
