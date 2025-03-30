import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import "./index.css";

// PAGES -------------------------------------------------------

import Welcome from "./pages/Welcome";
import Navbar from "./components/Navbar"; // Import the Navbar


// Authentication
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Navigation
import Home from "./pages/Home";
import ClientProfile from "./pages/ClientProfile";
import ProviderProfile from "./pages/ProviderProfile";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

// Edit and Add new plan
import ConfigPlan from "./pages/ConfigPlan";

// Business public profile
import ProviderPage from "./pages/ProviderPage";


// Conditional rendering - only using Navbar for pages in protected layout
const ProtectedLayout = () => {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Public routes without the Navbar */}
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes with the Navbar */}
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/provider-profile" element={<ProviderProfile />} />
          <Route path="/client-profile" element={<ClientProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/config-plan" element={<ConfigPlan />} />
          <Route path="/config-plan" element={<ConfigPlan />} />
          <Route path="/config-plan/:planId" element={<ConfigPlan />} />
          <Route path="/provider-page/:providerId" element={<ProviderPage />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
