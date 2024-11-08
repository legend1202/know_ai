import {
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useColorModeValue,
    useDisclosure,
    Badge
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import PencilIcon from "src/Icons/PencilIcon";
import SettingsIcon from "src/Icons/SettingsIcon";
import TrashIcon from "src/Icons/TrashIcon";
import { useDeleteAssistantMutation } from "src/api/mutations/knowleeAgentIndex";
import ConfirmModal from "src/components/common/ConfirmModal";

interface Props {
    assistantId: string;
    isDefaultAgentAdded: boolean;
}

function AssistantActionsMenu({ assistantId, isDefaultAgentAdded }: Props) {
    const navigate = useNavigate();
    const {
        isOpen: isOpenConfirmModal,
        onClose: onCloseConfirmModal,
        onOpen: onOpenConfirmModal,
    } = useDisclosure();

    const pathFillColor = useColorModeValue("#0C0D0D", "#FEFEFE");


    const { mutateAsync: deleteAssistant, isLoading } = useDeleteAssistantMutation();

    function handleEditClick() {
        navigate(`/knowlee-assistants/assistants/${assistantId}`);
    }

    async function handleDeleteAgent() {
        await deleteAssistant(assistantId);
        onCloseConfirmModal();
    }

    return (
        <>
            <Menu>
                <MenuButton
                    as={IconButton}
                    aria-label="Actions"
                    variant="unstyled"
                    minWidth="20px"
                >
                    <SettingsIcon pathFill={pathFillColor} />
                </MenuButton>
                <MenuList>
                    <MenuItem icon={<PencilIcon />} onClick={handleEditClick}>
                        Edit
                        {isDefaultAgentAdded && (
                            <Badge
                                ml="2"
                                colorScheme="yellow"
                            >
                                Knowlee Assistant
                            </Badge>
                        )}
                    </MenuItem>
                    <MenuItem
                        icon={<TrashIcon />}
                        _hover={{ color: "delete.100" }}
                        color="delete.50"
                        onClick={onOpenConfirmModal}
                    >
                        Delete
                    </MenuItem>
                </MenuList>
            </Menu >
            <ConfirmModal
                isOpen={isOpenConfirmModal}
                onClose={onCloseConfirmModal}
                onConfirm={handleDeleteAgent}
                title="Are you sure you want to delete this Assistant?"
                description="Assistant will be permanently deleted."
                confirmButtonProps={{ colorScheme: "red", isDisabled: isLoading, isLoading: isLoading }}
            />
        </>
    );
}

export default AssistantActionsMenu;