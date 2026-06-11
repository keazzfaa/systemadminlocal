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
  import RegisterOutlet from "./RegisterOutlet.jsx";
  import InvoicePiutang from "./InvoicePiutang.jsx";
  import AbsensiOutlet from "./AbsensiOutlet.jsx";
  import LaporanPenjualan from "./LaporanPenjualan.jsx";
  import LaporanPengiriman from "./LaporanPengiriman.jsx";

  function Guard({ children, page, roles }) {
    const { session, hasPerm } = useApp();
    if (!session) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(session.role)) return <Navigate to="/dashboard" replace />;
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
            <Route path="/supplier"          element={<Guard page="supplier"><Supplier /></Guard>} />
            <Route path="/customer"          element={<Guard page="customer"><Customer /></Guard>} />
            <Route path="/cashflow"          element={<Guard page="cashflow"><CashFlow /></Guard>} />
            <Route path="/reports"           element={<Guard page="reports"><Reports /></Guard>} />
            <Route path="/audit"             element={<Guard page="all"><AuditLog /></Guard>} />
            <Route path="/users"             element={<Guard page="all"><UserManagement /></Guard>} />
            {/* Halaman baru */}
            <Route path="/register-outlet"   element={<Guard page="dashboard"><RegisterOutlet /></Guard>} />
            <Route path="/invoice-piutang"   element={<Guard page="dashboard"><InvoicePiutang /></Guard>} />
            <Route path="/absensi-outlet"    element={<Guard roles={["owner","admin","sales"]}><AbsensiOutlet /></Guard>} />
            <Route path="/stock-gudang"      element={<Guard page="inventory"><StockGudang /></Guard>} />
            <Route path="/stock-outlet"      element={<Guard page="dashboard"><StockOutlet /></Guard>} />
            <Route path="/laporan-penjualan" element={<Guard page="reports"><LaporanPenjualan /></Guard>} />
            <Route path="/laporan-pengiriman"element={<Guard page="reports"><LaporanPengiriman /></Guard>} />
          </Routes>
        </Shell>
      </BrowserRouter>
    );
  }
