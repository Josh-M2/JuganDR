import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
  useToast,
  Select,
  Tooltip,
  Image,
  Table,
  TableContainer,
  TableCaption,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Tfoot,
  Center,
} from "@chakra-ui/react";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../AdminDashboard.css";
import axios from "axios";
import { ErrorImage } from "./Login";
import { IndigencyForm } from "./FillUpSedula";
import NavigationBar from "./NavigationBar";
import LoaderRing from "./LoaderRing";
import trashcan from "./../assets/trash-can.svg";
import { saveAs } from "file-saver";
import { parseISO, isAfter, isBefore } from "date-fns";
import * as XLSX from "xlsx";
// import * as fs from "fs";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  ImageRun,
  TextWrappingType,
  TextWrappingSide,
} from "docx";
import logoJugan from "./../assets/Jugan-logo.png";
import logoConsolacion from "./../assets/Consolacion-logo.png";
import { url } from "inspector";
import { createClient } from "@supabase/supabase-js";
import NotificationBar from "./NotificationBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Footer from "./Footer";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY || "";
const urlEnv = process.env.REACT_APP_SERVER_ACCESS || "";

interface data {
  id: number;
  age: string; // Assuming age is stored as a string
  barangay: string;
  city: string;
  ext_name: string; // Empty string if no extension name is present
  first_name: string;
  last_name: string;
  middle_name: string;
  mobile_num: string; // Assuming mobile number is also a string
  province: string;
  requested_at: string; // Date in string format (ISO 8601)
  street: string;
  document: string;
  released_date: string;
  front_id: string;
  back_id: string;
}

