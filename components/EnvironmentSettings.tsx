
import React from 'react';
import { Sky, SoftShadows, Stars } from '@react-three/drei';

const EnvironmentSettings: React.FC = () => {
  return (
    <>
      {/* High fidelity shadows */}
      <SoftShadows size={25} samples={12} focus={0.5} />

      {/* Main Sun */}
      <directionalLight
        castShadow
        position={[15, 25, 12]}
        intensity={1.8}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Increased Ambient Light for Stylized/Toon look (fills shadows with color) */}
      <ambientLight intensity={0.7} />

      {/* Hemisphere Light for gradient fill */}
      <hemisphereLight args={["#87CEEB", "#2d3436", 0.5]} />

      {/* Environment */}
      <Sky 
        sunPosition={[15, 25, 12]} 
        turbidity={0.8} 
        rayleigh={0.5} 
        mieCoefficient={0.005} 
        mieDirectionalG={0.8} 
      />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <fog attach="fog" args={['#eef0f4', 15, 90]} />
    </>
  );
};

export default EnvironmentSettings;
