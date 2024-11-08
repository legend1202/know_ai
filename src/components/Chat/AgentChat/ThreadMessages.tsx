import { Box, Button, Flex, Grid, GridItem, Spinner, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import React, { useEffect, useId, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NewQueryMutationType } from "src/types/panel";
import styled from "styled-components";
import { useNewQueryMutation } from "../../../api/mutations/conversationIndex";
import { IThreadMessage, Message, Role } from "../../../utils/types";
import { AxiosError } from "axios";
import AIPendingBubble from "../AIPendingBubble";
import { getToken } from "src/api/queries";
import { useAuth0 } from "@auth0/auth0-react";
import MessageBox from "./MessageBox";
import {
  useGetAgentThread,
  useGetRunStatus,
  useUserAgents,
} from "src/api/queries/knowleeAgentQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useNewUserAgentThreadMutation, useSendMessageInAgentThreadMutation } from "src/api/mutations/agentThreads";
import ThreadMessageChatInput, { IChatPayload } from "./ThreadMessageChatInput";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { useUserUsageStats } from "src/api/queries/userUsageQuery";
import { createAudio, getAudio } from "src/utils/audio";
import { useGetUserSubscription } from "src/api/queries/subscriptionQuery";
import { useUserScrapedData } from "src/api/queries";
import GoogleAuthButton from "src/components/ThirdPartyConnectors/GoogleAuthButton";
import { useThirdPartyConfig } from "src/api/queries/thirdPartyQuery";
import { useOpenAITextToSpeechMutation } from "src/api/mutations/openAIMutation";
import AuthorizeOptions from "./AuthorizeOptions";

const serverURL = import.meta.env.VITE_APP_SERVER_URL as string;

interface Props {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showSidebar: boolean;
  agentId?: string;
  agentName: string;
  initialPrompts: string[];
  setAgentId: React.Dispatch<React.SetStateAction<string>>;
}
interface Patterns {
  [key: string]: RegExp; // This allows any string to index a RegExp type
}
interface ThirdPartyConfig {
  [key: string]: {
    token?: {
      access_token?: string;
    }
  };
}

export const Header = styled.div`
  text-align: center;
  font-size: 64px;
  font-family: editor;
  @media (max-width: 480px) {
    font-size: 40px;
  }
`;

function ThreadMessages({ agentId, agentName, initialPrompts = [], setAgentId }: Props) {
  const navigate = useNavigate()
  const toast = useToast();
  const borderColor = useColorModeValue("neutral.30", "neutral.80");
  const queryClient = useQueryClient();
  const assistantName = agentName || 'Knowlee';
  const { threadId } = useParams();
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
  const { data: userUsageStat } = useUserUsageStats();
  const newQueryMutation: NewQueryMutationType = useNewQueryMutation(threadId!);
  const bgColor = useColorModeValue('white', 'neutral.90');
  const color = useColorModeValue('blackAlpha.800', 'whiteAlpha.900');
  const hoverBorderColor = useColorModeValue('gray.400', 'gray.500');
  const hoverTextColor = useColorModeValue('blackAlpha.900', 'whiteAlpha.900'); // Adjusted for hover text color
  const textColor = useColorModeValue('blackAlpha.800', 'whiteAlpha.900');
  // generalise hardcoded message for all google related functionalities
  // const googleRequireMessage = 'Knowlee needs access to your Google account in order to use its features. To allow access, kindly click the "Authorize" button below. If you would prefer not to use this functionality, you can also skip this step.'
  const googleRequireMessage = "Connect your account so Knowlee can help you manage your tasks and handle your requests on its own. This connection enhances Knowlee's ability to provide tailored assistance and proactive support directly aligned with your needs. Ready to get started? Just click the 'Connect' button below."

  const {
    data: threadResponse,
    isLoading: isLoadingThreadMessages,
    refetch: refetchThreadMessages,
  } = useGetAgentThread(threadId || "");
   
  const { mutateAsync: sendMessageToThread, data: sendMessageData, isLoading } = useSendMessageInAgentThreadMutation(threadId || "");
  const { data: runningThreadData, isLoading: isLoadingGetRunStatus } = useGetRunStatus(
    sendMessageData?.createdRun.thread_id || "",
    sendMessageData?.createdRun?.id || "",
    threadId,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [streamIsLoading, setStreamIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechToSpeechAudioElementRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speechToSpeechToggle, setSpeechToSpeechToggleToggle] = useState<boolean>(false); // State for toggle button
  const startRecordingButtonId = useId()
  const stopRecordingButtonId = useId()
  const { data: userDataSources } = useUserScrapedData();
  const { data: thirdPartyConfig } = useThirdPartyConfig();
  const createNewUserAgentThreadMutation = useNewUserAgentThreadMutation();
  const { data: userAgents } = useUserAgents();

  const { mutateAsync: audioBuffer } = useOpenAITextToSpeechMutation();
  const [previousMessage, setPreviousMessage] = useState<IThreadMessage>();

  const { data: userSubsriptionRes } = useGetUserSubscription();

  const handleSend = async (message: Message) => {
    try {
      // append user entered message
      queryClient.setQueryData(
        ["knowlee-agent", "user-threads-message", threadId],
        (prev?: IThreadMessage[]) => {
          return [
            ...(prev || []),
            {
              id: Date.now().toString(),
              object: "thread.message",
              created_at: Date.now(),
              assistant_id: agentId!,
              thread_id: threadId!,
              run_id: Date.now().toString(),
              role: "user" as Role,
              content: [
                {
                  type: "text",
                  text: {
                    value: message.content ?? "",
                    annotations: [],
                  },
                },
              ],
              file_ids: [],
              metadata: {},
            },
          ];
        }
      );
      setStreamIsLoading(true);

      if (!userDataSources || !userDataSources?.entityList?.length)
        return toast({
          title: "Oops! It seems like you haven't added a knowledge source yet.",
          description: "Let's add one to chat with Knowlee!",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

      const token = await getToken(
        getAccessTokenSilently,
        getAccessTokenWithPopup
      );
      if (!token) throw new Error("Failed to get token");

      //   const res = await axios.post(
      //     `knowlee-agent/threads/${threadId!}/runs/stream`,
      //     {
      //       textMessage: message.content,
      //       assistantId: agentId,
      //       title: `Chatting with ${assistantName}`
      //     },
      //     {
      //         responseType: "stream",
      //         headers: { Authorization: `Bearer ${token}` },
      //         // onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
      //         //   console.log(progressEvent);
      //         //     console.log(
      //         //         "progressEvent----->",
      //         //         (progressEvent.event as { currentTarget: { response: string } })
      //         //             ?.currentTarget?.response
      //         //     );
      //         // },
      //     }
      // );
      // console.log("res.data----->", res.data);

      let userThreadId = threadId;
      if (!threadId) {
        const createdThread =
          await createNewUserAgentThreadMutation.mutateAsync({
            title: `Chatting with ${assistantName}`,
            assistantId: agentId!,
          });
        userThreadId = createdThread?._id;
        if (createdThread) {
          navigate(`/knowleechats/${createdThread._id}`);
        }
      }

      const response = await fetch(
        `${serverURL}api/knowlee-agent/threads/${userThreadId!}/runs/stream`,
        {
          method: "POST",
          body: JSON.stringify({
            textMessage: message.content,
            assistantId: agentId,
            title: `Chatting with ${assistantName}`,
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setStreamIsLoading(false);
      if (!response.ok || !response.body) {
        throw response.statusText;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const loopRunner = true;
      let responseTextMessage = "";
      const newMessageDummyId = Date.now().toString();

      while (loopRunner) {
        const { value, done } = await reader.read();
        if (done) {
          // refetch all thread messages
          refetchThreadMessages();
          // to update chat tokens count
          queryClient.invalidateQueries([
            "knowlee-agent",
            "user-threads",
            threadId,
            "runs",
          ]);
          break;
        }

        const decodedChunk = decoder.decode(value, { stream: true });
        responseTextMessage = responseTextMessage.concat(decodedChunk);
        // console.log("decodedChunk------>", decodedChunk);
        // append assistant message to react query store
        queryClient.setQueryData(
          ["knowlee-agent", "user-threads-message", threadId],
          (prev?: IThreadMessage[]) => {
            if (!prev || !prev.length) {
              return [];
            }
            let isMessageUpdated = false;
            const updatedMessages = prev?.map((message) => {
              if (message?.id === newMessageDummyId) {
                isMessageUpdated = true;
                return ({
                  ...message,
                  content: [
                    {
                      type: "text",
                      text: {
                        value: responseTextMessage,
                        annotations: [],
                      },
                    },
                  ],
                });
              }
              return message;
            });
            if (isMessageUpdated) {
              return updatedMessages;
            }
            return [
              ...(prev || []),
              {
                id: newMessageDummyId,
                object: "thread.message",
                created_at: Date.now(),
                run_id: newMessageDummyId,
                assistant_id: agentId!,
                thread_id: threadId!,
                role: "assistant" as Role,
                content: [
                  {
                    type: "text",
                    text: {
                      value: responseTextMessage,
                      annotations: [],
                    },
                  },
                ],
                file_ids: [],
                metadata: {},
              },
            ];
          }
        );
        // scrollToBottom();
      }
    } catch (error) {
      setStreamIsLoading(false);
      console.log("error----->", error);
    }
  };

  const handleInitialPromptPass = (prompt: string) => {
    const message: Message = {
      content: prompt,
      role: "user",
    }
    handleSend(message)
  }


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [threadId, threadResponse]);

  useEffect(() => {
    if (userUsageStat && userSubsriptionRes) {
      const { tokenUsed = 0, totalRunTokenUsed = 0 } = userUsageStat;
      const { plan } = userSubsriptionRes.userSubscription;
      if (typeof plan === "string") return;
      if ((tokenUsed + totalRunTokenUsed) >= plan.features.maxTokens) {
        setErrorMessage(
          "You have exhausted your credits. Please contact info@knowlee.ai to request a reset."
        );
        return;
      }
    }
    if (newQueryMutation.isError) {
      const err =
        (newQueryMutation.error as AxiosError<{ message: string }>)?.response
          ?.data?.message || "something went wrong";
      setErrorMessage(err);
    }
    return () => {
      setErrorMessage("");
    };
  }, [newQueryMutation.error, newQueryMutation.isError, userSubsriptionRes, userUsageStat]);

  useEffect(() => {
    const finishedStatuses = ["cancelled", "failed", "completed", "expired"];
    if (finishedStatuses.includes(runningThreadData?.status || "")) {
      refetchThreadMessages();
    }
  }, [refetchThreadMessages, runningThreadData?.status]);

  ////console.log("newQueryMutation=====>", newQueryMutation.isLoading);

  const pauseAudio = () => {
    if (speechToSpeechAudioElementRef.current && isPlaying) {
      speechToSpeechAudioElementRef.current.pause();
      setIsPlaying(false);
    }
  };


  const startRecording = () => document.getElementById(startRecordingButtonId)?.click();
  const stopRecording = () => document.getElementById(stopRecordingButtonId)?.click();

  const generateVoice = async (text: string) => {
    if (isPlaying) return;
    if (!text) return;

    // create audio logic
    const resAudioBuffer = await audioBuffer({ text });

    // Check if audio data is valid
    if (!resAudioBuffer || !resAudioBuffer.data) {
      console.error("Invalid audio data received");
      return;
    }

    // Convert array buffer to Uint8Array
    const uint8Array = new Uint8Array(resAudioBuffer?.data);

    // Create Blob from Uint8Array
    const blob = new Blob([uint8Array], { type: 'audio/mpeg' });

    // Create URL from Blob
    const audioUrl = URL.createObjectURL(blob);

    speechToSpeechAudioElementRef.current = new Audio(audioUrl);
    speechToSpeechAudioElementRef.current.addEventListener("ended", handleAudioEnd);

    playAudio();
  };

  const playAudio = () => {
    if (speechToSpeechAudioElementRef.current) {
      speechToSpeechAudioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    startRecording()
  };

  useEffect(() => {
    // audio is playing and voice chat toggle is turned off
    // we pause the currently playing audio
    if (!speechToSpeechToggle && isPlaying) {
      return pauseAudio()
    }
    if (!threadResponse || !speechToSpeechToggle || isRecording) return;
    const lastMessage = threadResponse[threadResponse?.length - 1];
    if (lastMessage?.role === "user") return;

    const contentToBeSpoken = lastMessage?.content;
    const message = contentToBeSpoken
      ?.map((message) => message.text.value)
      .join(" ");

    const loadingStatuses = ["queued", "in_progress", "requires_action"];
    if (
      runningThreadData &&
      !loadingStatuses.includes(runningThreadData?.status) &&
      lastMessage !== previousMessage
    ) {
      generateVoice(message);
      setPreviousMessage(lastMessage);
    }
  }, [threadResponse, speechToSpeechToggle]);


  if (threadId && isLoadingThreadMessages) {
    return (
      <Box position={"absolute"} // Use absolute positioning
        top={0}
        left={0}
        width={"100%"} // Cover the full width
        height={"100%"} // Cover the full height
        display={"flex"} // Add flex display
        justifyContent={"center"} // Center content horizontally
        alignItems={"center"} // Center content vertically
        color="primary.40"
      >
        <Spinner />
      </Box>
    );
  }

  const isRequestInProgress = ["queued", "in_progress"].includes(runningThreadData?.status || "")

  function matchOpenAiFunctionCall() {
    const userAgent = userAgents?.find(agent => agent.assistant.id === agentId);
    const functionNames = userAgent?.functionDefinitions?.map(obj => obj.functionDefinition?.name);

    const googlePattern = /^(gmail_users_|google_calendar_)/;

    const patterns: Patterns = {
      google: googlePattern,
      // Add more patterns as needed
    };

    for (const provider in patterns) {
      console.log("provider === >>>> ", provider);
      const pattern = patterns[provider];
      const matchedFunctions =
        functionNames?.filter((name) => pattern.test(name)) || [];

      const token = thirdPartyConfig?.[provider]?.token?.access_token;

      if (matchedFunctions.length > 0 && !token) {
        switch (provider) {
          case "google":
            return <AuthorizeOptions provider="Google" setAgentId={setAgentId} createNewUserAgentThreadMutation={createNewUserAgentThreadMutation} text={googleRequireMessage} />;
          // Add cases for other providers
          default:
            break;
        }
        break;
      }
    }
    return null;
  }


  return (
    <Box
      className="scroll-hover"
      width={"100%"}
      h={"100%"}
      display={"flex"}
      flexDirection={"column"}
      overflow={"auto"}

    >
      <Box
        className="scroll-hover"
        overflow={"auto"}
        flexGrow={1}
        mb={(isRequestInProgress || streamIsLoading) ? "10px" : ""}
      >
        {!threadResponse || !threadResponse?.length ? (
          <Flex height="98%" alignItems="end">
            <Grid
              templateColumns='repeat(2, 1fr)' w="100%" gap={2}>
              {initialPrompts.map((prompt) => (
                prompt ?
                  <GridItem w='100%'>
                    <Flex
                      onClick={() => handleInitialPromptPass(prompt)}
                      w="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      role="button"
                      border="1px solid"
                      borderColor={borderColor} // Use color mode value
                      borderRadius="lg"
                      p={2}
                      m={0}
                      transition="all 350ms"
                      color={color} // Use color mode value
                      _hover={{
                        color: hoverTextColor, // You might want to change this for dark mode as well
                        boxShadow: "md",
                        borderColor: hoverBorderColor // Use color mode value
                      }}
                      bg={bgColor} // Use color mode value

                    >
                      <Text fontSize="15px" color={textColor} noOfLines={1}>{prompt}</Text>
                      <ArrowForwardIcon boxSize={6} /> {/* Adjust icon size if needed */}
                    </Flex>
                  </GridItem> : null
              ))}
            </Grid>
          </Flex>
        ) : null}

        {threadResponse?.map((message, index) => {
          return <MessageBox key={index} message={message} />;
        })}

        {(isRequestInProgress || streamIsLoading) && <AIPendingBubble />}

        <div ref={messagesEndRef}></div>
      </Box>
      <Box mb={2}>{
        // threadResponse?.length > 0 && matchOpenAiFunctionCall()
        matchOpenAiFunctionCall()
      }</Box>
      <Box mt={0}>
        <ThreadMessageChatInput
          onSend={handleSend}
          startRecordingButtonId={startRecordingButtonId}
          stopRecordingButtonId={stopRecordingButtonId}
          startRecording={startRecording}
          stopRecording={stopRecording}
          setIsRecording={setIsRecording}
          setSpeechToSpeechToggleToggle={setSpeechToSpeechToggleToggle}
          speechToSpeechToggle={speechToSpeechToggle}
          disabled={
            newQueryMutation.isError ||
            Boolean(errorMessage) ||
            isRequestInProgress ||
            streamIsLoading
          }
          errorMessage={errorMessage}
          key={threadId}
        />
        <Text fontSize="xs" color="gray.600" textAlign="center" mt={2}>
          Knowlee can make mistakes. Consider checking important information.
        </Text>
      </Box>
    </Box>
  );
}

export default ThreadMessages;
