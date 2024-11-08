import {
  Box,
  Center,
  Image,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserData } from "../../api/queries/index";
import { Link } from "react-router-dom";
import SettingsIcon from "src/Icons/SettingsIcon";
import NotificationIcon from "../Dashboard/Icons/NotificationIcon";
import EditIcon from "../Dashboard/Icons/EditIcon";
import { theme } from "src/theme";
import NotificationModal from "../Notifications";
import { useUserNotifications } from "../../api/queries";
import { Notification } from "src/utils/types";


const icon = `/images/waving_hand.png`;

const dashboardImage = "/images/dashboard.png";
const Banner = () => {
  const {
    user: userAuth0Data,
    isLoading: isAuthLoading,
  } = useAuth0();
  const { data: userDBData, isLoading: isDbDataLoading } = useUserData();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const numOfArticle = 10;
  const numOfInsights = 3;

  const getUserDisplayedName = () => {
    // Add loading skeleton
    if (isAuthLoading || isDbDataLoading) return ".....";
    let name = userDBData?.username || userAuth0Data?.name || "User";
    let message = "Hello " + name;
    return message;
  };

  const articles = () => (
    <Link to={"/knowledge-sources"}>
      <u>{numOfArticle} new articles</u>
    </Link>
  );
  const insights = () => (
    <Link to={"/knowledge-sources"}>
      <u>{numOfInsights} new insights</u>
    </Link>
  );

  const handleSettingsPressed = () => {
    <Link to={"/settings"} />;
  };

  const { data, isLoading, isError } = useUserNotifications();
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "This is an example of notification",
      message: "You can read the full message here.",
      url: "https://app.knowlee.ai/knowledge-sources",
      isViewed: false,
      createdAt: new Date().toString(),
      userId: "",
    },
  ];

  const getNotifications = () => (data?.length ? data : mockNotifications);

  const notifications = getNotifications();

  // Check if all notifications are viewed
  const allNotificationsViewed = notifications.every(notification => notification.isViewed);
  const unreadNotificationColor = "#FFAB3F";
  const readNotificationColor = theme.colors.neutral[60]; // or any other color you want

  return (
    <Box
      w={"100%"}
      minHeight="180px"
      bg="black"
      borderRadius="10px"
      p="32px"
      bgImage={dashboardImage}
      backgroundPosition={"right"}
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
    >
      <NotificationModal isOpen={isOpen} onClose={onClose} />
      <Box display={"flex"} justifyContent={"flex-end"}>
        <Box
          boxSize={8}
          minWidth={8}
          borderRadius={5}
          bgColor={theme.colors.neutral[60]}
          position={"relative"}
        >
          <Box
            boxSize={"5px"}
            minWidth={"5px"}
            borderRadius={"2px"}
            bgColor={allNotificationsViewed ? readNotificationColor : unreadNotificationColor}
            position={"absolute"}
            right={"3px"}
            top={"3px"}
          />
          <Center h={8} color="white" onClick={onOpen}>
            <NotificationIcon fill={"white"} />
          </Center>
        </Box>
        <Box
          boxSize={8}
          minWidth={8}
          borderRadius={5}
          bgColor={theme.colors.neutral[60]}
          marginLeft={5}
        >
          <Link to={"/settings/profile"}>
            <Center h={8} color="white">
              <EditIcon fill={"white"} />
            </Center>
          </Link>
        </Box>

        <Box
          boxSize={8}
          minWidth={8}
          borderRadius={5}
          marginLeft={5}
          bgColor={theme.colors.neutral[60]}
          onClick={handleSettingsPressed}
        >
          <Link to={"/settings/notifications"}>
            <Center h={8} color="white">
              <SettingsIcon pathFill="white" />
            </Center>
          </Link>
        </Box>
      </Box>
      <Box display="flex" alignItems="center">
        <Text fontSize="31px" lineHeight="35px" color="white">
          {getUserDisplayedName()}
        </Text>
        <Image src={icon} ml={2} boxSize="24px" />
      </Box>
      <Text fontSize="16px" lineHeight="30px" fontWeight="400"  color="white">
      Knowlee is continuously processing new articles to bring you fresh insights.
      </Text>
    </Box>
  );
};

export default Banner;
