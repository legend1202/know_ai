import { MetaDataWithType, PanelOptionType } from "src/types/panel";


export enum SOURCE_TYPES {
  TWITTER = "twitter",
  YOUTUBE = "youtube",
  MEDIUM = "medium",
  PDF = "pdf",
  CSV = "csv",
  NEWSAPI = "news",
  ARTEMIS = "artemis",
  BUBBLEMAPS = "bubblemaps",
  URL = "url",
  CODA = "coda",
  REDDIT = "reddit",
  GITBOOK = "gitbook",
  OPENAI = "openai",
  GITHUB = "github",
}

export interface IUserVector {
  userId: string;
  entityId: string;
  vectorsId: {
    id: string;
  }[];
}

export type Entity = {
  id: string;
  value: string;
  fileName: string;
  sourceType: SOURCE_TYPES;
  subSetType?: string;
  isScraped: boolean;
  isNoData:boolean;
  createdAt: number | string;
  userVectors: IUserVector[]
  tokens?: number;
};

export type EntityWithoutUserVectors = Omit<Entity, "userVectors">;

export type FilterEntityQuery = {
  sourceType?: string;
  subSetType?: string;
  isScraped?: boolean;
}

export type EntityPayload = {
  value: string;
  sourceType: SOURCE_TYPES;
  isScraped: boolean;
};

export interface UserKnowledge {
  userId: string;
  entities: Entity[];
}

export interface Message {
  role: Role;
  content: string;
  _id?: string;
  metaData?: MetaDataWithType<PanelOptionType>;
  isLoading?: boolean;
}

export type Role = "assistant" | "user";


export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  url: string
  isViewed: boolean
  createdAt: string
}

export interface ThreadRun {
  id: string;
  object: "thread.run";
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: "queued" | "in_progress" | "requires_action" | "cancelling" | "cancelled" | "failed" | "completed" | "expired";
  // required_action: unknown | RequiredAction | null;
  required_action: unknown | null;
  // last_error: LastError | null;
  last_error: unknown | null;
  expires_at: number | null;
  started_at: number | null;
  cancelled_at: number | null;
  failed_at: number | null;
  completed_at: number | null;
  model: string;
  instructions: string | null;
  tools: Tool[];
  file_ids: string[];
  metadata: Record<string, string>;
}

// interface RequiredAction {
//   // Define properties for the details on the action required to continue the run
// }

// interface LastError {
//   // Define properties for the last error associated with this run
// }

interface Tool {
  type: "retrieval" | "code_interpreter";
}

export interface FileCitation {
  end_index: number;
  file_citation: {
    file_id: string;
    quote: string;
  };
  start_index: number;
  text: string;
  type: "file_citation";
}

export interface FilePath {
  end_index: number;
  file_path: {
    file_id: string;
  };
  start_index: number;
  text: string;
  type: "file_path";
}

// THREAD MESSAGES
interface TextContent {
  type: string;
  text: {
    value: string;
    annotations: Array<FileCitation | FilePath>;
  };
}

export interface IThreadMessage {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: Role;
  content: TextContent[];
  file_ids: string[];
  assistant_id: string | null;
  run_id: string | null;
  metadata: unknown;
}

export interface IMessageList {
  object: string;
  data: IThreadMessage[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}