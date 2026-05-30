import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import InventoryManagement from "./InventoryManagement.jsx";
import NewSalesRecord from "./NewSalesRecord.jsx";
import ReportsAnalytics from "./ReportsAnalytics.jsx";
import SecurityAudit from "./SecurityAudit.jsx";
import Operations from "./Operations.jsx";

function Shell({ children }) {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname === "/login") return children;
  return <div className="app-shell"><Navbar /><main className="page-content">{children}</main></div>;
}

export default function App() {
  return <BrowserRouter><Shell><Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/inventory" element={<InventoryManagement />} />
    <Route path="/new-sale" element={<NewSalesRecord />} />
    <Route path="/reports" element={<ReportsAnalytics />} />
    <Route path="/security" element={<SecurityAudit />} />
    <Route path="/operations" element={<Operations />} />
  </Routes></Shell></BrowserRouter>;
}
