import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

export const ROLES = {
  owner: { label: "Owner",         color: "red",   perms: ["all"] },
  admin: { label: "Administrator", color: "navy",  perms: ["dashboard","inventory","reports","supplier","customer","register-outlet","invoice-piutang","absensi"] },
  sales: { label: "Sales",         color: "green", perms: ["dashboard","inventory","sales","customer","barang-keluar","barang-masuk","register-outlet","invoice-piutang","absensi"] },
};

const NOW = new Date().toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" });

const SEED_USERS = [
  { id:1, name:"Super Owner",  email:"owner@neuralops.id",  role:"owner", avatar:"SO", password:"owner123",  phone:"0811-0000-0001", address:"Jakarta Pusat",  createdAt:"1 Januari 2024",  lastLogin:NOW, totalLogin:42, photoUrl:"", status:"Aktif" },
  { id:2, name:"Marcus Tan",   email:"admin@neuralops.id",  role:"admin", avatar:"MT", password:"admin123",  phone:"0812-0000-0002", address:"Surabaya",       createdAt:"15 Februari 2024", lastLogin:NOW, totalLogin:31, photoUrl:"", status:"Aktif" },
  { id:3, name:"Sari Dewi",    email:"sales@neuralops.id",  role:"sales", avatar:"SD", password:"sales123",  phone:"0813-0000-0003", address:"Malang",         createdAt:"1 Maret 2024",    lastLogin:NOW, totalLogin:18, photoUrl:"", status:"Aktif" },
];

const SEED_SUPPLIERS = [
  { id:1, name:"PT. Maju Bersama",  contact:"Budi Santoso", phone:"0811-2345-6789", email:"budi@majubersama.co.id", category:"Elektronik", status:"Aktif",   lastOrder:"2025-01-10" },
  { id:2, name:"CV. Sumber Makmur", contact:"Dewi Rahayu",  phone:"0822-3456-7890", email:"dewi@sumbermakmur.com",  category:"Perangkat",  status:"Aktif",   lastOrder:"2025-01-08" },
  { id:3, name:"PT. Global Tech",   contact:"Ahmad Fauzi",  phone:"0833-4567-8901", email:"ahmad@globaltech.id",    category:"Komponen",   status:"Inaktif", lastOrder:"2024-12-20" },
  { id:4, name:"UD. Karya Mandiri", contact:"Sri Wahyuni",  phone:"0844-5678-9012", email:"sri@karyamandiri.co.id", category:"Aksesoris",  status:"Aktif",   lastOrder:"2025-01-12" },
];

const SEED_CUSTOMERS = [
  { id:1, name:"PT. Nusantara Digital", contact:"Rizky Pratama",  phone:"0855-1234-5678", email:"rizky@nusantaradigital.id", city:"Jakarta",  status:"Aktif",    totalBeli:145000000 },
  { id:2, name:"CV. Berkah Jaya",       contact:"Eka Susanto",    phone:"0866-2345-6789", email:"eka@berkahjaya.com",         city:"Surabaya", status:"Aktif",    totalBeli:87500000  },
  { id:3, name:"PT. Mitra Solusi",      contact:"Lina Wati",      phone:"0877-3456-7890", email:"lina@mitrasolusi.co.id",     city:"Bandung",  status:"Aktif",    totalBeli:220000000 },
  { id:4, name:"UD. Sejahtera Abadi",   contact:"Hendra Gunawan", phone:"0888-4567-8901", email:"hendra@sejahteraabadi.id",   city:"Malang",   status:"Nonaktif", totalBeli:34200000  },
];

const SEED_ITEMS_IN = [
  { id:1, tanggal:"2025-01-12", kode:"IN-001", nama:"Edge Compute Unit v2",    qty:50,  satuan:"unit", harga:4500000,  supplier:"PT. Maju Bersama",  total:225000000, keterangan:"Restock Q1"   },
  { id:2, tanggal:"2025-01-10", kode:"IN-002", nama:"Neural Interface Bridge", qty:20,  satuan:"unit", harga:2200000,  supplier:"CV. Sumber Makmur", total:44000000,  keterangan:"Order Reguler" },
  { id:3, tanggal:"2025-01-08", kode:"IN-003", nama:"Solid State Array 12TB",  qty:100, satuan:"unit", harga:1800000,  supplier:"PT. Global Tech",   total:180000000, keterangan:"Stok Gudang"  },
  { id:4, tanggal:"2025-01-05", kode:"IN-004", nama:"Quantum Processor X1",    qty:10,  satuan:"unit", harga:12000000, supplier:"PT. Maju Bersama",  total:120000000, keterangan:"Produk Baru"  },
];

