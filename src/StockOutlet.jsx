import React, { useState } from "react";
import { Search, Download, Plus, Edit2, Trash2, X, Save, Store, Package } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");

const EMPTY = { sales:"", outlet:"", area:"", produk:"", kode:"", stok:0, satuan:"unit", harga:0, lastUpdate:"", keterangan:"" };

const SEED = [
  { id:1,  sales:"Sari Dewi",    outlet:"Toko Maju Sejahtera",  area:"Jakarta",  produk:"Edge Compute Unit v2",         kode:"ECU-V2",  stok:8,  satuan:"unit", harga:6500000,  lastUpdate:"2025-01-13", keterangan:"" },
  { id:2,  sales:"Sari Dewi",    outlet:"Toko Maju Sejahtera",  area:"Jakarta",  produk:"Solid State Array 12TB",       kode:"SSA-12",  stok:12, satuan:"unit", harga:2500000,  lastUpdate:"2025-01-13", keterangan:"" },
  { id:3,  sales:"Sari Dewi",    outlet:"Toko Harapan Baru",    area:"Jakarta",  produk:"Neural Interface Bridge",      kode:"NIB-01",  stok:3,  satuan:"unit", harga:3200000,  lastUpdate:"2025-01-10", keterangan:"Stok menipis" },
  { id:4,  sales:"Sari Dewi",    outlet:"CV. Maju Terus",       area:"Jakarta",  produk:"Fiber Module 5G Compatible",   kode:"FBR-5G",  stok:15, satuan:"unit", harga:450000,   lastUpdate:"2025-01-12", keterangan:"" },
  { id:5,  sales:"Budi Santoso", outlet:"CV. Berkah Mandiri",   area:"Bandung",  produk:"Quantum Processor X1",         kode:"QPX-01",  stok:2,  satuan:"unit", harga:18000000, lastUpdate:"2025-01-11", keterangan:"Stok kritis!" },
  { id:6,  sales:"Budi Santoso", outlet:"CV. Berkah Mandiri",   area:"Bandung",  produk:"RAM Server 64GB DDR5",          kode:"RAM-64",  stok:5,  satuan:"unit", harga:4200000,  lastUpdate:"2025-01-13", keterangan:"" },
  { id:7,  sales:"Budi Santoso", outlet:"PT. Sentosa Abadi",    area:"Medan",    produk:"Power Backup UPS 2000VA",       kode:"PWR-UPS", stok:3,  satuan:"unit", harga:1800000,  lastUpdate:"2025-01-09", keterangan:"" },
  { id:8,  sales:"Eka Permana",  outlet:"UD. Sumber Rezeki",    area:"Surabaya", produk:"Solid State Array 12TB",       kode:"SSA-12",  stok:15, satuan:"unit", harga:2500000,  lastUpdate:"2025-01-13", keterangan:"" },
  { id:9,  sales:"Eka Permana",  outlet:"UD. Sumber Rezeki",    area:"Surabaya", produk:"Kabel CAT8 100m",               kode:"CBL-CAT8",stok:4,  satuan:"roll", harga:320000,   lastUpdate:"2025-01-12", keterangan:"" },
  { id:10, sales:"Eka Permana",  outlet:"UD. Prima Jaya",       area:"Surabaya", produk:"Edge Compute Unit v2",         kode:"ECU-V2",  stok:0,  satuan:"unit", harga:6500000,  lastUpdate:"2025-01-08", keterangan:"HABIS – perlu restock" },
];

const SALES_LIST  = ["Sari Dewi","Budi Santoso","Eka Permana"];
const AREA_LIST   = ["Jakarta","Bandung","Surabaya","Medan"];

