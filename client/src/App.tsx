import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import DocumentSelection from "./components/DocumentSelection";
import Login from "./components/Login";
import Main from "./components/Main";
import AdminDashboard from "./components/AdminDashBoard";
import EmailForChangePassword from "./components/EmailForChangePassword";
import ChangePassword from "./components/ChangePassword";

import FillUpIndigency from "./components/FillUpIndigency";
import FillUpBarangayCertificate from "./components/FillUpBarangayCertificate";
import FillUpBarangayClearance from "./components/FillUpBarangayClearance";
import FillUpSeniorCitizenCertificate from "./components/FillUpSeniorCitizenCertificate";
import FillUpBarangayBusinessPermit from "./components/FillUpBarangayBusinessPermit";
import FillUpNoClaimsAndConflict from "./components/FillUpNoClaimsAndConflict";
import FillUpBarangayResidency from "./components/FillUpBarangayResidency";
import TrackDocument from "./components/TrackDocument";

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
          <Route
            path="/Barangay Certificate"
            element={<FillUpBarangayCertificate />}
          />
          <Route
            path="/Barangay Clearance"
            element={<FillUpBarangayClearance />}
          />
          <Route
            path="/Senior Citizen Certificate"
            element={<FillUpSeniorCitizenCertificate />}
          />
          <Route
            path="/Barangay Business Permit"
            element={<FillUpBarangayBusinessPermit />}
          />
          <Route
            path="/No Claims And Conflict"
            element={<FillUpNoClaimsAndConflict />}
          />
          <Route
            path="/Barangay Residency"
            element={<FillUpBarangayResidency />}
          />
          <Route path="/Track Document" element={<TrackDocument />} />
          <Route path="/Admin Dashboard" element={<AdminDashboard />} />
          <Route path="/reset-password" element={<ChangePassword />} />
          <Route
            path="/email-reset-password"
            element={<EmailForChangePassword />}
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
