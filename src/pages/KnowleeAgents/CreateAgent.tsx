import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Table,
    TableContainer,
    Tbody,
    Text,
    useColorModeValue,
    useToast,
    Tooltip,
    Textarea,
    Spinner,
    Switch,
    Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useCreateKnowleeAgentMutation } from "src/api/mutations/knowleeAgentIndex";
import { useUserScrapedData } from "src/api/queries";
import AgentDataSourceRow from "src/components/KnowleeAgents/CreateAgent/AgentDataSourceRow";
import { isDoubleStepEntity } from "src/utils/entity";
import { useState } from "react";
import PaginationComponent from "src/components/Pagination/PaginationComponent";
import OpenAIFunctionsInput from "src/components/KnowleeAgents/OpenAIFunctionsInput";
import { CreateKnowleeAgentPayload } from "src/api/requests/knowleeAgentIndex";
import { InfoOutlineIcon } from "@chakra-ui/icons"

const initialLimit = 5;

function CreateAgent() {
    const navigate = useNavigate();
    const toast = useToast();

    const labelTextColor = useColorModeValue("neutral.60", "neutral.40");
    const borderColor = useColorModeValue("neutral.30", "neutral.80");
    const headingTextColor = useColorModeValue("neutral.100", "neutral.10");

    const [currentPage, setCurrentPage] = useState(1);
    const [onlyEnabledSources, setOnlyEnabledSources] = useState(false);
    const [limit, setLimit] = useState(initialLimit);

    const { data: userEntitiesRes, isLoading: isUserEntitiesLoading } = useUserScrapedData({ limit, skip: (currentPage - 1) * limit, excludeNoData: true });

    const totalPages = Math.ceil((userEntitiesRes?.totalCount || 0) / limit);

    const { mutateAsync: createAgent, isLoading: isLoadingCreateAgent } =
        useCreateKnowleeAgentMutation();

    const [numInputs, setNumInputs] = useState(1);

    const formik = useFormik<CreateKnowleeAgentPayload>({
      initialValues: {
        entityIds: [],
        instructions: "",
        functionDefinitions: [],
        name: "",
        initialPrompts: ['', '', '', '']
      },
      onSubmit: async (values, { resetForm }) => {
                const { entityIds = [], functionDefinitions = [] } = values;
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

        await createAgent(values);
        resetForm();
        navigate("/knowlee-assistants/my-assistants");
      },
    });
    const { errors, handleChange, handleReset, handleSubmit, values, setValues } = formik;
    const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      handleReset(e);
      navigate("/knowlee-assistants/my-assistants")
    }

    function handleOnlyEnabledChange(e: React.ChangeEvent<HTMLInputElement>) {
      const checked = e.target.checked;
      setOnlyEnabledSources(checked);
      setLimit(checked ? userEntitiesRes?.totalCount || 0 : initialLimit);
      setCurrentPage(1);
    }

    const handleInputChange = (
      index: number,
      event: React.ChangeEvent<HTMLInputElement>
    ) => {

      const newInputs = [...formik.values.initialPrompts];

      newInputs[index] = event.target.value;
      formik.setFieldValue("initialPrompts", newInputs);
      if (
        index === numInputs - 1 &&
        event.target.value.trim() !== "" &&
        numInputs < 5
      ) {
        setNumInputs(numInputs + 1);
      }
    };

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
                  
                                <FormLabel
                                    color={labelTextColor}
                                    marginBottom="0"
                                >
                    Name
                    <Tooltip label="Enter a unique name for your assistant. This name will be used to identify your assistant across the platform." fontSize="sm">
                      <span>
                        <InfoOutlineIcon cursor="help" boxSize="14px" ml="6px" color="primary.50" />
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
                    color={labelTextColor}
                    fontWeight="500"
                    marginBottom="0" // Remove any default bottom margin
                  >
                    Instructions
                    <Tooltip label="Provide detailed instructions for your assistant. Describe its tasks, objectives, and any specific preferences or constraints." fontSize="sm">
                      <span>
                        <InfoOutlineIcon cursor="help" boxSize="14px" ml="6px" color="primary.50" />
                      </span>
                    </Tooltip>
                  </FormLabel>
                </Flex>                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={3}>
                <FormControl
                  display="flex"
                  flexDirection="column"
                  gap="8px"
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
                  color={labelTextColor}
                  fontWeight="500"
                  marginBottom="0"
                >
                  Conversation Starters
                  <Tooltip label="List initial questions or prompts to configure how your assistant starts conversations. This helps tailor the assistant's interactions according to your needs." fontSize="sm">
                    <span>
                      <InfoOutlineIcon cursor="help" boxSize="14px" ml="6px" color="primary.50" />
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
                    <div key={index}>
                      {index < numInputs && (
                        <Input
                          borderRadius="12px"
                          maxWidth={["100%", "100%", "560px"]}
                          border="2px solid"
                          borderColor={borderColor}
                          padding={3}
                          placeholder={`Question ${index + 1}`}
                          value={values.initialPrompts[index]}
                          onChange={(event) => handleInputChange(index, event)}
                          width="full"
                          name={`initialPrompts[${index}]`}
                          marginTop="0"
                        />
                      )}
                    </div>
                  ))}
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
              </AccordionPanel>
            </AccordionItem>
            <OpenAIFunctionsInput
              handleChange={handleChange}
              values={values}
              setValues={setValues}
            />
          </Accordion>

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
                    <Tooltip label="Select the data sources your assistant will use to gather information. You can filter sources to include only those that are currently enabled." fontSize="sm">
                      <span>
                        <InfoOutlineIcon cursor="help" boxSize="14px" ml="6px" color="primary.50" />
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
                      <Tooltip label="Filter to show only the data sources that are enabled. Use this to streamline the selection of active sources for your assistant." fontSize="sm">
                        <span>
                          <InfoOutlineIcon cursor="help" boxSize="14px" ml="6px" color="primary.50" />
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
                <TableContainer
                  w="100%"
                  height={[
                    "calc(100vh - 492px)",
                    "calc(100vh - 492px)",
                    "calc(100vh - 332px)",
                  ]}
                  overflowY={"auto"}
                >
                  {isUserEntitiesLoading ?
                    <Flex alignItems="center" height="100%" justifyContent="center">
                      <Spinner />
                    </Flex>
                  :
                    <Table variant="simple">
                      <Tbody overflow="auto">
                        {userEntitiesRes?.entityList?.map((entity) => {
                          const { isScraped } = entity;
                          // don't show double-step entity, not sracped entity and entity with no uservectors
                          if (isDoubleStepEntity(entity) || !isScraped) { //temp: pause pinecone, || !userVectors.length
                            return null;
                          }
                          if (onlyEnabledSources && !values?.entityIds?.includes(entity.id)) {
                            return null;
                          }
                          return (
                            <AgentDataSourceRow
                              key={entity.id}
                              entity={entity}
                              handleChange={handleChange}
                              values={values}
                            />
                          );
                        })}
                      </Tbody>
                    </Table>}
                </TableContainer>
                <PaginationComponent
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />

              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Flex
            flexDirection="column"
            gap="8px"
            marginTop="24px"
            paddingRight="2"
          >
            <Flex justifyContent={"space-between"}>
                    </Flex>
          </Flex>
        </Box>
        <Flex
                bottom="10"
                justifyContent="center"
                gap="24px"
                marginTop="24px"
            >
          <Button
            fontWeight="500"
            color="neutral.10"
            bg="primary.50"
            minWidth={["auto", "144px"]}
            type="submit"
            isLoading={isLoadingCreateAgent}
            isDisabled={isLoadingCreateAgent}
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

export default CreateAgent;
