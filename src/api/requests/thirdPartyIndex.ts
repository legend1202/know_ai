import { ThirdPartyConfig } from "src/types/thirdParty.interface";
import { ServerResponse, apiRequest } from "./client";

export type exportUrlPayload = {
    docId: string, 
    docType: string
}

export async function getThirdPartyConfigRequest(token: string) {
    const res = await apiRequest<ServerResponse<ThirdPartyConfig>>(
        "GET",
        "third-party/config",
        token
    );
    return res.data.result;
}

export async function googleLoginRequest(token: string) {
    const res = await apiRequest<ServerResponse<{ authURL: string }>>(
        "POST",
        `third-party/google/auth/login`,
        token
    );
    return res.data.result;
}

export async function googleExportUrlContentRequest(token: string, payload: exportUrlPayload) {
    const res = await apiRequest<ServerResponse<{text: string}>>(
        "POST",
        `third-party/google/generate-export-url-content`,
        token,
        payload
    );
    return res.data.result;
}
