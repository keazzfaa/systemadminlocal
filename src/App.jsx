import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useApp } from "./context.jsx";
import Navbar from "./Navbar.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Dashboard from "./Dashboard.jsx";
import BarangMasuk from "./BarangMasuk.jsx";
import BarangKeluar from "./BarangKeluar.jsx";
import StockGudang from "./StockGudang.jsx";
import StockOutlet from "./StockOutlet.jsx";
import Supplier from "./Supplier.jsx";
import Customer from "./Customer.jsx";
import CashFlow from "./CashFlow.jsx";
import Reports from "./Reports.jsx";
import AuditLog from "./AuditLog.jsx";
import UserManagement from "./UserManagement.jsx";
import Profile from "./Profile.jsx";
import RegisterOutlet from "./RegisterOutlet.jsx";
import InvoicePiutang from "./InvoicePiutang.jsx";
import Absensi from "./Absensi.jsx";

function Guard({ children, page }) {
  const { session, hasPerm } = useApp();
  if (!session) return <Navigate to="/login" replace />;
  if (page && !hasPerm(page) && session.role !== "owner") return <Navigate to="/dashboard" replace />;
  return children;
}

const PUBLIC = ["/", "/login", "/register"];

function Shell({ children }) {
  const { pathname } = useLocation();
  const { darkMode } = useApp();
  if (PUBLIC.includes(pathname)) return children;
  return (
    <div className={`app-shell${darkMode ? " dark" : ""}`}>
      <Navbar />
      <main className="page-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/"                  element={<Navigate to="/login" replace />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />
          <Route path="/dashboard"         element={<Guard page="dashboard"><Dashboard /></Guard>} />
          <Route path="/barang-masuk"      element={<Guard page="inventory"><BarangMasuk /></Guard>} />
          <Route path="/barang-keluar"     element={<Guard page="inventory"><BarangKeluar /></Guard>} />
          <Route path="/stock-gudang"      element={<Guard page="inventory"><StockGudang /></Guard>} />
          <Route path="/stock-outlet"      element={<Guard page="inventory"><StockOutlet /></Guard>} />
          <Route path="/supplier"          element={<Guard page="mitra"><Supplier /></Guard>} />
          <Route path="/customer"          element={<Guard page="mitra"><Customer /></Guard>} />
          <Route path="/register-outlet"   element={<Guard page="mitra"><RegisterOutlet /></Guard>} />
          <Route path="/cashflow"          element={<Guard page="keuangan"><CashFlow /></Guard>} />
          <Route path="/reports"           element={<Guard page="keuangan"><Reports /></Guard>} />
          <Route path="/invoice-piutang"   element={<Guard page="keuangan"><InvoicePiutang /></Guard>} />
          <Route path="/audit"             element={<Guard page="sistem"><AuditLog /></Guard>} />
          <Route path="/absensi"           element={<Guard page="sistem"><Absensi /></Guard>} />
          <Route path="/users"             element={<Guard page="sistem"><UserManagement /></Guard>} />
          <Route path="/profile"           element={<Guard><Profile /></Guard>} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
