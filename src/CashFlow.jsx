import React, { useState } from "react";
import { Plus, Search, Download, Edit2, Trash2, X, Save, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");
const EMPTY = { tanggal:"", kode:"", keterangan:"", jenis:"masuk", jumlah:"", kategori:"Penjualan" };
const KATEGORIS = ["Penjualan","Pembelian","Operasional","SDM","Pajak","Lain-lain"];

export default function CashFlow() {
  const { cashflow, setCashflow, addLog } = useApp();
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("semua");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [del, setDel] = useState(null);

  const filtered = cashflow.filter(x => {
    const matchSearch = x.keterangan.toLowerCase().includes(search.toLowerCase()) || x.kode.toLowerCase().includes(search.toLowerCase());
    const matchJenis = filterJenis==="semua" || x.jenis===filterJenis;
    return matchSearch && matchJenis;
  });

  const totalMasuk  = cashflow.filter(x=>x.jenis==="masuk").reduce((s,x)=>s+x.jumlah,0);
  const totalKeluar = cashflow.filter(x=>x.jenis==="keluar").reduce((s,x)=>s+x.jumlah,0);
  const saldo       = totalMasuk - totalKeluar;

  const chartData = ["Jan","Feb","Mar","Apr","Mei","Jun"].map((m,i)=>({
    m, masuk:[120,145,98,200,178,195][i]*1000000, keluar:[60,80,55,90,85,75][i]*1000000
  }));

  const openAdd = () => {
    setForm({...EMPTY, tanggal:new Date().toISOString().slice(0,10), kode:"CF-"+String(cashflow.length+1).padStart(3,"0")});
    setEditId(null); setModal(true);
  };
  const openEdit = (item) => { setForm({...item, jumlah:String(item.jumlah)}); setEditId(item.id); setModal(true); };

  const save = () => {
    const item = { ...form, jumlah: Number(form.jumlah), id: editId || Date.now() };
    if (editId) {
      setCashflow(prev => prev.map(x => x.id===editId ? item : x));
      addLog("Edit Cash Flow", `${item.kode}: ${item.keterangan}`, "data");
    } else {
      setCashflow(prev => [item, ...prev]);
      addLog("Tambah Cash Flow", `${item.kode}: ${item.jenis} ${FMT(item.jumlah)}`, "data");
    }
    setModal(false);
  };

  const remove = (id) => {
    const item = cashflow.find(x=>x.id===id);
    setCashflow(prev=>prev.filter(x=>x.id!==id));
    addLog("Hapus Cash Flow", `${item.kode}: ${item.keterangan}`, "data");
    setDel(null);
  };

  const doExport = () => {
    exportToExcel(filtered, "Cash_Flow", ["id","tanggal","kode","keterangan","jenis","kategori","jumlah"]);
    addLog("Export Excel", "Cash Flow diekspor", "export");
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Cash Flow</h1>
          <p>Pantau arus kas masuk dan keluar perusahaan</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export Excel</button>
          <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah Transaksi</button>
        </div>
      </div>

      <div className="summary-row" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        <div className="card stat-card">
          <div className="stat-top"><span className="icon-badge"><ArrowUpCircle size={20} style={{color:"var(--green)"}}/></span></div>
          <h3>Total Cash Masuk</h3>
          <strong style={{color:"var(--green)"}}>{FMT(totalMasuk)}</strong>
        </div>
        <div className="card stat-card">
          <div className="stat-top"><span className="icon-badge"><ArrowDownCircle size={20} style={{color:"var(--red)"}}/></span></div>
          <h3>Total Cash Keluar</h3>
          <strong style={{color:"var(--red)"}}>{FMT(totalKeluar)}</strong>
        </div>
        <div className="card stat-card">
          <h3>Saldo Bersih</h3>
          <strong style={{color:saldo>=0?"var(--green)":"var(--red)"}}>{FMT(saldo)}</strong>
          <span className={`badge ${saldo>=0?"badge-green":"badge-red"}`} style={{marginTop:8}}>
            {saldo>=0?"Positif":"Defisit"}
          </span>
        </div>
      </div>

      <div className="card" style={{marginTop:24}}>
        <div className="card-title"><h2>Grafik Arus Kas 6 Bulan</h2></div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <XAxis dataKey="m"/>
            <Tooltip formatter={v=>"Rp "+v.toLocaleString("id-ID")}/>
            <Bar dataKey="masuk"  name="Cash Masuk"  radius={[6,6,0,0]} fill="var(--green)"/>
            <Bar dataKey="keluar" name="Cash Keluar" radius={[6,6,0,0]} fill="var(--red)"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card table-card" style={{marginTop:24}}>
        <div className="table-head">
          <h2>Riwayat Transaksi</h2>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <div className="filter-tabs">
              {["semua","masuk","keluar"].map(j=>(
                <button key={j} className={`pill-btn${filterJenis===j?" active":""}`} onClick={()=>setFilterJenis(j)}>
                  {j.charAt(0).toUpperCase()+j.slice(1)}
                </button>
              ))}
            </div>
            <div className="search-bar" style={{minWidth:220}}>
              <Search size={16}/>
              <input placeholder="Cari transaksi..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>
        </div>
        <table>
          <thead><tr>
            <th>Tanggal</th><th>Kode</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th>Jumlah</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}>
                <td>{r.tanggal}</td>
                <td><span className="badge badge-blue">{r.kode}</span></td>
                <td><strong>{r.keterangan}</strong></td>
                <td><span className="badge badge-muted">{r.kategori}</span></td>
                <td>
                  <span className={`badge ${r.jenis==="masuk"?"badge-green":"badge-red"}`}>
                    {r.jenis==="masuk"?"↑ Masuk":"↓ Keluar"}
                  </span>
                </td>
                <td><strong style={{color:r.jenis==="masuk"?"var(--green)":"var(--red)"}}>{FMT(r.jumlah)}</strong></td>
                <td>
                  <div style={{display:"flex",gap:8}}>
                    <button className="icon-btn" onClick={()=>openEdit(r)}><Edit2 size={15}/></button>
                    <button className="icon-btn danger" onClick={()=>setDel(r.id)}><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={7} style={{textAlign:"center",color:"var(--muted)",padding:40}}>Tidak ada data</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editId?"Edit":"Tambah"} Transaksi</h2>
              <button className="icon-btn" onClick={()=>setModal(false)}><X size={18}/></button>
            </div>
            <div className="form-grid2">
              <div>
                <label>Tanggal</label>
                <input className="field" type="date" value={form.tanggal} onChange={e=>setForm(f=>({...f,tanggal:e.target.value}))}/>
              </div>
              <div>
                <label>Kode</label>
                <input className="field" value={form.kode} onChange={e=>setForm(f=>({...f,kode:e.target.value}))}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label>Keterangan</label>
                <input className="field" value={form.keterangan} onChange={e=>setForm(f=>({...f,keterangan:e.target.value}))}/>
              </div>
              <div>
                <label>Jenis</label>
                <select className="field" value={form.jenis} onChange={e=>setForm(f=>({...f,jenis:e.target.value}))}>
                  <option value="masuk">Cash Masuk</option>
                  <option value="keluar">Cash Keluar</option>
                </select>
              </div>
              <div>
                <label>Kategori</label>
                <select className="field" value={form.kategori} onChange={e=>setForm(f=>({...f,kategori:e.target.value}))}>
                  {KATEGORIS.map(k=><option key={k}>{k}</option>)}
                </select>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label>Jumlah (Rp)</label>
                <input className="field" type="number" value={form.jumlah} onChange={e=>setForm(f=>({...f,jumlah:e.target.value}))}/>
              </div>
            </div>
            {form.jumlah&&<div className="total-preview">Jumlah: <strong>{FMT(Number(form.jumlah))}</strong></div>}
            <button className="primary-btn full" onClick={save}><Save size={16}/>Simpan</button>
          </div>
        </div>
      )}

      {del && (
        <div className="modal-overlay" onClick={()=>setDel(null)}>
          <div className="modal confirm-modal" onClick={e=>e.stopPropagation()}>
            <h2>Hapus Transaksi?</h2>
            <p>Data transaksi akan dihapus permanen.</p>
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
