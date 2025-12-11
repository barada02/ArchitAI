
import React from 'react';
import { mockHouseBlueprint } from '../data/mockHouse';
import Block from './structure/Block';
import Roof from './structure/Roof';

const House: React.FC = () => {
  // In Phase 3, we will accept a 'blueprint' prop passed from App.tsx (from AI).
  // For Phase 1, we use the mock data directly.
  const blueprint = mockHouseBlueprint;

  return (
    <group name={blueprint.id}>
      {blueprint.components.map((component) => {
        switch (component.type) {
          case 'roof':
            return <Roof key={component.id} config={component} />;
          
          case 'floor':
          case 'wall':
          case 'door':
          case 'window':
          case 'generic':
          default:
            return <Block key={component.id} config={component} />;
        }
      })}
    </group>
  );
};

export default House;
