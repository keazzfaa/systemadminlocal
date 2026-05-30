import React, { useState } from "react";
import { Plus, Search, Download, Edit2, Trash2, X, Save, Truck } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";

const EMPTY = { name:"", contact:"", phone:"", email:"", category:"", status:"Aktif", lastOrder:"" };

export default function Supplier() {
  const { suppliers, setSuppliers, addLog } = useApp();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [del, setDel] = useState(null);

  const filtered = suppliers.filter(x =>
    x.name.toLowerCase().includes(search.toLowerCase()) ||
    x.contact.toLowerCase().includes(search.toLowerCase()) ||
    x.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (s) => { setForm({...s}); setEditId(s.id); setModal(true); };

  const save = () => {
    const item = { ...form, id: editId || Date.now() };
    if (editId) {
      setSuppliers(prev => prev.map(x => x.id===editId ? item : x));
      addLog("Edit Supplier", `${item.name} diperbarui`, "data");
    } else {
      setSuppliers(prev => [item, ...prev]);
      addLog("Tambah Supplier", `${item.name} ditambahkan`, "data");
    }
    setModal(false);
  };

  const remove = (id) => {
    const item = suppliers.find(x=>x.id===id);
    setSuppliers(prev=>prev.filter(x=>x.id!==id));
    addLog("Hapus Supplier", `${item.name} dihapus`, "data");
    setDel(null);
  };

  const doExport = () => {
    exportToExcel(filtered, "Supplier", ["id","name","contact","phone","email","category","status","lastOrder"]);
    addLog("Export Excel", "Data Supplier diekspor", "export");
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Manajemen Supplier</h1>
          <p>Kelola data mitra pemasok barang dan material</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export Excel</button>
          <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah Supplier</button>
        </div>
      </div>

      <div className="summary-row">
        <div className="card stat-card"><h3>Total Supplier</h3><strong>{filtered.length}</strong></div>
        <div className="card stat-card"><h3>Aktif</h3><strong>{filtered.filter(x=>x.status==="Aktif").length}</strong></div>
        <div className="card stat-card"><h3>Inaktif</h3><strong>{filtered.filter(x=>x.status!=="Aktif").length}</strong></div>
      </div>

      <div className="card table-card" style={{marginTop:24}}>
        <div className="table-head">
          <h2>Daftar Supplier</h2>
          <div className="search-bar" style={{minWidth:260}}>
            <Search size={16}/>
            <input placeholder="Cari nama, kontak, kategori..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
        <table>
          <thead><tr>
            <th>Nama Perusahaan</th><th>Kontak</th><th>Telepon</th><th>Email</th><th>Kategori</th><th>Status</th><th>Order Terakhir</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.contact}</td>
                <td>{r.phone}</td>
                <td><a href={`mailto:${r.email}`} style={{color:"var(--navy)"}}>{r.email}</a></td>
                <td><span className="badge badge-blue">{r.category}</span></td>
                <td><span className={`badge ${r.status==="Aktif"?"badge-green":"badge-muted"}`}>{r.status}</span></td>
                <td>{r.lastOrder}</td>
                <td>
                  <div style={{display:"flex",gap:8}}>
                    <button className="icon-btn" onClick={()=>openEdit(r)}><Edit2 size={15}/></button>
                    <button className="icon-btn danger" onClick={()=>setDel(r.id)}><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:"var(--muted)",padding:40}}>Tidak ada data</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editId?"Edit":"Tambah"} Supplier</h2>
              <button className="icon-btn" onClick={()=>setModal(false)}><X size={18}/></button>
            </div>
            <div className="form-grid2">
              {[["Nama Perusahaan","name"],["Nama Kontak","contact"],["Telepon","phone"],["Email","email"],["Kategori","category"]].map(([label,key])=>(
                <div key={key}>
                  <label>{label}</label>
                  <input className="field" value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <label>Status</label>
                <select className="field" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option>Aktif</option><option>Inaktif</option>
                </select>
              </div>
              <div>
                <label>Tanggal Order Terakhir</label>
                <input className="field" type="date" value={form.lastOrder} onChange={e=>setForm(f=>({...f,lastOrder:e.target.value}))}/>
              </div>
            </div>
            <button className="primary-btn full" onClick={save}><Save size={16}/>Simpan</button>
          </div>
        </div>
      )}

      {del && (
        <div className="modal-overlay" onClick={()=>setDel(null)}>
          <div className="modal confirm-modal" onClick={e=>e.stopPropagation()}>
            <h2>Hapus Supplier?</h2>
            <p>Data supplier akan dihapus permanen.</p>
            <div style={{display:"flex",gap:12,marginTop:24}}>
              <button className="secondary-btn" style={{flex:1}} onClick={()=>setDel(null)}>Batal</button>
              <button className="primary-btn danger-btn" style={{flex:1}} onClick={()=>remove(del)}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
