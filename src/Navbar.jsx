import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PackageCheck, PackageMinus, Truck, Users, Wallet,
  BarChart3, ClipboardList, ShieldCheck, Network, LogOut, Moon, Sun,
  Menu, X, Store, FileText, MapPin, Package, BarChart2, ChevronDown, ChevronRight
} from "lucide-react";
import { useApp } from "./context.jsx";

// Grup navigasi
const NAV_GROUPS = [
  {
    label: "Utama",
    items: [
      { to:"/dashboard",     label:"Dashboard",    icon:LayoutDashboard, page:"dashboard" },
    ]
  },
  {
    label: "Inventori",
    items: [
      { to:"/barang-masuk",  label:"Barang Masuk", icon:PackageCheck,  page:"inventory" },
      { to:"/barang-keluar", label:"Barang Keluar",icon:PackageMinus,  page:"inventory" },
      { to:"/stock-gudang",  label:"Stock Gudang", icon:Package,       page:"inventory" },
      { to:"/stock-outlet",  label:"Stock Outlet", icon:Package,       page:"dashboard" },
    ]
  },
  {
    label: "Mitra",
    items: [
      { to:"/supplier",          label:"Supplier",        icon:Truck,    page:"supplier"  },
      { to:"/customer",          label:"Customer",        icon:Users,    page:"customer"  },
      { to:"/register-outlet",   label:"Register Outlet", icon:Store,    page:"dashboard" },
    ]
  },
  {
    label: "Keuangan",
    items: [
      { to:"/cashflow",        label:"Cash Flow",     icon:Wallet,   page:"cashflow"  },
      { to:"/invoice-piutang", label:"Invoice Piutang",icon:FileText, page:"dashboard" },
    ]
  },
  {
    label: "Laporan",
    items: [
      { to:"/laporan-penjualan",  label:"Laporan Penjualan",  icon:BarChart2,     page:"reports"   },
      { to:"/laporan-pengiriman", label:"Laporan Pengiriman", icon:Truck,         page:"reports"   },
      { to:"/absensi-outlet",     label:"Absensi & Lokasi",   icon:MapPin,        page:"dashboard" },
      { to:"/reports",            label:"Analitik",           icon:BarChart3,     page:"reports"   },
    ]
  },
  {
    label: "Admin",
    items: [
      { to:"/audit", label:"Audit Log",  icon:ClipboardList, page:"all" },
      { to:"/users", label:"User & Role",icon:ShieldCheck,   page:"all" },
    ]
  },
];

const ROLE_COLOR = { owner:"badge-red", admin:"badge-navy", sales:"badge-green" };

export default function Navbar() {
  const { session, logout, darkMode, toggleDark, hasPerm, ROLES } = useApp();
  const [open, setOpen]   = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const nav = useNavigate();

  const doLogout = () => { logout(); nav("/login"); };

  const toggleGroup = (label) => setCollapsed(p=>({...p,[label]:!p[label]}));

  const isVisible = (item) => {
    if(item.page==="all") return session?.role==="owner";
    return hasPerm(item.page) || session?.role==="owner";
  };

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

        <nav className="nav-links" style={{overflowY:"auto",flex:1}}>
          {NAV_GROUPS.map(group=>{
            const visibleItems = group.items.filter(isVisible);
            if(visibleItems.length===0) return null;
            const isCollapsed = collapsed[group.label];
            return (
              <div key={group.label}>
                <button
                  onClick={()=>toggleGroup(group.label)}
                  style={{
                    display:"flex",alignItems:"center",justifyContent:"space-between",
                    width:"100%",padding:"6px 16px",background:"transparent",border:"none",
                    color:"var(--muted)",fontSize:11,fontWeight:700,letterSpacing:"0.08em",
                    textTransform:"uppercase",cursor:"pointer",marginTop:8,
                  }}>
                  <span>{group.label}</span>
                  {isCollapsed ? <ChevronRight size={13}/> : <ChevronDown size={13}/>}
                </button>
                {!isCollapsed && visibleItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} onClick={() => setOpen(false)}
                    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                    <Icon size={18}/>
                    <span>{label}</span>
                  </NavLink>
                ))}
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
