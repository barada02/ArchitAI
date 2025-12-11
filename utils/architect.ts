
import { ComponentConfig, ModuleConfig, Vector3 } from "../types/blueprint";

/**
 * The Architect Engine
 * 
 * Responsibilities:
 * 1. Takes high-level "Modules" (Rooms, Towers, Boundaries, Balconies)
 * 2. Mathematically calculates the position of every wall, floor, and roof.
 * 3. Returns a flat list of atomic components for the Renderer.
 */

const WALL_THICKNESS = 0.25; 
const FLOOR_HEIGHT = 0.2;
const ROOF_OVERHANG = 0.6; 

// Helper to generate a unique ID
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to prevent negative dimensions
const clamp = (val: number, min: number = 0.1) => Math.max(val, min);

export const generateArchitecture = (modules: ModuleConfig[]): ComponentConfig[] => {
  let components: ComponentConfig[] = [];

  modules.forEach(module => {
    switch (module.type) {
      case 'room':
        components = [...components, ...generateRoom(module)];
        break;
      case 'tower':
        components = [...components, ...generateTower(module)];
        break;
      case 'boundary':
        components = [...components, ...generateBoundary(module)];
        break;
      case 'balcony':
        components = [...components, ...generateBalcony(module)];
        break;
      default:
        // Fallback for unknown types, treat as room
        components = [...components, ...generateRoom(module)];
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

  // 2. Walls 
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

  // South Wall (+Z) - Standard Door Logic
  const isGroundFloor = y < 0.5;
  const canFitDoor = width > 2.2;

  if (isGroundFloor && canFitDoor) {
    const doorW = 1.2;
    const doorH = 2.1;
    const wallLeftW = (width - doorW) / 2;
    const wallRightW = wallLeftW;
    const wallTopH = wallH - doorH;

    // Left Segment
    parts.push({
      id: uid('wall_s_left'),
      type: 'wall',
      position: { x: x - (width/2) + (wallLeftW/2), y: wallY, z: z + depth / 2 - WALL_THICKNESS / 2 },
      size: { x: wallLeftW, y: wallH, z: WALL_THICKNESS },
      color: style.wallColor || '#ecf0f1',
      material: style.wallMaterial || 'brick',
      shape: 'box'
    });
    // Right Segment
    parts.push({
      id: uid('wall_s_right'),
      type: 'wall',
      position: { x: x + (width/2) - (wallRightW/2), y: wallY, z: z + depth / 2 - WALL_THICKNESS / 2 },
      size: { x: wallRightW, y: wallH, z: WALL_THICKNESS },
      color: style.wallColor || '#ecf0f1',
      material: style.wallMaterial || 'brick',
      shape: 'box'
    });
    // Top Segment
    parts.push({
      id: uid('wall_s_top'),
      type: 'wall',
      position: { x: x, y: (y + FLOOR_HEIGHT) + doorH + (wallTopH/2), z: z + depth / 2 - WALL_THICKNESS / 2 },
      size: { x: doorW, y: wallTopH, z: WALL_THICKNESS },
      color: style.wallColor || '#ecf0f1',
      material: style.wallMaterial || 'brick',
      shape: 'box'
    });
    // Door
    parts.push({
      id: uid('door_main'),
      type: 'door',
      position: { x: x, y: (y + FLOOR_HEIGHT) + doorH / 2, z: z + depth / 2 - WALL_THICKNESS / 2 },
      size: { x: doorW, y: doorH, z: WALL_THICKNESS * 0.8 },
      color: '#5d4037',
      material: 'wood',
      shape: 'box'
    });
  } else {
    // Solid South Wall
    parts.push({
      id: uid('wall_s'),
      type: 'wall',
      position: { x, y: wallY, z: z + depth / 2 - WALL_THICKNESS / 2 },
      size: { x: width, y: wallH, z: WALL_THICKNESS },
      color: style.wallColor || '#ecf0f1',
      material: style.wallMaterial || 'brick',
      shape: 'box'
    });
  }

  // Side Walls
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
  const roofY = y + FLOOR_HEIGHT + wallH + roofH / 2; 
  const flatRoofY = y + FLOOR_HEIGHT + wallH + 0.1;

  if (style.roofType === 'gable') {
    parts.push({
      id: uid('roof'),
      type: 'roof',
      position: { x, y: roofY, z },
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

  parts.push({
    id: uid('tower_body'),
    type: 'wall',
    position: { x, y: y + height / 2, z },
    size: { x: radius, y: height, z: radius },
    color: style.wallColor || '#95a5a6',
    material: style.wallMaterial || 'stone',
    shape: 'cylinder'
  });

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

const generateBoundary = (module: ModuleConfig): ComponentConfig[] => {
  const parts: ComponentConfig[] = [];
  const { position, size, style } = module;
  const { x, y, z } = position;
  const { x: width, y: height, z: depth } = size;

  const wallH = height;
  const wallY = y + wallH / 2;
  const gateWidth = 2.0;
  
  // Boundary Logic: 4 Walls, but front wall has a distinct GATE
  
  // 1. GATE PILLARS & GATE (South Side)
  const pillarSize = WALL_THICKNESS * 2; 
  const pillarH = wallH + 0.2; // Pillars slightly taller
  
  const wallLeftW = (width - gateWidth) / 2;
  const wallRightW = wallLeftW;
  
  // Left Wall Segment
  parts.push({
    id: uid('bound_s_left'),
    type: 'wall',
    position: { x: x - width/2 + wallLeftW/2, y: wallY, z: z + depth/2 },
    size: { x: wallLeftW, y: wallH, z: WALL_THICKNESS },
    color: style.wallColor || '#bdc3c7',
    shape: 'box'
  });
  
  // Right Wall Segment
  parts.push({
    id: uid('bound_s_right'),
    type: 'wall',
    position: { x: x + width/2 - wallRightW/2, y: wallY, z: z + depth/2 },
    size: { x: wallRightW, y: wallH, z: WALL_THICKNESS },
    color: style.wallColor || '#bdc3c7',
    shape: 'box'
  });

  // Pillars
  parts.push({
    id: uid('gate_pillar_l'),
    type: 'wall',
    position: { x: x - gateWidth/2 - pillarSize/2, y: y + pillarH/2, z: z + depth/2 },
    size: { x: pillarSize, y: pillarH, z: pillarSize },
    color: '#34495e',
    shape: 'box'
  });
  parts.push({
    id: uid('gate_pillar_r'),
    type: 'wall',
    position: { x: x + gateWidth/2 + pillarSize/2, y: y + pillarH/2, z: z + depth/2 },
    size: { x: pillarSize, y: pillarH, z: pillarSize },
    color: '#34495e',
    shape: 'box'
  });

  // The Gate Itself (Thinner, different color)
  parts.push({
    id: uid('bound_gate'),
    type: 'door',
    position: { x: x, y: y + wallH/2, z: z + depth/2 },
    size: { x: gateWidth, y: wallH * 0.9, z: 0.1 }, 
    color: '#5d4037', // Wood
    material: 'wood',
    shape: 'box'
  });

  // 2. Other 3 Walls (Solid)
  // North
  parts.push({
    id: uid('bound_n'),
    type: 'wall',
    position: { x, y: wallY, z: z - depth/2 },
    size: { x: width, y: wallH, z: WALL_THICKNESS },
    color: style.wallColor || '#bdc3c7',
    shape: 'box'
  });
  // East
  parts.push({
    id: uid('bound_e'),
    type: 'wall',
    position: { x: x + width/2, y: wallY, z },
    size: { x: WALL_THICKNESS, y: wallH, z: depth },
    color: style.wallColor || '#bdc3c7',
    shape: 'box'
  });
  // West
  parts.push({
    id: uid('bound_w'),
    type: 'wall',
    position: { x: x - width/2, y: wallY, z },
    size: { x: WALL_THICKNESS, y: wallH, z: depth },
    color: style.wallColor || '#bdc3c7',
    shape: 'box'
  });

  return parts;
};

const generateBalcony = (module: ModuleConfig): ComponentConfig[] => {
  const parts: ComponentConfig[] = [];
  const { position, size, style } = module;
  const { x, y, z } = position;
  const { x: width, y: height, z: depth } = size;

  // 1. Floor Platform
  parts.push({
    id: uid('balcony_floor'),
    type: 'floor',
    position: { x, y: y + 0.1, z },
    size: { x: width, y: 0.2, z: depth },
    color: style.wallColor || '#bdc3c7',
    material: 'concrete',
    shape: 'box'
  });

  // 2. Railings (Thin walls on all 4 sides)
  const railH = 1.0;
  const railThick = 0.1;
  const railY = y + 0.2 + railH/2;

  // Render 4 Railings to be safe (AI might place balcony anywhere)
  // Front
  parts.push({ id: uid('rail_f'), type: 'wall', position: { x, y: railY, z: z + depth/2 }, size: { x: width, y: railH, z: railThick }, color: '#34495e', shape: 'box' });
  // Back
  parts.push({ id: uid('rail_b'), type: 'wall', position: { x, y: railY, z: z - depth/2 }, size: { x: width, y: railH, z: railThick }, color: '#34495e', shape: 'box' });
  // Left
  parts.push({ id: uid('rail_l'), type: 'wall', position: { x: x - width/2, y: railY, z }, size: { x: railThick, y: railH, z: depth }, color: '#34495e', shape: 'box' });
  // Right
  parts.push({ id: uid('rail_r'), type: 'wall', position: { x: x + width/2, y: railY, z }, size: { x: railThick, y: railH, z: depth }, color: '#34495e', shape: 'box' });

  return parts;
};
