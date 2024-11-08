

import { MediumConfig } from "src/types/medium.interface";
import { ServerResponse, apiRequest } from "./client";

export async function getMediumConfigRequest(token: string) {
    const res = await apiRequest<ServerResponse<MediumConfig>>(
        "GET",
        "medium/config",
        token
    );
    return res.data.result;
}

export async function mediumLoginRequest(
    token: string,
) {
    const res = await apiRequest<ServerResponse<{ authURL: string }>>(
        "POST",
        `medium/login`,
        token,
    );
    return res.data.result;
}
