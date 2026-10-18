import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Layout from "./shared/Layout";
import HomePage from "./features/home/HomePage";
import DocumentPicker from "./features/requests/DocumentPicker";
import RequestForm from "./features/requests/RequestForm";
import TrackPage from "./features/tracking/TrackPage";
import AdminLogin from "./features/admin/AdminLogin";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminDetail from "./features/admin/AdminDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="request" element={<DocumentPicker />} />
          <Route path="request/:typeId" element={<RequestForm />} />
          <Route path="track" element={<TrackPage />} />
          <Route path="track/:code" element={<TrackPage />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/requests/:id" element={<AdminDetail />} />
          <Route
            path="*"
            element={
              <main className="container page-space">
                <div className="page-heading">
                  <span className="eyebrow">404</span>
                  <h1>Page not found</h1>
                  <p>The page you requested is unavailable.</p>
                  <Link to="/" className="button button-primary">
                    Return home
                  </Link>
                </div>
              </main>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
