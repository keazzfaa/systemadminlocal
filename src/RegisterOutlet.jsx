import React, { useState } from "react";
import { Store, Plus, Search, MapPin, Phone, User, Edit2, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { useApp } from "./context.jsx";

const AREAS = ["Malang Kota","Batu","Kepanjen","Blitar","Lawang","Singosari","Dampit"];

export default function RegisterOutlet() {
  const { outlets, setOutlets, users, session, addLog } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterArea, setFilterArea]     = useState("all");
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "view"
  const [form, setForm]   = useState({});
  const [delConfirm, setDelConfirm] = useState(null);

  const salesList = users.filter(x=>x.role==="sales").map(x=>x.name);

  const filtered = outlets.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || o.namaOutlet.toLowerCase().includes(q) || o.namaOwner.toLowerCase().includes(q) || o.telp.includes(q);
    const matchS = filterStatus==="all" || o.status===filterStatus;
    const matchA = filterArea==="all" || o.area===filterArea;
    return matchQ && matchS && matchA;
  });

  const openAdd = () => {
    setForm({ namaOutlet:"", namaOwner:"", telp:"", alamat:"", area:"", salesman: session?.role==="sales"?session.name:"", status:"Aktif", tanggalDaftar: new Date().toISOString().slice(0,10), koordinat:"" });
    setModal("add");
  };

  const openEdit = (o) => { setForm({...o}); setModal("edit"); };
  const openView = (o) => { setForm({...o}); setModal("view"); };

  const save = () => {
    if (!form.namaOutlet || !form.namaOwner || !form.telp || !form.area) return alert("Lengkapi field wajib!");
    if (modal === "add") {
      const newO = { ...form, id: Date.now() };
      setOutlets([newO, ...outlets]);
      addLog("Register Outlet", `Outlet baru: ${form.namaOutlet} (${form.namaOwner})`);
    } else {
      setOutlets(outlets.map(x => x.id===form.id ? form : x));
      addLog("Edit Outlet", `Update outlet: ${form.namaOutlet}`);
    }
    setModal(null);
  };

  const deleteO = (id) => {
    setOutlets(outlets.filter(x=>x.id!==id));
    addLog("Hapus Outlet", `Outlet ID ${id} dihapus`);
    setDelConfirm(null);
  };

  const toggleStatus = (o) => {
    const newStatus = o.status==="Aktif" ? "Nonaktif" : "Aktif";
    setOutlets(outlets.map(x=>x.id===o.id?{...x,status:newStatus}:x));
    addLog("Toggle Outlet", `${o.namaOutlet} → ${newStatus}`);
  };

  const areas = [...new Set(outlets.map(x=>x.area))];

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1><Store size={28} style={{verticalAlign:"middle",marginRight:8}}/>Register Outlet</h1>
          <p>Manajemen data outlet dan area penjualan</p>
        </div>
        <div className="header-actions">
          {(session?.role==="owner"||session?.role==="admin"||session?.role==="sales") && (
            <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah Outlet</button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        {[
          ["Total Outlet", outlets.length, "badge-blue"],
          ["Aktif",        outlets.filter(x=>x.status==="Aktif").length, "badge-green"],
          ["Nonaktif",     outlets.filter(x=>x.status==="Nonaktif").length, "badge-red"],
          ["Area",         areas.length, "badge-navy"],
        ].map(([l,v,c])=>(
          <div className="card" key={l} style={{padding:"16px 20px",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:800,color:"var(--navy)"}}>{v}</div>
            <div style={{fontSize:13,color:"var(--muted)",marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:20,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div className="search-bar" style={{flex:1,minWidth:200}}>
            <Search size={16} color="var(--muted)"/>
            <input placeholder="Cari outlet, owner, telp..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="pill-btn" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{height:44,paddingLeft:14,paddingRight:14,border:"1px solid var(--line)",background:"var(--bg)",color:"var(--text)",borderRadius:999}}>
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
          <select className="pill-btn" value={filterArea} onChange={e=>setFilterArea(e.target.value)} style={{height:44,paddingLeft:14,paddingRight:14,border:"1px solid var(--line)",background:"var(--bg)",color:"var(--text)",borderRadius:999}}>
            <option value="all">Semua Area</option>
            {areas.map(a=><option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        <div className="table-head">
          <h2>Data Outlet ({filtered.length})</h2>
        </div>
        <div style={{overflowX:"auto"}}>
          <table>
            <thead>
              <tr>
                <th>Nama Outlet</th>
                <th>Nama Owner</th>
                <th>Telp</th>
                <th>Area</th>
                <th>Salesman</th>
                <th>Tgl Daftar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o=>(
                <tr key={o.id}>
                  <td>
                    <div style={{fontWeight:700,fontSize:13}}>{o.namaOutlet}</div>
                    {o.alamat && <div style={{fontSize:11,color:"var(--muted)"}}>{o.alamat.slice(0,40)}...</div>}
                  </td>
                  <td style={{fontWeight:600}}>{o.namaOwner}</td>
                  <td style={{fontSize:13}}>{o.telp}</td>
                  <td><span className="badge badge-blue">{o.area}</span></td>
                  <td style={{fontSize:13}}>{o.salesman}</td>
                  <td style={{fontSize:12,color:"var(--muted)"}}>{o.tanggalDaftar}</td>
                  <td>
                    <button onClick={()=>toggleStatus(o)} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
                      <span className={`badge badge-${o.status==="Aktif"?"green":"red"}`}>{o.status}</span>
                    </button>
                  </td>
                  <td>
                    <div style={{display:"flex",gap:4}}>
                      <button className="icon-btn" title="Lihat" onClick={()=>openView(o)}><Eye size={14}/></button>
                      {(session?.role!=="sales"||o.salesman===session?.name) && (
                        <button className="icon-btn" title="Edit" onClick={()=>openEdit(o)}><Edit2 size={14}/></button>
                      )}
                      {session?.role==="owner"&&(
                        <button className="icon-btn danger" title="Hapus" onClick={()=>setDelConfirm(o.id)}><Trash2 size={14}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={8} style={{textAlign:"center",color:"var(--muted)",padding:40}}>Tidak ada data outlet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit/View */}
      {(modal==="add"||modal==="edit"||modal==="view") && (
        <div className="modal-backdrop" onClick={()=>setModal(null)}>
          <div className="modal" style={{maxWidth:560}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:"0 0 20px",fontSize:18,fontWeight:800}}>
              {modal==="add"?"Tambah Outlet Baru":modal==="edit"?"Edit Outlet":"Detail Outlet"}
            </h3>
            <div className="form-grid2">
              {[
                ["namaOutlet","Nama Outlet","text",true],
                ["namaOwner","Nama Owner","text",true],
                ["telp","No. Telepon","text",true],
                ["tanggalDaftar","Tanggal Daftar","date",false],
              ].map(([k,l,t,req])=>(
                <div key={k}>
                  <label className="form-label">{l}{req&&<span style={{color:"var(--red)"}}>*</span>}</label>
                  <input className="form-input" type={t} value={form[k]||""} disabled={modal==="view"}
                    onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                </div>
              ))}
              <div style={{gridColumn:"1/-1"}}>
                <label className="form-label">Alamat</label>
                <textarea className="form-input" rows={2} value={form.alamat||""} disabled={modal==="view"}
                  onChange={e=>setForm(f=>({...f,alamat:e.target.value}))} style={{resize:"vertical"}}/>
              </div>
              <div>
                <label className="form-label">Area<span style={{color:"var(--red)"}}>*</span></label>
                {modal==="view"
                  ? <input className="form-input" value={form.area||""} disabled/>
                  : <select className="form-input" value={form.area||""} onChange={e=>setForm(f=>({...f,area:e.target.value}))}>
                      <option value="">-- Pilih Area --</option>
                      {AREAS.map(a=><option key={a}>{a}</option>)}
                    </select>
                }
              </div>
              <div>
                <label className="form-label">Salesman</label>
                {modal==="view"||session?.role==="sales"
                  ? <input className="form-input" value={form.salesman||""} disabled/>
                  : <select className="form-input" value={form.salesman||""} onChange={e=>setForm(f=>({...f,salesman:e.target.value}))}>
                      <option value="">-- Pilih Salesman --</option>
                      {salesList.map(s=><option key={s}>{s}</option>)}
                    </select>
                }
              </div>
              <div>
                <label className="form-label">Status</label>
                {modal==="view"
                  ? <span className={`badge badge-${form.status==="Aktif"?"green":"red"}`}>{form.status}</span>
                  : <select className="form-input" value={form.status||"Aktif"} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                      <option>Aktif</option><option>Nonaktif</option>
                    </select>
                }
              </div>
              <div>
                <label className="form-label">Koordinat GPS</label>
                <input className="form-input" placeholder="-7.9797,112.6304" value={form.koordinat||""} disabled={modal==="view"}
                  onChange={e=>setForm(f=>({...f,koordinat:e.target.value}))}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:24,justifyContent:"flex-end"}}>
              <button className="secondary-btn" onClick={()=>setModal(null)}>Tutup</button>
              {modal!=="view" && <button className="primary-btn" onClick={save}>{modal==="add"?"Simpan":"Update"}</button>}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className="modal-backdrop" onClick={()=>setDelConfirm(null)}>
          <div className="modal" style={{maxWidth:400,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
            <Trash2 size={40} color="var(--red)" style={{margin:"0 auto 16px"}}/>
            <h3 style={{margin:"0 0 8px"}}>Hapus Outlet?</h3>
            <p style={{color:"var(--muted)",margin:"0 0 24px"}}>Data outlet ini akan dihapus permanen.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button className="secondary-btn" onClick={()=>setDelConfirm(null)}>Batal</button>
              <button className="primary-btn danger-btn" onClick={()=>deleteO(delConfirm)}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
