
import { Editor } from "tldraw";
import { CreateDiagramActionUtil } from "./actions/CreateDiagramAction";
import { AgentHelpers } from "./types";

export class TldrawAgent {
    private editor: Editor;
    // Registry of available actions
    private actions = [new CreateDiagramActionUtil()];

    constructor(editor: Editor) {
        this.editor = editor;
    }

    // Main entry point: Send a message to the AI
    async prompt(request: { message: string; context?: any }) {
        // 1. Build System Prompt with Schema
        const actionSchemas = this.actions.map(a => zodSchemaToString(a.getSchema())).join("\n\n");

        const systemPrompt = `
You are a helpful assistant for Tldraw.
You can execute the following actions by returning a JSON object matching these schemas:

${actionSchemas}

Reply ONLY with a raw JSON object corresponding to the action you want to take.
For 'create_diagram', ensure you define 'nodes' and 'edges'. 
Nodes must have unique IDs (e.g. "node1", "node2").
Layout the nodes intelligently using 'x' and 'y' coordinates. 
Do not overlap nodes.
    `;

        // 2. Call the API
        try {
            const response = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `${systemPrompt}\n\nUser Request: ${request.message}`,
                    clientId: request.context?.clientId,
                    areaId: request.context?.areaId
                })
            });

            if (!response.ok) throw new Error("Failed to contact AI");

            // 3. Parse Response
            const text = await response.text();
            console.log("AI Response Raw:", text); // Debug log

            const actionJson = parseJsonFromResponse(text);

            if (!actionJson) {
                console.warn("AI did not return valid JSON action:", text);
                throw new Error("La IA no devolvió un diagrama válido. Respuesta: " + text.substring(0, 50) + "...");
            }

            // 4. Find and Execute Action
            const actionUtil = this.actions.find(a => a.type === actionJson._type);
            if (actionUtil) {
                // Validate with Zod
                const parsedAction = actionUtil.getSchema().parse(actionJson);
                const helpers: AgentHelpers = { editor: this.editor };
                await actionUtil.execute(parsedAction, helpers);
            } else {
                console.warn("Unknown action type:", actionJson._type);
                throw new Error(`Acción desconocida: ${actionJson._type}`);
            }

        } catch (e) {
            console.error("Agent Loop Error:", e);
            throw e;
        }
    }
}

// Helper: Extract JSON from potentially markdown-wrapped text
function parseJsonFromResponse(text: string): any {
    let contentToParse = text;

    try {
        // 1. Try parsing the HTTP response body as JSON first
        const body = JSON.parse(text);

        // Check if it's the backend wrapper (common in this project)
        if (body.response && typeof body.response === 'string') {
            contentToParse = body.response;
        } else if (body.message && typeof body.message === 'string') {
            contentToParse = body.message;
        } else {
            // Did the backend return the Action JSON directly?
            // If it looks like an action (has _type), return it
            if (body._type) return body;

            // Otherwise, maybe the body IS the content (rare but possible depending on backend)
        }
    } catch {
        // Not valid JSON body, assume it's raw text string
    }

    // 2. Now extract Action JSON from the content string (which might be markdown)
    try {
        // Try direct parse of the content string
        return JSON.parse(contentToParse);
    } catch {
        // Try extract from markdown block
        const match = contentToParse.match(/```json\s*([\s\S]*?)\s*```/) ||
            contentToParse.match(/```\s*([\s\S]*?)\s*```/) ||
            // Fallback: look for first { and last }
            contentToParse.match(/(\{[\s\S]*\})/);

        if (match) {
            try { return JSON.parse(match[1]); } catch { return null; }
        }
    }
    return null;
}

// Helper: Convert Zod schema to string description (Simplified for this MVP)
// Real implementation would inspect Zod internals or use zod-to-json-schema
function zodSchemaToString(schema: any): string {
    // For MVP, hardcoding the known schema description is safer/clearer than generic reflection
    // In a full implementation we'd use zod-to-ts or similar.
    return `
Action: "create_diagram"
Structure:
{
  "_type": "create_diagram",
  "nodes": [ { "id": "string", "type": "rectangle"|"ellipse"|"diamond", "label": "string", "x": number, "y": number, "w": number, "h": number } ],
  "edges": [ { "fromId": "nodeId", "toId": "nodeId", "label": "string" } ]
}
`;
}
