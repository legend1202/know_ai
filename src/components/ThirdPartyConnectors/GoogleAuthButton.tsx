import { Button, Flex, Text } from "@chakra-ui/react";
import GoogleIcon from "src/Icons/GoogleIcon";
import { useGoogleLoginMutation } from "src/api/mutations/thirdPartyIndex";
import { useThirdPartyConfig } from "src/api/queries/thirdPartyQuery";

function GoogleAuthButton() {
  const { data: thirdPartyConfig, isLoading: thirdPartyConfigLoading } =
    useThirdPartyConfig();

  const { mutateAsync: authorizeGoogle, isLoading: googleAuthLoading } =
    useGoogleLoginMutation();

  async function handleAuthorizeGoogle() {
    const data = await authorizeGoogle();
    if (data.authURL) {
      window.open(data.authURL);
    }
  }

  return (
    <Button
      gap={2}
      isLoading={thirdPartyConfigLoading || googleAuthLoading}
      onClick={handleAuthorizeGoogle}
    >
      <Flex
        alignItems="center"
        borderRadius="full"
        flexShrink={0}
        height={8}
        justifyContent="center"
        minW={8}
        width={8}
      >
        <GoogleIcon />
      </Flex>
      <Text>
        {thirdPartyConfig?.google?.token?.access_token
          ? "Connected"
          : "Connect"}
      </Text>
    </Button>
  );
}

export default GoogleAuthButton;