const AdminDashboard: React.FC = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const [accessToken, setAccessToken] = useState<string>("");
  const [supabase, setSupabase] = useState<any>(null);

  const getAccessToken = async () => {
    try {
      const response = await axios.get(`${urlEnv}get-access-token`, {
        withCredentials: true,
      });
      if (response.data) {
        setAccessToken(response.data);
      } else {
        openModalAlert1();
      }
    } catch (error) {
      console.error("Error getting access token:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getAccessToken();
    }
  }, [isAuthenticated]);

  // Initialize Supabase client once accessToken is set
  useEffect(() => {
    if (isAuthenticated && accessToken && !supabase) {
      setSupabase(
        createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        })
      ); // Store the initialized client in state
      console.log("supabase client initialized");
    }
  }, [accessToken]); // Only run this when `accessToken` changes
  const toast = useToast();
  const navigate = useNavigate();
  const [dataIncoming, setDataIncoming] = useState<data[]>([]);
  const [dataOutgoing, setDataOutgoing] = useState<data[]>([]);
  const [dataReleased, setDataReleased] = useState<data[]>([]);
  useEffect(() => {
    if (dataReleased) {
      console.log("dataReleased", dataReleased);
    }
  }, [dataReleased]);
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [isModalOpen4, setIsModalOpen4] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [loadingOutgoing, setLoadingOutgoing] = useState(false);
  const [loadingReleased, setLoadingReleased] = useState(false);
  const [loadingDeleteIncoming, setLoadingDeleteIncoming] = useState(false);
  const [loadingSendToOutgoing, setLoadingSendToOutgoing] = useState(false);
  const [loadingSendToReleased, setLoadingSendToReleased] = useState(false);
  const [frontIDUrl, setFrontIDUrl] = useState<string | null>(null);
  const [backIDUrl, setBackIDUrl] = useState<string | null>(null);
  const [loadingImageUrl, setLoadingImageUrl] = useState(false);
  const [images, setImages] = useState<{
    frontID: string;
    backID: string;
  } | null>(null);
  const [selectedDataID, setSelectedDataID] = useState(0);
  const [selectedDatas, setSelectedDatas] = useState<data | null>(null);
  useEffect(() => {
    console.log("selectedDatas", selectedDatas);
  }, [selectedDatas]);
  const [toggleEdit, setToggleEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [currentPageIncomingData, setCurrentPageIncomingData] = useState<
    data[] | null
  >(null);
  const [currentPageOutgoingData, setCurrentPageOutgoingData] = useState<
    data[] | null
  >(null);
  const [currentPageReleasedData, setCurrentPageReleasedData] = useState<
    data[] | null
  >(null);
  const [totalPagesIncoming, setTotalPagesIncoming] = useState(0);
  const [totalPagesOutgoing, setTotalPagesOutgoing] = useState(0);
  const [totalPagesReleased, setTotalPagesReleased] = useState(0);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [nameSearch, setNameSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    console.log(activeTab);
  }, [activeTab]);
  const [deleting, setDeleting] = useState("");
  const notificationBarRef = useRef<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [form, setForm] = useState<IndigencyForm>({
    document: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    ext_name: "",
    age: "",
    mobile_num: "",
    street: "",
    barangay: "",
    province: "",
    city: "",
    frontID: "",
    backID: "",
  });

  useEffect(() => {
    if (selectedDatas)
      setForm({
        document: selectedDatas.document,
        first_name: selectedDatas.first_name,
        middle_name: selectedDatas.middle_name,
        last_name: selectedDatas.last_name,
        ext_name: selectedDatas.ext_name,
        age: selectedDatas.age,
        mobile_num: selectedDatas.mobile_num,
        street: selectedDatas.street,
        barangay: selectedDatas.barangay,
        province: selectedDatas.province,
        city: selectedDatas.city,
        frontID: selectedDatas.front_id,
        backID: selectedDatas.back_id,
      });
  }, [selectedDatas]);

  const triggerNotification = () => {
    if (notificationBarRef.current) {
      notificationBarRef.current.addNotification();
    }
  };

  const handleIncomingClick = () => {
    setActiveTab(0);
  };

  const handleOutgoingClick = () => {
    setActiveTab(1);
  };

  const handleReleasedClick = () => {
    setActiveTab(2);
  };

  const openModalAlert = () => setIsModalOpen(true);
  const closeModalAlert = () => setIsModalOpen(false);

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

  const openModalAlert2 = () => setIsModalOpen2(true);
  const closeModalAlert2 = () => setIsModalOpen2(false);

  const openModalAlert3 = () => setIsModalOpen3(true);
  const closeModalAlert3 = () => setIsModalOpen3(false);

  const openModalAlert4 = () => setIsModalOpen4(true);
  const closeModalAlert4 = () => setIsModalOpen4(false);

  useEffect(() => {
    const selectedData = dataIncoming?.find(
      (dataInModal) => dataInModal.id === selectedDataID
    );

    if (selectedData) {
      setForm({
        document: selectedData.document || "",
        first_name: selectedData.first_name || "",
        middle_name: selectedData.middle_name || "",
        last_name: selectedData.last_name || "",
        ext_name: selectedData.ext_name || "",
        age: selectedData.age || "",
        mobile_num: selectedData.mobile_num || "",
        street: selectedData.street || "",
        barangay: selectedData.barangay || "",
        province: selectedData.province || "",
        city: selectedData.city || "",
        frontID: selectedData.front_id || "",
        backID: selectedData.back_id || "",
      });
    }
  }, [selectedDataID, dataIncoming]);

  const [error, setError] = useState<IndigencyForm>({
    document: "",
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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
        document: "",
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
        frontID: "",
        backID: "",
      });
      setToggleEdit(true);
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
        // purpose: "",
        // purpose_for: "",
        // school: "",
        street: "",
        province: "",
        barangay: "",
        city: "",
        frontID: "",
        backID: "",
      });

      return true;
    }
  };

  const handleSubmit = async (id: any) => {
    setLoading(true);

    const formDataWithId = { ...form, id };

    try {
      const response = await axios.post(`${urlEnv}updatedata`, formDataWithId, {
        withCredentials: true,
      });

      console.log("response", response);
    } catch (error) {
      console.error("Error Updating form", error);
      // Optionally handle the error, show a message, etc.
    }

    onClose();
    closeModalAlert();
    //fetchIncoming();
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/Sign in for Admin");
    }
  }, []);

  const refresh = async () => {
    if (activeTab === 0) {
      fetchIncomingData();
    } else if (activeTab === 1) {
      fetchOutgoingData();
    } else if (activeTab === 2) {
      fetchReleasedData();
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  //filtering
  const processAndSetOutgoingData = (data: data[]) => {
    let filteredData = data;
    console.log("outgoind_dataa", data);

    if (selectedFilter !== "All") {
      filteredData = data.filter((item) => item.document === selectedFilter);
    }

    if (nameSearch.trim() !== "") {
      const searchLower = nameSearch.trim().toLowerCase();
      filteredData = filteredData.filter(
        (item: data) =>
          item.first_name.toLowerCase().includes(searchLower) ||
          item.middle_name.toLowerCase().includes(searchLower) ||
          item.last_name.toLowerCase().includes(searchLower)
      );
    }

    setTotalPagesOutgoing(Math.ceil(filteredData.length / itemsPerPage));
    setCurrentPageOutgoingData(
      filteredData
        .sort((a, b) => b.id - a.id) // Sorting by id in ascending order
        .slice(startIndex, startIndex + itemsPerPage)
    );
    setDataOutgoing(filteredData);
  };

  const handleRealtimeOutgoingChange = (payload: any) => {
    console.log("Outgoing change received!", payload);
    if (!dataOutgoing) return;
    setDataOutgoing((prevData) => {
      let updatedData = [...prevData];

      switch (payload.eventType) {
        case "INSERT":
          updatedData = [payload.new, ...prevData];

          break;
        case "UPDATE":
          updatedData = updatedData.map((item) =>
            item.id === payload.new.id ? payload.new : item
          );
          break;
        case "DELETE":
          updatedData = updatedData.filter(
            (item) => item.id !== payload.old.id
          );
          break;
        default:
          break;
      }
      processAndSetOutgoingData(updatedData);
      return updatedData;
    });
  };
  //filtering
  const processAndSetIncomingData = (data: data[]) => {
    let filteredData = data;
    console.log("data_incoming_filtered", data);

    if (selectedFilter !== "All") {
      filteredData = data.filter((item) => item.document === selectedFilter);
    }

    if (nameSearch.trim() !== "") {
      const searchLower = nameSearch.trim().toLowerCase();
      filteredData = filteredData.filter(
        (item: data) =>
          item.first_name.toLowerCase().includes(searchLower) ||
          item.middle_name.toLowerCase().includes(searchLower) ||
          item.last_name.toLowerCase().includes(searchLower)
      );
    }

    setTotalPagesIncoming(Math.ceil(filteredData.length / itemsPerPage));
    setCurrentPageIncomingData(
      filteredData
        .sort((a, b) => b.id - a.id) // Sorting by id in ascending order
        .slice(startIndex, startIndex + itemsPerPage)
    );
    setDataIncoming(filteredData);
  };

  const handleRealtimeIncomingChange = (payload: any) => {
    console.log("Incoming change received!", payload);
    if (!dataIncoming) return;

    setDataIncoming((prevData) => {
      let updatedData = [...prevData];

      switch (payload.eventType) {
        case "INSERT":
          updatedData = [payload.new, ...prevData];
          triggerNotification();
          break;
        case "UPDATE":
          updatedData = updatedData.map((item) =>
            item.id === payload.new.id ? payload.new : item
          );
          break;
        case "DELETE":
          updatedData = updatedData.filter(
            (item) => item.id !== payload.old.id
          );
          break;
        default:
          break;
      }
      processAndSetIncomingData(updatedData);
      return updatedData;
    });
  };

  //filtering
  const processAndSetReleasedData = (data: data[]) => {
    let filteredData = data;

    if (selectedFilter !== "All") {
      filteredData = data.filter((item) => item.document === selectedFilter);
    }

    if (nameSearch.trim() !== "") {
      const searchLower = nameSearch.trim().toLowerCase();
      filteredData = filteredData.filter(
        (item: data) =>
          item.first_name.toLowerCase().includes(searchLower) ||
          item.middle_name.toLowerCase().includes(searchLower) ||
          item.last_name.toLowerCase().includes(searchLower)
      );
    }

    if (startDate || endDate) {
      filteredData = filteredData.filter((item) => {
        const itemDate =
          typeof item.released_date === "string"
            ? parseISO(item.released_date)
            : item.released_date;

        if (startDate && !endDate) {
          // Only startDate is set; include items on or after startDate
          return (
            isAfter(itemDate, startDate) ||
            itemDate.getTime() === startDate.getTime()
          );
        } else if (endDate && !startDate) {
          // Only endDate is set; include items on or before endDate
          return (
            isBefore(itemDate, endDate) ||
            itemDate.getTime() === endDate.getTime()
          );
        } else if (startDate && endDate) {
          // Both startDate and endDate are set; include items within the date range
          return (
            (isAfter(itemDate, startDate) ||
              itemDate.getTime() === startDate.getTime()) &&
            (isBefore(itemDate, endDate) ||
              itemDate.getTime() === endDate.getTime())
          );
        }
        return true; // Include all if no dates are set
      });
    }

    setTotalPagesReleased(Math.ceil(filteredData.length / itemsPerPage));
    setCurrentPageReleasedData(
      filteredData
        .sort((a, b) => b.id - a.id) // Sorting by id in ascending order
        .slice(startIndex, startIndex + itemsPerPage)
    );
    setDataReleased(filteredData);
  };

  const handleRealtimeReleasedChange = (payload: any) => {
    console.log("Incoming change received!", payload);
    if (!dataReleased) return;

    setDataReleased((prevData) => {
      let updatedData = [...prevData];

      switch (payload.eventType) {
        case "INSERT":
          updatedData = [payload.new, ...prevData];
          break;
        case "UPDATE":
          updatedData = updatedData.map((item) =>
            item.id === payload.new.id ? payload.new : item
          );
          break;
        case "DELETE":
          updatedData = updatedData.filter(
            (item) => item.id !== payload.old.id
          );
          break;
        default:
          break;
      }
      processAndSetReleasedData(updatedData);
      return updatedData;
    });
  };

  const fetchOutgoingData = async () => {
    setLoadingOutgoing(true);
    try {
      const response = await axios.get(`${urlEnv}fetchoutgoing`, {
        withCredentials: true,
      });
      console.log("dataoutgoing", response.data);

      processAndSetOutgoingData(response.data);
      setLoadingOutgoing(false);
    } catch (error: any) {
      if (error.response.status == 404) {
        setLoadingOutgoing(false);
        processAndSetOutgoingData([]);
      } else if (error.response.status === 401) {
        setLoadingOutgoing(false);
        openModalAlert1();
      }
    }
    setLoadingOutgoing(false);
  };

  const fetchIncomingData = async () => {
    setLoadingIncoming(true);
    try {
      const response = await axios.get(`${urlEnv}fetchincoming`, {
        withCredentials: true,
      });
      processAndSetIncomingData(response.data);
      setLoadingIncoming(false);
    } catch (error: any) {
      if (error.response.status == 404) {
        setLoadingIncoming(false);
        processAndSetIncomingData([]);
      } else if (error.response.status === 401) {
        setLoadingIncoming(false);
        openModalAlert1();
      }
    }
    setLoadingIncoming(false);
  };

  const fetchReleasedData = async () => {
    setLoadingReleased(true);
    try {
      const response = await axios.get(
        `${urlEnv}fetchreleased`,

        { withCredentials: true }
      );
      processAndSetReleasedData(response.data);
      setLoadingReleased(false);
    } catch (error: any) {
      if (error.response.status == 404) {
        setLoadingReleased(false);
        processAndSetReleasedData([]);
      } else if (error.response.status === 401) {
        setLoadingReleased(false);
        openModalAlert1();
      }
    }
    setLoadingReleased(false);
  };

  useEffect(() => {
    // Initial fetch for outgoing data
    if (supabase) {
      fetchIncomingData();

      fetchOutgoingData();

      fetchReleasedData();

      // Real-time subscription for outgoing data
      const outgoingSubscription = supabase
        .channel("outgoing")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "outgoing" },
          handleRealtimeOutgoingChange
        )
        .subscribe();

      // Real-time subscription for incoming data
      const incomingSubscription = supabase
        .channel("incoming")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "incoming" },
          handleRealtimeIncomingChange
        )
        .subscribe();

      const releasedSubscription = supabase
        .channel("released")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "released" },
          handleRealtimeReleasedChange
        )
        .subscribe();

      // Cleanup on component unmount
      return () => {
        outgoingSubscription.unsubscribe();
        incomingSubscription.unsubscribe();
        releasedSubscription.unsubscribe();
      };
    }
  }, [
    supabase,
    selectedFilter,
    startDate,
    endDate,
    nameSearch,
    startIndex,
    itemsPerPage,
  ]);

  // const fetchIncoming = async () => {
  //   setLoadingIncoming(true);
  //   console.log(`${urlEnv}fetchincoming`);
  //   try {
  //     const response = await axios.get(
  //       `${urlEnv}fetchincoming`,
  //       { withCredentials: true }
  //     );
  //     if (response.data) {
  //       let filteredData = response.data;

  //       if (selectedFilter !== "All") {
  //         filteredData = response.data.filter(
  //           (item: data) => item.document === selectedFilter
  //         );
  //       }

  //       if (nameSearch.trim() !== "") {
  //         const searchLower = nameSearch.trim().toLowerCase();

  //         filteredData = filteredData.filter(
  //           (item: data) =>
  //             item.first_name.toLowerCase().includes(searchLower) ||
  //             item.middle_name.toLowerCase().includes(searchLower) ||
  //             item.last_name.toLowerCase().includes(searchLower)
  //         );
  //       }

  //       setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  //       setCurrentPageIncomingData(
  //         filteredData
  //           .sort((a: { id: number }, b: { id: number }) => a.id - b.id) // Sorting by id in ascending order
  //           .slice(startIndex, startIndex + itemsPerPage)
  //       );

  //       setDataIncoming(filteredData);
  //       setLoadingIncoming(false);
  //     }
  //   } catch (err: any) {
  //     //logout function here if JWT expires
  //     console.log(`Error fetching data: ${err}`);
  //     if (err.response.status == 404) {
  //       setLoadingIncoming(false);
  //       setDataIncoming([]);
  //     } else if (err.response.status === 401) {
  //       setLoadingIncoming(false);
  //       openModalAlert1();
  //     }
  //   }
  // };

  const deleteFromIncoming = async (id: number) => {
    console.log("deleteFromIncoming", id);
    setLoadingDeleteIncoming(true);
    try {
      const response = await axios.post(
        `${urlEnv}deletefromincoming`,
        {
          id: id,
        },
        {
          withCredentials: true,
        }
      );

      if (response) {
        console.log(response.data);

        console.log(response.data);
        // await fetchIncoming();
      }
    } catch (err: any) {
      console.error(`Error deleting data: ${err.message}`);
    }
    setLoadingDeleteIncoming(false);
    closeModalAlert2();
  };

  // const fetchOutgoing = async () => {
  //   setLoadingOutgoing(true);
  //   console.log(`${urlEnv}fetchOutgoing`);
  //   try {
  //     const response = await axios.get(
  //       `${urlEnv}fetchoutgoing`,

  //       { withCredentials: true }
  //     );
  //     if (response.data) {
  //       let filteredData = response.data;

  //       if (selectedFilter !== "All") {
  //         filteredData = response.data.filter(
  //           (item: data) => item.document === selectedFilter
  //         );
  //       }

  //       if (nameSearch.trim() !== "") {
  //         const searchLower = nameSearch.trim().toLowerCase();

  //         filteredData = filteredData.filter(
  //           (item: data) =>
  //             item.first_name.toLowerCase().includes(searchLower) ||
  //             item.middle_name.toLowerCase().includes(searchLower) ||
  //             item.last_name.toLowerCase().includes(searchLower)
  //         );
  //       }

  //       // console.log("incoming datas", filteredData);
  //       setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  //       setCurrentPageOutgoingData(
  //         filteredData
  //           .sort((a: { id: number }, b: { id: number }) => a.id - b.id) // Sorting by id in ascending order
  //           .slice(startIndex, startIndex + itemsPerPage)
  //       );

  //       setDataOutgoing(filteredData);
  //       setLoadingOutgoing(false);
  //     }
  //   } catch (err: any) {
  //     //logout function here if JWT expires
  //     console.log(`Error fetching data: ${err.message}`);
  //     if (err.response.status == 404) {
  //       setLoadingOutgoing(false);
  //       setDataOutgoing(null);
  //     } else if (err.response.status === 401) {
  //       setLoadingOutgoing(false);
  //       openModalAlert1();
  //     }
  //   }
  // };

  const deleteFromOutgoing = async (id: number) => {
    console.log("deleteFromOutgoing", id);
    setLoadingDeleteIncoming(true);
    try {
      const response = await axios.post(
        `${urlEnv}deletefromoutgoing`,
        {
          id: id,
        },
        {
          withCredentials: true,
        }
      );

      if (response) {
        console.log(response.data);

        console.log(response.data);
        // await fetchOutgoing();
      }
    } catch (err: any) {
      console.error(`Error deleting data: ${err.message}`);
    }
    setLoadingDeleteIncoming(false);
    closeModalAlert2();
  };

  const sendToOutgoing = async (data: any) => {
    setLoadingSendToOutgoing(true);
    console.log("sendToOutgoing", data);
    console.log("sendToOutgoing", data.id);

    try {
      const response = await axios.post(`${urlEnv}outgoing_request`, data, {
        withCredentials: true,
      });

      if (response) {
        console.log("sent to outgoing");
        deleteFromIncoming(data.id);
        closeModalAlert3();
        onClose();
      }
    } catch (err: any) {
      console.error(`error sending to outgoing: ${err.message}`);
    }
    setLoadingSendToOutgoing(true);
  };

  const sendToReleased = async (data: any) => {
    setLoadingSendToReleased(true);
    console.log("sendToReleased", data);
    console.log("sendToReleased", data.id);

    try {
      const response = await axios.post(`${urlEnv}sendtoreleased`, data, {
        withCredentials: true,
      });

      if (response) {
        console.log("sent to Released");
        deleteFromOutgoing(data.id);
        closeModalAlert4();
        onClose();
      }
    } catch (err: any) {
      console.error(`error sending to Released: ${err.message}`);
    }
    setLoadingSendToReleased(true);
  };

  // const fetchReleased = async () => {
  //   setLoadingReleased(true);
  //   console.log(`${urlEnv}fetchReleased`);
  //   try {
  //     const response = await axios.get(
  //       `${urlEnv}fetchreleased`,

  //       { withCredentials: true }
  //     );
  //     if (response.data) {
  //       let filteredData = response.data;

  //       if (selectedFilter !== "All") {
  //         filteredData = response.data.filter(
  //           (item: data) => item.document === selectedFilter
  //         );
  //       }

  //       if (nameSearch.trim() !== "") {
  //         const searchLower = nameSearch.trim().toLowerCase();

  //         filteredData = filteredData.filter(
  //           (item: data) =>
  //             item.first_name.toLowerCase().includes(searchLower) ||
  //             item.middle_name.toLowerCase().includes(searchLower) ||
  //             item.last_name.toLowerCase().includes(searchLower)
  //         );
  //       }

  //       // console.log("incoming datas", filteredData);
  //       setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  //       setCurrentPageReleasedData(
  //         filteredData
  //           .sort((a: { id: number }, b: { id: number }) => a.id - b.id) // Sorting by id in ascending order
  //           .slice(startIndex, startIndex + itemsPerPage)
  //       );

  //       setDataReleased(filteredData);
  //       setLoadingReleased(false);
  //     }
  //   } catch (err: any) {
  //     //logout function here if JWT expires
  //     console.log(`Error fetching data: ${err.message}`);
  //     if (err.response.status == 404) {
  //       setLoadingReleased(false);
  //       setDataReleased(null);
  //     } else if (err.response.status === 401) {
  //       setLoadingReleased(false);
  //       openModalAlert1();
  //     }
  //   }
  // };

  //fetch upon mount
  // useEffect(() => {
  //   if (activeTab === 0) {
  //     fetchIncoming();
  //     const interval = setInterval(fetchIncoming, 60000);
  //     return () => clearInterval(interval);
  //   } else
  //   if (activeTab === 1) {
  //     fetchOutgoing();
  //     const interval = setInterval(fetchOutgoing, 60000);
  //     return () => clearInterval(interval);
  //   } else
  //   if (activeTab === 2) {
  //     fetchReleased();
  //     const interval = setInterval(fetchReleased, 60000);
  //     return () => clearInterval(interval);
  //   }
  // }, []);

  //for paging
  // useEffect(() => {
  //   if (activeTab === 0 && dataIncoming) {
  //     const startIndex = (currentPage - 1) * itemsPerPage;
  //     setCurrentPageIncomingData(
  //       dataIncoming.slice(startIndex, startIndex + itemsPerPage)
  //     );
  //   }
  // }, [activeTab, currentPage, dataIncoming]);

  // useEffect(() => {
  //   if (activeTab === 1 && dataOutgoing) {
  //     const startIndex = (currentPage - 1) * itemsPerPage;
  //     setCurrentPageOutgoingData(
  //       dataOutgoing.slice(startIndex, startIndex + itemsPerPage)
  //     );
  //   }
  // }, [activeTab, currentPage, dataOutgoing]);

  // useEffect(() => {
  //   if (activeTab === 2 && dataReleased) {
  //     const startIndex = (currentPage - 1) * itemsPerPage;
  //     setCurrentPageReleasedData(
  //       dataReleased.slice(startIndex, startIndex + itemsPerPage)
  //     );
  //   }
  // }, [activeTab, currentPage, dataReleased]);

  //for filtering
  // useEffect(() => {
  //   if (activeTab === 0) {
  //     fetchIncoming();
  //   }
  // }, [activeTab, selectedFilter, currentPage, nameSearch]);

  // useEffect(() => {
  //   if (activeTab === 1) {
  //     fetchOutgoing();
  //   }
  // }, [activeTab, selectedFilter, currentPage, nameSearch]);

  // useEffect(() => {
  //   if (activeTab === 2) {
  //     fetchReleased();
  //   }
  // }, [activeTab, selectedFilter, currentPage, nameSearch]);

  const toUpperCase = (value: unknown): string => {
    return typeof value === "string" ? value.toUpperCase() : String(value);
  };

  const generateWordDocumentIndigency = async (data: any) => {
    //indigency
    if (data.document !== "Barangay Indigency") {
      return;
    }
    console.log("generateWordDocumentgenerateWordDocumentIndigency", data);
    const {
      age,
      barangay,
      city,
      document,
      ext_name,
      first_name,
      last_name,
      middle_name,
      province,
      street,
    } = data;
    const fontSizeBody = 24; //12px
    const fontSizeHeader = 22; //11px
    const font = "Times New Roman";
    const day: Date = new Date();
    const date: number = day.getDate(); // Day of the month (1-31)
    const month: string = day.toLocaleString("default", { month: "long" });
    const year: number = day.getFullYear(); // 4-digit year
    const dayName: string = day.toLocaleString("default", { weekday: "long" }); // Full name of the day

    const issuedDate = ` ${date}th `;
    const issuedMonthYear = ` ${month} ${year} `;
    const fullName = ` ${toUpperCase(first_name)} ${toUpperCase(
      middle_name[0]
    )}. ${toUpperCase(last_name)}${
      ext_name ? ` ${toUpperCase(ext_name)},` : ","
    } `;
    const fullAddress = ` ${street}, ${barangay}, ${province}, ${city}`;
    console.log("fullName", fullName);
    const address = `${barangay}, ${province}, ${city}`;
    console.log("fullName", fullName);

    // const dataItem = {
    //   name: "John Doe",
    //   age: "18",
    //   address: "Purok 5, Barangay Jugan, Consolacion, Cebu",
    //   father: "Juan Dela Cruz",
    //   fatherAge: "46",
    //   mother: "Maria Dela Cruz",
    //   motherAge: "40",
    //   issuedDate: "16th day of March 2021",
    //   purpose: "SCHOLARSHIP APPLICATION at SM FOUNDATION",
    // };

    const shortBondPaperSize = {
      width: 12240,
      height: 15840,
    };

    // Create a new Document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: shortBondPaperSize,
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children: [
            // Header: Republic of the Philippines, etc.

            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Republic of the Philippines",
                  bold: true,
                  font: font,
                  color: "#4472C4",
                  size: fontSizeHeader,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Province of Cebu",
                  font: font,
                  color: "#FF0000",
                  size: fontSizeHeader,
                }),
                new TextRun({
                  text: "Municipality of Consolacion",
                  font: font,
                  break: 1,
                  color: "#00B050",
                  size: fontSizeHeader,
                }),
                new TextRun({
                  text: "Sangguniang Barangay of Jugan",
                  break: 1,
                  bold: true,
                  font: font,
                  size: fontSizeHeader,
                }),
                new TextRun({
                  text: "Tel. No. 239 – 1361",
                  font: font,
                  break: 1,
                  bold: true,
                  size: fontSizeHeader,
                }),
              ],
            }),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "OFFICE OF THE PUNONG BARANGAY",
                  bold: true,
                  break: 1,
                  size: fontSizeBody,
                  font: font,
                }),
              ],
            }),
            new Paragraph({
              thematicBreak: true, // Adds a horizontal line below this paragraph
            }),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "CERTIFICATE OF INDIGENCY",
                  bold: true,
                  font: font,
                  size: 32,
                  break: 1,
                }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "TO WHOM IT MAY CONCERN:",
                  font: font,
                  break: 2,
                  size: fontSizeBody,
                }),
              ],
            }),

            // Main body of the certificate
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({
                  text: "\tThis is to certify that a certain",
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: fullName, // Full name
                  bold: true, // Make it bold
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: `${age} years of age, a resident of${fullAddress}. `, // Rest of the text
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: "He is belonging to the indigent families in our barangay.",
                  size: fontSizeBody,
                  font: font,
                }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "\tThis certification is issued upon the request of the subject, for ",
                  size: fontSizeBody,
                  font: font,
                  break: 1,
                }),
                new TextRun({
                  text: "__________", // Underscores that need to be bold
                  bold: true,
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: " at ",
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: "__________", // Another set of bold underscores
                  bold: true,
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: ".",
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: "\tIssued this",
                  break: 2,
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: issuedDate, // The issued date (could be bold/underlined if needed)
                  size: fontSizeBody,
                  font: font,
                  bold: true,
                }),
                new TextRun({
                  text: "day of", // The issued date (could be bold/underlined if needed)
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: issuedMonthYear, // The issued date (could be bold/underlined if needed)
                  size: fontSizeBody,
                  bold: true,
                  font: font,
                }),
                new TextRun({
                  text: "in Barangay " + address + ".",
                  size: fontSizeBody,
                  font: font,
                }),
              ],
            }),

            // Footer with signature
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "HON. ANTONIETTO S. PEPITO",
                  bold: true,
                  break: 3,
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: "Punong Barangay",
                  break: 1,
                  size: fontSizeBody,
                  font: font,
                }),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "NOT VALID WITHOUT",
                  break: 2,
                  size: fontSizeBody,
                  font: font,
                }),
                new TextRun({
                  text: "OFFICIAL SEAL",
                  size: fontSizeBody,
                  break: 1,
                }),
              ],
            }),

            new Paragraph({
              // Set text wrapping to in front of text
              children: [
                new ImageRun({
                  data: await fetch(logoJugan).then((res) => res.arrayBuffer()), // Fetch the image and convert it to ArrayBuffer
                  transformation: {
                    width: 123, // Set width in twips
                    height: 123, // Set height in twips
                  },
                  floating: {
                    horizontalPosition: {
                      align: "right",
                      relative: "margin",
                    },
                    verticalPosition: {
                      align: "top",
                      relative: "margin",
                    },
                  },
                  type: "png",
                }),
              ],
            }),

            new Paragraph({
              // Set text wrapping to in front of text
              children: [
                new ImageRun({
                  data: await fetch(logoConsolacion).then((res) =>
                    res.arrayBuffer()
                  ), // Fetch the image and convert it to ArrayBuffer
                  transformation: {
                    width: 115, // Set width in twips
                    height: 115, // Set height in twips
                  },
                  floating: {
                    horizontalPosition: {
                      align: "left",
                      relative: "margin",
                    },
                    verticalPosition: {
                      align: "top",
                      relative: "margin",
                    },
                  },
                  type: "png",
                }),
              ],
            }),
          ],
        },
      ],
    });

    // Convert the document to a Blob and download
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "Certificate_of_Indigency.docx");
    });
  };

  const getPublicUrl = async (datas: any) => {
    setLoadingImageUrl(true);
    console.log("datas", datas);
    const response = await axios.get(`${urlEnv}get-images`, {
      params: { selectedDatas: datas },
      withCredentials: true,
    });
    if (response.data) {
      console.log("response.data", response);
      console.log("responsefrontId", response.data.frontId);
      console.log("responsebackid", response.data.backId);
      setFrontIDUrl(response.data.frontId);
      setBackIDUrl(response.data.backId);
    }
    setLoadingImageUrl(false);
  };

  const handleExport = () => {
    if (!dataReleased || dataReleased.length <= 0) {
      return;
    }

    const formattedData = dataReleased.map((item) => {
      const fullName = ` ${toUpperCase(item.first_name)} ${toUpperCase(
        item.middle_name[0]
      )}. ${toUpperCase(item.last_name)}${
        item.ext_name ? ` ${toUpperCase(item.ext_name)},` : ","
      }`;

      const released_date =
        typeof item.released_date === "string"
          ? parseISO(item.released_date)
          : item.released_date;

      const document = toUpperCase(item.document);

      return {
        Name: fullName,
        Document: document,
        Released_date: released_date,
      };
    });

    let data = formattedData.map((item) => ({
      Full_name: item.Name,
      Document_type: item.Document,
      Released_date: item.Released_date
        ? item.Released_date.toLocaleDateString()
        : "Invalid Date",
    }));

    // data = [
    //   {
    //     Start_Date:
    //       typeof startDate === "string"
    //         ? parseISO(startDate).toDateString()
    //         : "No data",

    //     End_Date:
    //       typeof endDate === "string"
    //         ? parseISO(endDate).toDateString()
    //         : "No data",
    //   },
    //   ...data,
    // ];

    // Convert JSON data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate a downloadable Excel file
    XLSX.writeFile(
      workbook,
      `${startDate?.toLocaleDateString() || ""}${startDate ? " TO " : ""}${
        endDate?.toLocaleDateString() || ""
      }${endDate ? " - " : ""}${selectedFilter} document released.xlsx`
    );
  };

  return (
    <>
      <NavigationBar />

      <div className="custom-width !mb-5">
        <div className="m-5 flex flex-row gap-3 justify-between items-center">
          <h1 className="text-[24px] font-semibold">Admin Dashboard</h1>
          <div className="flex flex-row items-center gap-3">
            <button
              onClick={refresh}
              className="rounded-xl py-4 px-6 text-slate-50 bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Refresh
            </button>
            {activeTab === 2 ? (
              <button
                onClick={handleExport}
                className="rounded-xl py-4 px-6  text-slate-50 bg-indigo-600 hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Export
              </button>
            ) : (
              ""
            )}
            <div className="flex flex-col">
              <label htmlFor="type" className="text-[12px] text-gray-400">
                Document Type:
              </label>
              <Select
                id="type"
                width="auto"
                onChange={(e) => setSelectedFilter(e.target.value)}
                value={selectedFilter}
              >
                <option value="All">All</option>
                <option value="Barangay Indigency">Barangay Indigency</option>
                <option value="Sedula">Sedula</option>
                <option value="Barangay Clearance">Barangay Clearance</option>
                <option value="test">test loader</option>
              </Select>
            </div>
            {activeTab === 2 && (
              <>
                <div className="flex flex-col">
                  <label htmlFor="type" className="text-[12px] text-gray-400">
                    Select start date:
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    customInput={<Input />}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="type" className="text-[12px] text-gray-400">
                    Select end date:
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    minDate={startDate || undefined}
                    customInput={<Input />}
                  />
                </div>
              </>
            )}

            {activeTab !== 2 && (
              <div className="flex flex-col">
                <label htmlFor="search" className="text-[12px] text-gray-400">
                  Search:
                </label>
                <Input
                  id="search"
                  placeholder="Search by Name"
                  width="auto"
                  value={nameSearch}
                  onChange={(e) => {
                    e.preventDefault();
                    setNameSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <Tabs
            size="lg"
            variant="enclosed"
            index={activeTab}
            onChange={setActiveTab}
          >
            <TabList className="justify-evenly">
              <Tab className="w-[374.53px]" onClick={handleIncomingClick}>
                Incoming
              </Tab>
              <Tab className="w-[374.53px]" onClick={handleOutgoingClick}>
                Outgoing
              </Tab>
              <Tab className="w-[374.53px]" onClick={handleReleasedClick}>
                Released
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel className="!px-0 !pt-0">
                <TableContainer height="408px">
                  <Table>
                    <Thead>
                      <Tr>
                        <Th width="568px">
                          <div className="flex justify-center text-slate-600">
                            Names
                          </div>
                        </Th>
                        <Th width="197px">
                          <div className="flex justify-center text-slate-600">
                            Documents
                          </div>
                        </Th>
                        <Th width="346px">
                          <div className="flex justify-center text-slate-600">
                            Actions
                          </div>
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loadingIncoming ? (
                        <Tr height="367px">
                          <Td colSpan={3} textAlign="center" py={10}>
                            <div className="flex align-center justify-center">
                              <LoaderRing />
                            </div>
                          </Td>
                        </Tr>
                      ) : // </div>
                      Array.isArray(dataIncoming) && dataIncoming.length > 0 ? (
                        currentPageIncomingData?.map((dataItem, index) => (
                          <Tr
                            key={dataItem.id}
                            className={`${
                              index % 2 === 0 ? "bg-slate-50" : ""
                            } !h-[73.19px]`}
                            height="73.19px"
                          >
                            <Td className="h-[73.19px]" height="73.19px">
                              <div className="justify-center">
                                <div className="flex flex-row gap-3">
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[12px] text-gray-400">
                                      Last name
                                    </span>
                                    <span>{dataItem.last_name}</span>
                                  </div>
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[12px] text-gray-400">
                                      First name
                                    </span>
                                    <span>{dataItem.first_name}</span>
                                  </div>
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[12px] text-gray-400">
                                      Middle name
                                    </span>
                                    <span>{dataItem.middle_name}</span>
                                  </div>
                                </div>
                              </div>
                            </Td>
                            <Td className="h-[73.19px]" height="73.19px">
                              <div className="flex justify-center">
                                <span>{dataItem.document}</span>
                              </div>
                            </Td>
                            <Td className="h-[73.19px]" height="73.19px">
                              <div className="flex flex-row gap-3 justify-center">
                                <button
                                  onClick={() => {
                                    setSelectedDataID(dataItem.id);
                                    setSelectedDatas(dataItem);
                                    getPublicUrl(dataItem);
                                    onOpen();
                                  }}
                                  className="py-1 px-3 border rounded-xl self-center hover:bg-gray-500/20"
                                >
                                  View
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedDatas(dataItem);
                                    openModalAlert3();
                                  }}
                                  className="rounded-xl py-1 px-3 text-slate-50 bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                  Accept
                                </button>

                                <Tooltip label="Delete" aria-label="A tooltip">
                                  <button
                                    className="w-[17px]"
                                    onClick={() => {
                                      setSelectedDataID(dataItem.id);
                                      setDeleting("incoming");
                                      openModalAlert2();
                                    }}
                                  >
                                    <img
                                      //image-button-size
                                      className="w-[17px]"
                                      src={trashcan}
                                      alt={"trashcan"}
                                    />
                                  </button>
                                </Tooltip>
                              </div>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr height="367px">
                          <Td colSpan={3} textAlign="center" py={10}>
                            <div className="flex align-center justify-center text-[16px] text-gray-400">
                              No Result
                            </div>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
                <div className="flex mt-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-2 mx-1 border rounded disabled:opacity-50 ${
                      currentPage === 1 ? `` : `hover:bg-slate-100 `
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2">
                    Page {currentPage} of {totalPagesIncoming}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPagesIncoming)
                      )
                    }
                    disabled={currentPage === totalPagesIncoming}
                    className={`px-3 py-2 mx-1 border rounded disabled:opacity-50 ${
                      currentPage === totalPagesIncoming
                        ? ``
                        : `hover:bg-slate-100 `
                    }`}
                  >
                    Next
                  </button>
                </div>
              </TabPanel>
              <TabPanel className="!px-0 !pt-0">
                <TableContainer height="408px">
                  <Table>
                    <Thead>
                      <Tr>
                        <Th width="568px">
                          <div className="flex justify-center text-slate-600">
                            Names
                          </div>
                        </Th>
                        <Th width="197px">
                          <div className="flex justify-center text-slate-600">
                            Documents
                          </div>
                        </Th>
                        <Th width="346px">
                          <div className="flex justify-center text-slate-600">
                            Actions
                          </div>
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loadingOutgoing ? (
                        <Tr height="367px">
                          <Td colSpan={3} textAlign="center" py={10}>
                            <div className="flex align-center justify-center">
                              <LoaderRing />
                            </div>
                          </Td>
                        </Tr>
                      ) : Array.isArray(dataOutgoing) &&
                        dataOutgoing.length > 0 ? (
                        currentPageOutgoingData?.map((dataItem, index) => (
                          <Tr
                            key={dataItem.id}
                            className={`${
                              index % 2 === 0 ? "bg-slate-50" : ""
                            } h-[73.19px]`}
                          >
                            <Td className="h-[73.19px]">
                              <div className="justify-center">
                                <div className="flex flex-row gap-3">
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[12px] text-gray-400">
                                      Last name
                                    </span>
                                    <span>{dataItem.last_name}</span>
                                  </div>
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[12px] text-gray-400">
                                      First name
                                    </span>
                                    <span>{dataItem.first_name}</span>
                                  </div>
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[12px] text-gray-400">
                                      Middle name
                                    </span>
                                    <span>{dataItem.middle_name}</span>
                                  </div>
                                </div>
                              </div>
                            </Td>
                            <Td className="h-[73.19px]">
                              <div className="flex justify-center">
                                <span>{dataItem.document}</span>
                              </div>
                            </Td>
                            <Td className="h-[73.19px]">
                              <div className="flex flex-row gap-3 justify-center">
                                <button
                                  onClick={() => {
                                    console.log(
                                      "outgoing dataitem: ",
                                      dataItem
                                    );
                                    setSelectedDataID(dataItem.id);
                                    setSelectedDatas(dataItem);
                                    getPublicUrl(dataItem);
                                    onOpen();
                                  }}
                                  className="py-1 px-3 border rounded-xl self-center hover:bg-gray-500/20"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDataID(dataItem.id);
                                    setSelectedDatas(dataItem);
                                    openModalAlert4();
                                  }}
                                  className="py-1 px-3 border rounded-xl self-center hover:bg-gray-500/20"
                                >
                                  Release
                                </button>
                                <button
                                  onClick={() => {
                                    switch (dataItem.document) {
                                      case "Barangay Indigency":
                                        generateWordDocumentIndigency(dataItem);
                                        break;

                                      default:
                                        break;
                                    }
                                  }}
                                  className="rounded-xl py-1 px-3 text-slate-50 bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                  Generate
                                </button>

                                <Tooltip label="Delete" aria-label="A tooltip">
                                  <button
                                    className="w-[17px]"
                                    onClick={() => {
                                      setSelectedDataID(dataItem.id);
                                      setDeleting("outgoing");
                                      openModalAlert2();
                                    }}
                                  >
                                    <img
                                      //image-button-size
                                      className="w-[17px]"
                                      src={trashcan}
                                      alt={"trashcan"}
                                    />
                                  </button>
                                </Tooltip>
                              </div>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr height="367px">
                          <Td colSpan={3} textAlign="center" py={10}>
                            <div className="flex align-center justify-center text-[16px] text-gray-400">
                              No Result
                            </div>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
                {/* Pagination Controls */}
                <div className="flex mt-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-2 mx-1 border rounded disabled:opacity-50 ${
                      currentPage === 1 ? `` : `hover:bg-slate-100 `
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2">
                    Page {currentPage} of {totalPagesOutgoing}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPagesOutgoing)
                      )
                    }
                    disabled={currentPage === totalPagesOutgoing}
                    className={`px-3 py-2 mx-1 border rounded disabled:opacity-50 ${
                      currentPage === totalPagesOutgoing
                        ? ``
                        : `hover:bg-slate-100 `
                    }`}
                  >
                    Next
                  </button>
                </div>
              </TabPanel>
              <TabPanel className="!px-0 !pt-0">
                <TableContainer height="408px">
                  <Table>
                    <Thead>
                      <Tr>
                        <Th width="568px">
                          <div className="flex justify-center text-slate-600">
                            Names
                          </div>
                        </Th>
                        <Th width="197px">
                          <div className="flex justify-center text-slate-600">
                            Documents
                          </div>
                        </Th>
                        <Th width="346px">
                          <div className="flex justify-center text-slate-600">
                            Date released
                          </div>
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loadingReleased ? (
                        <Tr height="367px">
                          <Td colSpan={3} textAlign="center" py={10}>
                            <div className="flex align-center justify-center">
                              <LoaderRing />
                            </div>
                          </Td>
                        </Tr>
                      ) : Array.isArray(dataReleased) &&
                        dataReleased.length > 0 ? (
                        currentPageReleasedData?.map((dataItem, index) => (
                          <Tr
                            key={dataItem.id}
                            className={`${
                              index % 2 === 0 ? "bg-slate-50" : ""
                            } h-[73.19px]`}
                          >
                            <Td className="h-[73.19px]">
                              <div className="justify-center">
                                <div className="flex flex-row gap-3">
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[12px] text-gray-400">
                                      Last name
                                    </span>
                                    <span>{dataItem.last_name}</span>
                                  </div>
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[12px] text-gray-400">
                                      First name
                                    </span>
                                    <span>{dataItem.first_name}</span>
                                  </div>
                                  <div className="flex flex-col w-fit">
                                    <span className="text-[12px] text-gray-400">
                                      Middle name
                                    </span>
                                    <span>{dataItem.middle_name}</span>
                                  </div>
                                </div>
                              </div>
                            </Td>
                            <Td className="h-[73.19px]">
                              <div className="flex justify-center">
                                <span>{dataItem.document}</span>
                              </div>
                            </Td>
                            <Td className="h-[73.19px]">
                              <div className="flex flex-row gap-3 justify-center">
                                <span>
                                  {new Date(
                                    dataItem?.released_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr height="367px">
                          <Td colSpan={3} textAlign="center" py={10}>
                            <div className="flex align-center justify-center text-[16px] text-gray-400">
                              No Result
                            </div>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>

                {/* Pagination Controls */}
                <div className="flex mt-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-2 mx-1 border rounded disabled:opacity-50 ${
                      currentPage === 1 ? `` : `hover:bg-slate-100 `
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2">
                    Page {currentPage} of {totalPagesReleased}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPagesReleased)
                      )
                    }
                    disabled={currentPage === totalPagesReleased}
                    className={`px-3 py-2 mx-1 border rounded disabled:opacity-50 ${
                      currentPage === totalPagesIncoming
                        ? ``
                        : `hover:bg-slate-100 `
                    }`}
                  >
                    Next
                  </button>
                </div>
              </TabPanel>
              <NotificationBar ref={notificationBarRef} />
            </TabPanels>
          </Tabs>
        </div>
      </div>
      <Footer />

      {/* INCOMING MODALS */}
      {/* view the details of data alert */}
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton className="border !border-transparent " />
          <ModalBody pb={6} pt={0}>
            {selectedDataID !== null
              ? (() => {
                  let selectedData = null;
                  switch (activeTab) {
                    case 0:
                      selectedData = dataIncoming?.find(
                        (dataInModal) => dataInModal.id === selectedDataID
                      );
                      break;
                    case 1:
                      console.log("trigger dataOutgoing", dataOutgoing);
                      console.log("trigger dataOutgoing", selectedDataID);

                      selectedData = dataOutgoing?.find(
                        (dataInModal) => dataInModal.id === selectedDataID
                      );
                      console.log("trigger dataOutgoing", selectedData);
                      break;
                    default:
                      break;
                  }

                  return (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-3">
                          <h2 className="text-base font-semibold leading-10 text-gray-900 mt-4 mb-4">
                            {selectedData?.document}
                          </h2>
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
                                  readOnly={!toggleEdit}
                                  onChange={handleChange}
                                  type="text"
                                  className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                    error.first_name
                                      ? "border-2 border-rose-600"
                                      : ""
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
                                  readOnly={!toggleEdit}
                                  onChange={handleChange}
                                  type="text"
                                  className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                    error.middle_name
                                      ? "border-2 border-rose-600"
                                      : ""
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
                                  readOnly={!toggleEdit}
                                  onChange={handleChange}
                                  type="text"
                                  className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                    error.last_name
                                      ? "border-2 border-rose-600"
                                      : ""
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
                                  readOnly={!toggleEdit}
                                  onChange={handleChange}
                                  type="text"
                                  className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                    error.ext_name
                                      ? "border-2 border-rose-600"
                                      : ""
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
                                  readOnly={!toggleEdit}
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
                                  readOnly={!toggleEdit}
                                  onChange={handleChange}
                                  type="text"
                                  className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                    error.mobile_num
                                      ? "border-2 border-rose-600"
                                      : ""
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
                                  readOnly={!toggleEdit}
                                  onChange={handleChange}
                                  className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                    error.street
                                      ? "border-2 border-rose-600"
                                      : ""
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
                                  readOnly={!toggleEdit}
                                  onChange={handleChange}
                                  className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                    error.barangay
                                      ? "border-2 border-rose-600"
                                      : ""
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
                                  readOnly={!toggleEdit}
                                  onChange={handleChange}
                                  className={`p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                                    error.province
                                      ? "border-2 border-rose-600"
                                      : ""
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
                                  readOnly={!toggleEdit}
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
                                id="document"
                                name="document"
                                type="text"
                                value="Sedula"
                                readOnly
                                className={`hidden p-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 `}
                              />
                            </div>
                            <div className="sm:col-span-6">
                              <label
                                htmlFor="city"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Front ID
                              </label>
                              {loadingImageUrl ? (
                                <div className="flex items-center justify-center min-h-[297px]">
                                  <LoaderRing />
                                </div>
                              ) : (
                                <div className="min-h-[297px] cursor-pointer flex items-center justify-center border rounded-lg">
                                  {frontIDUrl ? (
                                    <Image
                                      src={frontIDUrl ? frontIDUrl : "loading"}
                                      onClick={() => {
                                        window.open(
                                          frontIDUrl ? frontIDUrl : "",
                                          "_blank"
                                        );
                                      }}
                                      alt="Front image preview"
                                      className="rounded-lg shadow-md my-1"
                                    />
                                  ) : (
                                    "No data"
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="sm:col-span-6">
                              <label
                                htmlFor="city"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Back ID
                              </label>
                              {loadingImageUrl ? (
                                <div className="flex items-center justify-center min-h-[297px]">
                                  <LoaderRing />
                                </div>
                              ) : (
                                <div className="min-h-[297px] cursor-pointer flex items-center justify-center border rounded-lg">
                                  {backIDUrl ? (
                                    <Image
                                      src={backIDUrl ? backIDUrl : "Loading"}
                                      onClick={() => {
                                        window.open(
                                          backIDUrl ? backIDUrl : "",
                                          "_blank"
                                        );
                                      }}
                                      alt="Back image preview"
                                      className="rounded-lg shadow-md my-1"
                                    />
                                  ) : (
                                    "No data"
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <ModalFooter className="gap-3 !px-0 !pt-3 !pb-0">
                        {/* <Button onClick={onClose}>Cancel</Button> */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setToggleEdit(!toggleEdit);
                            if (toggleEdit) {
                              const confirm = handleConfirm();
                              confirm && openModalAlert();
                            }
                          }}
                          // type={toggleEdit ? "submit" : undefined}
                          className="px-4 py-2 text-black bg-white text-black rounded-xl border border-gray hover:bg-gray-300 transition-colors duration-300 w-fit cursor-pointer"
                        >
                          {toggleEdit ? "Save" : "Edit"}
                        </button>

                        <button
                          disabled={loading}
                          onClick={(e) => {
                            e.preventDefault();
                            // setSelectedDatas(selectedDatas);
                            openModalAlert3();
                          }}
                          className="px-4 py-2 text-slate-100 bg-indigo-600 hover:bg-indigo-500 text-gray-700 rounded-xl transition-colors duration-300 w-fit cursor-pointer font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          {/* Send */}
                          {loading ? "Sending" : "Send"}
                        </button>
                      </ModalFooter>
                    </form>
                  );
                })()
              : "No data return"}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* review the edited alert */}
      <Modal onClose={closeModalAlert} isOpen={isModalOpen} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Review</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert} />
          <ModalBody>Please ensure the information is correct.</ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              type="button"
              onClick={() => {
                closeModalAlert();
                setToggleEdit(true);
              }}
              className="text-sm font-semibold leading-6 text-gray-900 py-2 px-4 rounded"
            >
              Review
            </button>
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                const examplePromise = handleSubmit(selectedDataID);

                toast.promise(examplePromise, {
                  success: {
                    title: "Sent",
                    description: "Document succesfully updated",
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

                // Optionally close modal after submitting
                // closeModal();
              }}
              className="text-sm font-semibold leading-6 text-gray-900 py-2 px-4 rounded"
            >
              Update
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
              className="text-sm font-semibold bg-indigo-600 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Confirm
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* delete confirmation alert */}
      <Modal onClose={closeModalAlert2} isOpen={isModalOpen2} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Are you sure to delete?</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert2} />
          <ModalBody>This will delete the data.</ModalBody>
          <ModalFooter className="gap-x-4">
            <button className="px-4 py-2 text-black bg-white text-black rounded-xl border border-gray hover:bg-gray-300 transition-colors duration-300 w-fit cursor-pointer">
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                const deletion =
                  deleting === "incoming"
                    ? deleteFromIncoming(selectedDataID)
                    : deleteFromOutgoing(selectedDataID);

                toast.promise(deletion, {
                  success: {
                    title: "Deleted",
                    description: "Document succesfully Deleted",
                  },
                  error: {
                    title: "Rejected",
                    description: "Something went wrong",
                  },
                  loading: {
                    title: "Deleting",
                    description: "Please wait",
                  },
                });
              }}
              className="text-sm font-semibold bg-indigo-600 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {loadingDeleteIncoming ? "Deleting" : "Confirm"}
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* accept request alert */}
      <Modal onClose={closeModalAlert3} isOpen={isModalOpen3} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Accept this document request?</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert3} />
          <ModalBody>This data will be sent to outgoing categories</ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              className="px-4 py-2 text-black bg-white text-black rounded-xl border border-gray hover:bg-gray-300 transition-colors duration-300 w-fit cursor-pointer"
              onClick={closeModalAlert3}
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                const deletion = sendToOutgoing(selectedDatas);

                toast.promise(deletion, {
                  success: {
                    title: "Sent to Outgoing",
                    description: "Document succesfully Sent",
                  },
                  error: {
                    title: "Rejected",
                    description: "Something went wrong",
                  },
                  loading: {
                    title: "Sending to Outgoing",
                    description: "Please wait",
                  },
                });

                handleOutgoingClick();
              }}
              className="text-sm font-semibold bg-indigo-600 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {loadingSendToOutgoing ? "Sending" : "Confirm"}
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* release modal alert */}
      <Modal onClose={closeModalAlert4} isOpen={isModalOpen4} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Release this document request?</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert4} />
          <ModalBody>This data will be sent to Released categories</ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              className="px-4 py-2 text-black bg-white text-black rounded-xl border border-gray hover:bg-gray-300 transition-colors duration-300 w-fit cursor-pointer"
              onClick={closeModalAlert4}
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                const deletion = sendToReleased(selectedDatas);

                toast.promise(deletion, {
                  success: {
                    title: "Sent to Released",
                    description: "Document succesfully Sent",
                  },
                  error: {
                    title: "Rejected",
                    description: "Something went wrong",
                  },
                  loading: {
                    title: "Sending to Released",
                    description: "Please wait",
                  },
                });

                handleOutgoingClick();
              }}
              className="text-sm font-semibold bg-indigo-600 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {loadingSendToReleased ? "Sending" : "Confirm"}
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default AdminDashboard;
