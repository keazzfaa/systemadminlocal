import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useApp } from "./context.jsx";
import Navbar from "./Navbar.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import BarangMasuk from "./BarangMasuk.jsx";
import BarangKeluar from "./BarangKeluar.jsx";
import Supplier from "./Supplier.jsx";
import Customer from "./Customer.jsx";
import CashFlow from "./CashFlow.jsx";
import Reports from "./Reports.jsx";
import AuditLog from "./AuditLog.jsx";
import UserManagement from "./UserManagement.jsx";

function Guard({ children, page }) {
  const { session, hasPerm } = useApp();
  if (!session) return <Navigate to="/login" replace />;
  if (page && !hasPerm(page) && session.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function Shell({ children }) {
  const { pathname } = useLocation();
  const { darkMode } = useApp();
  if (pathname === "/" || pathname === "/login") return children;
  return (
    <div className={`app-shell${darkMode ? " dark" : ""}`}>
      <Navbar />
      <main className="page-content">{children}</main>
    </div>
  );P
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard"    element={<Guard page="dashboard"><Dashboard /></Guard>} />
          <Route path="/barang-masuk" element={<Guard page="inventory"><BarangMasuk /></Guard>} />
          <Route path="/barang-keluar"element={<Guard page="inventory"><BarangKeluar /></Guard>} />
          <Route path="/supplier"     element={<Guard page="supplier"><Supplier /></Guard>} />
          <Route path="/customer"     element={<Guard page="customer"><Customer /></Guard>} />
          <Route path="/cashflow"     element={<Guard page="cashflow"><CashFlow /></Guard>} />
          <Route path="/reports"      element={<Guard page="reports"><Reports /></Guard>} />
          <Route path="/audit"        element={<Guard page="all"><AuditLog /></Guard>} />
          <Route path="/users"        element={<Guard page="all"><UserManagement /></Guard>} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
