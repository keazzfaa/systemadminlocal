import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, BarChart3, ShieldCheck, Activity, LogOut, Network } from "lucide-react";
const links=[['/dashboard','Dashboard',LayoutDashboard],['/inventory','Inventory',Package],['/new-sale','New Sale',ShoppingCart],['/reports','Reports',BarChart3],['/security','Security',ShieldCheck],['/operations','Operations',Activity]];
export default function Navbar(){return <aside className="sidebar"><div className="brand"><div className="brand-icon"><Network size={22}/></div><div><h2>Neural Ops</h2><p>Enterprise Suite</p></div></div><nav className="nav-links">{links.map(([to,label,Icon])=><NavLink key={to} to={to} className={({isActive})=>isActive?'nav-item active':'nav-item'}><Icon size={19}/><span>{label}</span></NavLink>)}</nav><NavLink to="/login" className="nav-item logout"><LogOut size={19}/><span>Logout</span></NavLink></aside>}