const SEED_ITEMS_OUT = [
  { id:1, tanggal:"2025-01-13", kode:"OUT-001", nama:"Edge Compute Unit v2",    qty:30, satuan:"unit", harga:6500000,  customer:"PT. Nusantara Digital", total:195000000, keterangan:"PO-2025-001" },
  { id:2, tanggal:"2025-01-11", kode:"OUT-002", nama:"Neural Interface Bridge", qty:15, satuan:"unit", harga:3200000,  customer:"CV. Berkah Jaya",       total:48000000,  keterangan:"PO-2025-002" },
  { id:3, tanggal:"2025-01-09", kode:"OUT-003", nama:"Solid State Array 12TB",  qty:80, satuan:"unit", harga:2500000,  customer:"PT. Mitra Solusi",      total:200000000, keterangan:"PO-2025-003" },
  { id:4, tanggal:"2025-01-07", kode:"OUT-004", nama:"Quantum Processor X1",    qty:5,  satuan:"unit", harga:18000000, customer:"UD. Berkah Jaya",       total:90000000,  keterangan:"PO-2025-004" },
];

const SEED_CASHFLOW = [
  { id:1, tanggal:"2025-01-13", kode:"CF-001", keterangan:"Penjualan Edge Compute Unit",  jenis:"masuk",  jumlah:195000000, saldo:0, kategori:"Penjualan"  },
  { id:2, tanggal:"2025-01-13", kode:"CF-002", keterangan:"Pembelian Stok dari Supplier", jenis:"keluar", jumlah:44000000,  saldo:0, kategori:"Pembelian"  },
  { id:3, tanggal:"2025-01-12", kode:"CF-003", keterangan:"Penjualan Interface Bridge",   jenis:"masuk",  jumlah:48000000,  saldo:0, kategori:"Penjualan"  },
  { id:4, tanggal:"2025-01-12", kode:"CF-004", keterangan:"Biaya Operasional",            jenis:"keluar", jumlah:12000000,  saldo:0, kategori:"Operasional" },
  { id:5, tanggal:"2025-01-11", kode:"CF-005", keterangan:"Penjualan Solid State Array",  jenis:"masuk",  jumlah:200000000, saldo:0, kategori:"Penjualan"  },
  { id:6, tanggal:"2025-01-10", kode:"CF-006", keterangan:"Gaji Karyawan",                jenis:"keluar", jumlah:85000000,  saldo:0, kategori:"SDM"         },
];

export const SEED_OUTLETS = [
  { id:1, namaOutlet:"Toko Maju Jaya",     namaOwner:"Budi Santoso",   telp:"0811-1111-0001", alamat:"Jl. Pahlawan No.12, Malang",     area:"Malang Kota",  salesman:"Sari Dewi",  status:"Aktif",   tanggalDaftar:"2024-01-10", koordinat:"-7.9797,112.6304" },
  { id:2, namaOutlet:"Warung Berkah",       namaOwner:"Dewi Rahayu",    telp:"0822-2222-0002", alamat:"Jl. Veteran No.45, Batu",        area:"Batu",         salesman:"Sari Dewi",  status:"Aktif",   tanggalDaftar:"2024-02-14", koordinat:"-7.8685,112.5248" },
  { id:3, namaOutlet:"Toko Sejahtera",      namaOwner:"Ahmad Fauzi",    telp:"0833-3333-0003", alamat:"Jl. Diponegoro No.7, Kepanjen",  area:"Kepanjen",     salesman:"Andi Kurnia",status:"Nonaktif",tanggalDaftar:"2024-03-05", koordinat:"-8.1300,112.5700" },
  { id:4, namaOutlet:"Kios Mandiri",        namaOwner:"Sri Wahyuni",    telp:"0844-4444-0004", alamat:"Jl. Soekarno-Hatta No.88, Blitar",area:"Blitar",      salesman:"Andi Kurnia",status:"Aktif",   tanggalDaftar:"2024-01-20", koordinat:"-8.0956,112.1609" },
  { id:5, namaOutlet:"Toko Prima",          namaOwner:"Rizky Pratama",  telp:"0855-5555-0005", alamat:"Jl. Semeru No.3, Malang",        area:"Malang Kota",  salesman:"Sari Dewi",  status:"Aktif",   tanggalDaftar:"2024-04-12", koordinat:"-7.9694,112.6150" },
  { id:6, namaOutlet:"Outlet Nusantara",    namaOwner:"Eka Susanto",    telp:"0866-6666-0006", alamat:"Jl. Merdeka No.21, Lawang",      area:"Lawang",       salesman:"Dina Putri", status:"Aktif",   tanggalDaftar:"2024-05-08", koordinat:"-7.8377,112.6940" },
];

