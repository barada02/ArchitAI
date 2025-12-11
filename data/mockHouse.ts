
import { HouseBlueprint } from '../types/blueprint';

export const mockHouseBlueprint: HouseBlueprint = {
  id: 'house_001',
  name: 'Modern Minimalist Starter',
  modules: [
    {
      id: 'main_room',
      type: 'room',
      position: { x: 0, y: 0, z: 0 },
      size: { x: 5, y: 3, z: 4 },
      style: {
        wallColor: '#f0f0f0',
        wallMaterial: 'brick',
        roofColor: '#2c3e50',
        roofType: 'gable',
        roofHeight: 1.5
      }
    },
    {
      id: 'tower_1',
      type: 'tower',
      position: { x: 3.5, y: 0, z: -1 },
      size: { x: 1.2, y: 6, z: 1.2 },
      style: {
        wallColor: '#bdc3c7',
        wallMaterial: 'stone',
        roofColor: '#2980b9',
        roofType: 'cone',
        roofHeight: 2
      }
    }
  ]
};
