import React, { useState } from "react";
import { Search, Download, Plus, Edit2, Trash2, X, Save, AlertTriangle, Package } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");

const EMPTY = { kode:"", nama:"", kategori:"Hardware", stok:0, masuk:0, keluar:0, satuan:"unit", harga:0, min:5, lokasi:"", keterangan:"" };

const SEED = [
  { id:1, kode:"ECU-V2",  nama:"Edge Compute Unit v2",         kategori:"Hardware",    stok:20, masuk:5,  keluar:8,  satuan:"unit", harga:6500000,  min:10, lokasi:"Rak A-1", keterangan:"Cek kondisi fisik" },
  { id:2, kode:"NIB-01",  nama:"Neural Interface Bridge",      kategori:"Hardware",    stok:5,  masuk:0,  keluar:3,  satuan:"unit", harga:3200000,  min:8,  lokasi:"Rak A-2", keterangan:"Stok menipis, segera PO" },
  { id:3, kode:"SSA-12",  nama:"Solid State Array 12TB",       kategori:"Storage",     stok:20, masuk:20, keluar:15, satuan:"unit", harga:2500000,  min:15, lokasi:"Rak B-1", keterangan:"" },
  { id:4, kode:"QPX-01",  nama:"Quantum Processor X1",         kategori:"Processor",   stok:5,  masuk:0,  keluar:2,  satuan:"unit", harga:18000000, min:5,  lokasi:"Rak C-1", keterangan:"Item premium, simpan aman" },
  { id:5, kode:"FBR-5G",  nama:"Fiber Module 5G Compatible",   kategori:"Networking",  stok:35, masuk:10, keluar:12, satuan:"unit", harga:450000,   min:20, lokasi:"Rak D-2", keterangan:"" },
  { id:6, kode:"PWR-UPS", nama:"Power Backup UPS 2000VA",      kategori:"Power",       stok:8,  masuk:3,  keluar:5,  satuan:"unit", harga:1800000,  min:5,  lokasi:"Rak E-1", keterangan:"" },
  { id:7, kode:"CBL-CAT8",nama:"Kabel CAT8 100m",              kategori:"Aksesoris",   stok:15, masuk:0,  keluar:8,  satuan:"roll", harga:320000,   min:10, lokasi:"Rak F-3", keterangan:"" },
  { id:8, kode:"RAM-64",  nama:"RAM Server 64GB DDR5",         kategori:"Memory",      stok:3,  masuk:0,  keluar:4,  satuan:"unit", harga:4200000,  min:5,  lokasi:"Rak A-3", keterangan:"CRITICAL – stok minus!" },
];

const KATEGORI_LIST = ["Hardware","Storage","Processor","Networking","Power","Aksesoris","Memory"];