export const SEED_INVOICES = [
  { id:1, noInvoice:"INV-2025-001", outlet:"Toko Maju Jaya",    salesman:"Sari Dewi",  tanggalInvoice:"2025-01-10", tanggalJatuhTempo:"2025-01-24", jumlah:12500000,  sisa:12500000,  status:"normal",   keterangan:"Pembelian produk A" },
  { id:2, noInvoice:"INV-2025-002", outlet:"Warung Berkah",      salesman:"Sari Dewi",  tanggalInvoice:"2024-12-20", tanggalJatuhTempo:"2025-01-03", jumlah:8750000,   sisa:5000000,   status:"overdue",  keterangan:"Pembelian produk B" },
  { id:3, noInvoice:"INV-2025-003", outlet:"Kios Mandiri",       salesman:"Andi Kurnia",tanggalInvoice:"2024-10-15", tanggalJatuhTempo:"2024-11-14", jumlah:22000000,  sisa:22000000,  status:"priority", keterangan:"Pembelian produk C" },
  { id:4, noInvoice:"INV-2025-004", outlet:"Toko Prima",         salesman:"Sari Dewi",  tanggalInvoice:"2025-01-05", tanggalJatuhTempo:"2025-01-19", jumlah:6800000,   sisa:6800000,   status:"normal",   keterangan:"Pembelian produk D" },
  { id:5, noInvoice:"INV-2025-005", outlet:"Outlet Nusantara",   salesman:"Dina Putri", tanggalInvoice:"2024-11-01", tanggalJatuhTempo:"2024-12-01", jumlah:15300000,  sisa:15300000,  status:"priority", keterangan:"Pembelian produk E" },
  { id:6, noInvoice:"INV-2025-006", outlet:"Toko Sejahtera",     salesman:"Andi Kurnia",tanggalInvoice:"2024-12-28", tanggalJatuhTempo:"2025-01-11", jumlah:9200000,   sisa:4000000,   status:"overdue",  keterangan:"Pembelian produk F" },
  { id:7, noInvoice:"INV-2025-007", outlet:"Toko Maju Jaya",     salesman:"Sari Dewi",  tanggalInvoice:"2025-01-12", tanggalJatuhTempo:"2025-01-26", jumlah:3500000,   sisa:3500000,   status:"normal",   keterangan:"Pembelian produk G" },
];

export const SEED_ABSENSI = [
  { id:1, salesman:"Sari Dewi",  tanggal:"2025-01-13", outlet:"Toko Maju Jaya",    jamMasuk:"08:15", jamKeluar:"09:30", koordinat:"-7.9797,112.6304", status:"Hadir", catatan:"Kunjungan rutin" },
  { id:2, salesman:"Sari Dewi",  tanggal:"2025-01-13", outlet:"Warung Berkah",      jamMasuk:"10:00", jamKeluar:"11:15", koordinat:"-7.8685,112.5248", status:"Hadir", catatan:"Negosiasi harga" },
  { id:3, salesman:"Sari Dewi",  tanggal:"2025-01-13", outlet:"Toko Prima",         jamMasuk:"13:30", jamKeluar:"14:45", koordinat:"-7.9694,112.6150", status:"Hadir", catatan:"Pengiriman pesanan" },
  { id:4, salesman:"Andi Kurnia",tanggal:"2025-01-13", outlet:"Kios Mandiri",       jamMasuk:"08:00", jamKeluar:"09:00", koordinat:"-8.1300,112.5700", status:"Hadir", catatan:"Kunjungan pembayaran" },
  { id:5, salesman:"Dina Putri", tanggal:"2025-01-13", outlet:"Outlet Nusantara",   jamMasuk:"09:45", jamKeluar:"11:00", koordinat:"-7.8377,112.6940", status:"Hadir", catatan:"Follow-up tagihan" },
  { id:6, salesman:"Sari Dewi",  tanggal:"2025-01-12", outlet:"Toko Maju Jaya",    jamMasuk:"08:20", jamKeluar:"09:40", koordinat:"-7.9797,112.6304", status:"Hadir", catatan:"Kunjungan rutin" },
  { id:7, salesman:"Andi Kurnia",tanggal:"2025-01-12", outlet:"Toko Sejahtera",     jamMasuk:"10:30", jamKeluar:"-",     koordinat:"-8.0956,112.1609", status:"Tidak Hadir", catatan:"Outlet tutup" },
];

const loadUsers = () => {
  try { const saved = localStorage.getItem("no_users"); if (saved) return JSON.parse(saved); } catch {}
  return SEED_USERS;
};
const persistUsers = (list) => { try { localStorage.setItem("no_users", JSON.stringify(list)); } catch {} };

