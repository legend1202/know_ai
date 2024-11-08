import {
  Box,
  Container,
  Flex,
  useColorModeValue,
  Text,
  Button,
  FormControl,
  Select,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import UpgradePlanIcon from "src/Icons/subscription/UpgradePlanIcon";
import { useStipePaymentMutation } from "src/api/mutations/stripeIndex";
import {
  useGetSubscriptions,
  useGetUserSubscription,
} from "src/api/queries/subscriptionQuery";
import { PlanDuration } from "src/api/requests/stripeIndex";
import { useSubscriptionModalStore } from "src/store";
import { SubscriptionPlan } from "src/types/subscription.interface";

const UpgradePlanCard = () => {
  const toast = useToast();
  const { close } = useSubscriptionModalStore();
  const { isLoading: isLoadingSubscriptionData, data: subscriptionsResponse } =
    useGetSubscriptions();

  const { data: userSubscriptionRes } = useGetUserSubscription();
  const userCurrentPlanPriceId =
    userSubscriptionRes?.userSubscription.stripePriceId;
  
  const userCurrentPlanPriority =
    typeof userSubscriptionRes?.userSubscription.plan !== "string"
      ? userSubscriptionRes?.userSubscription.plan.priority
      : 0;

  const subscriptionOptions =
    subscriptionsResponse &&
    subscriptionsResponse?.flatMap((item) => item.subscriptions);

  const headingTextColor = useColorModeValue("neutral.100", "neutral.10");
  const usersSubscription = subscriptionOptions?.find(
    (sub) => sub.stripePriceId === userCurrentPlanPriceId
  );
  const borderColor = useColorModeValue("neutral.30", "neutral.80");

  const subHeadingColor = useColorModeValue("#6C7275", "#6C7275");

  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionPlan | null>(null);
  const { mutateAsync: stripePayment, isLoading: isPlanUpgading } =
    useStipePaymentMutation();

  async function upgradeSubscription({
    planDuration,
    priceId,
  }: {
    planDuration: PlanDuration;
    priceId: string;
  }) {
    // onCloseUpgradeModal();
    const data = await stripePayment({
      planDuration,
      priceId,
      tolt_referral: window?.tolt_referral,
    });

    if ((data as { url?: string })?.url) {
      window.location.href = (data as { url: string }).url;
      return;
    }
    // setSelectedSubscription(priceId);
    toast({
      title: "Subscription Updated Successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    close();
  }

  if (isLoadingSubscriptionData) {
    return (
      <Flex alignItems="center" justifyContent="center" h="36vh" minW="280px">
        <Spinner />
      </Flex>
    );
  }

  const handleSubscriptionSelect = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!subscriptionOptions?.length || !event.target.value) return;
    const subscription = subscriptionOptions.find(
      (_) => _._id === event.target.value
    );
    if (!subscription) return;
    setSelectedSubscription(subscription);
  };

  const handleUpgradeSubscription = async () => {
    if (!selectedSubscription?.planType || !usersSubscription?.stripePriceId)
      return;
    await upgradeSubscription({
      planDuration: selectedSubscription?.planType as PlanDuration,
      priceId: usersSubscription?.stripePriceId,
    });
  };

  return (
    <Container
      border={"1px solid"}
      borderRadius="10px"
      borderColor={borderColor}
      padding="7"
      maxWidth="inherit"
    >
      <Flex gap="16px">
        <UpgradePlanIcon />
        <Box>
          <Text
            color={headingTextColor}
            fontFamily="Roboto"
            fontSize="16px"
            fontStyle="normal"
            fontWeight="500"
            lineHeight="30px"
          >
            Upgrade Plan
          </Text>
          <Text
            color={subHeadingColor}
            fontFamily="Roboto"
            fontSize="14px"
            fontStyle="normal"
            fontWeight="500"
            lineHeight="24px"
          >
            Long-term savings.
          </Text>
        </Box>
      </Flex>

      <FormControl py={"16px"}>
        <Select
          size="md"
          onChange={handleSubscriptionSelect}
          defaultValue="default"
          value={selectedSubscription?._id || usersSubscription?._id}
        >
          {!!subscriptionOptions?.length &&
            subscriptionOptions.map((subscription) => {
              return (
                <option
                  key={subscription._id}
                  value={subscription._id}
                  disabled={
                    userCurrentPlanPriceId === subscription.stripePriceId ||
                    subscription.priority <= (userCurrentPlanPriority || 0)
                  }
                >
                  {subscription.price && subscription.interval
                    ? `${subscription.name} - $${subscription.price} / ${subscription.interval}`
                    : `${subscription.name}`}
                </option>
              );
            })}
        </Select>
      </FormControl>

      <Button
        py={6}
        borderRadius={"12px"}
        bg={"primary.50"}
        color={"neutral.10"}
        _hover={{}}
        width={"full"}
        isDisabled={isPlanUpgading}
        isLoading={isPlanUpgading}
        onClick={handleUpgradeSubscription}
      >
        Upgrade
      </Button>
    </Container>
  );
};

export default UpgradePlanCard;
