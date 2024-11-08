import { ServerResponse, apiRequest } from "./client";
import { ThreadMessage } from "src/types/threads.interface";
import { IMessageList, ThreadRun } from "src/utils/types";
import { UserAgent, UserThread } from "src/types/userAgent.interface";
import { Conversation } from "src/components/Conversation/Conversations";


export interface CreateFixtureAgentPayload {
    team_home_name: string;
    team_away_name: string;
    fixture_id: number;
    team_away_id: number;
    team_home_id: number;
}
interface AddMessageInThreadResponse  {
    message: ThreadMessage;
    createdRun: ThreadRun;
    userThread: UserThread;
  }

  export interface AddMessagePayload {
    threadId?: string,
    textMessage: string,
    shouldRun: boolean,
    assistantId?: string,
    title: string
  }

export async function createFixtureAgentRequest(
    token: string,
    payload?: CreateFixtureAgentPayload
){
    if (!payload) {
        console.error('Payload is required for createFixtureAgentRequest');
        return null;
    }

    const res = await apiRequest<ServerResponse< string>>(
        "POST",
        `football/fixtureAgent`,
        token,
        payload
    );

    return res.data.result;
}