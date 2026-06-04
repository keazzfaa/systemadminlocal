import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PackageCheck, PackageMinus, Truck, Users, Wallet,
  BarChart3, ClipboardList, ShieldCheck, Network, LogOut, Moon, Sun, Menu, X
} from "lucide-react";
import { useApp } from "./context.jsx";

const LINKS = [
  { to:"/dashboard",     label:"Dashboard",    icon:LayoutDashboard, page:"dashboard" },
  { to:"/barang-masuk",  label:"Barang Masuk", icon:PackageCheck,    page:"inventory" },
  { to:"/barang-keluar", label:"Barang Keluar",icon:PackageMinus,    page:"inventory" },
  { to:"/supplier",      label:"Supplier",     icon:Truck,           page:"supplier"  },
  { to:"/customer",      label:"Customer",     icon:Users,           page:"customer"  },
  { to:"/cashflow",      label:"Cash Flow",    icon:Wallet,          page:"cashflow"  },
  { to:"/reports",       label:"Laporan",      icon:BarChart3,       page:"reports"   },
  { to:"/audit",         label:"Audit Log",    icon:ClipboardList,   page:"all"       },
  { to:"/users",         label:"User & Role",  icon:ShieldCheck,     page:"all"       },
];

const ROLE_COLOR = { owner:"badge-red", admin:"badge-navy", sales:"badge-green" };

export default function Navbar() {
  const { session, logout, darkMode, toggleDark, hasPerm, ROLES } = useApp();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const visible = LINKS.filter(l =>
    l.page === "all" ? session?.role === "owner" : hasPerm(l.page)
  );

  const doLogout = () => { logout(); nav("/login"); };

  return (
    <>
      {!open && (
        <button className="hamburger" onClick={() => setOpen(true)}>
          <Menu size={22}/>
        </button>
      )}

      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Network size={20}/></div>
          <div>
            <h2>Neural Ops</h2>
            <p>Enterprise Suite</p>
          </div>
        </div>

        <div className="user-chip">
          <div className="avatar">{session?.avatar || "??"}</div>
          <div className="user-info">
            <strong>{session?.name}</strong>
            <span className={`badge ${ROLE_COLOR[session?.role] || "badge-muted"}`}>
              {ROLES[session?.role]?.label || session?.role}
            </span>
          </div>
        </div>

        <nav className="nav-links">
          {visible.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
              <Icon size={18}/>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item dark-toggle" onClick={toggleDark}>
            {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button className="nav-item logout" onClick={doLogout}>
            <LogOut size={18}/><span>Logout</span>
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)}/>}
    </>
  );
}
