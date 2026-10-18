import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import logo from "../assets/Jugan-logo.png";

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Barangay Jugan home">
            <img src={logo} alt="" />
            <span>
              <strong>Barangay Jugan</strong>
              <small>Document Services</small>
            </span>
          </Link>
          <nav aria-label="Main navigation" className="main-nav">
            <NavLink to="/request">Request a document</NavLink>
            <NavLink to="/track">Track a request</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="site-footer">
        <div className="container footer-inner">
          <span>Barangay Jugan · Consolacion, Cebu</span>
          <span>Keep your tracking code to check your request.</span>
        </div>
      </footer>
    </div>
  );
}
