import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";

const Logout: React.FC = () => {
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
      window.location.reload(); // Reload the app to reflect logout state
    } catch (error) {
      console.error("Logout failed");
    }
  };

  return (
    <>
      <button onClick={openModalAlert5}>Logout</button>
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

export default Logout;
