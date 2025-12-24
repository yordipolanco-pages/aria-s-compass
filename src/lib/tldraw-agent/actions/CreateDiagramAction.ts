
import { z } from "zod";
import { AgentActionUtil } from "../AgentActionUtil";
import { AgentHelpers } from "../types";
import { createShapeId } from "tldraw";

// Schema for a single shape the AI can propose
const ShapeSchema = z.object({
    id: z.string().optional(), // AI might suggest IDs, or we generate them
    type: z.enum(["rectangle", "ellipse", "diamond", "text"]),
    label: z.string().optional(),
    x: z.number(),
    y: z.number(),
    w: z.number().optional().default(160),
    h: z.number().optional().default(80)
});

// Schema for connections
const EdgeSchema = z.object({
    fromId: z.string(),
    toId: z.string(),
    label: z.string().optional()
});

export const CreateDiagramSchema = z.object({
    _type: z.literal("create_diagram"),
    nodes: z.array(ShapeSchema),
    edges: z.array(EdgeSchema)
});

type CreateDiagramAction = z.infer<typeof CreateDiagramSchema>;

export class CreateDiagramActionUtil extends AgentActionUtil<CreateDiagramAction> {
    type = "create_diagram";

    getSchema() {
        return CreateDiagramSchema;
    }

    execute(action: CreateDiagramAction, { editor }: AgentHelpers) {
        const { nodes, edges } = action;
        const newShapes: any[] = [];
        const idMap = new Map<string, any>(); // Map AI IDs to Tldraw IDs

        // 0. Create Frame
        const frameId = createShapeId();
        // Calculate bounds to size the frame (simple approximation)
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(n => {
            if (n.x < minX) minX = n.x;
            if (n.y < minY) minY = n.y;
            if ((n.x + (n.w || 160)) > maxX) maxX = n.x + (n.w || 160);
            if ((n.y + (n.h || 80)) > maxY) maxY = n.y + (n.h || 80);
        });
        // Add padding
        const padding = 50;
        minX -= padding; minY -= padding; maxX += padding; maxY += padding;

        // Default if no nodes
        if (nodes.length === 0) { minX = 0; minY = 0; maxX = 300; maxY = 300; }

        newShapes.push({
            id: frameId,
            type: "frame",
            x: minX,
            y: minY,
            props: {
                w: maxX - minX,
                h: maxY - minY,
                name: "Diagrama Generado"
            }
        });

        // 1. Create Nodes
        nodes.forEach(node => {
            const shapeId = createShapeId();
            if (node.id) idMap.set(node.id, { id: shapeId, ...node }); // Store layout info for arrows

            // Base Geo Shape
            if (node.type !== "text") {
                newShapes.push({
                    id: shapeId,
                    type: "geo",
                    parentId: frameId, // Nest in frame
                    x: node.x - minX, // Coordinates are usually local to parent if parent is frame, BUT in Tldraw standard they are page-space if using createShapes. 
                    // Wait, if parentId is set, x/y are LOCAL to parent.
                    // So we must subtract frame x/y.
                    y: node.y - minY,
                    props: {
                        geo: node.type, // rectangle, ellipse, diamond mapping works directly
                        w: node.w,
                        h: node.h,
                        color: "light-blue"
                    }
                });

                // Label (RichText)
                if (node.label) {
                    const textId = createShapeId();
                    newShapes.push({
                        id: textId,
                        type: "text",
                        parentId: frameId,
                        x: (node.x - minX) + (node.w / 2),
                        y: (node.y - minY) + (node.h / 2),
                        props: {
                            richText: {
                                type: "doc",
                                content: [{ type: "paragraph", attrs: { dir: "auto" }, content: [{ type: "text", text: node.label }] }]
                            },
                            textAlign: "middle",
                            size: "s",
                            autoSize: true,
                            scale: 1
                        }
                    });
                }
            }
            // Handle pure text nodes separately if needed, but for now specific node types
        });

        // 2. Create Edges
        edges.forEach(edge => {
            const fromNode = idMap.get(edge.fromId);
            const toNode = idMap.get(edge.toId);

            if (fromNode && toNode) {
                // Coords relative to nodes (which are now relative to frame)
                // Actually, we can just use the same math but result is local to frame as long as parentId is set
                const startX = (fromNode.x - minX) + (fromNode.w / 2);
                const startY = (fromNode.y - minY) + (fromNode.h / 2);
                const endX = (toNode.x - minX) + (toNode.w / 2);
                const endY = (toNode.y - minY) + (toNode.h / 2);

                newShapes.push({
                    id: createShapeId(),
                    type: "arrow",
                    parentId: frameId,
                    x: startX,
                    y: startY,
                    props: {
                        start: { x: 0, y: 0 },
                        end: { x: endX - startX, y: endY - startY },
                        arrowheadEnd: "arrow",
                        size: "m"
                    }
                });
            }
        });

        // Commit to canvas
        editor.createShapes(newShapes);
        editor.zoomToFit();
    }
}

