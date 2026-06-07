import React, { useState } from "react";
import { MapPin, Plus, Search, Calendar, Clock, User, CheckCircle, XCircle, Eye, Trash2, Navigation } from "lucide-react";
import { useApp } from "./context.jsx";

export default function Absensi() {
  const { absensi, setAbsensi, outlets, users, session, addLog } = useApp();
  const [search, setSearch]       = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSales, setFilterSales] = useState("all");
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState({});
  const [viewRec, setViewRec]     = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const salesList = users.filter(x=>x.role==="sales").map(x=>x.name);
  const outletList = outlets.map(x=>x.namaOutlet);

  const myAbsensi = session?.role==="sales"
    ? absensi.filter(x=>x.salesman===session.name)
    : absensi;

  const filtered = myAbsensi.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q || a.salesman.toLowerCase().includes(q) || a.outlet.toLowerCase().includes(q) || a.koordinat?.includes(q);
    const matchD = !filterDate || a.tanggal===filterDate;
    const matchS = filterSales==="all" || a.salesman===filterSales;
    return matchQ && matchD && matchS;
  });

  // Group by date for summary
  const dates = [...new Set(filtered.map(x=>x.tanggal))].sort().reverse();
  const today = new Date().toISOString().slice(0,10);

  const openAdd = () => {
    setForm({
      salesman: session?.role==="sales" ? session.name : "",
      tanggal: today,
      outlet: "",
      jamMasuk: "",
      jamKeluar: "",
      koordinat: "",
      status: "Hadir",
      catatan: "",
    });
    setModal("add");
  };

  const save = () => {
    if (!form.salesman||!form.outlet||!form.tanggal||!form.jamMasuk) return alert("Lengkapi field wajib!");
    const rec = { ...form, id: Date.now() };
    setAbsensi([rec, ...absensi]);
    addLog("Absensi", `${rec.salesman} kunjungi ${rec.outlet} (${rec.tanggal})`);
    setModal(null);
  };

  const deleteA = (id) => {
    setAbsensi(absensi.filter(x=>x.id!==id));
    addLog("Hapus Absensi", `Record ID ${id} dihapus`);
    setDelConfirm(null);
  };

  // Summary per salesman for today's date
  const todayRecs = myAbsensi.filter(x=>x.tanggal===today);
  const grouped = salesList.map(s=>({
    name:s,
    hadir: myAbsensi.filter(x=>x.salesman===s&&x.status==="Hadir").length,
    tidakHadir: myAbsensi.filter(x=>x.salesman===s&&x.status==="Tidak Hadir").length,
    today: myAbsensi.filter(x=>x.salesman===s&&x.tanggal===today).length,
  }));

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1><MapPin size={28} style={{verticalAlign:"middle",marginRight:8}}/>Absensi & Tag Lokasi</h1>
          <p>Laporan kunjungan sales ke setiap outlet</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah Kunjungan</button>
        </div>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        {[
          ["Total Kunjungan", myAbsensi.length, "badge-blue"],
          ["Hari Ini", todayRecs.length, "badge-navy"],
          ["Hadir", myAbsensi.filter(x=>x.status==="Hadir").length, "badge-green"],
          ["Tidak Hadir", myAbsensi.filter(x=>x.status==="Tidak Hadir").length, "badge-red"],
        ].map(([l,v,c])=>(
          <div className="card" key={l} style={{padding:"16px 20px",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:800,color:"var(--navy)"}}>{v}</div>
            <div style={{fontSize:13,color:"var(--muted)",marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Salesman summary (admin/owner only) */}
      {session?.role!=="sales" && (
        <div className="card" style={{marginBottom:20}}>
          <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:800}}>Rekap Kunjungan per Salesman</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
            {grouped.map(g=>(
              <div key={g.name} style={{background:"var(--bg)",border:"1px solid var(--line)",borderRadius:14,padding:"14px 16px"}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>{g.name}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span className="badge badge-green">{g.hadir} hadir</span>
                  <span className="badge badge-red">{g.tidakHadir} absen</span>
                  <span className="badge badge-blue">{g.today} hari ini</span>
                </div>
              </div>
            ))}
            {grouped.length===0 && <span style={{color:"var(--muted)"}}>Tidak ada data salesman</span>}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{marginBottom:16,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div className="search-bar" style={{flex:1,minWidth:200}}>
            <Search size={16} color="var(--muted)"/>
            <input placeholder="Cari salesman, outlet..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
            style={{height:44,padding:"0 14px",border:"1px solid var(--input-border)",borderRadius:999,background:"var(--input-bg)",color:"var(--text)",fontSize:14,fontFamily:"inherit"}}/>
          {filterDate && <button className="pill-btn" onClick={()=>setFilterDate("")}>Reset Tanggal</button>}
          {session?.role!=="sales" && (
            <select value={filterSales} onChange={e=>setFilterSales(e.target.value)}
              style={{height:44,padding:"0 14px",border:"1px solid var(--line)",borderRadius:999,background:"var(--bg)",color:"var(--text)",fontSize:14,fontFamily:"inherit"}}>
              <option value="all">Semua Sales</option>
              {salesList.map(s=><option key={s}>{s}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        <div className="table-head">
          <h2>Log Kunjungan ({filtered.length})</h2>
        </div>
        <div style={{overflowX:"auto"}}>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Salesman</th>
                <th>Outlet</th>
                <th>Jam Masuk</th>
                <th>Jam Keluar</th>
                <th>Koordinat</th>
                <th>Status</th>
                <th>Catatan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a=>(
                <tr key={a.id}>
                  <td style={{fontSize:12,fontWeight:600}}>{a.tanggal}</td>
                  <td style={{fontWeight:600,fontSize:13}}>{a.salesman}</td>
                  <td style={{fontSize:13}}>{a.outlet}</td>
                  <td style={{fontSize:12}}><Clock size={12} style={{marginRight:4,verticalAlign:"middle"}}/>{a.jamMasuk}</td>
                  <td style={{fontSize:12}}>{a.jamKeluar&&a.jamKeluar!=="-"?<><Clock size={12} style={{marginRight:4,verticalAlign:"middle"}}/>{a.jamKeluar}</>:"-"}</td>
                  <td>
                    {a.koordinat ? (
                      <a href={`https://maps.google.com/?q=${a.koordinat}`} target="_blank" rel="noopener noreferrer"
                        style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"var(--navy)",textDecoration:"none",border:"1px solid var(--navy)",borderRadius:999,padding:"2px 8px",fontWeight:600}}>
                        <Navigation size={10}/> Lihat Map
                      </a>
                    ) : <span style={{color:"var(--muted)",fontSize:12}}>-</span>}
                  </td>
                  <td><span className={`badge badge-${a.status==="Hadir"?"green":"red"}`}>{a.status}</span></td>
                  <td style={{fontSize:12,color:"var(--muted)",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.catatan||"-"}</td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <button className="icon-btn" title="Lihat" onClick={()=>setViewRec(a)}><Eye size={14}/></button>
                      {(session?.role==="owner"||session?.role==="admin") && (
                        <button className="icon-btn danger" title="Hapus" onClick={()=>setDelConfirm(a.id)}><Trash2 size={14}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={9} style={{textAlign:"center",color:"var(--muted)",padding:40}}>Tidak ada data kunjungan</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {modal==="add" && (
        <div className="modal-backdrop" onClick={()=>setModal(null)}>
          <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:"0 0 20px",fontSize:18,fontWeight:800}}>Tambah Kunjungan</h3>
            <div className="form-grid2">
              <div>
                <label className="form-label">Salesman<span style={{color:"var(--red)"}}>*</span></label>
                {session?.role==="sales"
                  ? <input className="form-input" value={form.salesman} disabled/>
                  : <select className="form-input" value={form.salesman||""} onChange={e=>setForm(f=>({...f,salesman:e.target.value}))}>
                      <option value="">-- Pilih --</option>
                      {salesList.map(s=><option key={s}>{s}</option>)}
                    </select>
                }
              </div>
              <div>
                <label className="form-label">Tanggal<span style={{color:"var(--red)"}}>*</span></label>
                <input className="form-input" type="date" value={form.tanggal||""} onChange={e=>setForm(f=>({...f,tanggal:e.target.value}))}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label className="form-label">Outlet<span style={{color:"var(--red)"}}>*</span></label>
                <select className="form-input" value={form.outlet||""} onChange={e=>setForm(f=>({...f,outlet:e.target.value}))}>
                  <option value="">-- Pilih Outlet --</option>
                  {outletList.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Jam Masuk<span style={{color:"var(--red)"}}>*</span></label>
                <input className="form-input" type="time" value={form.jamMasuk||""} onChange={e=>setForm(f=>({...f,jamMasuk:e.target.value}))}/>
              </div>
              <div>
                <label className="form-label">Jam Keluar</label>
                <input className="form-input" type="time" value={form.jamKeluar||""} onChange={e=>setForm(f=>({...f,jamKeluar:e.target.value}))}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label className="form-label">Koordinat GPS</label>
                <input className="form-input" placeholder="-7.9797,112.6304" value={form.koordinat||""} onChange={e=>setForm(f=>({...f,koordinat:e.target.value}))}/>
                <small style={{color:"var(--muted)",fontSize:11}}>Format: latitude,longitude</small>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status||"Hadir"} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  <option>Hadir</option><option>Tidak Hadir</option>
                </select>
              </div>
              <div>
                <label className="form-label">Catatan</label>
                <input className="form-input" value={form.catatan||""} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))} placeholder="Keterangan kunjungan..."/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:24,justifyContent:"flex-end"}}>
              <button className="secondary-btn" onClick={()=>setModal(null)}>Batal</button>
              <button className="primary-btn" onClick={save}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewRec && (
        <div className="modal-backdrop" onClick={()=>setViewRec(null)}>
          <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:"0 0 20px",fontSize:18,fontWeight:800}}>Detail Kunjungan</h3>
            {[
              ["Salesman", viewRec.salesman],
              ["Tanggal", viewRec.tanggal],
              ["Outlet", viewRec.outlet],
              ["Jam Masuk", viewRec.jamMasuk],
              ["Jam Keluar", viewRec.jamKeluar||"-"],
              ["Catatan", viewRec.catatan||"-"],
            ].map(([l,v])=>(
              <div key={l} className="info-row">
                <span className="info-row-label">{l}</span>
                <span className="info-row-val">{v}</span>
              </div>
            ))}
            <div className="info-row">
              <span className="info-row-label">Status</span>
              <span><span className={`badge badge-${viewRec.status==="Hadir"?"green":"red"}`}>{viewRec.status}</span></span>
            </div>
            {viewRec.koordinat && (
              <div className="info-row">
                <span className="info-row-label">Lokasi</span>
                <a href={`https://maps.google.com/?q=${viewRec.koordinat}`} target="_blank" rel="noopener noreferrer"
                  className="primary-btn" style={{fontSize:12,padding:"6px 12px"}}>
                  <Navigation size={12}/> Buka di Maps
                </a>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
              <button className="secondary-btn" onClick={()=>setViewRec(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className="modal-backdrop" onClick={()=>setDelConfirm(null)}>
          <div className="modal" style={{maxWidth:380,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
            <Trash2 size={40} color="var(--red)" style={{margin:"0 auto 16px"}}/>
            <h3 style={{margin:"0 0 8px"}}>Hapus Record Kunjungan?</h3>
            <p style={{color:"var(--muted)",margin:"0 0 24px"}}>Data ini akan dihapus permanen.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button className="secondary-btn" onClick={()=>setDelConfirm(null)}>Batal</button>
              <button className="primary-btn danger-btn" onClick={()=>deleteA(delConfirm)}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
