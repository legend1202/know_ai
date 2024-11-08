import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    useColorModeValue,
    useToast,
    Tooltip,
    Textarea,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Switch,
    Text,
    Select,
    IconButton,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { DeleteIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useCreateKnowleeProcessMutation } from "src/api/mutations/knowleeProcessIndex";
import { CreateKnowleeProcessPayload } from "src/api/requests/knowleeProcessIndex";
import { useUserAgents } from "src/api/queries/knowleeAgentQuery";
import { format } from "date-fns";
import { DATETIME_LOCAL_FORMAT } from "src/utils/time";

function CreateProcess() {
    const navigate = useNavigate();
    const toast = useToast();

    const labelTextColor = useColorModeValue("neutral.60", "neutral.40");
    const borderColor = useColorModeValue("neutral.30", "neutral.80");
    const headingTextColor = useColorModeValue("neutral.100", "neutral.10");

    const { data: userAssistantList } = useUserAgents();
    const {
        mutateAsync: createKnowleeProcess,
        isLoading: isLoadingCreateKnowleeProcess,
    } = useCreateKnowleeProcessMutation();

    const formik = useFormik<CreateKnowleeProcessPayload>({
        initialValues: {
            goals: [
                {
                    goal: "",
                    assistantId: "",
                },
            ],
            isRecurring: false,
            name: "",
        },
        onSubmit: async (values, { resetForm }) => {
            const {
                goals = [],
                interval,
                isRecurring,
                name,
                scheduledAt,
            } = values;

            if (!name) {
                toast({
                    title: "Validation Error",
                    description: "Name is required",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            if (!goals?.length || goals.length < 2) {
                toast({
                    title: "Validation Error",
                    description: "At least 2 goals are required",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            const isGoalsValid = goals.every(
                ({ goal, assistantId }) => goal && assistantId
            );

            if (!isGoalsValid) {
                toast({
                    title: "Validation Error",
                    description: "Please enter goal and select assistant",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return true;
            }

            if (isRecurring && (!interval || Number(interval) <= 0)) {
                toast({
                    title: "Validation Error",
                    description:
                        "Please enter a valid interval in hours for the recurring process.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return; // Stop the submission if the interval is invalid
            }

            await createKnowleeProcess({
                ...values,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            });
            resetForm();
            navigate("/knowlee-processes/my-processes");
        },
    });
    const { errors, handleChange, handleReset, handleSubmit, values } = formik;
    const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        handleReset(e);
        navigate("/knowlee-processes/my-processes");
    };

    console.log("values----->", values);

    return (
        <Box
            as="form"
            onSubmit={handleSubmit}
            overflow={"auto"}
            w="full" // Use "full" for full-width or specify a custom width
            maxWidth="1200px" // Adjust this value based on your design needs
            m="0 auto" // Automatically adjust margins to center the content
            p="4" // Add some padding around the content (optional, adjust as needed)
        >
            <Box>
                <Accordion allowToggle>
                    <AccordionItem>
                        <AccordionButton>
                            <Flex alignItems="center">
                                <FormLabel color={labelTextColor} marginBottom="0">
                                    Name
                                    <Tooltip
                                        label="Enter a unique name for your assistant. This name will be used to identify your assistant across the platform."
                                        fontSize="sm"
                                    >
                                        <span>
                                            <InfoOutlineIcon
                                                cursor="help"
                                                boxSize="14px"
                                                ml="6px"
                                                color="primary.50"
                                            />
                                        </span>
                                    </Tooltip>
                                </FormLabel>
                            </Flex>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                            <FormControl
                                display="flex"
                                flexDirection="column"
                                gap="8px"
                                isInvalid={Boolean(errors.name)}
                            >
                                <Input
                                    borderRadius="12px"
                                    maxWidth={["100%", "100%", "560px"]}
                                    border="2px solid"
                                    borderColor={borderColor}
                                    padding={3}
                                    placeholder="Name your Knowlee Process"
                                    value={values.name}
                                    onChange={handleChange}
                                    width="full"
                                    name="name"
                                    marginTop="0" // Remove any default bottom margin
                                />
                                <FormErrorMessage>{errors.name}</FormErrorMessage>
                            </FormControl>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>

                <Accordion allowToggle>
                    <AccordionItem>
                        <AccordionButton>
                            <Flex alignItems="center">
                                <FormLabel
                                    color={labelTextColor}
                                    fontWeight="500"
                                    marginBottom="0" // Remove any default bottom margin
                                >
                                    Goals
                                    <Tooltip
                                        label="Provide detailed goal for your process. Describe its tasks, objectives, and any specific preferences or constraints."
                                        fontSize="sm"
                                    >
                                        <span>
                                            <InfoOutlineIcon
                                                cursor="help"
                                                boxSize="14px"
                                                ml="6px"
                                                color="primary.50"
                                            />
                                        </span>
                                    </Tooltip>
                                </FormLabel>
                            </Flex>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel
                            pb={3}
                            gap={2}
                            display={"flex"}
                            flexDirection={"column"}
                        >
                            {formik.values.goals.map(({ goal, assistantId }, index) => (
                                <Flex key={index} gap={2} alignItems={"center"}>
                                    <Flex alignItems={"center"}>
                                        <FormLabel
                                            color={labelTextColor}
                                            fontWeight="500"
                                            marginBottom="0"
                                            htmlFor={`goals.${index}.assistantId`}
                                        >
                                            Assistant:
                                        </FormLabel>
                                        <Select
                                            onChange={formik.handleChange}
                                            name={`goals.${index}.assistantId`}
                                            size="md"
                                            value={assistantId}
                                        >
                                            <option
                                                key={"select-assistant"}
                                                value={""}
                                                disabled={true}
                                            >
                                                Select Assistant
                                            </option>
                                            {userAssistantList?.map(({ assistant }) => {
                                                const { id: assistantId = "", name = "" } = assistant;
                                                return (
                                                    <option key={assistantId} value={assistantId}>
                                                        {name}
                                                    </option>
                                                );
                                            })}
                                        </Select>
                                    </Flex>
                                    <Flex alignItems={"center"} flexGrow={1}>
                                        <FormLabel
                                            color={labelTextColor}
                                            fontWeight="500"
                                            marginBottom="0"
                                            htmlFor={`goals.${index}.goal`}
                                        >
                                            Task:
                                        </FormLabel>
                                        <Textarea
                                            name={`goals.${index}.goal`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={goal}
                                        />
                                    </Flex>
                                    <IconButton
                                        colorScheme="red"
                                        aria-label="Delete"
                                        icon={<DeleteIcon />}
                                        onClick={() => {
                                            formik.setFieldValue(
                                                "goals",
                                                values.goals?.filter((_, idx) => idx !== index)
                                            );
                                        }}
                                    />
                                </Flex>
                            ))}
                            <Button
                                type="button"
                                onClick={() =>
                                    formik.setFieldValue("goals", [
                                        ...formik.values.goals,
                                        { goal: "", assistantId: "" },
                                    ])
                                }
                                width={"xs"}
                                isDisabled={values.goals?.length >= 2}
                            >
                                Add Task
                            </Button>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>

                <Accordion allowToggle>
                    <AccordionItem>
                        <AccordionButton>
                            <FormLabel
                                color={labelTextColor}
                                fontWeight="500"
                                marginBottom="0"
                            >
                                Schedule (optional)
                                <Tooltip
                                    label="Enhance your chat experience by adding interactive tools that allow for direct in-chat creations and analyses. They may consume more tokens."
                                    fontSize="sm"
                                >
                                    <span>
                                        <InfoOutlineIcon
                                            cursor="help"
                                            boxSize="14px"
                                            ml="2"
                                            color="primary.50"
                                        />
                                    </span>
                                </Tooltip>
                            </FormLabel>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                            <Flex gap={3} flexDirection={"column"}>
                                <Flex gap={2} alignItems={"center"}>
                                    <Text>Recurring</Text>
                                    <Switch
                                        name="isRecurring"
                                        defaultChecked={values.isRecurring}
                                        isChecked={values.isRecurring}
                                        onChange={handleChange}
                                    />
                                </Flex>
                                
                                <FormControl>
                                    <FormLabel>Schedule At</FormLabel>
                                    <Input
                                        name="scheduledAt"
                                        type="datetime-local"
                                        value={values.scheduledAt as string}
                                        onChange={handleChange}
                                        width={"sm"}
                                        min={format(new Date(), DATETIME_LOCAL_FORMAT)}
                                    />
                                </FormControl>
                                {values.isRecurring && (
                                    <FormControl>
                                        <FormLabel>Every hours</FormLabel>
                                        <Input
                                            name="interval"
                                            type="number"
                                            min={0.5}
                                            step={0.01}
                                            value={values.interval}
                                            onChange={handleChange}
                                            width={"sm"}
                                            placeholder="0.5"
                                        />
                                    </FormControl>
                                )}
                            </Flex>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>

                <Flex
                    flexDirection="column"
                    gap="8px"
                    marginTop="24px"
                    paddingRight="2"
                >
                    <Flex justifyContent={"space-between"}></Flex>
                </Flex>
            </Box>
            <Flex bottom="10" justifyContent="center" gap="24px" marginTop="24px">
                <Button
                    fontWeight="500"
                    color="neutral.10"
                    bg="primary.50"
                    minWidth={["auto", "144px"]}
                    type="submit"
                    isLoading={isLoadingCreateKnowleeProcess}
                    isDisabled={isLoadingCreateKnowleeProcess}
                    _hover={{}}
                >
                    Save
                </Button>
                <Button
                    fontWeight="500"
                    minWidth={["auto", "144px"]}
                    onClick={handleCancel}
                    color={headingTextColor}
                >
                    Cancel
                </Button>
            </Flex>
        </Box>
    );
}

export default CreateProcess;
