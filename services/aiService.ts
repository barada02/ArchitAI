
import { GoogleGenAI, Type, SchemaParams } from "@google/genai";
import { HouseBlueprint } from "../types/blueprint";

// Initialize the API client
// Note: process.env.API_KEY is guaranteed to be available by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash"; // Using Flash for speed, can upgrade to 'gemini-3-pro-preview' for complex logic

// Define the schema to ensure the AI generates valid JSON matching our TypeScript interfaces
const componentSchema: SchemaParams = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Unique identifier for the component (e.g., 'wall_1')" },
    type: { 
      type: Type.STRING, 
      description: "The type of component. Must be one of: 'floor', 'wall', 'roof', 'door', 'window', 'generic'",
    },
    position: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        z: { type: Type.NUMBER },
      },
      required: ["x", "y", "z"]
    },
    size: {
      type: Type.OBJECT,
      description: "Dimensions in meters [width, height, depth]",
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        z: { type: Type.NUMBER },
      },
      required: ["x", "y", "z"]
    },
    rotation: {
      type: Type.OBJECT,
      description: "Euler rotation in radians",
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        z: { type: Type.NUMBER },
      },
    },
    color: { type: Type.STRING, description: "Hex color code (e.g., '#ff0000')" },
    material: { 
      type: Type.STRING, 
      description: "Material type. Options: 'wood', 'brick', 'glass', 'concrete', 'metal'" 
    }
  },
  required: ["id", "type", "position", "size", "color"]
};

const blueprintSchema: SchemaParams = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    components: {
      type: Type.ARRAY,
      items: componentSchema
    }
  },
  required: ["id", "name", "components"]
};

export const generateHouseBlueprint = async (prompt: string): Promise<HouseBlueprint> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: `
          You are an expert 3D Architect Engine. Your goal is to generate a JSON blueprint for a house based on user input.
          
          COORDINATE SYSTEM RULES:
          - Y is UP. Ground level is Y=0.
          - 1 unit = 1 meter.
          - The center of the plot is (0,0,0).
          - A standard floor is usually 0.2m thick.
          - A standard wall is 3m high.
          
          COMPONENT LOGIC:
          - 'floor': foundation slabs.
          - 'wall': vertical structures.
          - 'roof': sits on top of walls. Note: 'roof' uses ConeGeometry (pyramid shape). For flat roofs, use a 'floor' type component placed on top.
          - 'door': purely decorative slab. Place slightly forward (z + 0.05) to avoid Z-fighting.
          - 'window': decorative slab. Place slightly forward.
          
          DESIGN RULES:
          - Be creative with colors and dimensions.
          - Ensure walls align to form a closed structure if requested.
          - Always include a foundation (floor).
        `,
        responseMimeType: "application/json",
        responseSchema: blueprintSchema,
        temperature: 0.7, // Slightly creative
      }
    });

    if (response.text) {
      const blueprint = JSON.parse(response.text) as HouseBlueprint;
      // Ensure specific fields that might be missing are handled or defaults applied if necessary
      // (The schema handles most strictness, but good to be safe)
      return blueprint;
    } else {
      throw new Error("No data returned from AI");
    }
  } catch (error) {
    console.error("AI Generation Failed:", error);
    throw error;
  }
};
