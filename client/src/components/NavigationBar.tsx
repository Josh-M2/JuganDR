import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import logo from "./../assets/Jugan-logo.png";
import userlogo from "./../assets/user.svg";
import { PopoverGroup } from "@headlessui/react";
import Logout from "./Logout";
import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  Tooltip,
} from "@chakra-ui/react";
import axios from "axios";
import NotificationBar from "./NotificationBar";

interface navProps {
  allDataIncoming?: any[];
}

const NavigationBar: React.FC<navProps> = ({ allDataIncoming }) => {
  useEffect(() => {
    if (allDataIncoming) {
      console.log("navProps", allDataIncoming);
    }
  }, [allDataIncoming]);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminDashboard = location.pathname === "/Admin%20Dashboard";
  const isDocuments = location.pathname === "/Selection%20of%20Documents";
  const [isModalOpen5, setIsModalOpen5] = useState(false);
  const openModalAlert5 = () => setIsModalOpen5(true);
  const closeModalAlert5 = () => setIsModalOpen5(false);

  const handleLogout = async () => {
    try {
      try {
        await axios.post(
          `${process.env.REACT_APP_SERVER_ACCESS}logout`,
          {},
          {
            withCredentials: true, // Send cookies
          }
        );
      } catch (error: any) {
        console.log("Logout failed");
        // throw new Error("Logout failed");
      }
      localStorage.removeItem("isAuthenticated"); // Remove auth flag
      localStorage.removeItem("BearerToken");
      localStorage.removeItem("Email");
      navigate("/Sign in for Admin");
    } catch (error) {
      console.error("Logout failed");
    }
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur-lg top-0 z-50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
        <nav
          aria-label="Global"
          className="mx-auto flex max-w-7xl items-center justify-between p-4  lg:px-8 sticky"
        >
          <div className="flex lg:flex-1">
            <div className="flex flex-row gap-3 -m-1.5 h-[70px] items-center">
              <div>
                <a href="/" className="p-1.5">
                  <img src={logo} alt="logo" className="w-167px w-[64px]" />
                </a>
              </div>

              <div>
                <h1 className="text-xl font-semibold">Jugan DRMS</h1>
              </div>
            </div>
          </div>
          <div className="flex gap-x-8 align-center h-[64px]">
            <a
              href="/Admin Dashboard"
              className={`relative text-black px-2 py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-900 after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left hover:bg-blue-100 hover:bg-opacity-50 font-semibold pt-5 px-4 ${
                isAdminDashboard
                  ? "after:scale-x-100 bg-blue-100 bg-opacity-50"
                  : "after:scale-x-0"
              }`}
            >
              Dashboard
            </a>
            <a
              href="/Selection of Documents"
              className={`relative text-black px-2 py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-900 after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left hover:bg-blue-100 hover:bg-opacity-50 font-semibold pt-5 px-4 ${
                isDocuments
                  ? "after:scale-x-100 bg-blue-100 bg-opacity-50"
                  : "after:scale-x-0"
              }`}
            >
              Documents
            </a>

            {/* <Menu>
              <Tooltip label="My profile" aria-label="My profile">
                <MenuButton>
                  <div className="rounded-full border p-2">NOT</div>
                </MenuButton>
              </Tooltip>
              <Portal>
                <MenuList zIndex="popover" bg="white" boxShadow="lg">
                  <MenuGroup title="Review requests notifications">
                    <MenuItem
                      onClick={() => navigate("/reset-password")}
                    ></MenuItem>
                  </MenuGroup>
                </MenuList>
              </Portal>
            </Menu> */}

            <Menu>
              <Tooltip label="My profile" aria-label="My profile">
                <MenuButton>
                  <div className="rounded-full border p-2">
                    <img
                      src={userlogo}
                      alt="user"
                      className="w-8 h-8 border border-gray-300"
                    />
                  </div>
                </MenuButton>
              </Tooltip>
              <Portal>
                <MenuList zIndex="popover" bg="white" boxShadow="lg">
                  <MenuGroup title="My account">
                    <MenuItem onClick={() => navigate("/reset-password")}>
                      Change password
                    </MenuItem>
                    <MenuItem onClick={openModalAlert5}>Logout</MenuItem>
                  </MenuGroup>
                  {/* <MenuDivider />
                  <MenuGroup title="Help">
                    <MenuItem>Docs</MenuItem>
                    <MenuItem>FAQ</MenuItem>
                  </MenuGroup> */}
                </MenuList>
              </Portal>
            </Menu>
          </div>
        </nav>
      </header>
      <Modal onClose={closeModalAlert5} isOpen={isModalOpen5} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Logout</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert5} />
          <ModalBody>logout my account?</ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              onClick={closeModalAlert5}
              className="py-2 px-4 border rounded-xl self-center hover:bg-gray-500/20"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold bg-blue-500 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-blue-600"
            >
              Confirm
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NavigationBar;
