import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AppContext = createContext(null);

const ROLES = {
  admin:   { label: "Administrator", color: "red",    perms: ["all"] },
  manager: { label: "Manager",       color: "navy",   perms: ["dashboard","inventory","cashflow","reports","supplier","customer"] },
  staff:   { label: "Staff",         color: "green",  perms: ["dashboard","inventory","sales"] },
  viewer:  { label: "Viewer",        color: "muted",  perms: ["dashboard","reports"] },
};

const SEED_USERS = [
  { id:1, name:"Super Admin",   email:"admin@neuralops.id",   role:"admin",   avatar:"SA", password:"admin123"   },
  { id:2, name:"Marcus Tan",    email:"marcus@neuralops.id",  role:"manager", avatar:"MT", password:"manager123" },
  { id:3, name:"Sari Dewi",     email:"sari@neuralops.id",    role:"staff",   avatar:"SD", password:"staff123"   },
  { id:4, name:"Viewer Guest",  email:"viewer@neuralops.id",  role:"viewer",  avatar:"VG", password:"viewer123"  },
];

const SEED_SUPPLIERS = [
  { id:1, name:"PT. Maju Bersama",    contact:"Budi Santoso",   phone:"0811-2345-6789", email:"budi@majubersama.co.id",  category:"Elektronik",  status:"Aktif",    lastOrder:"2025-01-10" },
  { id:2, name:"CV. Sumber Makmur",   contact:"Dewi Rahayu",    phone:"0822-3456-7890", email:"dewi@sumbermakmur.com",   category:"Perangkat",   status:"Aktif",    lastOrder:"2025-01-08" },
  { id:3, name:"PT. Global Tech",     contact:"Ahmad Fauzi",    phone:"0833-4567-8901", email:"ahmad@globaltech.id",     category:"Komponen",    status:"Inaktif",  lastOrder:"2024-12-20" },
  { id:4, name:"UD. Karya Mandiri",   contact:"Sri Wahyuni",    phone:"0844-5678-9012", email:"sri@karyamandiri.co.id",  category:"Aksesoris",   status:"Aktif",    lastOrder:"2025-01-12" },
];

const SEED_CUSTOMERS = [
  { id:1, name:"PT. Nusantara Digital",  contact:"Rizky Pratama",  phone:"0855-1234-5678", email:"rizky@nusantaradigital.id",  city:"Jakarta",   status:"Aktif",  totalBeli: 145000000 },
  { id:2, name:"CV. Berkah Jaya",        contact:"Eka Susanto",    phone:"0866-2345-6789", email:"eka@berkahjaya.com",          city:"Surabaya",  status:"Aktif",  totalBeli: 87500000  },
  { id:3, name:"PT. Mitra Solusi",       contact:"Lina Wati",      phone:"0877-3456-7890", email:"lina@mitrasolusi.co.id",      city:"Bandung",   status:"Aktif",  totalBeli: 220000000 },
  { id:4, name:"UD. Sejahtera Abadi",    contact:"Hendra Gunawan", phone:"0888-4567-8901", email:"hendra@sejahteraabadi.id",    city:"Malang",    status:"Nonaktif", totalBeli: 34200000  },
];

const SEED_ITEMS_IN = [
  { id:1, tanggal:"2025-01-12", kode:"IN-001", nama:"Edge Compute Unit v2",    qty:50,  satuan:"unit",  harga:4500000,  supplier:"PT. Maju Bersama",  total:225000000,  keterangan:"Restock Q1" },
  { id:2, tanggal:"2025-01-10", kode:"IN-002", nama:"Neural Interface Bridge", qty:20,  satuan:"unit",  harga:2200000,  supplier:"CV. Sumber Makmur", total:44000000,   keterangan:"Order Reguler" },
  { id:3, tanggal:"2025-01-08", kode:"IN-003", nama:"Solid State Array 12TB",  qty:100, satuan:"unit",  harga:1800000,  supplier:"PT. Global Tech",   total:180000000,  keterangan:"Stok Gudang" },
  { id:4, tanggal:"2025-01-05", kode:"IN-004", nama:"Quantum Processor X1",   qty:10,  satuan:"unit",  harga:12000000, supplier:"PT. Maju Bersama",  total:120000000,  keterangan:"Produk Baru" },
];

const SEED_ITEMS_OUT = [
  { id:1, tanggal:"2025-01-13", kode:"OUT-001", nama:"Edge Compute Unit v2",    qty:30,  satuan:"unit", harga:6500000,  customer:"PT. Nusantara Digital", total:195000000, keterangan:"PO-2025-001" },
  { id:2, tanggal:"2025-01-11", kode:"OUT-002", nama:"Neural Interface Bridge", qty:15,  satuan:"unit", harga:3200000,  customer:"CV. Berkah Jaya",       total:48000000,  keterangan:"PO-2025-002" },
  { id:3, tanggal:"2025-01-09", kode:"OUT-003", nama:"Solid State Array 12TB",  qty:80,  satuan:"unit", harga:2500000,  customer:"PT. Mitra Solusi",      total:200000000, keterangan:"PO-2025-003" },
  { id:4, tanggal:"2025-01-07", kode:"OUT-004", nama:"Quantum Processor X1",   qty:5,   satuan:"unit", harga:18000000, customer:"UD. Berkah Jaya",       total:90000000,  keterangan:"PO-2025-004" },
];

