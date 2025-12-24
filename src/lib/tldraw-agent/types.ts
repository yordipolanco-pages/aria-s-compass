
import { Editor } from "tldraw";
import { z } from "zod";

export interface AgentHelpers {
    editor: Editor;
    // Add more helpers as needed (e.g. geometry math)
}

// Base structure for what the AI returns
export interface AgentAction<T = any> {
    _type: string;
    data: T;
}

// Interface for action execution
export interface IAgentActionUtil {
    type: string;
    getSchema(): z.ZodType<any>;
    execute(action: any, helpers: AgentHelpers): Promise<void> | void;
}
