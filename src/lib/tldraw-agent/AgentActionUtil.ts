
import { z } from "zod";
import { AgentHelpers, IAgentActionUtil } from "./types";

export abstract class AgentActionUtil<T> implements IAgentActionUtil {
    abstract type: string;

    abstract getSchema(): z.ZodType<T>;

    abstract execute(action: T, helpers: AgentHelpers): Promise<void> | void;
}
