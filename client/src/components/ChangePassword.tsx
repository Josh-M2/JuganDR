import React, { useEffect, useState } from "react";
import juganlogo from "./../assets/Jugan-logo.png";
import {
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import errorimage from "./../assets/circle-exclamation-solid.svg";
import eyeopen from "./../assets/eye-regular.svg";
import eyeclose from "./../assets/eye-slash-regular.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoaderRing from "./LoaderRing";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer";

export const ErrorImage = () => {
  return <img src={errorimage} alt="error" className="w-3 h-3 mr-1.5" />;
};

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  // State variables for password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Error state for validation messages
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const openModalAlert1 = () => setIsModalOpen1(true);
  const closeModalAlert1 = async () => {
    setIsModalOpen1(false);
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
      navigate("/Sign in for Admin");
    } catch (error) {
      console.error("Logout failed");
    }
  };

  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const openModalAlert2 = () => setIsModalOpen2(true);
  const closeModalAlert2 = () => {
    setIsModalOpen2(false);
    navigate("/Admin Dashboard");
  };
  // Password validation function
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 12) return "Password must be more than 12 characters";
    return "";
  };

  // Form validation
  const validateForm = () => {
    const currentPasswordError = validatePassword(currentPassword);
    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError =
      newPassword !== confirmNewPassword ? "Passwords do not match" : "";

    setErrors({
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      confirmNewPassword: confirmPasswordError,
    });

    return !(currentPasswordError || newPasswordError || confirmPasswordError);
  };

  // Handle form submission
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    if (!validateForm()) return;

    setLoading(true);

    const urlEnv = process.env.REACT_APP_SERVER_ACCESS;
    const userEmail = localStorage.getItem("Email");
    try {
      const response = await axios.post(
        `${urlEnv}change-password`,
        {
          email: userEmail,
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
      );
      if (!response.data) {
        openModalAlert1();
      } else if (response.data.message === "invalid_credentials") {
        setErrors((prevData) => ({
          ...prevData,
          currentPassword: "Wrong current password",
        }));
      } else if (response.data.message === "Succesfull") {
        openModalAlert2();
      }

      // Navigate to a different page if needed or display a success message
    } catch (error) {
      console.error("Error changing password: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/Sign in for Admin");
    }
  }, []);

  return (
    <>
      <NavigationBar />
      <div className="h-dvh">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Barangay Jugan"
              src={juganlogo}
              className="mx-auto h-40 w-auto"
            />
            <h2 className="mt-3 mb-3 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Change Password
            </h2>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handlePasswordChange}>
              {/* Current Password */}
              <div className="mt-1">
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Current Password
                </label>
                <div className="mt-2 relative flex flex-col">
                  <input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 border-gray-300 focus:outline-none ${
                      errors.currentPassword
                        ? "!border-red-500 !border"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.currentPassword && (
                    <label className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
                      <ErrorImage />
                      {errors.currentPassword}
                    </label>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="mt-4">
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  New Password
                </label>
                <div className="mt-2 relative flex flex-col">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 border-gray-300 focus:outline-none ${
                      errors.newPassword
                        ? "!border-red-500 !border"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.newPassword && (
                    <label className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
                      <ErrorImage />
                      {errors.newPassword}
                    </label>
                  )}
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="mt-4">
                <label
                  htmlFor="confirm-new-password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Confirm New Password
                </label>
                <div className="mt-2 relative flex flex-col">
                  <input
                    id="confirm-new-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 border-gray-300 focus:outline-none ${
                      errors.confirmNewPassword
                        ? "!border-red-500 !border"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.confirmNewPassword && (
                    <label className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
                      <ErrorImage />
                      {errors.confirmNewPassword}
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {loading ? <LoaderRing /> : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />

      {/* session expired or autologout alert */}
      <Modal onClose={closeModalAlert1} isOpen={isModalOpen1} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Session Expired</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert1} />
          <ModalBody>Please login again</ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              onClick={closeModalAlert1}
              className="text-sm font-semibold bg-blue-500 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-blue-600"
            >
              Confirm
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal onClose={closeModalAlert2} isOpen={isModalOpen2} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Successful</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert2} />
          <ModalBody>Password Successfully changed.</ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              onClick={closeModalAlert2}
              className="text-sm font-semibold bg-blue-500 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-blue-600"
            >
              OK
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChangePassword;
