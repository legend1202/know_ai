import { useAuth0 } from "@auth0/auth0-react";
import { useMutation } from "@tanstack/react-query";
import { getToken } from "../queries";
import { IStripeBuyCreditsPayload, StripePaymentPayload, buyCreditsRequest, stripePaymentRequest } from "../requests/stripeIndex";
import { AxiosError } from "axios";
import { ServerResponse } from "../requests/client";
import { useToast } from "@chakra-ui/react";

export const useStipePaymentMutation = () => {
    const toast = useToast();
    const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
    // const queryClient = useQueryClient();

    return useMutation(
        async (payload: StripePaymentPayload) => {
            const token = await getToken(
                getAccessTokenSilently,
                getAccessTokenWithPopup
            );
            if (!token) throw new Error("Failed to get token");
            return stripePaymentRequest(token, payload);
        },
        {
            onSuccess: () => {
                // queryClient.invalidateQueries(["subscriptions", "user-subscription"]);
            },
            onError: (error) => {
                const responseErrorMessage = (
                    error as AxiosError<ServerResponse<unknown>>
                )?.response?.data?.message;
                if (responseErrorMessage) {
                    toast({
                        title: "Subscription error",
                        description: responseErrorMessage,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            },
        }
    );
};

export const useStripeBuyCreditsMutation = () => {
    const toast = useToast();
    const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
    // const queryClient = useQueryClient();

    return useMutation(
        async (payload: IStripeBuyCreditsPayload) => {
            const token = await getToken(
                getAccessTokenSilently,
                getAccessTokenWithPopup
            );
            if (!token) throw new Error("Failed to get token");
            return buyCreditsRequest(token, payload);
        },
        {
            onSuccess: () => {
                // queryClient.invalidateQueries(["subscriptions", "user-subscription"]);
            },
            onError: (error) => {
                const responseErrorMessage = (
                    error as AxiosError<ServerResponse<unknown>>
                )?.response?.data?.message;
                if (responseErrorMessage) {
                    toast({
                        title: "Subscription error",
                        description: responseErrorMessage,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            },
        }
    );
};