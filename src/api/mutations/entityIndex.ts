import { useAuth0 } from "@auth0/auth0-react";
import { useMutation } from "@tanstack/react-query";
import { getToken } from "../queries";
import { handleGoogleDriveTextRequest } from "../requests/entityIndex";
import { useToast } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { ServerResponse } from "../requests/client";

export const useHandleGoogleDriveTextMutation = () => {
  const toast = useToast();
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();

  return useMutation(
    async (data: unknown) => {
      const token = await getToken(
        getAccessTokenSilently,
        getAccessTokenWithPopup
      );
      if (!token) throw new Error("Failed to get token");
      return handleGoogleDriveTextRequest(token, data);
    },
    {
      onSuccess: () => {
        toast({
          title: "Source added successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (error: AxiosError<ServerResponse<unknown>>) => {
        const errorMessage = error?.response?.data?.message;
        if (errorMessage && typeof errorMessage === "string") {
          toast({
            title: "An error occurred.",
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      },
    }
  );
};
