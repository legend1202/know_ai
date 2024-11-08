import { StripeSubscription } from "src/types/subscription.interface";
import { ServerResponse, apiRequest } from "./client";

export type PlanDuration = "monthly" | "yearly";
export type PlanType = "start" | "pro" | "FREE";

export type StripePaymentPayload = {
    planDuration?: PlanDuration,
    planType?: PlanType,
    priceId: string,
    tolt_referral?: string,
}

export type StripePaymentResponse = { url: string } | StripeSubscription;

export const stripeGetRequest = async (token: string) => {
    const res = await apiRequest<ServerResponse<{ url: string }>>(
        "GET",
        "/stripe",
        token
    );
    return res.data.result;
};


export const stripePaymentRequest = async (token: string, data: StripePaymentPayload) => {
    const res = await apiRequest<ServerResponse<StripePaymentResponse>>(
        "POST",
        "/stripe/payment",
        token,
        data,
    );
    return res.data.result;
};

export type IStripeBuyCreditsPayload = {
    tolt_referral?: string,
    quantity?: number,
}

export const buyCreditsRequest = async (token: string, data: IStripeBuyCreditsPayload) => {
    const res = await apiRequest<ServerResponse<StripePaymentResponse>>(
        "POST",
        "/stripe/credit-payment",
        token,
        data,
    );
    return res.data.result;
};
