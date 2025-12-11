
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
  required: ["type", "position", "size", "style"]
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

          **PLACEMENT RULES (CRITICAL):**
          - **Balconies**: Must be attached to a room. Place the balcony *in front* (South/+Z) of a room on an upper floor.
            - Example: Room at z=0, depth=4. Balcony at z=3, depth=2.
          - **Setbacks**: For multi-story homes, consider making the 2nd floor smaller or shifted back (North/-Z) to create space for a balcony on the 1st floor roof.
          - **Boundaries**: Make them large enough to enclose the whole house. e.g., if house is 10x10, boundary should be 20x20.

          **STYLES:**
          - **Indian**: Flat roofs, verandas (large balconies), boundary walls with gates, warm colors (cream, orange, red).
          - **Modern**: Boxy, flat roofs, glass materials, concrete.
          - **Cottage**: Gable roofs, brick/wood.

          Generate a coherent structure.
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
