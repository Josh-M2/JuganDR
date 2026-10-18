import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/base.css";
import "./styles/home.css";
import "./styles/requests.css";
import "./styles/tracking.css";
import "./styles/admin.css";
import "./styles/loading.css";
import "./styles/responsive.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
