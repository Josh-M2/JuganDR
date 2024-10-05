import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import errorimage from "src/assets/circle-exclamation-solid.svg";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

interface IndigencyForm {
  form: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  ext_name: string;
  age: string;
  mobile_num: string;
  // purpose: string;
  // purpose_for: string;
  // school: string;
  street: string;
  province: string;
  barangay: string;
  city: string;
}

export const ErrorImage = () => {
  return <img src={errorimage} alt="error" className="h-3 w-3 mr-1" />;
};

const FillUpIndigency: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [form, setForm] = useState<IndigencyForm>(() => {
    const savedForm = localStorage.getItem("indigencyForm");
    return savedForm
      ? JSON.parse(savedForm)
      : {
          form: "indigency",
          first_name: "",
          middle_name: "",
          last_name: "",
          ext_name: "",
          age: "",
          mobile_num: "",
          // purpose: "",
          // purpose_for: "",
          // school: "",
          street: "",
          barangay: "",
          province: "",
          city: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("indigencyForm", JSON.stringify(form));
  }, [form]);

  const [error, setError] = useState<IndigencyForm>({
    form: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    ext_name: "",
    age: "",
    mobile_num: "",
    // purpose: "",
    // purpose_for: "",
    // school: "",
    street: "",
    barangay: "",
    province: "",
    city: "",
  });

  const clearFormData = () => {
    localStorage.removeItem("indigencyForm");
    setForm({
      form: "indigency",
      first_name: "",
      middle_name: "",
      last_name: "",
      ext_name: "",
      age: "",
      mobile_num: "",
      // purpose: "",
      // purpose_for: "",
      // school: "",
      street: "",
      barangay: "",
      province: "",
      city: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleButtonClickedBack = () => {
    window.history.back();
  };

  const validatefirst_name = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const test = nameRegex.test(name);
    if (!name) {
      return "Must fill this field";
    } else if (!test) {
      return "Invalid name";
    }
  };
  const validatemiddle_name = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const test = nameRegex.test(name);
    if (!name) {
      return "Must fill this field";
    } else if (!test) {
      return "Invalid middle name";
    }
  };
  const validatelast_name = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const test = nameRegex.test(name);
    if (!name) {
      return "Must fill this field";
    } else if (!test) {
      return "Invalid last name";
    }
  };
  const validateage = (name: string) => {
    if (!name) {
      return "Must fill this field";
    }
    const age = Number(name);
    if (age <= 17) {
      return "Minors are not eligable to request a document";
    } else if (age > 120) {
      return "Invalid age";
    }
  };

  const validatemobile_num = (name: string) => {
    if (!name) {
      return "Must fill this field";
    }
    name = name.trim();
    if (name.length >= 11) {
      return "Invalid mobile_num number";
    } else if (name.length <= 9) {
      return "Invalid mobile_num number";
    }
  };

  // const validatepurpose = (name: string) => {
  //   const nameRegex = /^[a-zA-Z\s]+$/;
  //   const test = nameRegex.test(name);

  //   if (!test) {
  //     return "Invalid last name";
  //   }
  // };

  const validateschool = (name: string) => {
    const nameRegex = /^[a-zA-Z\s-]+$/;
    const test = nameRegex.test(name);
    if (!name) {
      return "Must fill this field";
    } else if (!test) {
      return "Invalid School";
    }
  };

  const validatestreet = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const test = nameRegex.test(name);
    if (!name) {
      return "Must fill this field";
    } else if (!test) {
      return "Invalid Street";
    }
  };

  const validateprovince = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const test = nameRegex.test(name);
    if (!name) {
      return "Must fill this field";
    } else if (!test) {
      return "Invalid province";
    }
  };

  const validatebarangay = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const test = nameRegex.test(name);
    if (!name) {
      return "Must fill this field";
    } else if (!test) {
      return "Invalid barangay";
    }
  };
  const validatecity = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const test = nameRegex.test(name);
    if (!name) {
      return "Must fill this field";
    } else if (!test) {
      return "Invalid City";
    }
  };

  const handleConfirm = () => {
    const first_nameError = validatefirst_name(form.first_name);
    const middle_nameError = validatemiddle_name(form.middle_name);
    const last_nameError = validatelast_name(form.last_name);
    const ageError = validateage(form.age);
    const mobile_numError = validatemobile_num(form.mobile_num);
    // const purposeError = validatepurpose(form.purpose);
    // const schoolError = validateschool(form.school);
    const streetError = validatestreet(form.street);
    const provinceError = validateprovince(form.province);
    const barangayError = validatebarangay(form.barangay);
    const cityError = validatecity(form.barangay);

    if (
      first_nameError ||
      middle_nameError ||
      last_nameError ||
      ageError ||
      mobile_numError ||
      // schoolError ||
      streetError ||
      provinceError ||
      barangayError
    ) {
      setError({
        form: "",
        first_name: first_nameError || "",
        middle_name: middle_nameError || "",
        last_name: last_nameError || "",
        ext_name: "",
        age: ageError || "",
        mobile_num: mobile_numError || "",
        // purpose: "",
        // purpose_for: "",
        // school: schoolError || "",
        street: streetError || "",
        province: provinceError || "",
        barangay: barangayError || "",
        city: cityError || "",
      });
      return false;
    } else {
      setError({
        form: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        ext_name: "",
        age: "",
        mobile_num: "",
        // purpose: "",
        // purpose_for: "",
        // school: "",
        street: "",
        province: "",
        barangay: "",
        city: "",
      });

      return true;
    }
  };

  const handleSubmit = async () => {
    // console.log("clicke!");
    // e.preventDefault();

    const urlEnv = process.env.REACT_APP_SERVER_ACCESS + "incoming_request";
    console.log("urlEnv", urlEnv);
    try {
      const response = await axios.post(urlEnv, form);
      console.log("response", response);
      if (response.data) {
        onClose();
        // clearFormData();
        navigate("/");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      // Optionally handle the error, show a message, etc.
    }
  };

  return (
    <div className="flex h-dvh justify-center p-2">
      <form className="w-5/6" onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-10 text-gray-900 mt-4 mb-4">
              Barangay Indigency
            </h2>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Personal Information
            </h2>
            {/* <p className="mt-1 text-sm leading-6 text-gray-600">
              Use a permanent address where you can receive mail.
            </p> */}

            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  First name
                </label>
                <div className="mt-2">
                  <input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    type="text"
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.first_name ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.first_name && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.first_name}
                    </label>
                  )}
                </div>
              </div>{" "}
              <div className="sm:col-span-3">
                <label
                  htmlFor="middle_name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Middle name
                </label>
                <div className="mt-2">
                  <input
                    id="middle_name"
                    name="middle_name"
                    value={form.middle_name}
                    onChange={handleChange}
                    type="text"
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.middle_name ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.middle_name && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.middle_name}
                    </label>
                  )}
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    type="text"
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.last_name ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.last_name && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.last_name}
                    </label>
                  )}
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="ext_name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Ext. name
                </label>
                <div className="mt-2">
                  <input
                    id="ext_name"
                    name="ext_name"
                    value={form.ext_name}
                    onChange={handleChange}
                    type="text"
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.ext_name ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.ext_name && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.ext_name}
                    </label>
                  )}
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="age"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Age
                </label>
                <div className="mt-2">
                  <input
                    id="age"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    type="number"
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.age ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.age && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.age}
                    </label>
                  )}
                </div>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="mobile_num"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  mobile_num #
                </label>
                <div className="mt-2">
                  <input
                    id="mobile_num"
                    name="mobile_num"
                    value={form.mobile_num}
                    onChange={handleChange}
                    type="text"
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.mobile_num ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.mobile_num && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.mobile_num}
                    </label>
                  )}
                </div>
              </div>
              {/* here paste 1 */}
              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="street"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Purok / Street
                </label>
                <div className="mt-2">
                  <input
                    id="street"
                    name="street"
                    type="text"
                    value={form.street}
                    onChange={handleChange}
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.street ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.street && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.street}
                    </label>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="barangay"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Barangay
                </label>
                <div className="mt-2">
                  <input
                    id="barangay"
                    name="barangay"
                    type="text"
                    value={form.barangay}
                    onChange={handleChange}
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.barangay ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.barangay && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.barangay}
                    </label>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="province"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  State / Province
                </label>
                <div className="mt-2">
                  <input
                    id="province"
                    name="province"
                    type="text"
                    value={form.province}
                    onChange={handleChange}
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.province ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.province && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.province}
                    </label>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  City
                </label>
                <div className="mt-2">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      error.city ? "border-2 border-rose-600" : ""
                    }`}
                  />
                  {error.city && (
                    <label className="flex items-center mt-1 text-rose-600">
                      <ErrorImage />
                      {error.city}
                    </label>
                  )}
                </div>
                <input
                  id="form"
                  name="form"
                  type="text"
                  value="indigency"
                  readOnly
                  className={`hidden p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 `}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pb-8 flex items-center justify-end gap-x-6 ">
          <button
            type="button"
            onClick={handleButtonClickedBack}
            className="text-sm font-semibold leading-6 text-gray-900 py-2 px-4 rounded"
          >
            Back
          </button>

          <Button
            onClick={() => {
              const confirm = handleConfirm();
              confirm && onOpen();
            }}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Confirm
          </Button>
          <Button
            onClick={clearFormData}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            clear(debug onle)
          </Button>
        </div>
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent
            style={{
              marginLeft: "0.75rem",
              marginRight: "0.75rem",
            }}
          >
            <ModalHeader>Review</ModalHeader>
            <ModalCloseButton />
            <ModalBody>Please ensure the informations are correct.</ModalBody>
            <ModalFooter className="gap-x-4">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold leading-6 text-gray-900 py-2 px-4 rounded"
              >
                Review
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  const examplePromise = handleSubmit();
                  // onClose();

                  toast.promise(examplePromise, {
                    success: {
                      title: "Sent",
                      description: "Document request sent",
                    },
                    error: {
                      title: "rejected",
                      description: "Something wrong",
                    },
                    loading: {
                      title: "Preparing",
                      description: "Please wait",
                    },
                  });
                }}
                className="text-sm font-semibold leading-6 text-gray-900 py-2 px-4 rounded"
              >
                Submit
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </form>
    </div>
  );
};

export default FillUpIndigency;
