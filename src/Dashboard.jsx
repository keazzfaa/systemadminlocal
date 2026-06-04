import React from "react";
import { useApp } from "./context";

import OwnerDashboard from "./OwnerDashboard";
import AdminDashboard from "./AdminDashboard";
import SalesDashboard from "./SalesDashboard";

export default function Dashboard() {
  const { session } = useApp();

  if (!session) {
    return <div>Loading...</div>;
  }

  switch (session.role) {
    case "owner":
      return <OwnerDashboard />;

    case "admin":
      return <AdminDashboard />;

    case "sales":
      return <SalesDashboard />;

    default:
      return <div>Akses Ditolak</div>;
  }
}