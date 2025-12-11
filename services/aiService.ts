
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
      enum: ['room', 'tower', 'boundary', 'balcony'],
      description: "The type of structure. 'room': basic building block. 'tower': cylindrical. 'boundary': perimeter wall/fence. 'balcony': raised platform with railings."
    },
    position: {
      type: Type.OBJECT,
      description: "Center X/Z position on the ground. Y is height (0 for ground, 3 for 2nd floor).",
      properties: {
        x: { type: Type.NUMBER },
        y: { type: Type.NUMBER },
        z: { type: Type.NUMBER },
      },
      required: ["x", "y", "z"]
    },
    size: {
      type: Type.OBJECT,
      description: "Dimensions. Room/Boundary: [width, height, depth]. Tower: [radius, height, radius].",
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
          You are a Senior Architect for a 3D Home Builder.
          Your job is to generate architectural blueprints composed of 'Modules'.

          **MODULE TYPES:**
          1. **room**: Standard living space. Has walls, floor, and roof.
          2. **tower**: Cylindrical vertical structure.
          3. **boundary**: A perimeter wall or fence surrounding the house. Usually low height (1-2m). NO ROOF.
          4. **balcony**: An outdoor platform on upper floors. Has railings. NO ROOF.

          **DESIGN RULES:**
          - **Boundaries**: If user asks for a boundary/fence, create a large 'boundary' module surrounding the main rooms.
          - **Balconies**: If user asks for a balcony, place a 'balcony' module (height ~0.2, y > 0) attached to a room.
          - **Composition**: Combine multiple modules. Overlap them slightly.
          - **Stylization**:
             - "Indian style": Flat roofs, warm colors (cream/orange), boundary walls, verandas (balconies).
             - "Modern": Boxy, concrete/glass, flat roofs.
             - "Cottage": Gable roofs, brick/wood.

          Generate a coherent structure based on the user's prompt.
        `,
        responseMimeType: "application/json",
        responseSchema: blueprintSchema,
        temperature: 0.75, 
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
