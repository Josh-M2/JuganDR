import React, { useEffect, useState } from "react";
import juganlogo from "./../assets/Jugan-logo.png";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import errorimage from "./../assets/circle-exclamation-solid.svg";
import errorimageGreen from "./../assets/circle-exclamation-solid-green.svg";
import eyeopen from "./../assets/eye-regular.svg";
import eyeclose from "./../assets/eye-slash-regular.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoaderRing from "./LoaderRing";
import { supabase } from "../config";
import { error } from "console";

export const ErrorImage = () => {
  return <img src={errorimage} alt="error" className="w-3 h-3 mr-1.5" />;
};

export const ErrorImageGreen = () => {
  return <img src={errorimageGreen} alt="error" className="w-3 h-3 mr-1.5" />;
};

const EmailForChangePassword: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");

  const countdownDuration = 1 * 60;
  const [timeRemaining, setTimeRemaining] = useState<number>(countdownDuration);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [timeError, setTimeError] = useState("");

  useEffect(() => {
    if (isCountingDown && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining <= 0) {
      setIsCountingDown(false);
      setTimeError("");
      localStorage.removeItem("countdownEndTimeResendEmail");
      localStorage.removeItem("errorMainResendEmail");
    }
  }, [isCountingDown, timeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  useEffect(() => {
    const savedEndTime = localStorage.getItem("countdownEndTimeResendEmail");
    const savederrorMainResendEmail =
      localStorage.getItem("errorMainResendEmail") || "";
    if (savedEndTime) {
      const timeLeft = Math.floor((Number(savedEndTime) - Date.now()) / 1000);
      if (timeLeft > 0) {
        setTimeRemaining(timeLeft);
        setTimeError(savederrorMainResendEmail);
        setIsCountingDown(true);
      } else {
        localStorage.removeItem("countdownEndTimeResendEmail");
        localStorage.removeItem("errorMainResendEmail");
      }
    }
  }, []);

  const validateEmail = (email: string): string => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return "Email address is required";
    }
    if (!re.test(email)) {
      return "Invalid email address";
    }

    return "";
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const emailError = await validateEmail(email);

    if (emailError) {
      setErrors(emailError);
      setLoading(false);
      return;
    }
    const urlEnv = process.env.REACT_APP_SERVER_ACCESS;

    try {
      const response = await axios.post(
        `${urlEnv}email-change-password`,
        {
          email,
        },
        { withCredentials: true }
      );

      if (response?.data?.message) {
        setSuccess(response.data.message);
        setTimeError("Resend email verification link after countdown");
        setTimeRemaining(countdownDuration);
        setIsCountingDown(true);
        const endTime = Date.now() + countdownDuration * 1000;
        localStorage.setItem("countdownEndTimeResendEmail", endTime.toString());
        localStorage.setItem(
          "errorMainResendEmail",
          "Resend email verification link after countdown"
        );
      }
    } catch (error: any) {
      console.error("error email changing password: ", error);
      if (error?.response?.data?.errorAttempt) {
        setErrors(error?.response?.data?.errorAttempt);
      }

      if (error.response?.data?.errorAttempt) {
        setTimeError("Resend email verification link after countdown");
        setTimeRemaining(countdownDuration);
        setIsCountingDown(true);
        const endTime = Date.now() + countdownDuration * 1000;
        localStorage.setItem("countdownEndTimeResendEmail", endTime.toString());
        localStorage.setItem(
          "errorMainResendEmail",
          "Resend email verification link after countdown"
        );
      }
      setLoading(false);
    }

    // console.log("submited", urlEnv);

    setLoading(false);
  };

  // useEffect(() => {
  //   if (success) setErrors("");

  //   if (errors) setSuccess("");
  // }, [success, errors]);

  return (
    <div className="h-dvh">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Barangay Jugan"
            src={juganlogo}
            className="mx-auto h-40 w-auto"
          />
          <h2 className="mt-3 mb-3 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Change password
          </h2>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {errors && (
            <label className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
              <ErrorImage />
              {errors}
            </label>
          )}
          {success && (
            <label className="text-green-600 text-[13px] mt-[5px] flex items-center">
              <ErrorImageGreen />
              {success}
            </label>
          )}
          <form onSubmit={handleChangePassword}>
            <div className="mt-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email
                </label>
              </div>
              <div className="mt-2 relative flex flex-col">
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className={`px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 border ${
                    errors ? "!border-red-500 !border" : "border-gray-300"
                  } focus:outline-none pr-10`}
                />
              </div>
              {errors && (
                <label className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
                  <ErrorImage />
                  {errors}
                </label>
              )}
            </div>

            <div className="mt-3">
              <button
                type="submit"
                disabled={loading || isCountingDown}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {loading ? (
                  <LoaderRing />
                ) : (
                  `Send Verification Link ${
                    isCountingDown
                      ? `in ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
                      : ""
                  }`
                )}
                {/* Countdown:  */}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailForChangePassword;
