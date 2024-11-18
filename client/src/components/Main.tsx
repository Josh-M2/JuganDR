import React, { useState } from "react";
import juganlogo from "./../assets/Jugan-logo.png";

import { useNavigate } from "react-router-dom";
import Logout from "./Logout";
import NavigationBar from "./NavigationBar";

const Main: React.FC = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const navigate = useNavigate();
  return (
    <>
      {isAuthenticated ? <NavigationBar /> : ""}
      <div className={`${isAuthenticated ? "h-[70vh]" : "h-[95vh]"}`}>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Barangay Jugan"
              src={juganlogo}
              className="mx-auto h-40 w-auto"
            />
            {/* <h2 className="mt-1 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Select a document
          </h2> */}
          </div>

          <div className=" sm:mx-auto sm:w-full sm:max-w-sm">
            {/* <div>
            <button
              type="submit"
              onClick={() => navigate("/Sign in for Admin")}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-5"
            >
              Sign in (Admin)
            </button>
          </div> */}
            <div>
              <button
                type="submit"
                onClick={() => navigate("/Selection of Documents")}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-5"
              >
                Request Document
              </button>
            </div>

            <p className="mt-3 text-center text-sm text-gray-500">
              Track your document{" "}
              <a
                href="/Track Document"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
