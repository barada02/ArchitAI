import React from 'react';
import { OrbitControls } from '@react-three/drei';
import EnvironmentSettings from './EnvironmentSettings';
import Ground from './Ground';
import House from './House';

interface ExperienceProps {
  houseGenerated: boolean;
}

const Experience: React.FC<ExperienceProps> = ({ houseGenerated }) => {
  return (
    <>
      {/* Camera Controls */}
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.1} // Prevent going under the ground
        minDistance={5}
        maxDistance={50}
        dampingFactor={0.05}
        enableDamping={true}
      />

      {/* Lighting and Sky */}
      <EnvironmentSettings />

      {/* The Physical World */}
      <Ground />

      {/* --------------------------------------------------------
          FUTURE EXPANSION ZONES
         -------------------------------------------------------- */}
      
      {/* Future: Engineer character will stand here. */}
      <group name="SpawnPoint_Engineer" position={[2, 0, 2]}>
        {/* Placeholder marker - visible in dev, invisible in prod usually */}
        {/* <axesHelper args={[1]} /> */} 
      </group>

      {/* Future: Home will be generated on this ground. */}
      <group name="Construction_Zone" position={[0, 0, 0]}>
        {houseGenerated && <House />}
      </group>

    </>
  );
};

export default Experience;