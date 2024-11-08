import { Box, Flex, Text, useColorMode, Tooltip } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import GoogleIcon from "src/Icons/GoogleIcon";
import MicrosoftIcon from "src/Icons/MicrosoftIcon";
import GoogleAuthButton from "src/components/ThirdPartyConnectors/GoogleAuthButton";

export default function AccountConnectorsList() {
  const { colorMode } = useColorMode();
  return (
    <Flex flexDir="column" minH={0} flex="1">
      <Text
        color={colorMode === "dark" ? "neutral.40" : "neutral.60"}
        fontSize="16px"
        fontWeight="500"
        lineHeight="24px"
        mt="24px"
      >
        Account Connectors
        <Tooltip
          label={
            <div>
              <Text fontWeight="normal" fontSize="sm">Connect your accounts to enable Knowlee assistants to manage them for you.</Text>
            </div>
          }
        >
          <span>
            <InfoIcon boxSize="12px" ml={2} />
          </span>
        </Tooltip>

      </Text>

      <Flex
        className="scroll-hover"
        mt="24px"
        alignItems="flex-start"
        flexWrap="wrap"
        gap="14px"
        overflowY="auto"
      >

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
          borderColor={colorMode === "dark" ? "#343839" : "neutral.20"}
          backgroundColor="neutral.'01100'"
        >
          <Box
            display="flex"
            height="60px"
            alignItems="center"
            gap="16px"
            alignSelf="stretch"
            opacity={1}
          >
            <Box
              w="60px"
              h="60px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              borderRadius="10px"
            // bg={iconColor}
            >
              <GoogleIcon />
            </Box>
            <Text
              color={colorMode === "dark" ? "neutral.10" : "neutral.90"}
              fontWeight="500"
              fontSize="16px"
              lineHeight="24px"
            >
              Google
            </Text>
          </Box>
          <GoogleAuthButton />
        </Box>

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
          borderColor={colorMode === "dark" ? "#343839" : "neutral.20"}
          backgroundColor="neutral.'01100'"
        >
          <Box
            display="flex"
            height="60px"
            alignItems="center"
            gap="16px"
            alignSelf="stretch"
            opacity={1}
          >
            <Box
              w="60px"
              h="60px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              borderRadius="10px"
            // bg={iconColor}
            >
              <MicrosoftIcon />
            </Box>
            <Text
              color={colorMode === "dark" ? "neutral.10" : "neutral.90"}
              fontWeight="500"
              fontSize="16px"
              lineHeight="24px"
            >
              Microsoft
            </Text>
          </Box>
          {/* need to Replace MicroSoftAuthButton here */}
          <GoogleAuthButton />
        </Box>

      </Flex>
    </Flex>
  );
}

