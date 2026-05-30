import React, { useState } from "react";
import { Plus, Search, Download, Edit2, Trash2, X, Save } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");
const EMPTY = { name:"", contact:"", phone:"", email:"", city:"", status:"Aktif", totalBeli:0 };

export default function Customer() {
  const { customers, setCustomers, addLog } = useApp();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [del, setDel] = useState(null);

  const filtered = customers.filter(x =>
    x.name.toLowerCase().includes(search.toLowerCase()) ||
    x.contact.toLowerCase().includes(search.toLowerCase()) ||
    x.city.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (c) => { setForm({...c}); setEditId(c.id); setModal(true); };

  const save = () => {
    const item = { ...form, totalBeli: Number(form.totalBeli), id: editId || Date.now() };
    if (editId) {
      setCustomers(prev => prev.map(x => x.id===editId ? item : x));
      addLog("Edit Customer", `${item.name} diperbarui`, "data");
    } else {
      setCustomers(prev => [item, ...prev]);
      addLog("Tambah Customer", `${item.name} ditambahkan`, "data");
    }
    setModal(false);
  };

  const remove = (id) => {
    const item = customers.find(x=>x.id===id);
    setCustomers(prev=>prev.filter(x=>x.id!==id));
    addLog("Hapus Customer", `${item.name} dihapus`, "data");
    setDel(null);
  };

  const doExport = () => {
    exportToExcel(filtered, "Customer", ["id","name","contact","phone","email","city","status","totalBeli"]);
    addLog("Export Excel", "Data Customer diekspor", "export");
  };

  const topCustomer = [...filtered].sort((a,b)=>b.totalBeli-a.totalBeli)[0];

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Manajemen Customer</h1>
          <p>Kelola data pelanggan dan riwayat pembelian</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export Excel</button>
          <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah Customer</button>
        </div>
      </div>

      <div className="summary-row">
        <div className="card stat-card"><h3>Total Customer</h3><strong>{filtered.length}</strong></div>
        <div className="card stat-card"><h3>Aktif</h3><strong>{filtered.filter(x=>x.status==="Aktif").length}</strong></div>
        <div className="card stat-card">
          <h3>Top Customer</h3>
          <strong style={{fontSize:16}}>{topCustomer?.name||"-"}</strong>
          <span className="badge badge-green" style={{marginTop:6}}>{FMT(topCustomer?.totalBeli||0)}</span>
        </div>
      </div>

      <div className="card table-card" style={{marginTop:24}}>
        <div className="table-head">
          <h2>Daftar Customer</h2>
          <div className="search-bar" style={{minWidth:260}}>
            <Search size={16}/>
            <input placeholder="Cari nama, kontak, kota..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
        <table>
          <thead><tr>
            <th>Nama Perusahaan</th><th>Kontak</th><th>Telepon</th><th>Email</th><th>Kota</th><th>Total Pembelian</th><th>Status</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.contact}</td>
                <td>{r.phone}</td>
                <td><a href={`mailto:${r.email}`} style={{color:"var(--navy)"}}>{r.email}</a></td>
                <td>{r.city}</td>
                <td><strong>{FMT(r.totalBeli)}</strong></td>
                <td><span className={`badge ${r.status==="Aktif"?"badge-green":"badge-muted"}`}>{r.status}</span></td>
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
              <h2>{editId?"Edit":"Tambah"} Customer</h2>
              <button className="icon-btn" onClick={()=>setModal(false)}><X size={18}/></button>
            </div>
            <div className="form-grid2">
              {[["Nama Perusahaan","name"],["Nama Kontak","contact"],["Telepon","phone"],["Email","email"],["Kota","city"]].map(([label,key])=>(
                <div key={key}>
                  <label>{label}</label>
                  <input className="field" value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <label>Status</label>
                <select className="field" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option>Aktif</option><option>Nonaktif</option>
                </select>
              </div>
            </div>
            <button className="primary-btn full" onClick={save}><Save size={16}/>Simpan</button>
          </div>
        </div>
      )}

      {del && (
        <div className="modal-overlay" onClick={()=>setDel(null)}>
          <div className="modal confirm-modal" onClick={e=>e.stopPropagation()}>
            <h2>Hapus Customer?</h2>
            <p>Data customer akan dihapus permanen.</p>
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
