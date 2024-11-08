import {
    Box,
    Button,
    Flex,
    Text,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import AgentIcon from "src/Icons/AgentIcon";
import LogIn04AltIcon from "src/Icons/knowlee-agents/LogIn04AltIcon";
import { UserProcess } from "src/types/userProcess.interface.ts";
import AssistantActionsMenu from "./MyProcesses/ProcessActionsMenu";
import { useManuallyRunUserProcessMutation } from "src/api/mutations/knowleeProcessIndex";
import { format } from "date-fns";
import ProcessChatModal from "./ProcessChatModal";

interface Props {
    process: UserProcess;
    isCreator?: boolean;
}

function ProcessCard({ process, isCreator }: Props) {
    const {
        name,
        goals,
        _id,
        scheduledAt = "",
        isRecurring = false,
        interval = 0,
        threadIds = [],
    } = process;

    const textColor = useColorModeValue("neutral.90", "neutral.10");
    const borderColor = useColorModeValue("neutral.20", "neutral.05100");
    const buttonBorderColor = useColorModeValue("neutral.30", "neutral.05100");
    const pathFillColor = useColorModeValue("#0C0D0D", "#FEFEFE");

    const {
        isOpen: isOpenProcessChatModal,
        onOpen: onOpenProcessChatModal,
        onClose: onCloseProcessChatModal,
    } = useDisclosure();

    const {
        mutateAsync: manuallyRunUserProcess,
        isLoading: isLoadingManualProcessRun,
    } = useManuallyRunUserProcessMutation();

    // Utility function to truncate text
    const truncateText = (text: string, maxLength = 55) => {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    async function handleRunClick() {
        await manuallyRunUserProcess({ id: _id });
    }

    function renderActionMenu() {
        if (isCreator) {
            return <AssistantActionsMenu processId={process.id} />;
        }
    }

    function getScheduledForText() {
        if (!scheduledAt && !isRecurring) {
            return "Only Manual Run";
        }
        let text = "";
        if (scheduledAt) {
            text = text.concat(format(new Date(scheduledAt), "PPP, p"));
        }
        if (isRecurring) {
            text = text.concat(`, every ${interval} hours`);
        } else {
            text = text.concat(" once");
        }
        return text;
    }

    return (
        <>
        <Box
            display="flex"
            width={["full", "calc(50% - 8px)", "300px", "242px"]}
            padding="20px 24px"
            flexDirection="column"
            justifyContent="center"
            alignItems="flexStart"
            gap="20px"
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
        >
            <Flex alignItems="center" gap="16px" justifyContent="space-between">
                <Box
                    w="60px"
                    h="60px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="10px"
                    bg="#4386f4"
                >
                    <AgentIcon />
                </Box>
                <Button
                    display="flex"
                    padding="12px 24px"
                    justifyContent="center"
                    alignItems="center"
                    borderRadius="10px"
                    border="2px solid"
                    borderColor={buttonBorderColor}
                    color={textColor}
                    leftIcon={<LogIn04AltIcon pathFill={pathFillColor} />}
                    fontSize="16px"
                    fontWeight="500"
                    onClick={handleRunClick}
                    isLoading={isLoadingManualProcessRun}
                >
                    Run
                </Button>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
                <Box color={textColor}>
                    <Text fontWeight="500" fontSize="16px" lineHeight="24px">
                        {name}
                    </Text>
                    <Text fontWeight="500" fontSize="12px" lineHeight="24px">
                        {goals?.length > 0 ? truncateText(goals[0].goal) : 'No goals defined'}
                    </Text>
                </Box>
                {/* Show only if the user is the owner */}
                {renderActionMenu()}
            </Flex>
                <Text fontWeight="400" fontSize="12px">
                    {/* display the time and the frequency if recurring or once if not */}
                Scheduled for:{" "}
                {getScheduledForText()}
                </Text>
            <Button
                size="sm"
                onClick={onOpenProcessChatModal}
                isDisabled={!threadIds?.length}
            >
                View Runs
            </Button>
        </Box>
            <ProcessChatModal
                userProcess={process}
                isOpen={isOpenProcessChatModal}
                onClose={onCloseProcessChatModal}
            />
        </>
    );
}

export default ProcessCard;
