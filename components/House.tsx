
import React, { useMemo } from 'react';
import Block from './structure/Block';
import Roof from './structure/Roof';
import { ComponentType, HouseBlueprint } from '../types/blueprint';

interface HouseProps {
  blueprint: HouseBlueprint;
}

/**
 * Priority Order for Construction:
 * 1. Floors (Foundation)
 * 2. Walls (Structure)
 * 3. Roof (Cover)
 * 4. Generics (Frames/Lintels)
 * 5. Doors/Windows (Openings)
 */
const CONSTRUCTION_PRIORITY: Record<ComponentType, number> = {
  floor: 0,
  wall: 1,
  roof: 2,
  generic: 3,
  door: 4,
  window: 4
};

const STAGGER_DELAY = 0.10; // Time between individual blocks in the same group
const GROUP_DELAY = 0.4;   // Time between major groups (Floors -> Walls)

const House: React.FC<HouseProps> = ({ blueprint }) => {
  
  // THE ENGINE: Analyze blueprint and calculate build schedule
  const sequencedComponents = useMemo(() => {
    if (!blueprint || !blueprint.components) return [];

    // 1. Sort components by Priority first, then by vertical height (build up)
    const sorted = [...blueprint.components].sort((a, b) => {
      const priorityA = CONSTRUCTION_PRIORITY[a.type] ?? 99;
      const priorityB = CONSTRUCTION_PRIORITY[b.type] ?? 99;
      
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.position.y - b.position.y;
    });

    // 2. Calculate Delays
    let currentDelay = 0;
    let lastPriority = -1;

    return sorted.map((component) => {
      const priority = CONSTRUCTION_PRIORITY[component.type] ?? 99;
      
      // If we move to a new construction phase (e.g. Floor -> Wall), add a larger pause
      if (priority > lastPriority && lastPriority !== -1) {
        currentDelay += GROUP_DELAY;
      } else {
        // Otherwise just small stagger
        currentDelay += STAGGER_DELAY;
      }

      lastPriority = priority;

      return {
        ...component,
        _calculatedDelay: currentDelay
      };
    });
  }, [blueprint]);

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