export function AppProvider({ children }) {
  const [session, setSession]     = useState(() => { try { const s = localStorage.getItem("no_session"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [darkMode, setDarkMode]   = useState(() => localStorage.getItem("no_dark") === "1");
  const [users, setUsersState]    = useState(loadUsers);
  const [suppliers, setSuppliers] = useState(SEED_SUPPLIERS);
  const [customers, setCustomers] = useState(SEED_CUSTOMERS);
  const [itemsIn, setItemsIn]     = useState(SEED_ITEMS_IN);
  const [itemsOut, setItemsOut]   = useState(SEED_ITEMS_OUT);
  const [cashflow, setCashflow]   = useState(SEED_CASHFLOW);
  const [outlets, setOutlets]     = useState(SEED_OUTLETS);
  const [invoices, setInvoices]   = useState(SEED_INVOICES);
  const [absensi, setAbsensi]     = useState(SEED_ABSENSI);
  const [auditLog, setAuditLog]   = useState([
    { id:1, ts:"2025-01-13 10:45", user:"Super Owner", action:"Login",           detail:"Login sukses",                             type:"auth"      },
    { id:2, ts:"2025-01-13 10:47", user:"Super Owner", action:"Tambah Supplier", detail:"PT. Nusantara Baru ditambahkan",            type:"data"      },
    { id:3, ts:"2025-01-13 09:12", user:"Marcus Tan",  action:"Barang Masuk",    detail:"IN-001: 50 unit Edge Compute Unit v2",      type:"inventory" },
    { id:4, ts:"2025-01-13 08:30", user:"Sari Dewi",   action:"Barang Keluar",   detail:"OUT-001: 30 unit ke PT. Nusantara Digital", type:"inventory" },
    { id:5, ts:"2025-01-12 16:00", user:"Marcus Tan",  action:"Export Excel",    detail:"Laporan Cash Flow diekspor",                type:"export"    },
    { id:6, ts:"2025-01-12 15:30", user:"Super Owner", action:"Backup Database", detail:"Backup berhasil (45.2 MB)",                 type:"system"    },
  ]);

  const setUsers = (list) => { setUsersState(list); persistUsers(list); };

  const addLog = useCallback((action, detail, type = "data") => {
    setAuditLog(prev => [{ id: Date.now(), ts: new Date().toLocaleString("id-ID"), user: session?.name || "System", action, detail, type }, ...prev]);
  }, [session]);

  const login = (email, password) => {
    const all = loadUsers();
    const u = all.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) return false;
    const updated = { ...u, lastLogin: new Date().toLocaleString("id-ID"), totalLogin: (u.totalLogin || 0) + 1 };
    const newList = all.map(x => x.id === u.id ? updated : x);
    setUsers(newList); setSession(updated);
    localStorage.setItem("no_session", JSON.stringify(updated));
    setAuditLog(prev => [{ id: Date.now(), ts: new Date().toLocaleString("id-ID"), user: u.name, action:"Login", detail:"Login sukses", type:"auth" }, ...prev]);
    return true;
  };

  const register = (name, email, password, role = "sales") => {
    const all = loadUsers();
    if (all.find(x => x.email.toLowerCase() === email.toLowerCase())) return { ok: false, msg: "Email sudah terdaftar." };
    const avatar = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const newUser = { id: Date.now(), name, email, password, role, avatar, phone: "", address: "", photoUrl: "", status: "Aktif", createdAt: new Date().toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" }), lastLogin: new Date().toLocaleString("id-ID"), totalLogin: 1 };
    const updated = [...all, newUser];
    setUsers(updated); setSession(newUser);
    localStorage.setItem("no_session", JSON.stringify(newUser));
    setAuditLog(prev => [{ id: Date.now(), ts: new Date().toLocaleString("id-ID"), user: name, action:"Register", detail:`Akun baru dibuat (${ROLES[role]?.label})`, type:"auth" }, ...prev]);
    return { ok: true };
  };

  const updateProfile = (userId, changes) => {
    const all = loadUsers();
    const updated = all.map(x => x.id === userId ? { ...x, ...changes } : x);
    setUsers(updated);
    if (session?.id === userId) { const newSession = { ...session, ...changes }; setSession(newSession); localStorage.setItem("no_session", JSON.stringify(newSession)); }
  };

  const logout = () => { addLog("Logout", "User logout", "auth"); setSession(null); localStorage.removeItem("no_session"); };
  const toggleDark = () => setDarkMode(d => { const nv = !d; localStorage.setItem("no_dark", nv ? "1" : "0"); return nv; });
  const hasPerm = (page) => { if (!session) return false; const p = ROLES[session.role]?.perms || []; return p.includes("all") || p.includes(page); };

  return (
    <AppContext.Provider value={{
      session, login, logout, register, updateProfile,
      darkMode, toggleDark, hasPerm, ROLES,
      users, setUsers,
      suppliers, setSuppliers,
      customers, setCustomers,
      itemsIn, setItemsIn,
      itemsOut, setItemsOut,
      cashflow, setCashflow,
      outlets, setOutlets,
      invoices, setInvoices,
      absensi, setAbsensi,
      auditLog, addLog,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
