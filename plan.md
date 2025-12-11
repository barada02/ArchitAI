# Architectural Plan: AI Home Builder Engine

## 1. Core Workflow: The "Triad" Architecture

You are exactly correct. The most robust way to build this is to separate the **Intent** (AI) from the **Execution** (3D Engine). We will not have the AI write code. We will have the AI write *instructions*.

### A. The Architect (AI Layer)
*   **Role:** Translates natural language ("I want a cozy cottage") into structured data.
*   **Output:** A JSON Blueprint. It does not know about pixels or vertices. It only knows about architectural logic.

### B. The Blueprint (Data Layer)
*   **Role:** The "Source of Truth." This is a JSON file that describes the house hierarchically.
*   **Structure:**
    ```json
    {
      "id": "house_001",
      "style": "modern",
      "modules": [
        {
          "id": "floor_1",
          "type": "floor",
          "children": [
            { "type": "wall", "position": "north", "material": "brick", "id": "w1" },
            { "type": "wall", "position": "south", "material": "glass", "id": "w2" },
            { "type": "furniture", "item": "sofa", "coords": [2, 0, 2] }
          ]
        }
      ]
    }
    ```

### C. The Builder (Engine Layer)
*   **Role:** Reads the JSON and instantiates React/Three.js components.
*   **Logic:** It iterates through the `modules` array. If it sees `type: "wall"`, it renders the `<Wall />` component with the specified parameters.

---

## 2. The Animation Strategy: "The Construction Experience"

To achieve the effect of components flying in to build the house, we need a robust animation strategy.

### Recommendation: Framer Motion 3D (or React Spring)
Do not use `anime.js` or DOM-based animation libraries. Since we are using **React Three Fiber (R3F)**, we need a library designed to animate React state and Three.js objects.

**Why Framer Motion 3D?**
1.  **Declarative:** You define the "Enter" state (invisible, scaled down) and the "Visible" state (full size). The library handles the physics.
2.  **Staggering:** You can tell the engine: "Animate the floor. Wait 0.2s. Animate the walls. Wait 0.2s. Animate the roof." This creates that satisfying "lego clicking" effect.

**The "Sequencer" Pattern:**
We will create a `ConstructionManager` hook.
1.  **Phase 1 (Foundation):** Filter JSON for `type: "foundation"`. Trigger their "enter" animation.
2.  **Phase 2 (Structure):** Filter for `type: "wall"`. Trigger animation.
3.  **Phase 3 (Detail):** Filter for `type: "furniture"`. Pop them in.

This allows the user to watch the house being built in logical layers.

---

## 3. Advanced Feature Feasibility

### A. Segmentation (Exploded View)
*   **Feasibility:** High.
*   **How:** Since our JSON is hierarchical, we can easily calculate the center of the house.
*   **Implementation:** When "Explode Mode" is active, we multiply the position of every component by a scalar vector (e.g., 1.5x) away from the center.
    *   *Result:* The roof lifts up, the walls slide out. It looks like an engineering diagram.

### B. "X-Ray" / Hide Walls
*   **Feasibility:** Very High.
*   **How:** 
    1.  **Raycasting:** Three.js has built-in click detection.
    2.  **Interaction:** When a user clicks a wall, we toggle a localized state `isHidden`.
    3.  **Visual:** The `<Wall />` component listens to this state. If `isHidden` is true, it sets its material opacity to 0.1 (transparent) or `visible={false}`.
    4.  This allows users to "peel" the house to see the furniture inside.

### C. Component Interaction (Edit Mode)
*   **Feasibility:** Medium (Requires robust UI).
*   **How:**
    1.  User clicks a window.
    2.  The UI Overlay shows a "Properties Panel" (e.g., Change Material, Change Size).
    3.  User selects "Wood".
    4.  React updates the **JSON Blueprint** state.
    5.  The 3D component re-renders instantly with the new texture.

### D. Export Functionality
*   **Feasibility:** High.
*   **Tool:** `THREE.GLTFExporter`.
*   **How:** We can traverse the `Construction_Zone` group in Three.js and convert it to a standard `.glb` or `.obj` file. The user can then download this and open it in Blender or use it for 3D printing.

---

## 4. Implementation Roadmap

### Phase 1: The "Smart" Component System
*   Refactor the current single `House.tsx` into atomic parts: `<Wall>`, `<Roof>`, `<Floor>`, `<Window>`.
*   Create a hard-coded JSON file (`mockBlueprint.json`) to test rendering these parts dynamically.

### Phase 2: The Animation Sequencer
*   Implement `Framer Motion 3D`.
*   Create the "Staggered Build" effect where the JSON data flows in over time.

### Phase 3: The Brain (AI Integration)
*   Connect to Gemini API.
*   Write the "System Prompt" that teaches Gemini how to output our specific JSON structure.
*   Build the text input UI.

### Phase 4: The Editor (Interactivity)
*   Add Raycasting (click handlers) to components.
*   Implement "Explode View" math.
*   Implement Material Swapping.
