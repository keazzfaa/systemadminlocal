import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PackageCheck, PackageMinus, Truck, Users, Wallet,
  BarChart3, ClipboardList, ShieldCheck, Network, LogOut, Moon, Sun,
  Menu, X, UserCircle, ChevronRight, ChevronDown, Store, FileText, MapPin
} from "lucide-react";
import { useApp } from "./context.jsx";

const LINKS = [
  { to:"/dashboard",       label:"Dashboard",        icon:LayoutDashboard, page:"dashboard" },
  { to:"/barang-masuk",    label:"Barang Masuk",     icon:PackageCheck,    page:"inventory" },
  { to:"/barang-keluar",   label:"Barang Keluar",    icon:PackageMinus,    page:"inventory" },
  { to:"/stock-gudang",    label:"Stock Gudang",     icon:PackageCheck,    page:"stock-gudang" },
  { to:"/stock-outlet",    label:"Stock Outlet",     icon:PackageCheck,    page:"stock-outlet" },
  { to:"/supplier",        label:"Supplier",         icon:Truck,           page:"supplier"  },
  { to:"/customer",        label:"Customer",         icon:Users,           page:"customer"  },
  { to:"/cashflow",        label:"Cash Flow",        icon:Wallet,          page:"cashflow"  },
  { to:"/reports",         label:"Laporan",          icon:BarChart3,       page:"reports"   },
  { to:"/register-outlet", label:"Register Outlet",  icon:Store,           page:"register-outlet" },
  { to:"/invoice-piutang", label:"Invoice Piutang",  icon:FileText,        page:"invoice-piutang" },
  { to:"/absensi",         label:"Absensi Sales",    icon:MapPin,          page:"absensi"   },
  { to:"/audit",           label:"Audit Log",        icon:ClipboardList,   page:"all"       },
  { to:"/users",           label:"User & Role",      icon:ShieldCheck,     page:"all"       },
];

const MENU_GROUPS = [
  {
    title: "UTAMA",
    items: ["Dashboard"]
  },
  {
    title: "INVENTORI",
    items: ["Barang Masuk","Barang Keluar","Stock Gudang","Stock Outlet"]
  },
  {
    title: "MITRA",
    items: ["Supplier","Customer","Register Outlet"]
  },
  {
    title: "KEUANGAN",
    items: ["Cash Flow","Invoice Piutang","Laporan"]
  },
  {
    title: "SISTEM",
    items: ["Absensi Sales","Audit Log","User & Role","Profile"]
  }
];

const ROLE_COLOR = { owner:"badge-red", admin:"badge-navy", sales:"badge-green" };

export default function Navbar() {
  const { session, logout, darkMode, toggleDark, hasPerm, ROLES } = useApp();
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState({
    utama: true,
    inventori: true,
    mitra: true,
    keuangan: true,
    sistem: true,
  });
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

        <NavLink to="/profile" className="user-chip user-chip-link" onClick={() => setOpen(false)}>
          <div className="avatar-wrap-sm">
            {session?.photoUrl
              ? <img src={session.photoUrl} alt="av" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
              : <div className="avatar">{session?.avatar || "??"}</div>
            }
          </div>
          <div className="user-info">
            <strong>{session?.name}</strong>
            <span className={`badge ${ROLE_COLOR[session?.role] || "badge-muted"}`}>
              {ROLES[session?.role]?.label || session?.role}
            </span>
          </div>
          <ChevronRight size={15} style={{color:"var(--muted)",marginLeft:"auto",flexShrink:0}}/>
        </NavLink>

        <nav className="nav-links" style={{overflowY:"auto",flex:1}}>
  {MENU_GROUPS.map(group => {
    const key = group.title.toLowerCase();

    return (
      <div key={group.title} className="nav-group">
        <button
          className="nav-group-header"
          onClick={() =>
            setSections(prev => ({
              ...prev,
              [key]: !prev[key]
            }))
          }
        >
          <span>{group.title}</span>
          {sections[key]
            ? <ChevronDown size={14}/>
            : <ChevronRight size={14}/>
          }
        </button>

        {sections[key] && (
          <>
            {visible
              .filter(item => group.items.includes(item.label))
              .map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `nav-item${isActive ? " active" : ""}`
                  }
                >
                  <Icon size={18}/>
                  <span>{label}</span>
                </NavLink>
              ))}

            {group.title === "SISTEM" && (
              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `nav-item${isActive ? " active" : ""}`
                }
              >
                <UserCircle size={18}/>
                <span>Profile</span>
              </NavLink>
            )}
          </>
        )}
      </div>
    );
  })}
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
