export interface Assistant {
    id: string;
    created_at: number;
    description: string | null;
    file_ids: Array<string>;
    instructions: string | null;
    metadata: unknown | null;
    model: string;
    name: string | null;
    object: "assistant";
    tools: Array<{
        type: "code_interpreter" | "retrieval" | "function";
    }>;
    initialPrompts?: string[];
    isDefaultAgentAdded: boolean;
}

export interface OpenAIPagination<Item extends { id: string }> {
    data: Array<Item>;
}

export interface AssistantDeleted {
    id: string;
    deleted: boolean;
    object: 'assistant.deleted';
}

export interface Thread {
    id: string;
    created_at: number;
    metadata: unknown | null;
    object: 'thread';
}

export type FunctionParameters = Record<string, unknown>;

export interface OpenAIFunction {
    createdAt: string;
    updatedAt: string;
    functionDefinition: {
        name: string;
        description?: string;
        parameters?: FunctionParameters;
    };
    label: string;
    onlySuperAdmin: boolean;
    id: string;
    _id: string;
}
