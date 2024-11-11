import React, { useEffect, useState } from "react";
import juganlogo from "./../assets/Jugan-logo.png";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import errorimage from "./../assets/circle-exclamation-solid.svg";
import eyeopen from "./../assets/eye-regular.svg";
import eyeclose from "./../assets/eye-slash-regular.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoaderRing from "./LoaderRing";

export const ErrorImage = () => {
  return <img src={errorimage} alt="error" className="w-3 h-3 mr-1.5" />;
};

const EmailForChangePassword: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");

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
    const urlEnv = process.env.REACT_APP_SERVER_ACCES;

    try {
      const response = await axios.post(`${urlEnv}email-change-password`, {
        email,
      });

      if (response.data) {
        console.log(response.data);
      }
    } catch (error) {
      console.error("error email changing password: ", error);
      setLoading(false);
    }

    console.log("submited", email);

    setLoading(false);
  };

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
            Enter email to change password
          </h2>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
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
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {loading ? <LoaderRing /> : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailForChangePassword;
