import {
    Checkbox,
    Flex,
    Spinner,
    Text,
    Tooltip,
    useColorModeValue,
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    FormLabel,
} from "@chakra-ui/react";
import { ChangeEvent } from "react";
import { useAvailableFunctions } from "src/api/queries/knowleeAgentQuery";
import { CreateKnowleeAgentPayload } from "src/api/requests/knowleeAgentIndex";
import { InfoOutlineIcon, InfoIcon } from "@chakra-ui/icons"

interface Props {
    handleChange: {
        (e: ChangeEvent<any>): void;
        <T = string | ChangeEvent<any>>(field: T): T extends ChangeEvent<any> ? void : (e: string | ChangeEvent<any>) => void;
    };
    values: CreateKnowleeAgentPayload;
    setValues: (values: CreateKnowleeAgentPayload, shouldValidate?: boolean) => void;
}

function OpenAIFunctionsInput({ values, setValues }: Props) {
    const labelTextColor = useColorModeValue("neutral.60", "neutral.40");

    const { data: availableFunctionList, isLoading } = useAvailableFunctions();

    // The IDs of the three functions that should be selected/deselected together
    const linkedFunctionIds = ['65b0d676c76e46f4771c7f93', '65b0d676c76e46f4771c7f92', '65b0d676c76e46f4771c7f90'];

    // Adjust handleChange to incorporate the logic for the virtual checkbox
    const handleVirtualChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        let newFunctionDefinitions = [...values.functionDefinitions];

        if (checked) {
            // Add all linked functions if not already included
            linkedFunctionIds.forEach((id) => {
                if (!newFunctionDefinitions.includes(id)) {
                    newFunctionDefinitions.push(id);
                }
            });
        } else {
            // Remove all linked functions
            newFunctionDefinitions = newFunctionDefinitions.filter(id => !linkedFunctionIds.includes(id));
        }

        // Update the state with the new list of function definitions
        setValues({ ...values, functionDefinitions: newFunctionDefinitions });
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value: changedId, checked } = event.target;
        let newFunctionDefinitions = [...values.functionDefinitions];

        if (checked && !newFunctionDefinitions.includes(changedId)) {
            newFunctionDefinitions.push(changedId);
        } else if (!checked) {
            newFunctionDefinitions = newFunctionDefinitions.filter(id => id !== changedId);
        }

        setValues({ ...values, functionDefinitions: newFunctionDefinitions });
    };


    function VirtualCheckbox() {
        // Check if all linked functions are selected
        const virtualChecked = linkedFunctionIds.every(id => values.functionDefinitions.includes(id));

        return (
            <Checkbox
                isChecked={virtualChecked}
                onChange={handleVirtualChange}
            >
                <Text
                    fontSize="14px"
                    color={labelTextColor}
                    textTransform={"capitalize"}
                >
                    All "Knowledge Sources"
                    <Tooltip label="You don't need to connect any data sources, you can retrieve them by chatting. It consume more tokens." fontSize="sm">
                    <span>
                        <InfoIcon cursor="crosshair" boxSize="14px" ml="2" color="primary.50" />
                    </span>
                </Tooltip>
                </Text>

            </Checkbox>
        );
    }

    function FunctionList() {
        if (isLoading) return <Spinner />;
        if (!availableFunctionList || !availableFunctionList.length) return null;
        return availableFunctionList
            .filter(fn => !linkedFunctionIds.includes(fn._id)) // Filter out the linkedFunctionIds
            .map((fn) => {
                const { _id, label = "" } = fn;
                const isChecked = values.functionDefinitions.includes(_id);
                // There can be a maximum of 128 tools per assistant.
                const isDisabled =
                    !isChecked && values.functionDefinitions.length >= 128;

                return (
                    <Flex align="center" gap={"8px"} key={_id}>
                        <Checkbox
                            name="functionDefinitions"
                            value={_id}
                            isChecked={isChecked}
                            onChange={handleChange}
                            isDisabled={isDisabled}
                        />
                        <Text
                            fontSize="14px"
                            color={labelTextColor}
                            textTransform={"capitalize"}
                        >
                            {label}
                        </Text>
                    </Flex>
                );
            });
    }


    return (
        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
            <FormLabel
                                color={labelTextColor}
                                fontWeight="500"
                                marginBottom="0"
                            >
                Tools
                <Tooltip label="Enhance your chat experience by adding interactive tools that allow for direct in-chat creations and analyses. They may consume more tokens." fontSize="sm">
                  <span>
                    <InfoOutlineIcon cursor="help" boxSize="14px" ml="2" color="primary.50" />
                  </span>
                </Tooltip>
              </FormLabel>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Flex flexDirection="column" gap="4px">
                <FunctionList />
                <VirtualCheckbox /> {/* Keep the virtual checkbox in the UI */}
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      );
    }
    
    export default OpenAIFunctionsInput;