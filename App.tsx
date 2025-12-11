
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import { HouseBlueprint } from './types/blueprint';
import { generateHouseBlueprint } from './services/aiService';
import { mockHouseBlueprint } from './data/mockHouse';

const App: React.FC = () => {
  const [blueprint, setBlueprint] = useState<HouseBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the Gemini API via our service
      const newBlueprint = await generateHouseBlueprint(prompt);
      setBlueprint(newBlueprint);
    } catch (err) {
      console.error(err);
      setError("Failed to generate house. Please try a different prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setBlueprint(null);
    setError(null);
  };

  return (
    <div className="relative w-full h-full bg-slate-900">
      <UIOverlay 
        onGenerate={handleGenerate} 
        onClear={handleClear}
        isGenerated={!!blueprint}
        isLoading={isLoading}
        error={error}
      />
      
      <Canvas
        shadows
        camera={{ position: [8, 5, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        className="w-full h-full touch-none"
      >
        <Suspense fallback={null}>
          <Experience blueprint={blueprint} />
        </Suspense>
      </Canvas>
      
      <Loader />
    </div>
  );
};

export default App;
