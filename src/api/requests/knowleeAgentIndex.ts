import {
    Assistant,
    AssistantDeleted,
    OpenAIFunction,
    OpenAIPagination,
} from "src/types/openAI.interface";
import { ServerResponse, apiRequest } from "./client";
import { DefaultAgent, UserAgent, UserAgentWithFunctionDefinition } from "src/types/userAgent.interface";
import {
    Run,
} from "openai/resources/beta/threads/runs/runs";

export type CreateKnowleeAgentPayload = {
    name: string;
    instructions: string;
    entityIds: string[];
    functionDefinitions: string[];
    initialPrompts: string[];
};

export type UpdateAssistantPayload = {
    id: string;
} & Partial<CreateKnowleeAgentPayload>

export async function createKnowleeAgentRequest(
    token: string,
    payload?: CreateKnowleeAgentPayload
) {
    const res = await apiRequest<ServerResponse<{ userAgent: UserAgent }>>(
        "POST",
        `knowlee-agent`,
        token,
        payload
    );
    return res.data.result;
}

export async function getAllAgentsRequest(
    token: string,
) {
    const res = await apiRequest<ServerResponse<{ body: OpenAIPagination<Assistant> }>>(
        "GET",
        `knowlee-agent/assistants`,
        token,
    );
    return res.data.result?.body;
}

export async function retrieveAssistantRequest(
    token: string,
    assistantId: string,
) {
    const res = await apiRequest<ServerResponse<UserAgent>>(
        "GET",
        `knowlee-agent/assistants/${assistantId}`,
        token,
    );
    return res.data.result;
}

export async function updateAssistantRequest(
    token: string,
    payload: UpdateAssistantPayload,
) {
    const res = await apiRequest<ServerResponse<Assistant>>(
        "POST",
        `knowlee-agent/assistants/${payload.id}`,
        token,
        payload
    );
    return res.data.result;
}

export async function getUserAgentsRequest(
    token: string,
) {
    const res = await apiRequest<ServerResponse<UserAgentWithFunctionDefinition[]>>(
        "GET",
        `knowlee-agent/user-agents`,
        token,
    );
    return res.data.result;
}

export async function getDefaultAgentsRequest(
    token: string,
) {
    const res = await apiRequest<ServerResponse<DefaultAgent[]>>(
        "GET",
        `knowlee-agent/default-agents`,
        token,
    );
    return res.data.result;
}

export async function addDefaultAgentAsUserAgentRequest(
    token: string,
    agentId: string,
) {
    const res = await apiRequest<ServerResponse<UserAgent[]>>(
        "POST",
        `/knowlee-agent/default-agents/user-agent`,
        token, 
        { agentId }
    );
    return res.data.result;
}

export async function deleteAssistantRequest(
    token: string,
    assistantId: string,
) {
    const res = await apiRequest<ServerResponse<AssistantDeleted>>(
        "DELETE",
        `knowlee-agent/assistants/${assistantId}`,
        token,
    );
    return res.data.result;
}

export async function getThreadRunsRequest(
    token: string,
    threadId: string,
    params?: unknown,
) {
    const res = await apiRequest<
        ServerResponse<Run[]>
    >("GET", `knowlee-agent/user-threads/${threadId}/runs`, token, null, {
        params,
    });
    return res.data.result;
}

export async function getFunctionDefinitionsRequest(
    token: string,
    params?: unknown
) {
    const res = await apiRequest<ServerResponse<OpenAIFunction[]>>(
        "GET",
        `knowlee-agent/function-definitions`,
        token,
        null,
        {
            params,
        }
    );
    return res.data.result;
}
