import {
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
  useToast,
  Image,
  Select,
} from "@chakra-ui/react";
import errorimage from "src/assets/circle-exclamation-solid.svg";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import { supabase } from "../config";
import Footer from "./Footer";
import { IndigencyForm } from "./FillUpIndigency";

export const ErrorImage = () => {
  return <img src={errorimage} alt="error" className="h-3 w-3 mr-1" />;
};

const FillUpSeniorCitizenCertificate: React.FC = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [frontIdObject, setFrontIdObject] = useState<File | null>(null);
  const [backIdObject, setBackIdObject] = useState<File | null>(null);
  const [purokCertObject, setPurokCertObject] = useState<File | null>(null);

  const [selectedPurpose, setSelectedPurpose] = useState("Employment");

  const [submitLoading, setSubmitLoading] = useState(false);

  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const openModalAlert3 = () => setIsModalOpen3(true);
  const closeModalAlert3 = () => setIsModalOpen3(false);

  const [isModalOpen4, setIsModalOpen4] = useState(false);
  const openModalAlert4 = () => setIsModalOpen4(true);
  const closeModalAlert4 = () => setIsModalOpen4(false);

  const [isModalOpen5, setIsModalOpen5] = useState(false);
  const openModalAlert5 = () => setIsModalOpen5(true);
  const closeModalAlert5 = () => {
    setIsModalOpen5(false);
    window.location.href = "/";
  };

  const countdownDuration = 1 * 60;
  const [timeRemaining, setTimeRemaining] = useState<number>(countdownDuration);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);

  const [form, setForm] = useState<IndigencyForm>(() => {
    const savedForm = localStorage.getItem("SeniorCitizenCertificateForm");
    return savedForm
      ? JSON.parse(savedForm)
      : {
          document: "Senior Citizen Certificate",
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
          frontID: "",
          backID: "",
        };
  });

  useEffect(() => {
    const { frontID, backID, ...formToSave } = form;
    localStorage.setItem(
      "SeniorCitizenCertificateForm",
      JSON.stringify(formToSave)
    );
  }, [
    form.first_name,
    form.middle_name,
    form.last_name,
    form.age,
    form.mobile_num,
    form.street,
    form.province,
    form.barangay,
    form.city,
    form.ext_name,
    form.document,
  ]);

  const [error, setError] = useState<IndigencyForm>({
    document: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    ext_name: "",
    age: "",
    mobile_num: "",
    purpose: "",
    // purpose_for: "",
    // school: "",
    street: "",
    barangay: "",
    province: "",
    city: "",
    frontID: "",
    backID: "",
    purok_certificate: "",
  });

  const clearFormData = () => {
    localStorage.removeItem("SeniorCitizenCertificateForm");
    setForm({
      document: "Barangay Indigency",
      first_name: "",
      middle_name: "",
      last_name: "",
      ext_name: "",
      age: "",
      mobile_num: "",
      purpose: "",
      // purpose_for: "",
      // school: "",
      street: "",
      barangay: "",
      province: "",
      city: "",
      frontID: "",
      backID: "",
      purok_certificate: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const sanitizedTag = value.replace(/[^a-zA-Z0-9 ]/g, "");
    setForm({ ...form, [name]: sanitizedTag });
  };

  const handleButtonClickedBack = () => {
    clearFormData();
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

  const validatepurpose = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const test = nameRegex.test(name);
    if (!name) {
      return "Must fill this field";
    }
    if (!test) {
      return "Invalid last name";
    }
  };

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

  const validateFrontID = (name: string) => {
    if (!name || !frontIdObject) {
      return "Must fill this field";
    }
  };

  const validateBackID = (name: string) => {
    if (!name || !frontIdObject) {
      return "Must fill this field";
    }
  };

  const validatepurokCert = (name: string) => {
    if (!name || !purokCertObject) {
      return "Must fill this field";
    }
  };

  const handleConfirm = () => {
    setError({
      document: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      ext_name: "",
      age: "",
      mobile_num: "",
      purpose: "",
      // purpose_for: "",
      // school: "",
      street: "",
      barangay: "",
      province: "",
      city: "",
      frontID: "",
      backID: "",
      purok_certificate: "",
    });
    const first_nameError = validatefirst_name(form.first_name);
    const middle_nameError = validatemiddle_name(form.middle_name);
    const last_nameError = validatelast_name(form.last_name);
    const ageError = validateage(form.age);
    const purposeError = validatepurpose(form.purpose);
    // const schoolError = validateschool(form.school);
    const streetError = validatestreet(form.street);
    const provinceError = validateprovince(form.province);
    const barangayError = validatebarangay(form.barangay);
    const cityError = validatecity(form.city);
    let frontIDError = validateFrontID(form.frontID);
    let backIDError = validateBackID(form.backID);
    let purokCertError = validatepurokCert(form.purok_certificate);
    let mobile_numError = validatemobile_num(form.mobile_num);
    if (isAuthenticated) {
      frontIDError = "";
      backIDError = "";
      purokCertError = "";
      mobile_numError = "";
    }

    if (
      first_nameError ||
      middle_nameError ||
      last_nameError ||
      ageError ||
      mobile_numError ||
      purposeError ||
      // schoolError ||
      streetError ||
      provinceError ||
      barangayError ||
      frontIDError ||
      backIDError
    ) {
      setError({
        document: "",
        first_name: first_nameError || "",
        middle_name: middle_nameError || "",
        last_name: last_nameError || "",
        ext_name: "",
        age: ageError || "",
        mobile_num: mobile_numError || "",
        purpose: purposeError || "",
        // purpose_for: "",
        // school: schoolError || "",
        street: streetError || "",
        province: provinceError || "",
        barangay: barangayError || "",
        city: cityError || "",
        frontID: frontIDError || "",
        backID: backIDError || "",
        purok_certificate: purokCertError || "",
      });
      return false;
    } else {
      setError({
        document: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        ext_name: "",
        age: "",
        mobile_num: "",
        purpose: "",
        // purpose_for: "",
        // school: "",
        street: "",
        province: "",
        barangay: "",
        city: "",
        frontID: "",
        backID: "",
        purok_certificate: "",
      });

      return true;
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const urlEnv = process.env.REACT_APP_SERVER_ACCESS;

    const { data, error } = await supabase.storage
      .from("uploads") // Replace with your storage bucket name
      .upload(path, file);

    if (data) {
      console.log("uploadFile", data.path);
      return data;
    }

    if (error) {
      console.error("Error uploading file:", error);
    }

    return null;
  };
  const createTrackingID = async (encodedValue: any) => {
    console.log("createTrackingID", encodedValue);
    // Step 1: Decode the URL-encoded string
    const decodedValue = decodeURIComponent(encodedValue);

    // Step 2: Format it to remove special characters like ":" and "."
    const trackingID = decodedValue.replace(/[-:.TZ]/g, "");

    // Return the cleaned-up tracking ID
    return trackingID;
  };

  const exceeded = localStorage.getItem("exceeded");
  const handleSubmit = async () => {
    if (exceeded !== null) {
      openModalAlert3();
      return Promise.reject(new Error("Exceeded limit"));
    }
    // console.log("clicke!");
    // e.preventDefault();
    setSubmitLoading(true);

    const urlEnv = process.env.REACT_APP_SERVER_ACCESS;

    try {
      const response = await axios.get(`${urlEnv}validate-token`, {
        withCredentials: true,
      });
      if (!response?.data?.is_valid_token) {
        console.log("invalid token");
        onClose();
        openModalAlert5();
        setSubmitLoading(false);
        return Promise.reject(new Error("Invalid Token"));
      }
    } catch (error: any) {
      console.error("error validation token: ", error);
    }

    try {
      let frontIDPath = null;
      let backIDPath = null;
      let purokCert = null;

      // Upload files to Supabase Storage
      if (!exceeded) {
        if (frontIdObject) {
          const frontIDResponse = await uploadFile(
            frontIdObject,
            `uploads/frontID-${Date.now()}.png`
          );
          frontIDPath = frontIDResponse?.path; // Use the path for further processing
        }

        if (backIdObject) {
          const backIDResponse = await uploadFile(
            backIdObject,
            `uploads/backID-${Date.now()}.png`
          );
          backIDPath = backIDResponse?.path; // Use the path for further processing
        }

        if (purokCertObject) {
          const purokCertResponse = await uploadFile(
            purokCertObject,
            `uploads/purokCert-${Date.now()}.png`
          );
          purokCert = purokCertResponse?.path; // Use the path for further processing
        }

        const response = await axios.post(
          `${urlEnv}incoming_request`,
          {
            ...form,
            frontID: frontIDPath,
            backID: backIDPath,
            purok_certificate: purokCert,
            isAuthenticated: isAuthenticated,
          },
          { withCredentials: true }
        );
        console.log("response", response);
        if (response.data) {
          console.log("response.data", response.data.requested_at);
          const trackID = await createTrackingID(response.data.requested_at);
          const track = await axios.post(`${urlEnv}save-tracking-id`, {
            tracking_id: trackID,
            id: response.data.id,
          });

          if (track.data) {
            onClose();
            clearFormData();
            if (isAuthenticated) {
              navigate("/Selection of Documents");
            } else {
              console.log("track_id", track.data.track_id);
              navigate(
                `/Track Document/?success=true&trackid=${track.data.track_id}`
              );
            }
          }

          localStorage.removeItem("exceeded");
        }
      }
    } catch (error: any) {
      console.error("Error submitting form", error);
      if (error.response?.data?.errorAttempt) {
        openModalAlert3();
        onClose();
        const endTime = Date.now() + countdownDuration * 1000;
        localStorage.setItem("exceeded", endTime.toString());
      }
      // Optionally handle the error, show a message, etc.
      setSubmitLoading(false);
      return Promise.reject(error);
    }
    //localStorage.removeItem("BarangayBusinessPermitForm");
  };

  useEffect(() => {
    if (isCountingDown && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining <= 0) {
      setIsCountingDown(false);
      localStorage.removeItem("exceeded");
    }
  }, [isCountingDown, timeRemaining]);

  useEffect(() => {
    const savedEndTime = localStorage.getItem("exceeded");
    if (savedEndTime) {
      const timeLeft = Math.floor((Number(savedEndTime) - Date.now()) / 1000);
      if (timeLeft > 0) {
        setTimeRemaining(timeLeft);
        setIsCountingDown(true);
      } else {
        localStorage.removeItem("exceeded");
      }
    }
  }, []);

  // Handle image selection for the first input
  const handleFrontIDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFrontIdObject(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prevForm) => ({
          ...prevForm,
          frontID: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle back image selection
  const handleBackIDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackIdObject(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prevForm) => ({
          ...prevForm,
          backID: reader.result as string, // Save base64 or URL string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePurokCertificate = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setPurokCertObject(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prevForm) => ({
          ...prevForm,
          purok_certificate: reader.result as string, // Save base64 or URL string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (selectedPurpose !== "Others") {
      setForm((prev) => ({
        ...prev,
        purpose: selectedPurpose,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        purpose: "",
      }));
    }
  }, [selectedPurpose]);

  return (
    <>
      {isAuthenticated ? <NavigationBar /> : ""}
      <div className="flex flex-col h-dvh  p-2">
        <div className="flex justify-center">
          <form className="w-5/6" onSubmit={handleSubmit}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold leading-10 text-gray-900 mt-4 mb-4">
                  Senior Citizen Certificate
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
                      First name <span className="text-rose-600">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="first_name"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        type="text"
                        className={`${
                          error.first_name ? "!border-2 !border-rose-600" : ""
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
                      Middle name <span className="text-rose-600">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="middle_name"
                        name="middle_name"
                        value={form.middle_name}
                        onChange={handleChange}
                        type="text"
                        className={` ${
                          error.middle_name ? "!border-2 !border-rose-600" : ""
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
                      Last name <span className="text-rose-600">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="last_name"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        type="text"
                        className={` ${
                          error.last_name ? "!border-2 !border-rose-600" : ""
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
                      <Input
                        id="ext_name"
                        name="ext_name"
                        value={form.ext_name}
                        onChange={handleChange}
                        type="text"
                        className={` ${
                          error.ext_name ? "!border-2 !border-rose-600" : ""
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
                      Age <span className="text-rose-600">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="age"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        type="number"
                        className={` ${
                          error.age ? "!border-2 !border-rose-600" : ""
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
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="mobile_num"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Mobile number{" "}
                      {isAuthenticated ? (
                        ""
                      ) : (
                        <span className="text-rose-600">*</span>
                      )}
                    </label>
                    <div className="mt-2">
                      <Stack spacing={1}>
                        <InputGroup>
                          <InputLeftAddon>+63</InputLeftAddon>
                          <Input
                            type="tel"
                            placeholder="9123456789"
                            id="mobile_num"
                            name="mobile_num"
                            value={form.mobile_num}
                            onChange={handleChange}
                            className={` ${
                              error.mobile_num
                                ? "!border-2 !border-rose-600"
                                : ""
                            }`}
                          />
                        </InputGroup>
                        <label
                          htmlFor="type"
                          className="text-[15px] text-gray-400"
                        >
                          Reminder: Confirmation of document request will be
                          send to this number
                        </label>
                      </Stack>
                      {error.mobile_num && (
                        <label className="flex items-center mt-1 text-rose-600">
                          <ErrorImage />
                          {error.mobile_num}
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="mobile_num"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Purpose <span className="text-rose-600">*</span>
                    </label>

                    <Select
                      id="purpose"
                      name="purpose"
                      width="auto"
                      onChange={(e) => setSelectedPurpose(e.target.value)}
                      value={selectedPurpose}
                    >
                      <option value="Employment">Employment</option>
                      <option value="Loan">Loan</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Medical">Medical</option>
                      <option value="Others">Others..</option>
                    </Select>
                  </div>
                  {selectedPurpose === "Others" && (
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="mobile_num"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Please specify the purpose{" "}
                        <span className="text-rose-600">*</span>
                      </label>

                      <Input
                        id="purpose"
                        name="purpose"
                        value={form.purpose}
                        onChange={handleChange}
                        type="text"
                        className={` ${
                          error.purpose ? "!border-2 !border-rose-600" : ""
                        }`}
                      />
                      {error.purpose && (
                        <label className="flex items-center mt-1 text-rose-600">
                          <ErrorImage />
                          {error.purpose}
                        </label>
                      )}
                    </div>
                  )}
                  {/* here paste 1 */}
                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="street"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Purok / Street <span className="text-rose-600">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="street"
                        name="street"
                        type="text"
                        value={form.street}
                        onChange={handleChange}
                        className={` ${
                          error.street ? "!border-2 !border-rose-600" : ""
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
                      Barangay <span className="text-rose-600">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="barangay"
                        name="barangay"
                        type="text"
                        value={form.barangay}
                        onChange={handleChange}
                        className={` ${
                          error.barangay ? "!border-2 !border-rose-600" : ""
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
                      State / Province <span className="text-rose-600">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="province"
                        name="province"
                        type="text"
                        value={form.province}
                        onChange={handleChange}
                        className={` ${
                          error.province ? "!border-2 !border-rose-600" : ""
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
                      City <span className="text-rose-600">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={form.city}
                        onChange={handleChange}
                        className={` ${
                          error.city ? "!border-2 !border-rose-600" : ""
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
                      id="document"
                      name="document"
                      type="text"
                      value="Senior Citizen Certificate"
                      readOnly
                      className={`hidden p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 `}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="front"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Front image of valid ID{" "}
                      {isAuthenticated ? (
                        ""
                      ) : (
                        <span className="text-rose-600">*</span>
                      )}
                    </label>
                    <span className="text-sm">
                      Make sure the image is clear and can be read
                    </span>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        name="front"
                        //value={form.frontID}
                        onChange={handleFrontIDChange}
                        className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 ${
                          error.frontID ? "!border-2 !border-rose-600" : ""
                        }`}
                        style={{ padding: "1px 0" }}
                      />
                      {error.frontID && (
                        <label className="flex items-center mt-1 text-rose-600">
                          <ErrorImage />
                          {error.frontID}
                        </label>
                      )}
                      {form.frontID && frontIdObject && (
                        <Image
                          src={form.frontID}
                          alt="First Image Preview"
                          className="rounded-lg shadow-md my-1"
                        />
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="back"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Back image of valid ID{" "}
                      {isAuthenticated ? (
                        ""
                      ) : (
                        <span className="text-rose-600">*</span>
                      )}
                    </label>
                    <span className="text-sm">
                      Make sure the image is clear and can be read
                    </span>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        name="back"
                        //value={form.backID}
                        onChange={handleBackIDChange}
                        className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 ${
                          error.backID ? "!border-2 !border-rose-600" : ""
                        }`}
                        style={{ padding: "1px 0" }}
                      />
                      {error.backID && (
                        <label className="flex items-center mt-1 text-rose-600">
                          <ErrorImage />
                          {error.backID}
                        </label>
                      )}
                      {form.backID && backIdObject && (
                        <Image
                          src={form.backID}
                          alt="Second Image Preview"
                          className="rounded-lg shadow-md my-1"
                        />
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="purokcert"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Purok Certificate{" "}
                      {isAuthenticated ? (
                        ""
                      ) : (
                        <span className="text-rose-600">*</span>
                      )}
                    </label>
                    <span className="text-sm">
                      Make sure the image is clear and can be read
                    </span>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        name="purokcert"
                        onChange={handlePurokCertificate}
                        className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 ${
                          error.purok_certificate
                            ? "!border-2 !border-rose-600"
                            : ""
                        }`}
                        style={{ padding: "1px 0" }}
                      />
                      {error.purok_certificate && (
                        <label className="flex items-center mt-1 text-rose-600">
                          <ErrorImage />
                          {error.purok_certificate}
                        </label>
                      )}
                      {form.purok_certificate && purokCertObject && (
                        <Image
                          src={form.purok_certificate}
                          alt="Second Image Preview"
                          className="rounded-lg shadow-md my-1"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pb-8 flex items-center justify-end gap-x-6 ">
              <button
                type="button"
                onClick={openModalAlert4}
                className="text-sm font-semibold text-gray-900 py-2 px-3 rounded-md border hover:bg-slate-100"
              >
                Back
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  const confirm = handleConfirm();
                  confirm && onOpen();
                }}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Confirm
              </button>
              {/* <Button
              onClick={clearFormData}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              clear(debug onle)
            </Button> */}
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
                <ModalBody>
                  Please ensure the informations are correct.
                </ModalBody>
                <ModalFooter className="gap-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm font-semibold text-gray-900 py-2 px-3 rounded-md border hover:bg-slate-100"
                    disabled={submitLoading}
                  >
                    Review
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    onClick={(e) => {
                      e.preventDefault();
                      const examplePromise = handleSubmit();
                      // onClose();
                      if (exceeded === null) {
                        toast.promise(examplePromise, {
                          success: {
                            title: "Sent",
                            description: "Document request sent",
                          },
                          error: {
                            title: "Rejected",
                            description: "Something went wrong",
                          },
                          loading: {
                            title: "Preparing",
                            description: "Please wait",
                          },
                        });
                      }
                    }}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {submitLoading ? "Submiting" : "Submit"}
                  </button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </form>
        </div>
        <div className="">
          <Footer />
        </div>
      </div>
      <Modal onClose={closeModalAlert3} isOpen={isModalOpen3} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Request limit exceeded</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert3} />
          <ModalBody>Please try again later.</ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              className="px-4 py-2 text-black bg-white text-black rounded-xl border border-gray hover:bg-gray-300 transition-colors duration-300 w-fit cursor-pointer"
              onClick={closeModalAlert3}
            >
              Cancel
            </button>
            <button
              onClick={closeModalAlert3}
              className="text-sm font-semibold bg-indigo-600 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Okay
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal onClose={closeModalAlert4} isOpen={isModalOpen4} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>You haven't sent your request</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert4} />
          <ModalBody>
            Are you sure you want to go back to document selection page?
          </ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              className="px-4 py-2 text-black bg-white text-black rounded-xl border border-gray hover:bg-gray-300 transition-colors duration-300 w-fit cursor-pointer"
              onClick={closeModalAlert4}
            >
              Cancel
            </button>
            <button
              onClick={handleButtonClickedBack}
              className="text-sm font-semibold bg-indigo-600 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Confirm
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal onClose={closeModalAlert5} isOpen={isModalOpen5} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Invalid Request</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert5} />
          <ModalBody>
            Please close this alert to refresh. Dont worry your progress wont
            disappear
          </ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              onClick={() => {
                closeModalAlert5();
              }}
              className="text-sm font-semibold bg-indigo-600 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Okay
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FillUpSeniorCitizenCertificate;
