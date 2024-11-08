import { InfoIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Text,
  useColorModeValue,
  useToast,
  useColorMode,
  Textarea,
  Switch,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Center,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateAssistantMutation } from "src/api/mutations/knowleeAgentIndex";
import { useUserScrapedData } from "src/api/queries";
import { useRetrieveAssistant } from "src/api/queries/knowleeAgentQuery";
import { CreateKnowleeAgentPayload } from "src/api/requests/knowleeAgentIndex";
import AgentDataSourceRow from "src/components/KnowleeAgents/CreateAgent/AgentDataSourceRow";
import OpenAIFunctionsInput from "src/components/KnowleeAgents/OpenAIFunctionsInput";
import PaginationComponent from "src/components/Pagination/PaginationComponent";
import { isDoubleStepEntity } from "src/utils/entity";
import { InfoOutlineIcon } from "@chakra-ui/icons"

const initialLimit = 5;

function UpdateAssistant({ }) {
  const navigate = useNavigate();
  const { assistantId } = useParams();
  const { data: assistantDetails, isLoading: isLoadingAssistanceDetails } =
    useRetrieveAssistant(assistantId!);

  // Derive isDefaultAssistant from the assistantDetails
  const isDefaultAssistant = assistantDetails?.isDefaultAgentAdded;

  const toast = useToast();
  const { colorMode } = useColorMode();
  const borderColor = useColorModeValue("neutral.30", "neutral.80");
  const headingTextColor = useColorModeValue("neutral.100", "neutral.10");
  const labelTextColor = useColorModeValue("neutral.60", "neutral.40");

  const [currentPage, setCurrentPage] = useState(1);
  const [onlyEnabledSources, setOnlyEnabledSources] = useState(false);
  const [limit, setLimit] = useState(initialLimit);

  const { data: userEntities, isLoading: isUserEntitiesLoading } = useUserScrapedData({ limit, skip: (currentPage - 1) * limit, excludeNoData: true });

  const totalPages = Math.ceil((userEntities?.totalCount || 0) / limit);

  const { mutateAsync: updateAssistant, isLoading: isLoadingUpdateAssistant } =
    useUpdateAssistantMutation();

  const formik = useFormik<CreateKnowleeAgentPayload>({
    initialValues: {
      entityIds: [],
      functionDefinitions: [],
      instructions: "",
      name: "",
      initialPrompts: ['', '', '', '']
    },
    onSubmit: async (values, { resetForm }) => {
      if (!assistantDetails) {
        return console.error("Assistant not found", assistantId);
      }
      const { entityIds = [], functionDefinitions = [] } = values;
      const { assistant } = assistantDetails;
      if (!entityIds.length && !functionDefinitions.length) {
        toast({
          title: "Validation Error",
          description: "Select at least a data source or an advanced capability",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      await updateAssistant({ id: assistant.id, ...values });
      resetForm();
      navigate(-1);
    },
  });
  const { errors, handleChange, handleReset, handleSubmit, values, setValues } =
    formik;

  function handleOnlyEnabledChange(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setOnlyEnabledSources(checked);
    setLimit(checked ? userEntities?.totalCount || 0 : initialLimit);
    setCurrentPage(1);
  }

  useEffect(() => {
    if (assistantDetails) {
      const {
        assistant,
        entityIds = [],
        initialPrompts = ["", "", "", ""],
        functionDefinitions,
      } = assistantDetails;
      const { instructions = "", name = "" } = assistant;
      setValues({
        entityIds: entityIds || [],
        instructions: instructions || "",
        name: name || "",
        initialPrompts: initialPrompts || ["", "", "", ""],
        functionDefinitions: functionDefinitions || [],
      });
    }
  }, [assistantDetails, setValues]);

  if (isLoadingAssistanceDetails) {
    return (
      <Box textAlign="center">
        <Spinner />
      </Box>
    );
  }

  if (!assistantDetails) {
    navigate(-1);
    return null;
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    handleReset(e);
    navigate("/knowlee-assistants/my-assistants")
    }
  return (
    <Box
      as="form"
      // height={"calc(100% - 72px)"}
      overflow="auto"
      onSubmit={handleSubmit}
    >
      <Box>
        {!isDefaultAssistant && (
          <>
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Flex alignItems="center">
                    <FormLabel
                      color={colorMode === "dark" ? "neutral.40" : "neutral.60"}
                      fontWeight="500"
                      //   mt="16px"
                      marginBottom={"0px"}
                    >
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
                      // background="neutral.10"
                      maxWidth={["100%", "100%", "560px"]}
                      border="2px solid"
                      borderColor={borderColor}
                      padding={3}
                      // focusBorderColor="transparent"
                      placeholder="Name your Knowlee Assistant"
                      value={values.name}
                      onChange={handleChange}
                      width="full"
                      name="name"
                      required={true}
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
                      color={colorMode === "dark" ? "neutral.40" : "neutral.60"}
                      fontWeight="500"
                      fontSize="lg" // Adjust font size if necessary
                      lineHeight="normal" // Ensure line height is appropriate
                      marginBottom="0" // Remove any default bottom margin
                    >
                      Instructions
                      <Tooltip
                        label="Provide detailed instructions for your assistant. Describe its tasks, objectives, and any specific preferences or constraints."
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
                    // marginTop="24px"
                    isInvalid={Boolean(errors.instructions)}
                  >
                    <Textarea
                      borderRadius="12px"
                      width={"100%"}
                      maxWidth={["100%", "100%", "760px"]}
                      padding={3}
                      placeholder="Describe the tasks for your Knowlee Assistant"
                      minH="50px"
                      resize="both"
                      overflow="auto" // Enable scrolling within the Textarea
                      value={values.instructions}
                      onChange={handleChange}
                      name="instructions"
                      required={true}
                      maxLength={32768}
                    />
                    <FormErrorMessage>{errors.instructions}</FormErrorMessage>
                  </FormControl>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <FormLabel
                    color={colorMode === "dark" ? "neutral.40" : "neutral.60"}
                    fontWeight="500"
                    // mt="16px"
                    marginBottom="0"
                  >
                    Conversation Starters
                    <Tooltip
                      label="List initial questions or prompts to configure how your assistant starts conversations. This helps tailor the assistant's interactions according to your needs."
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
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <FormControl
                    display="flex"
                    flexDirection="column"
                    gap="8px"
                    isInvalid={Boolean(errors.name)}
                  >
                    {values.initialPrompts.map((_, index) => (
                      <Input
                        borderRadius="12px"
                        // background="neutral.10"
                        maxWidth={["100%", "100%", "560px"]}
                        border="2px solid"
                        borderColor={borderColor}
                        padding={3}
                        // focusBorderColor="transparent"
                        placeholder={`Question ${index + 1}`}
                        value={values.initialPrompts[index]}
                        onChange={handleChange}
                        width="full"
                        name={`initialPrompts[${index}]`}
                        marginTop="0" // Remove any default bottom margin
                      />
                    ))}
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>
                </AccordionPanel>
              </AccordionItem>
              <OpenAIFunctionsInput
                handleChange={handleChange}
                values={values}
                setValues={setValues} // Pass the Formik setValues function as a prop
              />
            </Accordion>
          </>
        )}

        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
              <FormLabel
                color={labelTextColor}
                fontWeight="500"
                marginBottom="0"
              >
                <Text color={labelTextColor} fontWeight="500">
                  Data Sources
                  <Tooltip
                    label="Select the data sources your assistant will use to gather information. You can filter sources to include only those that are currently enabled."
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
                </Text>
              </FormLabel>
              <Flex justifyContent="center" alignItems="center">
                <FormLabel
                  fontSize="13px"
                  color={labelTextColor}
                  fontWeight="100"
                  marginBottom="0"
                  marginLeft="10"
                >
                  <Text color={labelTextColor} fontWeight="400">
                    Show Only Selected Sources
                    <Tooltip
                      label="Filter to show only the data sources that are enabled. Use this to streamline the selection of active sources for your assistant."
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
                  </Text>
                </FormLabel>
                <Switch
                  id="only-enabled-sources"
                  defaultChecked={onlyEnabledSources}
                  checked={onlyEnabledSources}
                  onChange={handleOnlyEnabledChange}
                />
              </Flex>

              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <PaginationComponent
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
              />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>

      <Flex bottom="10" justifyContent="center" gap="24px" marginTop="24px">
        <Button
          fontWeight="500"
          color="neutral.10"
          bg="primary.50"
          minWidth={["auto", "144px"]}
          type="submit"
          isLoading={isLoadingUpdateAssistant}
          isDisabled={isLoadingUpdateAssistant}
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

export default UpdateAssistant;
