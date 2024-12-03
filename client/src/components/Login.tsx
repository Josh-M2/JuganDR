import React, { useEffect, useState } from "react";
import juganlogo from "./../assets/Jugan-logo.png";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import errorimage from "./../assets/circle-exclamation-solid.svg";
import eyeopen from "./../assets/eye-regular.svg";
import eyeclose from "./../assets/eye-slash-regular.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoaderRing from "./LoaderRing";
import Footer from "./Footer";
import NavigationBar from "./NavigationBar";

interface LoginForm {
  email: String;
  password: String;
}
export const ErrorImage = () => {
  return <img src={errorimage} alt="error" className="w-3 h-3 mr-1.5" />;
};

const Login: React.FC = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/Admin Dashboard");
    }
  }, []);
  const countdownDuration = 5 * 60;
  const [timeRemaining, setTimeRemaining] = useState<number>(countdownDuration);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const saveEmail = localStorage.getItem("email");
  const savePassword = localStorage.getItem("password");

  const [form, setForm] = useState<LoginForm>({
    email: saveEmail ? saveEmail : "",
    password: savePassword ? savePassword : "",
  });

  const [errors, setErrors] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [errorsMain, setErrorsMain] = useState({
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateEmail = (email: any) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return "Email address is required";
    }

    if (!re.test(email)) {
      return "Invalid Email Address";
    }

    return "";
  };

  const validatePassword = (name: any) => {
    const re = /^[A-Za-z\s'-.]+$/;

    if (!name) {
      return "Password is required";
    }

    return "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({
      email: "",
      password: "",
    });
    setErrorsMain({ message: "" });

    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    if (emailError || emailError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      setLoading(false);
    } else {
      setErrors({
        email: "",
        password: "",
      });

      try {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_SERVER_ACCESS}login`,
            { email: form.email, password: form.password, rememberMe },
            { withCredentials: true }
          );
          if (response) {
            console.log("login", response);

            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("Email", response.data.user.email);
          }
        } catch (error: any) {
          setErrorsMain({
            message: error.response?.data?.error,
          });

          if (error.response?.data?.errorAttempt) {
            setErrorsMain({
              message: error.response?.data?.errorAttempt,
            });
            setTimeRemaining(countdownDuration);
            setIsCountingDown(true);
            const endTime = Date.now() + countdownDuration * 1000;
            localStorage.setItem("countdownEndTime", endTime.toString());
            localStorage.setItem(
              "errorMain",
              error.response?.data?.errorAttempt
            );
          }
          setLoading(false);
          // throw new Error(error.response?.data?.error || "Login failed");
          return;
        }

        // if (rememberMe) {
        //   localStorage.setItem("email", String(form.email));
        //   localStorage.setItem("password", String(form.password));
        // } else {
        //   localStorage.removeItem("email");
        //   localStorage.removeItem("password");
        // }

        console.log("Login successful");
        navigate("/Admin Dashboard");
      } catch (err) {
        console.error("errorshit", err);
        return;
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!form.email) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
    } else {
      const emailError = validateEmail(form.email);
      if (emailError) {
        setErrors((prevErrors) => ({ ...prevErrors, email: emailError }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
      }
    }

    if (!form.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
    } else {
      const passwordError = validatePassword(form.password);
      if (passwordError) {
        setErrors((prevErrors) => ({ ...prevErrors, password: passwordError }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
      }
    }
  }, [form.email, form.password]);

  useEffect(() => {
    if (isCountingDown && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining <= 0) {
      setIsCountingDown(false);
      setErrorsMain({ message: "" });
      localStorage.removeItem("countdownEndTime");
      localStorage.removeItem("errorMain");
    }
  }, [isCountingDown, timeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  useEffect(() => {
    const savedEndTime = localStorage.getItem("countdownEndTime");
    const savedErrorMain = localStorage.getItem("errorMain") || "";
    if (savedEndTime) {
      const timeLeft = Math.floor((Number(savedEndTime) - Date.now()) / 1000);
      if (timeLeft > 0) {
        setTimeRemaining(timeLeft);
        setErrorsMain({ message: savedErrorMain });
        setIsCountingDown(true);
      } else {
        localStorage.removeItem("countdownEndTime");
        localStorage.removeItem("errorMain");
      }
    }
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
              Sign in to admin's account
            </h2>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handleLogin}>
              {errorsMain.message && (
                <label className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
                  <ErrorImage />
                  {errorsMain.message}
                </label>
              )}
              {isCountingDown && (
                <div className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
                  Countdown: {minutes}:{seconds < 10 ? "0" : ""}
                  {seconds}
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="username"
                    value={String(form.email)}
                    onChange={handleChange}
                    className={`px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 border ${
                      errors.email || errorsMain.message
                        ? "!border-red-500 !border"
                        : "border-gray-300"
                    } focus:outline-none`}
                  />
                  {errors.email && (
                    <label className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
                      <ErrorImage />
                      {errors.email}
                    </label>
                  )}
                </div>
              </div>

              <div className="mt-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <div className="text-sm">
                    <a
                      href="/email-reset-password"
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                      tabIndex={-1}
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div className="mt-2 relative flex flex-col">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={String(form.password)}
                    onChange={handleChange}
                    className={`px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 border ${
                      errors.password || errorsMain.message
                        ? "!border-red-500 !border"
                        : "border-gray-300"
                    } focus:outline-none pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    tabIndex={-1}
                  >
                    <img
                      src={showPassword ? eyeopen : eyeclose}
                      alt="toggle visibility"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
                {errors.password && (
                  <label className="text-[rgb(218,44,44)] text-[13px] mt-[5px] flex items-center">
                    <ErrorImage />
                    {errors.password}
                  </label>
                )}
              </div>

              <div className="mt-3">
                <button
                  type="submit"
                  disabled={loading || isCountingDown}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {loading ? <LoaderRing /> : "Sign in"}
                </button>
              </div>
            </form>
            <Checkbox
              className="mt-3 text-center text-sm text-gray-500"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)} // Update the state when checkbox changes
              tabIndex={-1}
            >
              Stay me logged in for 7 days
            </Checkbox>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
