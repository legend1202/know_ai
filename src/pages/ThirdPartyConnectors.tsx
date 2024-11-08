import { Box } from "@chakra-ui/react";
import GoogleAuthButton from "src/components/ThirdPartyConnectors/GoogleAuthButton";

function ThirdPartyConnectors() {
  return (
    <Box padding={3}>
      <GoogleAuthButton />
    </Box>
  );
}

export default ThirdPartyConnectors;
