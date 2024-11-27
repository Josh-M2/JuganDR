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
import { useNavigate, useSearchParams } from "react-router-dom";
import LoaderRing from "./LoaderRing";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import { supabase } from "../config";
import { ErrorImageGreen } from "./EmailForChangePassword";

const urlEnv = process.env.REACT_APP_SERVER_ACCESS || "";

export const ErrorImage = () => {
  return <img src={errorimage} alt="error" className="w-3 h-3 mr-1.5" />;
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const [errorsMain, setErrorsMain] = useState("");
  const [success, setSuccess] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  // Password validation function
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 12) return "Password must be more than 12 characters";
    return "";
  };

  // Form validation
  const validateForm = () => {
    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError =
      confirmNewPassword.trim() !== "" && newPassword !== confirmNewPassword
        ? "Passwords do not match"
        : "";

    if (newPasswordError || confirmPasswordError) {
      setErrors({
        newPassword: newPasswordError || "",
        confirmNewPassword: confirmPasswordError || "",
      });
    } else {
      setErrors({
        newPassword: "",
        confirmNewPassword: "",
      });
    }

    return !(newPasswordError || confirmPasswordError);
  };

  // Handle form submission
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ newPassword: "", confirmNewPassword: "" });
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("error: ", error.message);
        setErrorsMain(error.message);
      }

      if (data?.user) {
        console.log("data: ", data.user.email);
        setSuccess("Succesfully changed password, Logging in now.");
        const userEmail = data?.user?.email;
        let { error } = await supabase.auth.signOut();

        try {
          const response = await axios.post(
            `${urlEnv}login`,
            { email: userEmail, password: newPassword },
            { withCredentials: true }
          );

          if (response) {
            console.log("login", response);

            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("Email", response.data.user.email);
            window.location.reload();
          }
        } catch (error: any) {
          setErrorsMain(error.response?.data?.error);
          setLoading(false);
          // throw new Error(error.response?.data?.error || "Login failed");
          return;
        }
      }
    } catch (error) {
      console.error("Error changing password: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateForm();
  }, [newPassword, confirmNewPassword]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/Admin Dashboard");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await axios.get(`${urlEnv}initialize`, {
          withCredentials: true,
        });

        if (response.data) {
          console.log("Initialization complete:", response.data);
        }
      } catch (error: any) {
        console.error("error init: ", error);
      }
    };

    init();
  }, []);

  return (
    <>
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
            {errorsMain && (
              <label className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
                <ErrorImage />
                {errorsMain}
              </label>
            )}
            {success && (
              <label className="text-green-600 text-[13px] mt-[5px] flex items-center">
                <ErrorImageGreen />
                {success}
              </label>
            )}
            <form onSubmit={handlePasswordChange}>
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
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                    }}
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
    </>
  );
};

export default ResetPassword;
