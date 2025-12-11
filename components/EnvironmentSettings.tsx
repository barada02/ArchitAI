import React from 'react';
import { Sky, SoftShadows, Stars } from '@react-three/drei';

const EnvironmentSettings: React.FC = () => {
  return (
    <>
      {/* 
        SoftShadows:
        Creates realistic soft shadows typically seen in architectural renders.
      */}
      <SoftShadows size={25} samples={10} focus={0} />

      {/* 
        Directional Light: 
        Simulates the sun. Casts the main shadows.
      */}
      <directionalLight
        castShadow
        position={[10, 20, 10]}
        intensity={1.5}
        shadow-mapSize={[2048, 2048]} // High res shadows
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />

      {/* 
        Ambient Light:
        Simulates global illumination bounce (fill light).
      */}
      <ambientLight intensity={0.4} />

      {/* 
        Hemisphere Light:
        Simulates sky color (blueish) mixing with ground color reflection.
      */}
      <hemisphereLight args={["#87CEEB", "#3b8c40", 0.6]} />

      {/* 
        Sky:
        Procedural Rayleigh scattering sky.
      */}
      <Sky 
        sunPosition={[10, 20, 10]} 
        turbidity={0.5} 
        rayleigh={0.6} 
        mieCoefficient={0.005} 
        mieDirectionalG={0.8} 
      />
      
      {/* Faint stars for depth if camera looks up high */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Fog to blend the horizon smoothly */}
      <fog attach="fog" args={['#eef0f4', 10, 80]} />
    </>
  );
};

export default EnvironmentSettings;