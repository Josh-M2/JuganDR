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
  useSteps,
} from "@chakra-ui/react";
import LoaderRing from "./LoaderRing";
import { useNavigate, useSearchParams } from "react-router-dom";
import juganlogo from "./../assets/Jugan-logo.png";
import Footer from "./Footer";
import axios from "axios";
import { supabase } from "../config";
const urlEnv = process.env.REACT_APP_SERVER_ACCESS || "";

const TrackDocument: React.FC = () => {
  const [trackIdState, setTrackIdState] = useState("");
  const [loadingFetchTrack, setLoadingFetchTrack] = useState(false);
  const [isModalOpen4, setIsModalOpen4] = useState(false);
  const navigate = useNavigate();
  const openModalAlert4 = () => setIsModalOpen4(true);
  const closeModalAlert4 = () => setIsModalOpen4(false);
  const [searchParams, setSearchParams] = useSearchParams();
  let success = searchParams.get("success");
  let trackid = searchParams.get("trackid");

  useEffect(() => {
    if (success !== null) {
      switch (success) {
        case "true":
          openModalAlert4();
          const newSearchParams1 = new URLSearchParams(searchParams);
          newSearchParams1.delete("success");
          setSearchParams(newSearchParams1);
          success = "";

          break;
        // case "false":
        //   openDialog2();
        //   const newSearchParams2 = new URLSearchParams(searchParams);
        //   newSearchParams2.delete("type");
        //   setSearchParams(newSearchParams2);
        //   success = "";
        //   break;

        default:
          break;
      }
    }

    if (trackid !== null) {
      setTrackIdState(trackid);
    }
  }, []);
  const [activeStep, setActiveStep] = useState(0);

  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "vertical"
  );
  const steps = [
    { title: "Review", description: "Your document request is being review" },
    { title: "Accepted", description: "Go to barangay hall for interview" },

    { title: "Released", description: "Your document already released" },
    {
      title: "Rejected",
      description: "Your request may have a lacking requirements",
    },
  ];

  const filteredSteps =
    activeStep === 4
      ? steps.filter((_, index) => index > 2) // Show only steps after index 2
      : activeStep === 0
      ? [] // Show no steps
      : steps; // Default to all steps

  // Default is vertical

  // Update orientation based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setOrientation("vertical"); // Mobile or small screens
      } else {
        setOrientation("horizontal"); // Larger screens (PC)
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check on component mount

    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  const fetchTrack = async () => {
    setLoadingFetchTrack(true);
    try {
      const response = await axios.get(`${urlEnv}fetch-data-for-tracking`, {
        params: { trackIdState },
      });
      if (response.data?.in) {
        switch (response.data.in) {
          case "incoming":
            console.log("incoming");
            setActiveStep(1);
            break;
          case "outgoing":
            console.log("outgoing");
            setActiveStep(2);
            break;
          case "released":
            console.log("released");
            setActiveStep(3);
            break;
          case "rejected":
            console.log("rejected");
            setActiveStep(4);
            break;
          default:
            console.log("No Data");
            break;
        }
      } else {
        console.log("No Data");
        setActiveStep(0);
      }
    } catch (error: any) {
      console.log("error fetching track", error);
    }
    setLoadingFetchTrack(false);
  };

  useEffect(() => {
    if (trackIdState) {
      fetchTrack();

      const interval = setInterval(fetchTrack, 60000);
      return () => clearInterval(interval);
    }
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

        <div className="sm:col-span-3">
          <label
            htmlFor="trackid"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Track ID
          </label>
          <div className="mt-2 flex flex-row gap-1">
            <Input
              id="trackid"
              name="trackid"
              value={trackIdState}
              onChange={(e) => {
                setTrackIdState(e.target.value);
                const newSearchParams1 = new URLSearchParams(searchParams);
                newSearchParams1.delete("trackid");
                setSearchParams(newSearchParams1);
                trackid = "";
              }}
              type="text"
            />
            <button
              onClick={() => {
                fetchTrack();
              }}
              className="text-sm font-semibold bg-indigo-600 leading-6 text-slate-50 py-2 px-4 rounded-xl hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={loadingFetchTrack}
            >
              Track
            </button>
          </div>
        </div>
        <label className="text-[15px] text-gray-400 my-2">
          Your document tracking ID: {trackIdState}
        </label>
        {loadingFetchTrack ? (
          <Stepper
            index={activeStep}
            orientation={orientation}
            height="300px"
            className="responsive-stepper"
          >
            {/* <LoaderRing /> */}
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
              <p>No data </p>
            )}
          </Stepper>
        ) : (
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
              <p>No data </p>
            )}
          </Stepper>
        )}

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

      <Modal onClose={closeModalAlert4} isOpen={isModalOpen4} isCentered>
        <ModalOverlay />
        <ModalContent
          style={{
            marginLeft: "0.75rem",
            marginRight: "0.75rem",
          }}
        >
          <ModalHeader>Important</ModalHeader>
          <ModalCloseButton onClick={closeModalAlert4} />
          <ModalBody>
            Your tracking ID is "<b>{trackid}</b>".
            <br />
            <br />
            Please bring your valid ID and Purok certificate that you attached
            during fill up, upon claiming your requested document.
          </ModalBody>
          <ModalFooter className="gap-x-4">
            <button
              onClick={closeModalAlert4}
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
