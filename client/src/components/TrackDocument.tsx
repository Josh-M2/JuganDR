import React, { useEffect, useState } from "react";
import {
  Box,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
} from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import juganlogo from "./../assets/Jugan-logo.png";
import Footer from "./Footer";
import { supabase } from "../config";

const TrackDocument: React.FC = () => {
  const [trackIdState, setTrackIdState] = useState("");
  const [isModalOpen4, setIsModalOpen4] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "vertical"
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const steps = [
    { title: "Review", description: "Your document request is being reviewed" },
    { title: "Accepted", description: "Go to barangay hall for interview" },
    { title: "Released", description: "Your document is already released" },
    {
      title: "Rejected",
      description: "Your request may have missing requirements",
    },
  ];

  const filteredSteps =
    activeStep === 3
      ? steps.filter((_, index) => index === 2)
      : activeStep === 4
      ? steps.filter((_, index) => index > 2)
      : activeStep === 0
      ? []
      : steps;

  useEffect(() => {
    const success = searchParams.get("success");
    const trackid = searchParams.get("trackid");

    if (success === "true") {
      setIsModalOpen4(true);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("success");
      setSearchParams(newSearchParams);
    }

    if (trackid) {
      setTrackIdState(trackid);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerWidth <= 768 ? "vertical" : "horizontal");
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateStepBasedOnTable = (tableName: string) => {
    console.log("tableName_trigger: ", tableName);
    switch (tableName) {
      case "incoming":
        setActiveStep(1);
        break;
      case "outgoing":
        setActiveStep(2);
        break;
      case "released":
        setActiveStep(3);
        break;
      case "rejected":
        setActiveStep(4);
        break;
      default:
        setActiveStep(0);
    }
  };

  useEffect(() => {
    if (!trackIdState) return;

    const subscriptions: any[] = [];

    // Subscribe to each table
    const tables = ["incoming", "outgoing", "released", "rejected"];
    tables.forEach((table) => {
      const subscription = supabase
        .channel(`realtime-${table}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table,
            filter: `track_id=eq.${trackIdState}`,
          },
          (payload) => {
            if (payload.new) {
              updateStepBasedOnTable(table);
            }
          }
        )
        .subscribe();

      subscriptions.push(subscription);
    });

    // Fetch initial data from all tables
    const fetchTrackFromTables = async () => {
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select("track_id")
          .eq("track_id", trackIdState);

        if (data && data.length > 0) {
          updateStepBasedOnTable(table);
          return;
        } else if (error) {
          console.error(`Error fetching data from ${table}:`, error);
        }
      }

      // If no match found in any table
      setActiveStep(0);
    };

    fetchTrackFromTables();

    return () => {
      // Cleanup subscriptions
      subscriptions.forEach((sub) => supabase.removeChannel(sub));
    };
  }, [trackIdState]);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Barangay Jugan"
            src={juganlogo}
            className="mx-auto h-40 w-auto"
          />
          <h2 className="mt-1 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Track document
          </h2>
        </div>

        <div className="sm:col-span-3 flex items-center gap-2">
          <label
            htmlFor="trackid"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Track ID
          </label>
          <div className="flex flex-row gap-1">
            <Input
              id="trackid"
              name="trackid"
              value={trackIdState}
              onChange={(e) => setTrackIdState(e.target.value)}
              type="text"
            />
          </div>
        </div>
        <label className="text-[15px] text-gray-400 my-2">
          Your document tracking ID: {trackIdState}
        </label>
        <Stepper
          index={activeStep}
          orientation={orientation}
          height="300px"
          className="responsive-stepper"
        >
          {filteredSteps.length > 0 ? (
            filteredSteps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))
          ) : (
            <p>No data</p>
          )}
        </Stepper>

        <p className="mt-3 text-center text-sm text-gray-500">
          Request Another Document{" "}
          <a
            href="/Selection of Documents"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            here
          </a>
        </p>
      </div>
      <Footer />

      <Modal
        onClose={() => setIsModalOpen4(false)}
        isOpen={isModalOpen4}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Important</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Your tracking ID is "<b>{trackIdState}</b>".
            <br />
            <br />
            Please bring your valid ID and Purok certificate that you attached
            during fill-up, upon claiming your requested document.
          </ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              onClick={() => setIsModalOpen4(false)}
              className="text-sm font-semibold bg-indigo-600 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Thanks
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TrackDocument;
