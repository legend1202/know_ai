import { Button, Flex, Text } from "@chakra-ui/react";
import { useMediumLoginMutation } from "src/api/mutations/mediumIndex";
import { useMediumConfig } from "src/api/queries/mediumQuery";
import MediumIcon from "src/components/Dashboard/Icons/MediumIcon";

function MediumAuthButton() {
    const {
        data: mediumConfig,
        isLoading: mediumConfigLoading
    } = useMediumConfig();

    const { mutateAsync: authorizeMedium, isLoading: mediumAuthLoading } =
    useMediumLoginMutation();

async function handleAuthorizeMedium() {
    const data = await authorizeMedium();
    if (data.authURL) {
        window.open(data.authURL);
    }
}

  return (
    <Button
      gap={2}
      isLoading={mediumConfigLoading || mediumAuthLoading}
      onClick={handleAuthorizeMedium}
      isDisabled={Boolean(mediumConfig)}
    >
      <Flex
        alignItems="center"
        borderRadius="full"
        flexShrink={0}
        height={8}
        justifyContent="center"
        minW={8}
        width={8}
        bgColor="icons.medium"
      >
        <MediumIcon width="18" height="18" />
      </Flex>
      <Text>Connect</Text>
    </Button>
  );
}

export default MediumAuthButton;
