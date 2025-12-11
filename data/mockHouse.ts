
import { HouseBlueprint } from '../types/blueprint';

export const mockHouseBlueprint: HouseBlueprint = {
  id: 'house_001',
  name: 'Modern Minimalist Starter',
  components: [
    // --- FOUNDATION (Delay 0.0s) ---
    {
      id: 'foundation',
      type: 'floor',
      position: { x: 0, y: 0.1, z: 0 },
      size: { x: 5.2, y: 0.2, z: 4.2 }, // Slightly larger than walls
      color: '#7f8c8d',
      delay: 0
    },
    {
      id: 'step',
      type: 'floor',
      position: { x: 0, y: 0.1, z: 2.3 },
      size: { x: 1.6, y: 0.2, z: 0.6 },
      color: '#95a5a6',
      delay: 0.2
    },

    // --- WALLS (Delay 0.5s) ---
    // Back Wall
    {
      id: 'wall_back',
      type: 'wall',
      position: { x: 0, y: 1.6, z: -2 },
      size: { x: 5, y: 3, z: 0.2 },
      color: '#f0f0f0',
      delay: 0.5
    },
    // Left Wall
    {
      id: 'wall_left',
      type: 'wall',
      position: { x: -2.5, y: 1.6, z: 0 },
      size: { x: 0.2, y: 3, z: 4.2 }, // Overlap specifically calculated
      color: '#f0f0f0',
      delay: 0.6
    },
    // Right Wall
    {
      id: 'wall_right',
      type: 'wall',
      position: { x: 2.5, y: 1.6, z: 0 },
      size: { x: 0.2, y: 3, z: 4.2 },
      color: '#f0f0f0',
      delay: 0.7
    },
    // Front Wall (Left Section)
    {
      id: 'wall_front_left',
      type: 'wall',
      position: { x: -1.6, y: 1.6, z: 2 },
      size: { x: 1.8, y: 3, z: 0.2 },
      color: '#f0f0f0',
      delay: 0.8
    },
    // Front Wall (Right Section)
    {
      id: 'wall_front_right',
      type: 'wall',
      position: { x: 1.6, y: 1.6, z: 2 },
      size: { x: 1.8, y: 3, z: 0.2 },
      color: '#f0f0f0',
      delay: 0.8
    },
    // Front Wall (Top Section above door)
    {
      id: 'wall_front_top',
      type: 'wall',
      position: { x: 0, y: 2.6, z: 2 },
      size: { x: 1.4, y: 1, z: 0.2 },
      color: '#f0f0f0',
      delay: 0.9
    },

    // --- ROOF (Delay 1.2s) ---
    {
      id: 'roof_main',
      type: 'roof',
      position: { x: 0, y: 3.75, z: 0 },
      rotation: { x: 0, y: 0.785398, z: 0 }, // 45 degrees
      size: { x: 4, y: 1.5, z: 4 }, // Cone geometry uses radius/height
      color: '#2c3e50',
      delay: 1.2
    },

    // --- DETAILS (Delay 1.5s+) ---
    // Door Frame
    {
      id: 'door_frame',
      type: 'generic',
      position: { x: 0, y: 1.1, z: 2.05 },
      size: { x: 1.4, y: 2.2, z: 0.1 },
      color: '#1a1a1a',
      delay: 1.5
    },
    // Door
    {
      id: 'door',
      type: 'door',
      position: { x: 0, y: 1.1, z: 2.1 },
      size: { x: 1.2, y: 2.1, z: 0.05 },
      color: '#8d6e63',
      delay: 1.6
    },
    // Window Left
    {
      id: 'window_left',
      type: 'window',
      position: { x: -1.5, y: 2, z: 2.05 },
      size: { x: 1, y: 1, z: 0.05 },
      color: '#87CEEB',
      delay: 1.8
    },
    // Window Right
    {
      id: 'window_right',
      type: 'window',
      position: { x: 1.5, y: 2, z: 2.05 },
      size: { x: 1, y: 1, z: 0.05 },
      color: '#87CEEB',
      delay: 1.9
    }
  ]
};
