import React, { useState } from "react";
import juganlogo from "./../assets/Jugan-logo.png";
import check from "./../assets/check.svg";
import dropdown from "./../assets/chevron-down.svg";

import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer";

const documents = [
  {
    id: 1,
    name: "Barangay indigency",
  },
  {
    id: 2,
    name: "Sedula",
  },
  {
    id: 3,
    name: "Barangay Clearance",
  },
];

const DocumentSelection: React.FC = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const [selectedDocs, setSelectedDocs] = useState(documents[0]);
  const navigate = useNavigate();

  const handleButtonClicked = () => {
    switch (selectedDocs.id) {
      case 1:
        navigate(`/Barangay Indigency`);
        break;
      case 2:
        navigate(`/Sedula`);
        break;
      case 3:
        navigate(`/Barangay Clearance`);
        break;
      default:
        break;
    }
  };

  console.log("selectedDocs", selectedDocs);
  return (
    <>
      {isAuthenticated ? <NavigationBar /> : ""}

      <div className={`${isAuthenticated ? "h-[70vh]" : "h-[95vh]"}`}>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 my-[52px] lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Barangay Jugan"
              src={juganlogo}
              className="mx-auto h-40 w-auto"
            />
            <h2 className="mt-1 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Select a document
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Documents
              </label>
              <Listbox value={selectedDocs} onChange={setSelectedDocs}>
                {/* <Label className="block text-sm font-medium leading-6 text-gray-900">
                Assigned to
              </Label> */}
                <div className="relative mt-2">
                  <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                    <span className="flex items-center">
                      <span className="ml-3 block truncate">
                        {selectedDocs.name}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                      {/* <ChevronUpDownIcon
                      aria-hidden="true"
                      className="h-5 w-5 text-gray-400"
                    /> */}
                      <img
                        src={dropdown}
                        alt="dropdown"
                        className="h-5 w-5 text-gray-400"
                      />
                    </span>
                  </ListboxButton>

                  <ListboxOptions
                    transition
                    className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
                  >
                    {documents.map((docs) => (
                      <ListboxOption
                        key={docs.id}
                        value={docs}
                        className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                      >
                        <div className="flex items-center">
                          <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                            {docs.name}
                          </span>
                        </div>

                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                          {/* <CheckIcon aria-hidden="true" className="h-5 w-5" /> */}
                          <img src={check} alt="check" className="h-5 w-5" />
                        </span>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>

            <div>
              <button
                type="submit"
                onClick={handleButtonClicked}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-5"
              >
                Next
              </button>
            </div>

            {/* <p className="mt-3 text-center text-sm text-gray-500">
            Track your document{" "}
            <a
              href="#"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              here
            </a>
          </p> */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DocumentSelection;