export default function StockGudang() {
  const { session, addLog } = useApp();
  const [items, setItems]   = useState(SEED);
  const [search, setSearch] = useState("");
  const [filterKat, setFK]  = useState("all");
  const [filterStatus, setFS] = useState("all");
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [del, setDel]       = useState(null);

  const isOwnerOrAdmin = session?.role==="owner"||session?.role==="admin";

  const filtered = items.filter(x=>{
    const q = search.toLowerCase();
    const mQ = x.nama.toLowerCase().includes(q)||x.kode.toLowerCase().includes(q)||x.kategori.toLowerCase().includes(q);
    const mK = filterKat==="all"||x.kategori===filterKat;
    const mS = filterStatus==="all"||(filterStatus==="low"?x.stok<=x.min:x.stok>x.min);
    return mQ&&mK&&mS;
  });

  const openAdd  = ()  => { setForm({...EMPTY,kode:"STK-"+String(items.length+1).padStart(3,"0")}); setEditId(null); setModal(true); };
  const openEdit = (x) => { setForm({...x}); setEditId(x.id); setModal(true); };

  const save = () => {
    if(!form.nama||!form.kode) return;
    if(editId){
      setItems(prev=>prev.map(x=>x.id===editId?{...form,id:editId}:x));
      addLog("Edit Stock",""+form.kode+" diperbarui","inventory");
    } else {
      setItems(prev=>[{...form,id:Date.now()},...prev]);
      addLog("Tambah Stock",""+form.kode+" "+form.nama+" ditambahkan","inventory");
    }
    setModal(false);
  };

  const remove = (id) => {
    const x=items.find(i=>i.id===id);
    setItems(prev=>prev.filter(i=>i.id!==id));
    addLog("Hapus Stock",""+x.kode+" "+x.nama+" dihapus","inventory");
    setDel(null);
  };

  const doExport = () => {
    exportToExcel(filtered,"Stock_Gudang",["kode","nama","kategori","stok","masuk","keluar","satuan","harga","min","lokasi","keterangan"]);
    addLog("Export Excel","Stock Gudang diekspor","export");
  };

  const lowStock    = items.filter(x=>x.stok<=x.min);
  const totalNilai  = items.reduce((a,x)=>a+(x.stok*x.harga),0);
  const totalMasuk  = items.reduce((a,x)=>a+x.masuk,0);
  const totalKeluar = items.reduce((a,x)=>a+x.keluar,0);

  const barData = items.slice(0,6).map(x=>({n:x.kode,stok:x.stok,min:x.min}));

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Stock Gudang</h1>
          <p>Kelola inventaris dan pantau ketersediaan stok secara real-time</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export</button>
          {isOwnerOrAdmin && <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah Item</button>}
        </div>
      </div>

      {/* Summary */}
      <div className="summary-row">
        {[
          ["Total Item",    items.length+" SKU"],
          ["Stok Rendah ⚠️", lowStock.length+" item"],
          ["Masuk Hari Ini", "+"+totalMasuk+" unit"],
          ["Keluar Hari Ini","-"+totalKeluar+" unit"],
          ["Nilai Stok",    FMT(totalNilai)],
        ].map(([l,v])=>(
          <div className="card stat-card" key={l}>
            <h3>{l}</h3>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      {/* Alert low stock */}
      {lowStock.length>0 && (
        <div style={{background:"rgba(220,38,38,0.08)",border:"1px solid var(--red)",borderRadius:14,padding:"14px 18px",marginBottom:20,display:"flex",gap:12,alignItems:"flex-start"}}>
          <AlertTriangle size={20} color="var(--red)" style={{flexShrink:0,marginTop:2}}/>
          <div>
            <div style={{fontWeight:700,color:"var(--red)",marginBottom:4}}>⚠️ {lowStock.length} item stok rendah / habis</div>
            <div style={{fontSize:13,color:"var(--muted)"}}>
              {lowStock.map(x=><span key={x.kode} style={{marginRight:8}}><strong>{x.kode}</strong> ({x.stok} {x.satuan})</span>)}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title"><h2>Perbandingan Stok vs Minimum</h2></div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="n" tick={{fontSize:12}}/>
            <Tooltip/>
            <Bar dataKey="stok" name="Stok" fill="var(--navy)" radius={[4,4,0,0]}/>
            <Bar dataKey="min"  name="Min"  fill="var(--orange)" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:16,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div className="search-bar" style={{minWidth:220}}>
            <Search size={16} style={{color:"var(--muted)",flexShrink:0}}/>
            <input placeholder="Cari kode, nama, kategori..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["all",...KATEGORI_LIST].map(k=>(
              <button key={k} className={`pill-btn small${filterKat===k?" active":""}`} onClick={()=>setFK(k)}>
                {k==="all"?"Semua":k}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            {[["all","Semua"],["low","⚠️ Stok Rendah"],["ok","Stok Aman"]].map(([k,l])=>(
              <button key={k} className={`pill-btn small${filterStatus===k?" active":""}`} onClick={()=>setFS(k)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        <div style={{overflowX:"auto"}}>
          <table>
            <thead>
              <tr>
                {["Kode","Nama Produk","Kategori","Stok","Masuk","Keluar","Satuan","Harga","Nilai Stok","Lokasi","Status","Aksi"].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={12} style={{textAlign:"center",padding:32,color:"var(--muted)"}}>Tidak ada data</td></tr>}
              {filtered.map(x=>{
                const low = x.stok<=x.min;
                const critical = x.stok===0;
                return (
                  <tr key={x.id} style={{background:critical?"rgba(220,38,38,0.10)":low?"rgba(249,115,22,0.05)":"transparent"}}>
                    <td><span className="badge badge-blue">{x.kode}</span></td>
                    <td><strong>{x.nama}</strong>{x.keterangan&&<div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{x.keterangan}</div>}</td>
                    <td><span className="badge badge-orange">{x.kategori}</span></td>
                    <td style={{fontWeight:800,color:critical?"var(--red)":low?"var(--orange)":"var(--text)",fontSize:16}}>{x.stok}</td>
                    <td style={{color:"var(--green)",fontWeight:600}}>+{x.masuk}</td>
                    <td style={{color:"var(--orange)",fontWeight:600}}>-{x.keluar}</td>
                    <td>{x.satuan}</td>
                    <td>{FMT(x.harga)}</td>
                    <td><strong>{FMT(x.stok*x.harga)}</strong></td>
                    <td><span style={{fontSize:12,color:"var(--muted)"}}>{x.lokasi}</span></td>
                    <td>
                      {critical
                        ? <span style={{background:"var(--red)",color:"#fff",borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700}}>HABIS</span>
                        : low
                          ? <span style={{background:"var(--orange)",color:"#fff",borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700}}>⚠️ Rendah</span>
                          : <span style={{background:"var(--green)",color:"#fff",borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700}}>Aman</span>}
                    </td>
                    <td>
                      {isOwnerOrAdmin && (
                        <div style={{display:"flex",gap:4}}>
                          <button className="icon-btn" onClick={()=>openEdit(x)}><Edit2 size={14}/></button>
                          <button className="icon-btn danger" onClick={()=>setDel(x)}><Trash2 size={14}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:10,display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--muted)"}}>
          <span>Menampilkan {filtered.length} dari {items.length} item</span>
          <strong>Total Nilai: {FMT(filtered.reduce((a,x)=>a+(x.stok*x.harga),0))}</strong>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId?"Edit Item":"Tambah Item Baru"}</h3>
              <button className="icon-btn" onClick={()=>setModal(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                {[["Kode","kode","text"],["Nama Produk","nama","text"],["Stok","stok","number"],["Masuk","masuk","number"],["Keluar","keluar","number"],["Harga","harga","number"],["Min Stok","min","number"],["Lokasi","lokasi","text"]].map(([l,k,t])=>(
                  <div className="form-group" key={k}>
                    <label>{l}</label>
                    <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:t==="number"?Number(e.target.value):e.target.value}))}/>
                  </div>
                ))}
                <div className="form-group">
                  <label>Kategori</label>
                  <select value={form.kategori} onChange={e=>setForm(p=>({...p,kategori:e.target.value}))}>
                    {KATEGORI_LIST.map(k=><option key={k}>{k}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Satuan</label>
                  <select value={form.satuan} onChange={e=>setForm(p=>({...p,satuan:e.target.value}))}>
                    {["unit","pcs","roll","box","set"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{gridColumn:"1/-1"}}>
                  <label>Keterangan</label>
                  <input placeholder="Opsional" value={form.keterangan} onChange={e=>setForm(p=>({...p,keterangan:e.target.value}))}/>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={()=>setModal(false)}>Batal</button>
              <button className="primary-btn" onClick={save}><Save size={15}/>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {del && (
        <div className="modal-overlay" onClick={()=>setDel(null)}>
          <div className="modal" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Hapus Item</h3><button className="icon-btn" onClick={()=>setDel(null)}><X size={16}/></button></div>
            <div className="modal-body"><p>Hapus <strong>{del.kode} – {del.nama}</strong>?</p></div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={()=>setDel(null)}>Batal</button>
              <button className="primary-btn danger-btn" onClick={()=>remove(del.id)}><Trash2 size={15}/>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