export default function StockOutlet() {
  const { session, addLog } = useApp();
  const [items, setItems]   = useState(SEED);
  const [search, setSearch] = useState("");
  const [filterSales, setFS] = useState("all");
  const [filterArea, setFA]  = useState("all");
  const [filterStatus, setFSt] = useState("all");
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [del, setDel]       = useState(null);

  const isOwnerOrAdmin = session?.role==="owner"||session?.role==="admin";

  const filtered = items.filter(x=>{
    const q = search.toLowerCase();
    const mQ = x.produk.toLowerCase().includes(q)||x.outlet.toLowerCase().includes(q)||x.sales.toLowerCase().includes(q)||x.kode.toLowerCase().includes(q);
    const mS = filterSales==="all"||x.sales===filterSales;
    const mA = filterArea==="all"||x.area===filterArea;
    const mSt = filterStatus==="all"||(filterStatus==="empty"?x.stok===0:filterStatus==="low"?x.stok>0&&x.stok<=5:x.stok>5);
    return mQ&&mS&&mA&&mSt;
  });

  const openAdd  = ()  => { setForm({...EMPTY,lastUpdate:new Date().toISOString().slice(0,10)}); setEditId(null); setModal(true); };
  const openEdit = (x) => { setForm({...x}); setEditId(x.id); setModal(true); };

  const save = () => {
    if(!form.sales||!form.outlet||!form.produk) return;
    const entry = {...form,id:editId||Date.now(),lastUpdate:new Date().toISOString().slice(0,10)};
    if(editId){
      setItems(prev=>prev.map(x=>x.id===editId?entry:x));
      addLog("Edit Stock Outlet",`${form.outlet} - ${form.produk}`,"inventory");
    } else {
      setItems(prev=>[entry,...prev]);
      addLog("Tambah Stock Outlet",`${form.outlet} - ${form.produk}`,"inventory");
    }
    setModal(false);
  };

  const remove = (id) => {
    const x=items.find(i=>i.id===id);
    setItems(prev=>prev.filter(i=>i.id!==id));
    addLog("Hapus Stock Outlet",`${x.outlet} - ${x.produk}`,"inventory");
    setDel(null);
  };

  const doExport = () => {
    exportToExcel(filtered,"Stock_Outlet",["sales","outlet","area","kode","produk","stok","satuan","harga","lastUpdate","keterangan"]);
    addLog("Export Excel","Stock Outlet diekspor","export");
  };

  const emptyCount = items.filter(x=>x.stok===0).length;
  const lowCount   = items.filter(x=>x.stok>0&&x.stok<=5).length;
  const totalNilai = items.reduce((a,x)=>a+(x.stok*x.harga),0);

  // Chart – stok per sales
  const chartData = SALES_LIST.map(s=>({
    s: s.split(" ")[0],
    total: items.filter(x=>x.sales===s).reduce((a,x)=>a+x.stok,0),
    nilai: Math.round(items.filter(x=>x.sales===s).reduce((a,x)=>a+(x.stok*x.harga),0)/1000000),
  }));

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Stock Outlet by Salesman</h1>
          <p>Monitor stok produk di setiap outlet berdasarkan area salesman</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export</button>
          {isOwnerOrAdmin && <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah</button>}
        </div>
      </div>

      {/* Summary */}
      <div className="summary-row">
        {[
          ["Total Entri",   items.length+" item"],
          ["Stok Habis ⚠️", emptyCount+" item"],
          ["Stok Rendah",   lowCount+" item"],
          ["Total Nilai",   FMT(totalNilai)],
        ].map(([l,v])=>(
          <div className="card stat-card" key={l}>
            <h3>{l}</h3>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-title"><h2>Total Unit per Sales</h2></div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="s"/>
              <Tooltip/>
              <Bar dataKey="total" name="Unit" fill="var(--navy)" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title"><h2>Nilai Stok per Sales (Juta Rp)</h2></div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="s"/>
              <Tooltip formatter={v=>`Rp ${v} jt`}/>
              <Bar dataKey="nilai" name="Nilai (jt)" fill="var(--orange)" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:16,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div className="search-bar" style={{minWidth:220}}>
            <Search size={16} style={{color:"var(--muted)",flexShrink:0}}/>
            <input placeholder="Cari produk, outlet, sales..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["all",...SALES_LIST].map(s=>(
              <button key={s} className={`pill-btn small${filterSales===s?" active":""}`} onClick={()=>setFS(s)}>
                {s==="all"?"Semua Sales":s.split(" ")[0]}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["all",...AREA_LIST].map(a=>(
              <button key={a} className={`pill-btn small${filterArea===a?" active":""}`} onClick={()=>setFA(a)}>
                {a==="all"?"Semua Area":a}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            {[["all","Semua"],["empty","Habis"],["low","Rendah ≤5"],["ok","Aman >5"]].map(([k,l])=>(
              <button key={k} className={`pill-btn small${filterStatus===k?" active":""}`} onClick={()=>setFSt(k)}>{l}</button>
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
                {["Sales","Outlet","Area","Kode","Produk","Stok","Satuan","Harga","Nilai","Last Update","Status","Aksi"].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={12} style={{textAlign:"center",padding:32,color:"var(--muted)"}}>Tidak ada data</td></tr>}
              {filtered.map(x=>{
                const empty   = x.stok===0;
                const low     = x.stok>0&&x.stok<=5;
                const rowBg   = empty?"rgba(220,38,38,0.08)":low?"rgba(249,115,22,0.05)":"transparent";
                const stokClr = empty?"var(--red)":low?"var(--orange)":"var(--text)";
                return (
                  <tr key={x.id} style={{background:rowBg}}>
                    <td><strong>{x.sales}</strong></td>
                    <td>{x.outlet}</td>
                    <td><span className="badge badge-blue">{x.area}</span></td>
                    <td><span className="badge badge-blue">{x.kode}</span></td>
                    <td>{x.produk}</td>
                    <td style={{fontWeight:800,color:stokClr,fontSize:15}}>{x.stok}</td>
                    <td>{x.satuan}</td>
                    <td>{FMT(x.harga)}</td>
                    <td><strong>{FMT(x.stok*x.harga)}</strong></td>
                    <td style={{fontSize:12,color:"var(--muted)"}}>{x.lastUpdate}</td>
                    <td>
                      {empty
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
          <span>Menampilkan {filtered.length} dari {items.length} entri</span>
          <strong>Total Nilai: {FMT(filtered.reduce((a,x)=>a+(x.stok*x.harga),0))}</strong>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId?"Edit Stock Outlet":"Tambah Stock Outlet"}</h3>
              <button className="icon-btn" onClick={()=>setModal(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Sales</label>
                  <select value={form.sales} onChange={e=>setForm(p=>({...p,sales:e.target.value}))}>
                    <option value="">Pilih sales</option>
                    {SALES_LIST.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Area</label>
                  <select value={form.area} onChange={e=>setForm(p=>({...p,area:e.target.value}))}>
                    <option value="">Pilih area</option>
                    {AREA_LIST.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                {[["Outlet","outlet","text"],["Kode","kode","text"],["Produk","produk","text"],["Stok","stok","number"],["Harga","harga","number"]].map(([l,k,t])=>(
                  <div className="form-group" key={k}>
                    <label>{l}</label>
                    <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:t==="number"?Number(e.target.value):e.target.value}))}/>
                  </div>
                ))}
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
            <div className="modal-header"><h3>Hapus Entri</h3><button className="icon-btn" onClick={()=>setDel(null)}><X size={16}/></button></div>
            <div className="modal-body"><p>Hapus stok <strong>{del.produk}</strong> di <strong>{del.outlet}</strong>?</p></div>
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
