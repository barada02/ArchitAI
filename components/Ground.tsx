import React from 'react';
import { GridHelper } from 'three';

const Ground: React.FC = () => {
  return (
    <group>
      {/* 
        Main Ground Plane 
        A large circular or square plane to act as the "Earth".
      */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#596a57" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 
        Architectural Grid
        Helps with scale reference for future building generation.
        We fade it out so it doesn't look too "wireframe-y".
      */}
      <gridHelper 
        args={[100, 100, 0x000000, 0x000000]} 
        position={[0, 0.01, 0]} 
      >
         <meshBasicMaterial attach="material" color="#2f3d2e" transparent opacity={0.15} />
      </gridHelper>
    </group>
  );
};

export default Ground;