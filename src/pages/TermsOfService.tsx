import { Button, Checkbox, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import KnowleeLogoBig from "../Icons/KnowleeLogoBig";
import {
  useUpdateProfileMutation,
  useUpdateUserSettingMutation,
} from "../api/mutations/userIndex";
import { useUserSetting } from "../api/queries";
import { useAuth0 } from "@auth0/auth0-react";
import ReCAPTCHA from "react-google-recaptcha";

const googleReCAPTCHSiteKey = import.meta.env.VITE_APP_GOOGLE_RECAPTCHA_SITE_KEY as string;

const TOS_SECTIONS = {
  TOS: "TOS",
  PP: "PP",
  MARKETING: "MARKETING",
} as const;

type TosSection = (typeof TOS_SECTIONS)[keyof typeof TOS_SECTIONS];

const customScrollbar = {
  "&::-webkit-scrollbar": {
    width: "4px",
    marginLeft: "28px",
  },
  // "&::-webkit-scrollbar-track": {
  //   backgroundColor: "primary.10",
  // },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "primary.50",
    borderRadius: "5px",
  },
};

const TermsOfService: React.FC = () => {
  const { data: userSetting } = useUserSetting();
  const updateProfileMutation = useUpdateProfileMutation();
  const updateSettingMutation = useUpdateUserSettingMutation();

  const { logout } = useAuth0();

  const tosRef = useRef(null);
  const ppRef = useRef(null);
  const marketingRef = useRef(null);

  const [isCaptchaSolved, setIsCaptchaSolved] = useState<boolean>(false);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          switch (entry.target) {
            case tosRef.current:
              setSelectedSection(TOS_SECTIONS.TOS);
              break;
            case ppRef.current:
              setSelectedSection(TOS_SECTIONS.PP);
              break;
            case marketingRef.current:
              setSelectedSection(TOS_SECTIONS.MARKETING);
              break;
            default:
              break;
          }
        }
      });
    };

    const options = {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.5, // at least 50% of the target is visible
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    if (tosRef.current) observer.observe(tosRef.current);
    if (ppRef.current) observer.observe(ppRef.current);
    if (marketingRef.current) observer.observe(marketingRef.current);

    // Cleanup
    return () => {
      if (tosRef.current) observer.unobserve(tosRef.current);
      if (ppRef.current) observer.unobserve(ppRef.current);
      if (marketingRef.current) observer.unobserve(marketingRef.current);
    };
  }, []);

  const [selectedSection, setSelectedSection] = useState<TosSection>(
    TOS_SECTIONS.TOS
  );

  const [hasAcceptedTosPp, setHasAcceptedTosPp] = useState<boolean>(false);
  const [hasAcceptedMktg, setHasAcceptedMktg] = useState<boolean>(false);

  const isSectionViewed = (section: TosSection) => {
    return section === selectedSection;
  };

  const updateUser = () => {
    //console.log("userSetting", userSetting);
    if (!userSetting) {
      // if there are no user settings it means is an old user that didn't open the settings tab in the past
      // with the previously wacky implementation.
      // logout
      void logout({ logoutParams: { returnTo: window.location.origin } });
      return;
    }
    const formData = new FormData();
    formData.append("hasAcceptedTosPp", String(true));
    updateProfileMutation.mutate(formData);

    // update user settings 
    updateSettingMutation.mutate({
      ...userSetting,
      notification: {
        ...userSetting.notification,
        emailSpecialOffersAndPromotions: hasAcceptedMktg,
      },
    });
  };

  const handleSubmit = () => {
    if (!hasAcceptedTosPp) {
      return;
    }
    updateUser();
  };

  function onReCAPTCHAChange(token: string | null) {
    //console.log("Captcha value:", token);
    setIsCaptchaSolved(token !== null); // Set true if token is not null, which indicates captcha is solved
  }

  const isLoading = updateProfileMutation.isLoading;

  return (
    <Flex w="100%" bg="white">
      <Flex
        w="450px"
        boxShadow="8px 0px 15px rgba(0, 0, 0, 0.1)"
        flexDir="column"
        px="40px"
      >
        <Flex
          w="100%"
          mb="50px"
          mt="80px"
          justifyContent="center"
          alignItems="center"
        >
          <KnowleeLogoBig width="90" height="90" />
        </Flex>
        <Text
          py="8px"
          fontSize="18px"
          fontWeight={isSectionViewed(TOS_SECTIONS.TOS) ? "600" : "400"}
          color={
            isSectionViewed(TOS_SECTIONS.TOS) ? "neutral.100" : "neutral.50"
          }
        >
          1 Terms & Conditions
        </Text>
        <Text
          py="8px"
          fontSize="18px"
          fontWeight={isSectionViewed(TOS_SECTIONS.PP) ? "600" : "400"}
          color={
            isSectionViewed(TOS_SECTIONS.PP) ? "neutral.100" : "neutral.50"
          }
        >
          2 Privacy Policy
        </Text>
        {/*<Text
          fontSize="18px"
          py="8px"
          fontWeight={isSectionViewed(TOS_SECTIONS.MARKETING) ? "600" : "400"}
          color={
            isSectionViewed(TOS_SECTIONS.MARKETING)
              ? "neutral.100"
              : "neutral.50"
          }
        >
          3 Marketing Agreement
        </Text>*/}
      </Flex>
      <Flex flexDir="column" w="100%" pl="150px">
        <Flex
          flexDir="column"
          mt="50px"
          mb="50px"
          maxW="750px"
          w="100%"
          minH={0}
          flex="1"
        >
          <Heading color="neutral.100" mb="90px">
            Terms Of Service
          </Heading>
          <Flex
            className="scroll-hover"
            flexDir="column"
            overflowY="auto"
            pr="48px"
            sx={customScrollbar}
          >
            {mockTermsOfService.map((s, index) => (
              <>
                <Text
                  color="neutral.100"
                  fontWeight={600}
                  fontSize="22px"
                  py="18px"
                  ref={
                    index === 0 ? tosRef :
                    index === 1 ? ppRef :
                    marketingRef
                  }
                >
                  {s.title}
                </Text>
                <Text color="neutral.70">
                  {s.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </Text>
              </>
            ))}
          </Flex>

          <Flex flexDir="column" gap="8px" mt="16px">
            <Flex color="white">
              <Text fontWeight="500" color="neutral.100">
                I accept {' '}
                <a href="https://www.knowlee.ai/terms.html" target="_blank" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms & Conditions</a> 
                {' '}and {' '}
                <a href="https://www.knowlee.ai/privacy.html" target="_blank" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy Policy</a>
              </Text>
              <Checkbox
                borderColor="neutral.70"
                ml={2}
                isChecked={hasAcceptedTosPp}
                onChange={() => setHasAcceptedTosPp((prev) => !prev)}
              />
            </Flex>
            <Flex>
              <Text color="neutral.100" fontWeight="300">
                Please keep me posted on Knowlee news, events and offers.              </Text>
              <Checkbox
                borderColor="neutral.70"
                ml={2}
                isChecked={hasAcceptedMktg}
                onChange={() => setHasAcceptedMktg((prev) => !prev)}
              />
            </Flex>
            <ReCAPTCHA
              sitekey={googleReCAPTCHSiteKey}
              onChange={onReCAPTCHAChange}
            />
          </Flex>

          <Flex w="100%" mt="50px" p="8px" gap="8px">
            <Button
              color="white"
              bg="#4386F4"
              borderRadius="50px"
              padding="8px 20px"
              fontSize="16px"
              fontWeight="500"
              _hover={{}}
              _active={{}}
              onClick={handleSubmit}
              w="100%"
              isDisabled={
                isLoading ||
                !hasAcceptedTosPp ||
                updateSettingMutation.isLoading ||
                !isCaptchaSolved  // Disable button if captcha is not solved
              }
              isLoading={isLoading || updateSettingMutation.isLoading}
            >
              Submit
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

const mockTermsOfService = [
  {
    title: "1. Terms of service",
    content: `Thank you for choosing Knowlee!

    These Terms of Use apply when you use the services of Knowlee, Inc. or our affiliates, including our application programming interface, software, tools, developer services, data, documentation, and websites (“Services”). The Terms include our Service Terms, Sharing & Publication Policy, Usage Policies, and other documentation, guidelines, or policies we may provide in writing. By using our Services, you agree to these Terms. Our Privacy Policy explains how we collect and use personal information.
    
    1. Registration and Access
    • You must be at least 13 years old to use Knowlee. If under 18, you need permission from a parent or legal guardian. You represent either yourself or the entity you're authorized to act on behalf of. Accurate information is required for registration. Sharing access outside your organization is prohibited. You are liable for activities under your account.
 
 2. Usage Requirements
    • (a) Service Use: Access is granted non•exclusively as per these Terms. Abide by all applicable laws. All rights in Knowlee remain with us.
    • (b) Feedback: Feedback and suggestions are welcomed. Knowlee has the right to use any feedback without any obligations to you.
    • (c) Restrictions: Do not misuse, reverse engineer, or violate the services in any manner. Adhere to provided guidelines and only use the Services where supported.
    • (d) Third•Party Services: We aren't responsible for third•party products or services you employ.
 
 3. Content
    • (a) Ownership: You own the data you provide ("Input"). Knowlee grants you rights to the output generated ("Output"). Content should not violate laws or these terms.
    • (b) Similarity: Outputs might resemble those given to other users.
    • (c) Improvement via Content: Knowlee uses content for service improvement. Details on opting out are available on request.
    • (d) Accuracy: Knowlee seeks to improve continually. Users should independently verify the accuracy of outputs.
 
 4. Fees and Payments
    • (a) Billing: Abide by listed pricing or as agreed upon. Provide accurate billing information. We can rectify billing errors.
    • (b) Taxes: All taxes associated with the services are your responsibility.
    • (c) Price Alterations: Notice will be provided for any price changes.
    • (d) Billing Issues: Discrepancies should be reported promptly.
    • (e) Free Access: Multiple accounts to exploit free access are prohibited.
 
 5. Confidentiality, Security, and Data Protection
    • (a) Confidentiality: Respect the confidentiality of any non•public information accessed through Knowlee.
    • (b) Security: Ensure safe usage of Knowlee. Report any vulnerabilities.
    • (c) Data Processing: Adhere to data protection laws if processing personal data.
 
 6. Term and Termination
    • (a) Endings: These terms begin on first use and last until termination. Non•compliance might result in termination or suspension.
    • (b) Post•Termination: On termination, cease use and return or destroy confidential information.
 
 7. Liabilities and Warranties
    • (a) Indemnity: Protect us from claims arising from your misuse.
    • (b) Disclaimer: Knowlee is provided "as is". No warranties are guaranteed beyond what's mandated by law.
    • (c) Liability Caps: Liability is capped at either the service fee from the past year or $100, whichever is greater.
    `,
  },
  {
    title: "2. Privacy Policy",
    content: `Privacy Policy for Knowlee

    We at Knowlee, Inc. (along with our partners and subsidiaries, "Knowlee," "we," "us," or "our") prioritize your privacy and are committed to protecting any information we gather from or about you. This Privacy Policy explains our practices regarding Personal Information we collect when you utilize our platforms, tools, and services ("Services"). This policy does not pertain to content we handle on behalf of our business clients; such content is guided by agreements with those specific clients.
    
    For detailed insights on how we gather and use training data to develop our AI models and your choices regarding this, please refer to our designated help center article.
    
    1. Personal Information We Collect
       • Information You Provide: This includes:
         • Account Information: During account creation, we gather details like name, contact data, account passwords, payment methods, and transaction records.
         • User Input: We collect data you input, upload, or give feedback on while using our Services.
         • Communication Info: If you get in touch with us, we collect your contact details and message contents.
         • Social Media Interactions: We maintain profiles on platforms like Instagram, Twitter, etc. Your interactions on these pages may provide us with information you choose to share.
       • Automatically Collected Info: This comprises:
         • Log Data: Information automatically shared by your browser, like IP address, browser type, the date/time of your interaction, and your site activity.
         • Usage Info: Data regarding how you engage with our Services, such as content types, actions, time zones, access timings, device types, and connection data.
         • Device Details: Information about your device, its OS, and browser.
         • Cookies: We utilize cookies to enhance our Services. You can control cookie settings via your browser.
         • Analytics: Tools to help understand how users engage with our Services.
    
    2. Usage of Personal Information
       • For Service provision, analysis, and maintenance.
       • Service improvements and research.
       • Communication with users.
       • New product/service development.
       • Fraud prevention and securing our IT systems.
       • Legal obligations and rights protection.
       • We might aggregate or anonymize Personal Information so it can't identify you. This data helps us improve our Services, research, and share aggregated stats. We don’t attempt to de-anonymize this data unless legally mandated.
       
       Our model improvement may involve using your provided content. Opt-out instructions can be found here.
    
    3. Disclosure of Personal Information
       • Vendors/Service Providers: For business needs, we might share data with third-party service providers like hosting services, IT services, and email tools.
       • Business Transfers: During business transactions or mergers, your data may be shared and transferred to a succeeding entity.
       • Legal Requirements: In legal circumstances, we might disclose your data.
       • Affiliates: Our affiliate entities might access the data, consistent with this Privacy Policy.
    
    4. Your Rights
       • Depending on your jurisdiction, you might have the right to access, rectify, delete, transfer, restrict, or object to our data processing.
       • Exercise your rights via your Knowlee account or contact knowlee.ai@gmail.com.
       
       If our models inaccurately present information about you, reach out to knowlee.ai@gmail.com for corrections. Complete removal might not be feasible technically, but you can request Personal Information removal from our output using this form.
    
    5. Additional U.S. State Disclosures
       • We provide details about Personal Information categories we collect, their purpose, and who they are disclosed to. Review above sections for details.
       • Privacy rights are subject to local laws, and we don’t sell or use your data for targeted advertising. Specific privacy rights can be exercised via knowlee.ai@gmail.com.
       
       Verification may be needed to secure your data. If you can't verify your identity, we can't fulfill your request.
    
    6. Children
       • Knowlee is not designed for children under 13. If you suspect such data collection, contact us at knowlee.ai@gmail.com. Those 13-18 need parental consent.
    
    7. Links to Other Websites
       • We might link external sites not controlled by Knowlee. Their data handling is determined by their respective policies, not ours.
    
    8. Security and Retention
       • We adopt robust measures to protect your data both online and offline. However, online data transfer isn't foolproof.
       • Your data is retained as long as necessary for our Service provision, dispute resolutions, safety, or legal compliance.
    
    If you have any concerns about this Privacy Policy, please contact us at knowlee.ai@gmail.com.
    `,
  }/*,
  {
    title: "3. Marketing",
    content: `
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In diam nibh, condimentum eget massa lacinia, vulputate rutrum odio. Praesent facilisis vulputate neque ac tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc sed turpis consequat, facilisis augue eu, dapibus arcu. Donec vitae cursus purus. Praesent faucibus elit nec lacus consectetur tempus. Vivamus ullamcorper dui eros, vitae molestie ex luctus at. Suspendisse dapibus luctus blandit. Ut interdum ultrices nisl, in faucibus elit rhoncus mattis. Fusce porttitor est mi, non dapibus sem finibus ut. Duis et dictum mi. Suspendisse quis mauris dui. In vitae consectetur ex. Cras in risus quis libero ullamcorper tristique.

    `,
  },*/
];

export default TermsOfService;
