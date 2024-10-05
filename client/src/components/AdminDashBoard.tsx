import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logout from "./Logout";
import "../AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, []);

  return (
    <>
      <Logout />
      <Tabs size="lg" variant="enclosed">
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <p>one!</p>
          </TabPanel>
          <TabPanel>
            <p>two!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
export default AdminDashboard;