const SEED_CASHFLOW = [
  { id:1, tanggal:"2025-01-13", kode:"CF-001", keterangan:"Penjualan Edge Compute Unit",  jenis:"masuk",  jumlah:195000000, saldo:0, kategori:"Penjualan"   },
  { id:2, tanggal:"2025-01-13", kode:"CF-002", keterangan:"Pembelian Stok dari Supplier", jenis:"keluar", jumlah:44000000,  saldo:0, kategori:"Pembelian"   },
  { id:3, tanggal:"2025-01-12", kode:"CF-003", keterangan:"Penjualan Interface Bridge",   jenis:"masuk",  jumlah:48000000,  saldo:0, kategori:"Penjualan"   },
  { id:4, tanggal:"2025-01-12", kode:"CF-004", keterangan:"Biaya Operasional",            jenis:"keluar", jumlah:12000000,  saldo:0, kategori:"Operasional"  },
  { id:5, tanggal:"2025-01-11", kode:"CF-005", keterangan:"Penjualan Solid State Array",  jenis:"masuk",  jumlah:200000000, saldo:0, kategori:"Penjualan"   },
  { id:6, tanggal:"2025-01-10", kode:"CF-006", keterangan:"Gaji Karyawan",                jenis:"keluar", jumlah:85000000,  saldo:0, kategori:"SDM"          },
];

export function AppProvider({ children }) {
  const stored = localStorage.getItem("no_session");
  const [session, setSession] = useState(stored ? JSON.parse(stored) : null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("no_dark") === "1");
  const [users, setUsers] = useState(SEED_USERS);
  const [suppliers, setSuppliers] = useState(SEED_SUPPLIERS);
  const [customers, setCustomers] = useState(SEED_CUSTOMERS);
  const [itemsIn, setItemsIn] = useState(SEED_ITEMS_IN);
  const [itemsOut, setItemsOut] = useState(SEED_ITEMS_OUT);
  const [cashflow, setCashflow] = useState(SEED_CASHFLOW);
  const [auditLog, setAuditLog] = useState([
    { id:1, ts:"2025-01-13 10:45", user:"Super Admin",  action:"Login",          detail:"Login sukses dari 192.168.1.1",            type:"auth"     },
    { id:2, ts:"2025-01-13 10:47", user:"Super Admin",  action:"Tambah Supplier",detail:"PT. Nusantara Baru ditambahkan",            type:"data"     },
    { id:3, ts:"2025-01-13 09:12", user:"Marcus Tan",   action:"Barang Masuk",   detail:"IN-001: 50 unit Edge Compute Unit v2",      type:"inventory"},
    { id:4, ts:"2025-01-13 08:30", user:"Sari Dewi",    action:"Barang Keluar",  detail:"OUT-001: 30 unit ke PT. Nusantara Digital", type:"inventory"},
    { id:5, ts:"2025-01-12 16:00", user:"Marcus Tan",   action:"Export Excel",   detail:"Laporan Cash Flow diekspor",                type:"export"   },
    { id:6, ts:"2025-01-12 15:30", user:"Super Admin",  action:"Backup Database",detail:"Backup berhasil (45.2 MB)",                 type:"system"   },
  ]);

  const addLog = useCallback((action, detail, type = "data") => {
    setAuditLog(prev => [{
      id: prev.length + 1,
      ts: new Date().toLocaleString("id-ID"),
      user: session?.name || "System",
      action, detail, type
    }, ...prev]);
  }, [session]);

  const login = (email, password) => {
    const u = users.find(x => x.email === email && x.password === password);
    if (!u) return false;
    const s = { ...u };
    setSession(s);
    localStorage.setItem("no_session", JSON.stringify(s));
    setAuditLog(prev => [{ id: prev.length+1, ts: new Date().toLocaleString("id-ID"), user: u.name, action:"Login", detail:`Login sukses`, type:"auth" }, ...prev]);
    return true;
  };

  const logout = () => {
    addLog("Logout", "User logout");
    setSession(null);
    localStorage.removeItem("no_session");
  };

  const toggleDark = () => setDarkMode(d => {
    const nv = !d; localStorage.setItem("no_dark", nv ? "1" : "0"); return nv;
  });

  const hasPerm = (page) => {
    if (!session) return false;
    const p = ROLES[session.role]?.perms || [];
    return p.includes("all") || p.includes(page);
  };

  return (
    <AppContext.Provider value={{
      session, login, logout, darkMode, toggleDark, hasPerm, ROLES,
      users, setUsers,
      suppliers, setSuppliers,
      customers, setCustomers,
      itemsIn, setItemsIn,
      itemsOut, setItemsOut,
      cashflow, setCashflow,
      auditLog, addLog,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
export { ROLES };
