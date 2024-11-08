import { Box, Grid, GridItem, Stack,Flex,Text,Tooltip, } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import PageContainer from "../components/PageContainer";
import Banner from "../components/Banner";
import { Button, useDisclosure } from "@chakra-ui/react";
import NotificationModal from "../components/Notifications";
import Dashboardsummary from "../components/Dashboard/Dashboardsummary";
import Datasource from "../components/Dashboard/Datasource";
import TwitterTimeline from "../components/Dashboard/Twitterwidget";
import Recentactivity from "../components/Dashboard/Recentactivity";
import Insightsummary from "../components/Dashboard/Insightsummary";
import UserUsage from "src/components/Dashboard/UserUsage";

const Dashboard = () => {

  return (
    <PageContainer 
        title={
            <Flex alignItems="center">
            <Text mr={2}>Dashboard</Text>
            <Tooltip label="Knowlee Summary: 24-hour updates based on your sources, Data Sources Chart to get an overall overview, Social Announcements, Quick Access Buttons for Notifications, Edit Profile, Settings, and a glimpse into Knowlee's Recent Activities." fontSize="sm">
                <span>
                <InfoIcon boxSize="16px" />
                </span>
            </Tooltip>
            </Flex>
        }
        >
      <Box
        className="scroll-hover"
        overflow={"auto"}
        // height={'85vh'}
        maxHeight="100%"
      >
        {/*<Banner />*/}
        <Grid templateColumns='repeat(2, 1fr)' gap={4} marginTop={'15px'} className="full-width-desktop">
          <GridItem w='100%' display="flex">
            <UserUsage />
          </GridItem>
          <GridItem w='100%' display="flex">
            <Datasource />
          </GridItem>
        </Grid>

        <Grid templateColumns='repeat(2, 1fr)' gap={4} marginTop={'15px'} className="full-width-mobile">
          <GridItem w='100%' display="flex">
            <TwitterTimeline />
          </GridItem>
          {/* <GridItem w='100%' display="flex">
             <Insightsummary />
          </GridItem> */}
          <GridItem w='100%' display="flex">
            <Dashboardsummary />
          </GridItem>
        </Grid>

        {/* <Stack direction={{ lg: "row", md: "column" }} paddingTop={'15px'} spacing={4}>
          <Dashboardsummary />
          <Datasource />
        </Stack>
        <Stack direction='row' paddingTop={'15px'} spacing={4}>
           <TwitterTimeline />
          <Insightsummary />
          <Recentactivity />
        </Stack> */}
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
