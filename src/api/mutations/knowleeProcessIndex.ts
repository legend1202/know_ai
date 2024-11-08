import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../queries";
import {
    createKnowleeProcessRequest,
    deleteUserProcessRequest,
    updateUserProcessRequest,
    UpdateKnowleeProcessPayload,
    manuallyRunUserProcessRequest,
    CreateKnowleeProcessPayload,
} from "../requests/knowleeProcessIndex";
import { AxiosError } from "axios";
import { ServerResponse } from "../requests/client";
import { useToast } from "@chakra-ui/react";

export const useCreateKnowleeProcessMutation = () => {
    const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
    const toast = useToast();

    return useMutation(
        async (payload?: CreateKnowleeProcessPayload) => {
            const token = await getToken(
                getAccessTokenSilently,
                getAccessTokenWithPopup
            );
            if (!token) throw new Error("Failed to get token");
            return createKnowleeProcessRequest(token, payload);
        },
        {
            onSuccess: () => {
                toast({
                    title: "Process Created",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            },
            onError: (error: AxiosError<ServerResponse<unknown>>) => {
                if (error.response) {
                    const { message } = error.response.data;
                    if (message && typeof message === 'string') {
                        toast({
                            title: "An error occurred.",
                            description: message,
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                }
            },
        }
    );
};

export const useUpdateKnowleeProcessMutation = () => {
    const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation(
        async (payload: UpdateKnowleeProcessPayload) => {
            const token = await getToken(
                getAccessTokenSilently,
                getAccessTokenWithPopup
            );
            if (!token) throw new Error("Failed to get token");
            return updateUserProcessRequest(token, payload);
        },
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(["knowlee-process", "user-processes"]);
                queryClient.invalidateQueries(["knowlee-process", "user-process", data?.id]);
                toast({
                    title: "Process Updated",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            },
            onError: (error: AxiosError<ServerResponse<unknown>>) => {
                if (error.response) {
                    const { message } = error.response.data;
                    toast({
                        title: "An error occurred.",
                        description: message,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            },
        }
    );
};

export const useDeleteUserProcessMutation = () => {
    const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
    const toast = useToast();
    const queryClient = useQueryClient();

    return useMutation(
        async (processId: string) => {
            const token = await getToken(
                getAccessTokenSilently,
                getAccessTokenWithPopup
            );
            if (!token) throw new Error("Failed to get token");
            return deleteUserProcessRequest(token, processId);
        },
        {
            onSuccess: async () => {
                await queryClient.invalidateQueries(["knowlee-process", "user-processes"]);
                toast({
                    title: "Process Deleted",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            },
            onError: (error: AxiosError<ServerResponse<unknown>>) => {
                if (error.response) {
                    const { message } = error.response.data;
                    toast({
                        title: "An error occurred.",
                        description: message,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            },
        }
    );
};

export const useManuallyRunUserProcessMutation = () => {
    const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
    const toast = useToast();

    return useMutation(
        async (payload: { id: string }) => {
            const token = await getToken(
                getAccessTokenSilently,
                getAccessTokenWithPopup
            );
            if (!token) throw new Error("Failed to get token");
            return manuallyRunUserProcessRequest(token, payload);
        },
        {
            onSuccess: () => {
                toast({
                    title: "Manual process run successful",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            },
            onError: (error: AxiosError<ServerResponse<unknown>>) => {
                if (error.response) {
                    const { message } = error.response.data;
                    toast({
                        title: "An error occurred.",
                        description: message,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            },
        }
    );
};
