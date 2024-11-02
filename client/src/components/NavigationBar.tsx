import { useLocation } from "react-router-dom";
import React from "react";
import logo from "./../assets/Jugan-logo.png";
import { PopoverGroup } from "@headlessui/react";
import Logout from "./Logout";

const NavigationBar: React.FC = () => {
  const location = useLocation();
  const isAdminDashboard = location.pathname === "/Admin%20Dashboard";
  const isDocuments = location.pathname === "/Selection%20of%20Documents";
  return (
    <>
      <header className="bg-white/90 backdrop-blur-lg top-0 z-50">
        <nav
          aria-label="Global"
          className="mx-auto flex max-w-7xl items-center justify-between p-4  lg:px-8 sticky"
        >
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <img src={logo} alt="logo" className="w-167px w-[64px]" />
            </a>
          </div>
          <div className="flex gap-x-8 align-center h-[64px]">
            <a
              href="/Admin Dashboard"
              className={`relative text-black px-2 py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-900 after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left hover:bg-blue-100 hover:bg-opacity-50 font-semibold pt-5 px-4 ${
                isAdminDashboard
                  ? "after:scale-x-100 bg-blue-100 bg-opacity-50"
                  : "after:scale-x-0"
              }`}
            >
              Dashboard
            </a>
            <a
              href="/Selection of Documents"
              className={`relative text-black px-2 py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-900 after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left hover:bg-blue-100 hover:bg-opacity-50 font-semibold pt-5 px-4 ${
                isDocuments
                  ? "after:scale-x-100 bg-blue-100 bg-opacity-50"
                  : "after:scale-x-0"
              }`}
            >
              Documents
            </a>

            <a
              href="#"
              className={`relative text-black px-2 py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-900 after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left hover:bg-blue-100 hover:bg-opacity-50 font-semibold pt-5 px-4`}
            >
              <Logout />
            </a>
          </div>
        </nav>
      </header>
    </>
  );
};

export default NavigationBar;
