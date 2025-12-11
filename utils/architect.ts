
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
  
  // FIXED DIMENSIONS
  const gateWidth = 2.0;
  const pillarSize = 0.6; // Slightly thicker than wall
  const wallThick = 0.25;

  // 1. GATE PILLARS & GATE (South Side)
  // To avoid overlap, we calculate the remaining width for the walls
  // Total Width = Left Wall + Pillar + Gate + Pillar + Right Wall
  // Wall Width = (Total - Gate - 2*Pillar) / 2
  const availableForWalls = width - gateWidth - (pillarSize * 2);
  const wallSegWidth = Math.max(0.1, availableForWalls / 2);
  
  const pillarH = wallH + 0.3; // Pillars stand proud
  
  // Positions
  // Center is x. 
  // Gate is at x.
  // Right Pillar Center = x + gateWidth/2 + pillarSize/2
  // Right Wall Center = Right Pillar Edge + wallSegWidth/2
  // Right Pillar Edge = x + gateWidth/2 + pillarSize
  
  const rPillarX = x + gateWidth/2 + pillarSize/2;
  const lPillarX = x - gateWidth/2 - pillarSize/2;
  
  const rWallX = (x + gateWidth/2 + pillarSize) + wallSegWidth/2;
  const lWallX = (x - gateWidth/2 - pillarSize) - wallSegWidth/2;

  // Left Wall Segment
  parts.push({
    id: uid('bound_s_left'),
    type: 'wall',
    position: { x: lWallX, y: wallY, z: z + depth/2 },
    size: { x: wallSegWidth, y: wallH, z: wallThick },
    color: style.wallColor || '#bdc3c7',
    shape: 'box'
  });
  
  // Right Wall Segment
  parts.push({
    id: uid('bound_s_right'),
    type: 'wall',
    position: { x: rWallX, y: wallY, z: z + depth/2 },
    size: { x: wallSegWidth, y: wallH, z: wallThick },
    color: style.wallColor || '#bdc3c7',
    shape: 'box'
  });

  // Pillars (Thicker z-axis to stand out)
  parts.push({
    id: uid('gate_pillar_l'),
    type: 'wall',
    position: { x: lPillarX, y: y + pillarH/2, z: z + depth/2 },
    size: { x: pillarSize, y: pillarH, z: pillarSize },
    color: '#34495e',
    shape: 'box'
  });
  parts.push({
    id: uid('gate_pillar_r'),
    type: 'wall',
    position: { x: rPillarX, y: y + pillarH/2, z: z + depth/2 },
    size: { x: pillarSize, y: pillarH, z: pillarSize },
    color: '#34495e',
    shape: 'box'
  });

  // The Gate Itself (Recessed and thinner)
  parts.push({
    id: uid('bound_gate'),
    type: 'door',
    position: { x: x, y: y + wallH * 0.45, z: z + depth/2 }, // Slightly higher off ground? No, ground level.
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
    size: { x: width, y: wallH, z: wallThick },
    color: style.wallColor || '#bdc3c7',
    shape: 'box'
  });
  // East - Needs to span the full depth
  parts.push({
    id: uid('bound_e'),
    type: 'wall',
    position: { x: x + width/2, y: wallY, z },
    size: { x: wallThick, y: wallH, z: depth },
    color: style.wallColor || '#bdc3c7',
    shape: 'box'
  });
  // West
  parts.push({
    id: uid('bound_w'),
    type: 'wall',
    position: { x: x - width/2, y: wallY, z },
    size: { x: wallThick, y: wallH, z: depth },
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

  // 2. Corner Posts (Aesthetics)
  const postSize = 0.15;
  const railH = 0.9;
  const postY = y + 0.2 + railH/2;
  
  // Helper for posts
  const addPost = (px: number, pz: number) => {
    parts.push({
      id: uid('rail_post'),
      type: 'wall',
      position: { x: px, y: postY, z: pz },
      size: { x: postSize, y: railH, z: postSize },
      color: '#2c3e50',
      shape: 'box'
    });
  };

  addPost(x - width/2 + postSize/2, z + depth/2 - postSize/2); // Front Left
  addPost(x + width/2 - postSize/2, z + depth/2 - postSize/2); // Front Right
  addPost(x - width/2 + postSize/2, z - depth/2 + postSize/2); // Back Left
  addPost(x + width/2 - postSize/2, z - depth/2 + postSize/2); // Back Right

  // 3. Railings
  // Made thinner and glass-like or metal
  const railThick = 0.05;
  const railY = y + 0.2 + railH/2;
  const railColor = '#34495e';

  // Front Rail
  parts.push({ 
    id: uid('rail_f'), 
    type: 'wall', 
    position: { x, y: railY, z: z + depth/2 - railThick/2 }, 
    size: { x: width - postSize*2, y: railH * 0.8, z: railThick }, 
    color: railColor, 
    shape: 'box' 
  });
  
  // Left Rail
  parts.push({ 
    id: uid('rail_l'), 
    type: 'wall', 
    position: { x: x - width/2 + railThick/2, y: railY, z }, 
    size: { x: railThick, y: railH * 0.8, z: depth - postSize*2 }, 
    color: railColor, 
    shape: 'box' 
  });
  
  // Right Rail
  parts.push({ 
    id: uid('rail_r'), 
    type: 'wall', 
    position: { x: x + width/2 - railThick/2, y: railY, z }, 
    size: { x: railThick, y: railH * 0.8, z: depth - postSize*2 }, 
    color: railColor, 
    shape: 'box' 
  });

  // NO BACK RAIL for balconies, assuming they attach to a wall.
  // This makes it look like a balcony and not a cage.

  return parts;
};
