import {
  Box,
  Button,
  Flex,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CoreFeatures from "src/components/Subscription/CoreFeatures";
import EnterpriseSubscriptionPlanCard from "src/components/Subscription/EnterpriseSubscriptionPlanCard";
import FreeSubscriptionPlanCard from "src/components/Subscription/FreeSubscriptionPlanCard";
import BasicSubscriptionPlanCard from "src/components/Subscription/BasicSubscriptionPlanCard";
import ProSubscriptionPlanCard from "src/components/Subscription/ProSubscriptionPlanCard";
import SubscriptionFAQ from "src/components/Subscription/SubscriptionFAQ";
import Slider from "react-slick";
import MobileMenuIcon from "src/Icons/MobileMenuIcon";
import MobileMenuDrawer from "src/components/PageContainer/MobileMenuDrawer";
import { PlanDuration, PlanType } from "src/api/requests/stripeIndex";
import { useStipePaymentMutation } from "src/api/mutations/stripeIndex";
import {
  useFreeSubscriptionPlan,
  useGetSubscriptions,
  useGetUserSubscription,
} from "src/api/queries/subscriptionQuery";
import UpgradeConfirmationModal from "src/components/Modal/UpgradeConfirmationModal";

// const startMonthly = 29.00;
// const proMonthly = 59.00;

const sliderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  adaptiveHeight: true,
  // responsive: [
  //   {
  //     breakpoint: 768,
  //     settings: {
  //       slidesToShow: 2,
  //     }
  //   },
  //   {
  //     breakpoint: 600,
  //     settings: {
  //       slidesToShow: 1,
  //     }
  //   }
  // ]
};

