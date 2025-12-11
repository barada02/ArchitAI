
import { ComponentConfig, ModuleConfig, Vector3 } from "../types/blueprint";

/**
 * The Architect Engine
 * 
 * Responsibilities:
 * 1. Takes high-level "Modules" (Rooms, Towers)
 * 2. Mathematically calculates the position of every wall, floor, and roof.
 * 3. Returns a flat list of atomic components for the Renderer.
 */

const WALL_THICKNESS = 0.25; 
const FLOOR_HEIGHT = 0.2;
const ROOF_OVERHANG = 0.6; // Standard overhang

// Helper to generate a unique ID
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to prevent negative dimensions which cause inverted/invisible geometry
const clamp = (val: number, min: number = 0.1) => Math.max(val, min);

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
  const wallH = clamp(height);
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

  // East Wall (+X)
  const sideWallWidth = clamp(depth - (WALL_THICKNESS * 2));
  
  parts.push({
    id: uid('wall_e'),
    type: 'wall',
    position: { x: x + width / 2 - WALL_THICKNESS / 2, y: wallY, z },
    size: { x: WALL_THICKNESS, y: wallH, z: sideWallWidth },
    color: style.wallColor || '#ecf0f1',
    material: style.wallMaterial || 'brick',
    shape: 'box'
  });

  // West Wall (-X)
  parts.push({
    id: uid('wall_w'),
    type: 'wall',
    position: { x: x - width / 2 + WALL_THICKNESS / 2, y: wallY, z },
    size: { x: WALL_THICKNESS, y: wallH, z: sideWallWidth },
    color: style.wallColor || '#ecf0f1',
    material: style.wallMaterial || 'brick',
    shape: 'box'
  });

  // 3. Roof
  const roofH = clamp(style.roofHeight || 1.5);
  // Position: Top of wall + half roof height (since geometry is usually centered)
  const roofY = y + FLOOR_HEIGHT + wallH + roofH / 2; 
  // For Flat roofs, it's just a thin lid, so shift down slightly
  const flatRoofY = y + FLOOR_HEIGHT + wallH + 0.1;

  if (style.roofType === 'gable') {
    parts.push({
      id: uid('roof'),
      type: 'roof',
      position: { x, y: roofY, z },
      // Pass the FULL size including overhangs. 
      // Rotation is handled by the Component based on aspect ratio (Portrait/Landscape).
      size: { x: width + ROOF_OVERHANG, y: roofH, z: depth + ROOF_OVERHANG },
      color: style.roofColor || '#2c3e50',
      shape: 'prism'
    });
  } else if (style.roofType === 'pyramid') {
    parts.push({
      id: uid('roof'),
      type: 'roof',
      position: { x, y: roofY, z },
      size: { x: width + ROOF_OVERHANG, y: roofH, z: depth + ROOF_OVERHANG },
      color: style.roofColor || '#2c3e50',
      shape: 'pyramid'
    });
  } else {
    // Flat
    parts.push({
      id: uid('roof'),
      type: 'roof',
      position: { x, y: flatRoofY, z },
      size: { x: width + 0.4, y: 0.2, z: depth + 0.4 },
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
  const { x: radius, y: height } = size; 

  // Tower Body
  parts.push({
    id: uid('tower_body'),
    type: 'wall',
    position: { x, y: y + height / 2, z },
    size: { x: radius, y: height, z: radius },
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
    size: { x: radius + 0.5, y: roofH, z: radius + 0.5 },
    color: style.roofColor || '#2980b9',
    shape: 'cylinder' 
  });

  return parts;
};
