import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import DocumentSelection from "./components/DocumentSelection";
import Login from "./components/Login";
import Main from "./components/Main";
import FillUpIndigency from "./components/FillUpIndigency";
import FillUpSedula from "./components/FillUpSedula";
import FillUpBarangayClearance from "./components/FillUpBarangayClearance";
import AdminDashboard from "./components/AdminDashBoard";
import ChangePassword from "./components/ChangePassword";
import EmailForChangePassword from "./components/EmailForChangePassword";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route
            path="/Selection of Documents"
            element={<DocumentSelection />}
          />
          <Route path="/Sign in for Admin" element={<Login />} />
          <Route path="/" element={<Main />} />
          <Route path="/Barangay Indigency" element={<FillUpIndigency />} />
          <Route path="/Sedula" element={<FillUpSedula />} />
          <Route
            path="/Barangay Clearance"
            element={<FillUpBarangayClearance />}
          />
          <Route path="/Admin Dashboard" element={<AdminDashboard />} />
          <Route path="/reset-password" element={<ChangePassword />} />
          {/* <Route
            path="/email-reset-password"
            element={<EmailForChangePassword />}
          /> */}
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