const Subscriptions = () => {
  const toast = useToast();
  const { isOpen: isOpenMobileMenu, onOpen: onOpenMobileMenu, onClose: onCloseMobileMenu } = useDisclosure();
  const {
    isOpen: isOpenUpgradeModal,
    onOpen: onOpenUpgradeModal,
    onClose: onCloseUpgradeModal,
  } = useDisclosure();
  const [planDuration, setPlanDuration] = useState<PlanDuration>("monthly");
  const [currentStripePriceId, setCurrentStripePriceId] = useState("");
  const [upgradeStripePriceId, setUpgradeStripePriceId] = useState("");

  const mainBackground = useColorModeValue(
    "linear-gradient(180deg, #F3F5F7 0%, #FDFDFD 100%)",
    "#232627"
  );
  // const closeButtonBorderColor = useColorModeValue("neutral.40", "neutral.70");
  // const closeIconColor = useColorModeValue("neutral.60", "neutral.70");
  const headingColor = useColorModeValue("neutral.100", "neutral.10");
  const subHeadingColor = useColorModeValue("neutral.60", "neutral.50");

  const { mutateAsync: stripePayment, isLoading, variables } = useStipePaymentMutation();
  const { isLoading: isLoadingSubscriptionData, data: subscriptionsResponse } = useGetSubscriptions();
  const { data: freeSubscriptionPlan } = useFreeSubscriptionPlan();
  
  const subscriptionData = subscriptionsResponse?.find((subscription) => subscription._id === planDuration)

  const subscriptions = subscriptionData?.subscriptions

  const { data: userSubscriptionRes } = useGetUserSubscription();

  function onUpgradeClick(planType: PlanType, priceId: string) {
    console.log("planType----->", planType);
    onOpenUpgradeModal();
    setUpgradeStripePriceId(priceId)
  }

  async function onUpgradeConfirm() {
    onCloseUpgradeModal();
    const data = await stripePayment({
      planDuration,
      priceId: upgradeStripePriceId,
      tolt_referral: window?.tolt_referral,
    });
    if ((data as { url?: string })?.url) {
      window.location.href = (data as { url: string }).url;
      return;
    }
    setCurrentStripePriceId(upgradeStripePriceId);
    toast({
      title: "Subscription Updated Successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  }

  // function getPlanPrice(planType: PlanType) {
  //   switch (planType) {
  //     case "start":
  //       if (planDuration === "monthly") return startMonthly;
  //       // 20% discount
  //       if (planDuration === "yearly") return (startMonthly * 0.8);
  //       return 0;

  //     case "pro":
  //       if (planDuration === "monthly") return proMonthly;
  //       // 20% discount
  //       if (planDuration === "yearly") return (proMonthly * 0.8);
  //       return 0;
  //   }
  // }

  useEffect(() => {
    if (userSubscriptionRes?.userSubscription?.stripePriceId) {
      setCurrentStripePriceId(userSubscriptionRes.userSubscription.stripePriceId);
    }
  }, [userSubscriptionRes?.userSubscription?.stripePriceId])

  const renderPricingCards = () => {
    if (isLoadingSubscriptionData) {
      return (
        <Box
          mt={"16"}
          px={"10"}
          display={["none", "none", "flex"]}
          gap={"2px"}
          alignItems={"center"}
        >
          <Flex alignItems="center" w="100%" justifyContent="center">
            <Spinner />
          </Flex>
        </Box>
      );
    }
    return (
      <>
        <Box
          mt={"16"}
          px={"10"}
          display={["none", "none", "flex"]}
          gap={"2px"}
          alignItems={"center"}
        >
          {freeSubscriptionPlan && (
            <FreeSubscriptionPlanCard
              isCurrentPlan={
                freeSubscriptionPlan.stripePriceId === currentStripePriceId
              }
              isLoading={
                isLoading &&
                variables?.priceId === freeSubscriptionPlan.stripePriceId
              }
              onUpgrade={() =>
                onUpgradeClick(
                  freeSubscriptionPlan.planType as PlanType,
                  freeSubscriptionPlan.stripePriceId
                )
              }
              subscriptionPlan={freeSubscriptionPlan}
            />
          )}
          {subscriptions?.map((subscription) =>
            subscription.subscriptionFeature.planType === "start" ? (
              <BasicSubscriptionPlanCard
                key={subscription._id}
                onUpgrade={() =>
                  onUpgradeClick(
                    subscription.subscriptionFeature.planType,
                    subscription.stripePriceId
                  )
                }
                isLoading={
                  isLoading && variables?.priceId === subscription.stripePriceId
                }
                price={subscription.subscriptionFeature.price}
                subscriptionPlan={subscription}
                isCurrentPlan={
                  subscription?.stripePriceId === currentStripePriceId
                }
              />
            ) : (
              <ProSubscriptionPlanCard
                  key={subscription._id}
                  onUpgrade={() =>
                    onUpgradeClick(
                    subscription.subscriptionFeature.planType,
                    subscription.stripePriceId
                  )
                }
                isLoading={
                  isLoading && variables?.priceId === subscription.stripePriceId
                }
                price={subscription.subscriptionFeature.price}
                  subscriptionPlan={subscription}
                  isCurrentPlan={
                    subscription?.stripePriceId === currentStripePriceId
                  }
              />
            )
          )}
          <EnterpriseSubscriptionPlanCard />
        </Box>
        <Box
          display={["block", "block", "none"]}
          mt="8"
          className="subscription-slider-wrapper"
        >
          <Slider {...sliderSettings}>
            {freeSubscriptionPlan && (
              <FreeSubscriptionPlanCard
                isCurrentPlan={
                  freeSubscriptionPlan.stripePriceId === currentStripePriceId
                }
                isLoading={
                  isLoading && variables?.priceId === freeSubscriptionPlan.stripePriceId
                }
                onUpgrade={() =>
                  onUpgradeClick(
                    freeSubscriptionPlan.planType as PlanType,
                    freeSubscriptionPlan.stripePriceId
                  )
                }
                subscriptionPlan={freeSubscriptionPlan}
              />
            )}
            {subscriptions?.map((subscription) =>
              subscription.subscriptionFeature.planType === "start" ? (
                <BasicSubscriptionPlanCard
                  key={subscription._id}
                  onUpgrade={() =>
                    onUpgradeClick(
                      subscription.subscriptionFeature.planType,
                      subscription.stripePriceId
                    )
                  }
                  isLoading={
                    isLoading &&
                    variables?.priceId === subscription.stripePriceId
                  }
                  price={subscription.subscriptionFeature.price}
                  subscriptionPlan={subscription}
                  isCurrentPlan={
                    subscription?.stripePriceId === currentStripePriceId
                  }
                />
              ) : (
                <ProSubscriptionPlanCard
                    key={subscription._id}
                    onUpgrade={() =>
                      onUpgradeClick(
                      subscription.subscriptionFeature.planType,
                      subscription.stripePriceId
                    )
                  }
                    isLoading={
                      isLoading &&
                      variables?.priceId === subscription.stripePriceId
                    }
                  price={subscription.subscriptionFeature.price}
                    subscriptionPlan={subscription}
                    isCurrentPlan={
                      subscription?.stripePriceId === currentStripePriceId
                    }
                />
              )
            )}
            <EnterpriseSubscriptionPlanCard />
          </Slider>
        </Box>
      </>
    );
  };

  return (
    <>
    <Box
      className="scroll-hover"
      position={"relative"}
      minW={"full"}
      borderRadius={"2rem"}
      background={mainBackground}
      overflow={"auto"}
    >
      {/* Drawer for mobile screens */}
      <Box display={["flex", "flex", "none"]} justifyContent="end" paddingRight="8px">
        <Button
          variant="unstyled"
          onClick={onOpenMobileMenu}
          display="flex"
          justifyContent="end"
        >
          <MobileMenuIcon />
        </Button>
        <MobileMenuDrawer
          isOpen={isOpenMobileMenu}
          onClose={onCloseMobileMenu}
        />
      </Box>
      <Box
        mt={["10", "16", "20"]}
        textAlign={"center"}
        display={"flex"}
        flexDirection={"column"}
        gap={"4"}
        padding="0 12px"
      >
        <Text color={headingColor} fontSize={["36px", "36px", "49px"]} fontWeight={700}>
          AI Assistants made affordable
        </Text>
        <Text color={subHeadingColor} fontSize={"20px"}>
          Pricing Plans for every budget
        </Text>
      </Box>
      <Box mt={["6", "8", "16"]} display={"flex"} flexDirection={"column"} gap={"5"}>
        <Text
          textAlign={"center"}
          color={headingColor}
          fontSize={["28px", "28px", "31px"]}
          fontWeight={700}
        >

          Choose plan
        </Text>
        <Flex justifyContent={"center"}>
          <RadioGroup
            value={planDuration}
            onChange={(nextValue: PlanDuration) => {
              setPlanDuration(nextValue);
            }}
          >
            <Stack direction={["column", "column", "row"]} gap={"4"}>
              <Radio
                value="yearly"
                _dark={{
                  color: "neutral.10",
                  bg: planDuration === "yearly" ? "primary.50" : undefined,
                  borderColor: planDuration === "yearly" ? "transparent" : undefined
                }}
              >
                <Text
                  color={planDuration === "yearly" ? headingColor : subHeadingColor}
                  fontSize={"13px"}
                  fontWeight={planDuration === "yearly" ? "500" : "400"}
                >
                  Yearly (-20%)
                </Text>
              </Radio>
              <Radio
                value="monthly"
                _dark={{
                  color: "neutral.10",
                  bg: planDuration === "monthly" ? "primary.50" : undefined,
                  borderColor: planDuration === "monthly" ? "transparent" : undefined
                }}
              >
                <Text
                  color={planDuration === "monthly" ? headingColor : subHeadingColor}
                  fontSize={"13px"}
                  fontWeight={planDuration === "monthly" ? "500" : "400"}
                >
                  Monthly
                </Text>
              </Radio>
            </Stack>
          </RadioGroup>
        </Flex>
      </Box>

      {renderPricingCards()}
      <CoreFeatures />
      <SubscriptionFAQ />
    </Box>
      <UpgradeConfirmationModal
        isOpen={isOpenUpgradeModal}
        onClose={onCloseUpgradeModal}
        onConfirm={onUpgradeConfirm}
        confirmButtonProps={{ isDisabled: isLoading, isLoading: isLoading }}
      />
    </>
  );
};

export default Subscriptions;
