
export type ComponentType = 'floor' | 'wall' | 'roof' | 'door' | 'window' | 'generic';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ComponentConfig {
  id: string;
  type: ComponentType;
  position: Vector3;
  rotation?: Vector3; // Euler angles in radians
  scale?: Vector3;
  size?: Vector3; // Dimensions [width, height, depth]
  color?: string;
  material?: 'wood' | 'brick' | 'glass' | 'concrete' | 'metal';
  delay?: number; // Animation delay in seconds
}

export interface HouseBlueprint {
  id: string;
  name: string;
  components: ComponentConfig[];
}
