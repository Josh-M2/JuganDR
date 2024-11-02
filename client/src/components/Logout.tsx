import axios from "axios";
import React from "react";

const Logout: React.FC = () => {
  const handleLogout = async () => {
    try {
      try {
        await axios.post(
          `${process.env.REACT_APP_SERVER_ACCESS}logout`,
          {},
          {
            withCredentials: true, // Send cookies
          }
        );
      } catch (error: any) {
        console.log("Logout failed");
        // throw new Error("Logout failed");
      }
      localStorage.removeItem("isAuthenticated"); // Remove auth flag
      localStorage.removeItem("BearerToken");
      window.location.reload(); // Reload the app to reflect logout state
    } catch (error) {
      console.error("Logout failed");
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
