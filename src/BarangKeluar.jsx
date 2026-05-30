import React, { useState } from "react";
import { Plus, Search, Download, Edit2, Trash2, X, Save } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");
const EMPTY = { tanggal:"", kode:"", nama:"", qty:"", satuan:"unit", harga:"", customer:"", keterangan:"" };

export default function BarangKeluar() {
  const { itemsOut, setItemsOut, customers, addLog } = useApp();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [del, setDel] = useState(null);

  const filtered = itemsOut.filter(x =>
    x.nama.toLowerCase().includes(search.toLowerCase()) ||
    x.kode.toLowerCase().includes(search.toLowerCase()) ||
    x.customer.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({...EMPTY, tanggal:new Date().toISOString().slice(0,10), kode:"OUT-"+String(itemsOut.length+1).padStart(3,"0")}); setEditId(null); setModal(true); };
  const openEdit = (item) => { setForm({...item}); setEditId(item.id); setModal(true); };

  const save = () => {
    const total = Number(form.qty) * Number(form.harga);
    const item = { ...form, qty: Number(form.qty), harga: Number(form.harga), total, id: editId || Date.now() };
    if (editId) {
      setItemsOut(prev => prev.map(x => x.id===editId ? item : x));
      addLog("Edit Barang Keluar", `${item.kode}: ${item.nama}`, "inventory");
    } else {
      setItemsOut(prev => [item, ...prev]);
      addLog("Tambah Barang Keluar", `${item.kode}: ${item.qty} ${item.satuan} ${item.nama} ke ${item.customer}`, "inventory");
    }
    setModal(false);
  };

  const remove = (id) => {
    const item = itemsOut.find(x=>x.id===id);
    setItemsOut(prev=>prev.filter(x=>x.id!==id));
    addLog("Hapus Barang Keluar", `${item.kode}: ${item.nama}`, "inventory");
    setDel(null);
  };

  const doExport = () => {
    exportToExcel(filtered, "Barang_Keluar", ["id","tanggal","kode","nama","qty","satuan","harga","customer","total","keterangan"]);
    addLog("Export Excel", "Barang Keluar diekspor", "export");
  };

  const totalNilai = filtered.reduce((s,x)=>s+x.total,0);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Barang Keluar</h1>
          <p>Kelola penjualan dan pengiriman barang ke customer</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export Excel</button>
          <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah</button>
        </div>
      </div>

      <div className="summary-row">
        <div className="card stat-card"><h3>Total Transaksi</h3><strong>{filtered.length}</strong></div>
        <div className="card stat-card"><h3>Total Penjualan</h3><strong style={{fontSize:22}}>{FMT(totalNilai)}</strong></div>
        <div className="card stat-card"><h3>Total Qty Keluar</h3><strong>{filtered.reduce((s,x)=>s+x.qty,0)} unit</strong></div>
      </div>

      <div className="card table-card" style={{marginTop:24}}>
        <div className="table-head">
          <h2>Daftar Barang Keluar</h2>
          <div className="search-bar" style={{minWidth:260}}>
            <Search size={16}/>
            <input placeholder="Cari nama, kode, customer..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
        <table>
          <thead><tr>
            <th>Tanggal</th><th>Kode</th><th>Nama Barang</th><th>Qty</th><th>Harga</th><th>Customer</th><th>Total</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}>
                <td>{r.tanggal}</td>
                <td><span className="badge badge-green">{r.kode}</span></td>
                <td><strong>{r.nama}</strong><br/><small style={{color:"var(--muted)"}}>{r.keterangan}</small></td>
                <td>{r.qty} {r.satuan}</td>
                <td>{FMT(r.harga)}</td>
                <td>{r.customer}</td>
                <td><strong>{FMT(r.total)}</strong></td>
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
              <h2>{editId?"Edit":"Tambah"} Barang Keluar</h2>
              <button className="icon-btn" onClick={()=>setModal(false)}><X size={18}/></button>
            </div>
            <div className="form-grid2">
              {[
                ["Tanggal","tanggal","date"],["Kode","kode","text"],["Nama Barang","nama","text"],
                ["Qty","qty","number"],["Satuan","satuan","text"],["Harga Jual","harga","number"],
              ].map(([label,key,type])=>(
                <div key={key}>
                  <label>{label}</label>
                  <input className="field" type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <label>Customer</label>
                <select className="field" value={form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))}>
                  <option value="">Pilih Customer</option>
                  {customers.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label>Keterangan / No. PO</label>
                <input className="field" value={form.keterangan} onChange={e=>setForm(f=>({...f,keterangan:e.target.value}))}/>
              </div>
            </div>
            {form.qty&&form.harga&&<div className="total-preview">Total: <strong>{FMT(Number(form.qty)*Number(form.harga))}</strong></div>}
            <button className="primary-btn full" onClick={save}><Save size={16}/>Simpan</button>
          </div>
        </div>
      )}

      {del && (
        <div className="modal-overlay" onClick={()=>setDel(null)}>
          <div className="modal confirm-modal" onClick={e=>e.stopPropagation()}>
            <h2>Hapus Data?</h2>
            <p>Tindakan ini tidak dapat dibatalkan.</p>
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
