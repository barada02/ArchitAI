
import React, { useMemo } from 'react';
import Block from './structure/Block';
import Roof from './structure/Roof';
import { ComponentType, HouseBlueprint } from '../types/blueprint';
import { generateArchitecture } from '../utils/architect';

interface HouseProps {
  blueprint: HouseBlueprint;
}

const CONSTRUCTION_PRIORITY: Record<ComponentType, number> = {
  floor: 0,
  wall: 1,
  roof: 2,
  generic: 3,
  door: 4,
  window: 4
};

const STAGGER_DELAY = 0.05; 
const GROUP_DELAY = 0.3;   

const House: React.FC<HouseProps> = ({ blueprint }) => {
  
  // 1. ARCHITECT STEP: Expand High-Level Modules into Atomic Components
  const atomicComponents = useMemo(() => {
    if (!blueprint || !blueprint.modules) return [];
    return generateArchitecture(blueprint.modules);
  }, [blueprint]);

  // 2. ENGINE STEP: Sort and Schedule the Atomic Components
  const sequencedComponents = useMemo(() => {
    if (atomicComponents.length === 0) return [];

    // Sort by Priority (Floor -> Wall -> Roof)
    const sorted = [...atomicComponents].sort((a, b) => {
      const priorityA = CONSTRUCTION_PRIORITY[a.type] ?? 99;
      const priorityB = CONSTRUCTION_PRIORITY[b.type] ?? 99;
      
      // If same priority, build from bottom up (Y axis)
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.position.y - b.position.y;
    });

    // Calculate Delays
    let currentDelay = 0;
    let lastPriority = -1;

    return sorted.map((component) => {
      const priority = CONSTRUCTION_PRIORITY[component.type] ?? 99;
      
      if (priority > lastPriority && lastPriority !== -1) {
        currentDelay += GROUP_DELAY;
      } else {
        currentDelay += STAGGER_DELAY;
      }

      lastPriority = priority;

      return {
        ...component,
        _calculatedDelay: currentDelay
      };
    });
  }, [atomicComponents]);

  return (
    <group name={blueprint.id}>
      {sequencedComponents.map((component) => {
        switch (component.type) {
          case 'roof':
            return (
              <Roof 
                key={component.id} 
                config={component} 
                renderDelay={component._calculatedDelay} 
              />
            );
          
          case 'floor':
          case 'wall':
          case 'door':
          case 'window':
          case 'generic':
          default:
            return (
              <Block 
                key={component.id} 
                config={component} 
                renderDelay={component._calculatedDelay} 
              />
            );
        }
      })}
    </group>
  );
};

export default House;
