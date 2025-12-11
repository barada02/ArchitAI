
import { GoogleGenAI, Type, SchemaParams } from "@google/genai";
import { HouseBlueprint } from "../types/blueprint";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash"; 

// --- New "Smart Module" Schema ---

const moduleSchema: SchemaParams = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    type: { 
      type: Type.STRING, 
      enum: ['room', 'tower'],
      description: "The type of structure. 'room' creates a rectangular building block. 'tower' creates a cylindrical spire."
    },
    position: {
      type: Type.OBJECT,
      description: "Center X/Z position on the ground. Y is usually 0.",
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        z: { type: Type.NUMBER },
      },
      required: ["x", "y", "z"]
    },
    size: {
      type: Type.OBJECT,
      description: "Dimensions. For Room: [width, height, depth]. For Tower: [radius, height, radius].",
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        z: { type: Type.NUMBER },
      },
      required: ["x", "y", "z"]
    },
    style: {
      type: Type.OBJECT,
      properties: {
        wallColor: { type: Type.STRING },
        wallMaterial: { type: Type.STRING, enum: ['wood', 'brick', 'concrete', 'stone'] },
        roofColor: { type: Type.STRING },
        roofType: { type: Type.STRING, enum: ['flat', 'gable', 'pyramid'] },
        roofHeight: { type: Type.NUMBER }
      }
    }
  },
  required: ["type", "position", "size"]
};

const blueprintSchema: SchemaParams = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    modules: {
      type: Type.ARRAY,
      items: moduleSchema,
      description: "List of architectural modules that make up the house."
    }
  },
  required: ["id", "name", "modules"]
};

export const generateHouseBlueprint = async (prompt: string): Promise<HouseBlueprint> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: `
          You are a Senior Level Designer for a Stylized Fantasy Game (like World of Warcraft or Overwatch).
          Your job is to generate architectural blueprints composed of 'Modules' (Rooms and Towers).

          **DESIGN RULES:**
          1. **Composition**: Don't just make one box. Combine multiple modules. 
             - Example: A large central room (6x4x6) + a smaller side room (3x3x4) + a tall tower (radius 1.5) attached to the corner.
          2. **Stylization**:
             - Use 'gable' roofs for cottages.
             - Use 'flat' roofs for modern.
             - Use 'stone' for towers and foundations.
             - Use 'wood' for upper floors.
          3. **Colors**: Use vibrant, coherent color palettes. 
             - Evil/Gothic: Dark stone walls, dark blue/purple roofs.
             - Cozy: White/Cream walls, bright orange/red roofs.
          4. **Placement**: Ensure modules touch or slightly overlap so the building looks connected. Y position should usually be 0 for the ground floor.

          Do not worry about windows or doors yet; the engine handles basic structure first.
        `,
        responseMimeType: "application/json",
        responseSchema: blueprintSchema,
        temperature: 0.8, 
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as HouseBlueprint;
    } else {
      throw new Error("No data returned from AI");
    }
  } catch (error) {
    console.error("AI Generation Failed:", error);
    throw error;
  }
};
