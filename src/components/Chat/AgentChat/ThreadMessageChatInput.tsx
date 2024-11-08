import { KeyboardEvent, useRef, useState, useEffect, useLayoutEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  Spinner
} from "@chakra-ui/react";
import { ArrowUpIcon, AttachmentIcon } from "@chakra-ui/icons";
import { Message } from "src/utils/types";
import AudioRecordingButton from "../AudioRecordingButton";
import Recording02Icon from "src/Icons/Recording02Icon";
import { useOpenAIAudioTranscriptionMutation } from "src/api/mutations/openAIMutation";
import { useUserScrapedData } from "src/api/queries";
import ChatFileUpload from "../FileUpload";
import SmallTrashIcon from "src/Icons/SmallTrashIcon";
import ChatDocumentIcon from "src/Icons/ChatDocumentIcon";
import { useUploadImageForInterpretation } from "src/api/mutations/uploadIndex";

interface Props {
  onSend: (message: Message & IChatPayload) => void;
  disabled: boolean;
  errorMessage?: string;
  startRecordingButtonId: string;
  stopRecordingButtonId: string;
  startRecording: () => void;
  stopRecording: () => void;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  speechToSpeechToggle: boolean;
  setSpeechToSpeechToggleToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IChatPayload {
  files?: FileList | null
}
const initialSelectedFiles: IChatPayload = {
  files: null,
}

function ThreadMessageChatInput({
  onSend,
  disabled,
  errorMessage,
  startRecordingButtonId,
  stopRecordingButtonId,
  startRecording,
  stopRecording,
  speechToSpeechToggle,
  setSpeechToSpeechToggleToggle,
  setIsRecording,
}: Props) {
  const toast = useToast();
  const transcriptionMutation = useOpenAIAudioTranscriptionMutation();
  const { mutateAsync: uploadImage, isLoading: isImageUploading } = useUploadImageForInterpretation();
  const borderColor = useColorModeValue("neutral.30", "neutral.80");
  const bgColor = useColorModeValue(undefined, "neutral.90");

  const [content, setContent] = useState<string>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: userDataSources } = useUserScrapedData();    
  const [selectedFiles, setSelectedFiles] = useState(initialSelectedFiles);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > 12000) {
      alert("Message limit is 12000 characters");
      return;
    }

    setContent(value);
  };

  const handleSend = () => {
    if (disabled) {
      return;
    }
    if (!content?.trim()) {
      alert("Please enter a message to start a conversation");
      return;
    }

    if (!userDataSources || !userDataSources?.entityList?.length)
            return toast({
            title: "Oops! It seems like you haven't added a knowledge source yet.",
            description: "Let's add one to get started with chatting with Knowlee!",
            status: "error",
            duration: 5000,
            isClosable: true,
    });

    const message = uploadedImage ? `![Image to be interpreted is in the parenthesis](${uploadedImage}) ${content || ""}` : content;
    onSend({ role: "user", content: message.trim() });
    setContent("");
    setUploadedImage("")
    setSelectedFiles(initialSelectedFiles)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (transcriptionMutation.data) {
      setContent((prev) => `${prev || ""} ${transcriptionMutation.data.text}`);
    }
  }, [setContent, transcriptionMutation.data]);

  const handleVoiceChatToggle = () => {
    setSpeechToSpeechToggleToggle((prev) => {
      const isSpeechToSpeechOn = !prev;
      if (isSpeechToSpeechOn) startRecording();
      else stopRecording();
      return isSpeechToSpeechOn;
    });
  };

  const removeFile = (fileToRemove: File) => {
    const { files: files } = selectedFiles as { files: FileList }
    if(!files) return;
    const fileArr = Array.from(files)
    const dataTransfer = new DataTransfer();
    fileArr.forEach(file => {
      if(file !== fileToRemove) {
        dataTransfer.items.add(file);
      }
    })

    setSelectedFiles((_) => ({... _, files: dataTransfer.files }))
    setUploadedImage("")
  };

  const handleFileChange = async (files: FileList) => {
    setSelectedFiles((_) => ({... _, files: files }));

    const formData = new FormData();
    
    if(files && files.length > 0) {
        if (files && files.length) {
            // Add loop for support multiple files
            formData.append("files", files[0]);
        }
    }

    const url = await uploadImage(formData)
    if(!url) return console.error("Couldn't upload image");
    setUploadedImage(url)
  }

  useLayoutEffect(() => {
    if (textareaRef.current && textareaRef.current.scrollHeight) {
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <>
      {/* <Flex justifyContent="flex-end" alignItems="center" mb="1" mr="2">
        <Switch
          id="toggle-button"
          isChecked={speechToSpeechToggle}
          onChange={handleVoiceChatToggle}
          colorScheme="blue"
          size="sm"
          mr="1"
        />
      </Flex> */}
       {(selectedFiles.files && !!(selectedFiles?.files as { length: number})?.length) ? (
       Array.from(selectedFiles?.files)?.map((file) => (
        <Flex
          w="100%"
          p="16px"
          borderBottom="2px solid"
          borderColor="neutral.30"
          alignItems="center"
        >
          {isImageUploading ? <Spinner /> : <ChatDocumentIcon />}
          <Text ml="16px" fontSize="16px" fontWeight="500" lineHeight="24px">
            {file.name}
          </Text>
          <Button
            w="32px"
            h="32px"
            p="8px"
            boxSize="border-box"
            bg="none"
            _hover={{ bg: "none", color: "delete.100" }}
            display="flex"
            alignItems="center"
            color="delete.50"
            onClick={() => removeFile(file)}
          >
            <SmallTrashIcon />
          </Button>
        </Flex>
       ))
      ): null}
      <Box
        backgroundColor={bgColor}
        border={"2px"}
        borderColor={borderColor}
        borderRadius={"12px"}
      >
        <Flex
          w="100%"
          flexDirection="row"
          alignItems="center"
          p="4px"
          height={"auto"}
          minH="50px"
          overflowY="auto"
          borderTop="1px solid"
          borderTopColor={"transparent"}
          position="relative"
        >
           <ChatFileUpload 
            accept="image/*"
            isDisabled={disabled || isImageUploading} 
            inputRef={inputRef} 
            onChange={handleFileChange}>
            <Button p={2} mx="1" size="sm">
              <AttachmentIcon />
            </Button>
          </ChatFileUpload>
          <Textarea
            autoFocus={true}
            ref={textareaRef}
            py={0}
            border="none"
            outline="none"
            width={{
              base: "calc(100% - 80px)",
              lg: "calc(100% - 115px)",
              sm: "calc(100% - 45px)",
            }}
            resize="none"
            placeholder="Message Knowlee..."
            focusBorderColor="transparent"
            h="100%"
            maxH="200px"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              // Reset and set height
              target.style.height = "100%";
              target.style.height = `${target.scrollHeight}px`;
            }}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <Flex
            flexDirection={["column", "column", "row"]}
            alignItems="center"
            justifyContent="center"
            mx={{ base: "1", lg: "1", sm: "1" }}
            mb={{ base: "1", lg: "1", sm: "2" }}
            alignSelf={"end"}
            gap={1}
          >
            <Flex justifyContent="flex-end" alignItems="center" m="1" cursor={disabled ? "not-allowed": "pointer"}>
              {/* <Switch
                id="toggle-button"
                isChecked={speechToSpeechToggle}
                onChange={handleVoiceChatToggle}
                colorScheme="blue"
                size="sm"
                mr="1"
              /> */}
              {speechToSpeechToggle ? (
                <Recording02Icon
                  id="toggle-button"
                  onClick={handleVoiceChatToggle}
                  pathStroke="#0E64F1"
                  style={{ pointerEvents: disabled ? "none": "auto" }}
                />
              ) : (
                <Recording02Icon
                  id="toggle-button"
                  onClick={handleVoiceChatToggle}
                  pathStroke="#6C7275"
                  style={{ pointerEvents: disabled ? "none": "auto" }}
                />
              )}
            </Flex>
            <AudioRecordingButton
              startRecordingButtonId={startRecordingButtonId}
              stopRecordingButtonId={stopRecordingButtonId}
              setIsRecording={setIsRecording}
              transcriptionMutation={transcriptionMutation}
              isDisabled={disabled}
            />
            <Button
              bg={"#4386F4"}
              _hover={{ bg: "#1166f1" }}
              color={"white"}
              size="sm"
              borderRadius={"8px"}
              p={1}
              onClick={handleSend}
              isDisabled={disabled}
              position="sticky"
            >
              <ArrowUpIcon fontSize={"md"} boxSize={"6"} />
            </Button>
          </Flex>
        </Flex>
      </Box>
      {errorMessage && (
        <Box>
          <Text color={"red.500"}>{errorMessage}</Text>
        </Box>
      )}
    </>
  );
}

export default ThreadMessageChatInput;
