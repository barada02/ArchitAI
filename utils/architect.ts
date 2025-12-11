
import { ComponentConfig, ModuleConfig, Vector3 } from "../types/blueprint";

/**
 * The Architect Engine
 * 
 * Responsibilities:
 * 1. Takes high-level "Modules" (Rooms, Towers)
 * 2. Mathematically calculates the position of every wall, floor, and roof.
 * 3. Returns a flat list of atomic components for the Renderer.
 */

const WALL_THICKNESS = 0.2;
const FLOOR_HEIGHT = 0.2;

// Helper to generate a unique ID
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

export const generateArchitecture = (modules: ModuleConfig[]): ComponentConfig[] => {
  let components: ComponentConfig[] = [];

  modules.forEach(module => {
    if (module.type === 'room') {
      components = [...components, ...generateRoom(module)];
    } else if (module.type === 'tower') {
      components = [...components, ...generateTower(module)];
    }
  });

  return components;
};

const generateRoom = (module: ModuleConfig): ComponentConfig[] => {
  const parts: ComponentConfig[] = [];
  const { position, size, style } = module;
  const { x, y, z } = position;
  const { x: width, y: height, z: depth } = size;

  // 1. Foundation / Floor
  parts.push({
    id: uid('floor'),
    type: 'floor',
    position: { x, y: y + FLOOR_HEIGHT / 2, z },
    size: { x: width, y: FLOOR_HEIGHT, z: depth },
    color: '#7f8c8d',
    material: 'concrete',
    shape: 'box'
  });

  // 2. Walls (4 sides to create a hollow room)
  // Wall Height is full height minus floor
  const wallH = height;
  const wallY = y + FLOOR_HEIGHT + wallH / 2;

  // North Wall (-Z)
  parts.push({
    id: uid('wall_n'),
    type: 'wall',
    position: { x, y: wallY, z: z - depth / 2 + WALL_THICKNESS / 2 },
    size: { x: width, y: wallH, z: WALL_THICKNESS },
    color: style.wallColor || '#ecf0f1',
    material: style.wallMaterial || 'brick',
    shape: 'box'
  });

  // South Wall (+Z)
  parts.push({
    id: uid('wall_s'),
    type: 'wall',
    position: { x, y: wallY, z: z + depth / 2 - WALL_THICKNESS / 2 },
    size: { x: width, y: wallH, z: WALL_THICKNESS },
    color: style.wallColor || '#ecf0f1',
    material: style.wallMaterial || 'brick',
    shape: 'box'
  });

  // East Wall (+X) - Width matches depth minus overlaps to avoid z-fighting
  parts.push({
    id: uid('wall_e'),
    type: 'wall',
    position: { x: x + width / 2 - WALL_THICKNESS / 2, y: wallY, z },
    size: { x: WALL_THICKNESS, y: wallH, z: depth - (WALL_THICKNESS * 2) }, // Tuck inside
    color: style.wallColor || '#ecf0f1',
    material: style.wallMaterial || 'brick',
    shape: 'box'
  });

  // West Wall (-X)
  parts.push({
    id: uid('wall_w'),
    type: 'wall',
    position: { x: x - width / 2 + WALL_THICKNESS / 2, y: wallY, z },
    size: { x: WALL_THICKNESS, y: wallH, z: depth - (WALL_THICKNESS * 2) },
    color: style.wallColor || '#ecf0f1',
    material: style.wallMaterial || 'brick',
    shape: 'box'
  });

  // 3. Roof
  const roofH = style.roofHeight || 1.5;
  const roofY = y + FLOOR_HEIGHT + wallH + (style.roofType === 'flat' ? 0.1 : roofH / 2);

  if (style.roofType === 'gable') {
    // Prism Roof (A-Frame)
    parts.push({
      id: uid('roof'),
      type: 'roof',
      position: { x, y: roofY, z },
      // Rotate 90 deg on Y to align with width, or 0 for depth. 
      // Defaulting to align with the wider side or X axis.
      rotation: { x: 0, y: Math.PI / 2, z: 0 }, 
      size: { x: depth + 0.5, y: roofH, z: width + 0.5 }, // Overhang
      color: style.roofColor || '#2c3e50',
      shape: 'prism'
    });
  } else if (style.roofType === 'pyramid') {
    parts.push({
      id: uid('roof'),
      type: 'roof',
      position: { x, y: roofY, z },
      size: { x: width + 0.5, y: roofH, z: depth + 0.5 },
      color: style.roofColor || '#2c3e50',
      shape: 'box' // Roof component handles 'box' as pyramid often in strict mode, but let's assume Roof.tsx handles generic
    });
  } else {
    // Flat
    parts.push({
      id: uid('roof'),
      type: 'roof',
      position: { x, y: roofY, z },
      size: { x: width + 0.5, y: 0.2, z: depth + 0.5 },
      color: style.roofColor || '#2c3e50',
      shape: 'box'
    });
  }

  return parts;
};

const generateTower = (module: ModuleConfig): ComponentConfig[] => {
  const parts: ComponentConfig[] = [];
  const { position, size, style } = module;
  const { x, y, z } = position;
  const { x: radius, y: height } = size; // x is radius, y is height

  // Tower Body
  parts.push({
    id: uid('tower_body'),
    type: 'wall',
    position: { x, y: y + height / 2, z },
    size: { x: radius, y: height, z: radius }, // Cylinder uses x/z as radii
    color: style.wallColor || '#95a5a6',
    material: style.wallMaterial || 'stone',
    shape: 'cylinder'
  });

  // Tower Roof (Cone)
  const roofH = style.roofHeight || radius * 1.5;
  parts.push({
    id: uid('tower_roof'),
    type: 'roof',
    position: { x, y: y + height + roofH / 2, z },
    size: { x: radius + 0.4, y: roofH, z: radius + 0.4 }, // Overhang
    color: style.roofColor || '#2980b9',
    shape: 'cylinder' // Roof component treats cylinder/box as Cone usually or we add explicit logic
  });

  return parts;
};
