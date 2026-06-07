import React, { useState } from "react";
import { FileText, Plus, Search, AlertTriangle, Clock, CheckCircle, Edit2, Trash2, Eye, DollarSign } from "lucide-react";
import { useApp } from "./context.jsx";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");

function daysDiff(dateStr) {
  const d = new Date(dateStr);
  const now = new Date("2025-01-14");
  return Math.floor((now - d) / (1000*60*60*24));
}

function getStatusFromDays(jatuhTempo) {
  const diff = daysDiff(jatuhTempo);
  if (diff > 90) return "priority";
  if (diff > 30) return "overdue";
  return "normal";
}

export default function InvoicePiutang() {
  const { invoices, setInvoices, outlets, users, session, addLog } = useApp();
  const [tab, setTab]     = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [delConfirm, setDelConfirm] = useState(null);
  const [bayarModal, setBayarModal] = useState(null);
  const [bayarAmt, setBayarAmt]     = useState("");

  const salesList = users.filter(x=>x.role==="sales").map(x=>x.name);
  const outletList = outlets.map(x=>x.namaOutlet);

  // For sales: only see own invoices
  const myInvoices = session?.role==="sales"
    ? invoices.filter(x=>x.salesman===session.name)
    : invoices;

  // Recalculate status dynamically
  const withStatus = myInvoices.map(inv => ({
    ...inv,
    statusCalc: getStatusFromDays(inv.tanggalJatuhTempo),
    hari: daysDiff(inv.tanggalJatuhTempo),
  }));

  const tabs = [
    { key:"all",      label:"Semua",    count: withStatus.length },
    { key:"normal",   label:"Normal (14-30 Hari)",    count: withStatus.filter(x=>x.status==="normal").length, color:"green" },
    { key:"overdue",  label:"Overdue (30-90 Hari)",   count: withStatus.filter(x=>x.status==="overdue").length, color:"orange" },
    { key:"priority", label:"Priority (>90 Hari)",    count: withStatus.filter(x=>x.status==="priority").length, color:"red" },
  ];

  const filtered = withStatus.filter(inv => {
    const q = search.toLowerCase();
    const matchQ = !q || inv.noInvoice.toLowerCase().includes(q) || inv.outlet.toLowerCase().includes(q) || inv.salesman.toLowerCase().includes(q);
    const matchT = tab==="all" || inv.status===tab;
    return matchQ && matchT;
  });

  const totalSisa = filtered.reduce((s,x)=>s+x.sisa,0);
  const totalJumlah = filtered.reduce((s,x)=>s+x.jumlah,0);

  const openAdd = () => {
    setForm({
      noInvoice:"INV-2025-"+(invoices.length+1).toString().padStart(3,"0"),
      outlet:"", salesman:session?.role==="sales"?session.name:"",
      tanggalInvoice:new Date().toISOString().slice(0,10),
      tanggalJatuhTempo:"", jumlah:"", sisa:"",
      status:"normal", keterangan:""
    });
    setModal("add");
  };

  const openEdit = (inv) => { setForm({...inv}); setModal("edit"); };
  const openView = (inv) => { setForm({...inv}); setModal("view"); };

  const save = () => {
    if (!form.outlet||!form.tanggalJatuhTempo||!form.jumlah) return alert("Lengkapi field wajib!");
    const j = parseFloat(String(form.jumlah).replace(/\D/g,""));
    const s = parseFloat(String(form.sisa||form.jumlah).replace(/\D/g,""));
    const rec = { ...form, jumlah:j, sisa:isNaN(s)?j:s, id: form.id||Date.now() };
    if (modal==="add") {
      setInvoices([rec,...invoices]);
      addLog("Tambah Invoice", `${rec.noInvoice} - ${rec.outlet}`);
    } else {
      setInvoices(invoices.map(x=>x.id===rec.id?rec:x));
      addLog("Edit Invoice", `Update ${rec.noInvoice}`);
    }
    setModal(null);
  };

  const bayar = () => {
    const amt = parseFloat(bayarAmt.replace(/\D/g,""));
    if (!amt||amt<=0) return alert("Masukkan jumlah pembayaran yang valid!");
    setInvoices(invoices.map(x=>{
      if(x.id!==bayarModal.id) return x;
      const newSisa = Math.max(0, x.sisa - amt);
      const newStatus = newSisa===0?"lunas":getStatusFromDays(x.tanggalJatuhTempo);
      return {...x, sisa:newSisa, status:newSisa===0?"lunas":x.status};
    }));
    addLog("Pembayaran Invoice", `${bayarModal.noInvoice} bayar ${FMT(amt)}`);
    setBayarModal(null); setBayarAmt("");
  };

  const statusStyle = (s) => ({
    normal:{bg:"#f0fdf4",border:"var(--green)",text:"var(--green)",label:"Normal"},
    overdue:{bg:"#fff7ed",border:"var(--orange)",text:"var(--orange)",label:"Overdue"},
    priority:{bg:"#fef2f2",border:"var(--red)",text:"var(--red)",label:"Priority ⚠"},
    lunas:{bg:"#eff6ff",border:"var(--navy)",text:"var(--navy)",label:"Lunas"},
  }[s]||{bg:"var(--bg)",border:"var(--line)",text:"var(--muted)",label:s});

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1><FileText size={28} style={{verticalAlign:"middle",marginRight:8}}/>Invoice Piutang</h1>
          <p>Manajemen tagihan dan piutang outlet</p>
        </div>
        <div className="header-actions">
          {(session?.role==="owner"||session?.role==="admin") && (
            <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah Invoice</button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        {[
          ["Total Piutang",  FMT(myInvoices.reduce((s,x)=>s+x.sisa,0)), "badge-navy", DollarSign],
          ["Normal",         withStatus.filter(x=>x.status==="normal").length+" invoice", "badge-green", CheckCircle],
          ["Overdue",        withStatus.filter(x=>x.status==="overdue").length+" invoice","badge-orange", Clock],
          ["Priority",       withStatus.filter(x=>x.status==="priority").length+" invoice","badge-red", AlertTriangle],
        ].map(([l,v,c,I])=>(
          <div className="card" key={l} style={{padding:"16px 20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <I size={18} style={{color:`var(--${c.replace("badge-","")})`}}/><span className={`badge ${c}`}>{l}</span>
            </div>
            <div style={{fontSize:20,fontWeight:800}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Priority warning */}
      {withStatus.filter(x=>x.status==="priority").length > 0 && (
        <div className="card" style={{border:"2px solid var(--red)",background:"#fef2f2",marginBottom:16,padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
          <AlertTriangle size={20} color="var(--red)"/>
          <span style={{fontWeight:700,color:"var(--red)"}}>
            {withStatus.filter(x=>x.status==="priority").length} invoice melebihi 90 hari! Total: {FMT(withStatus.filter(x=>x.status==="priority").reduce((s,x)=>s+x.sisa,0))}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="filter-tabs" style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            className={`pill-btn${tab===t.key?" active":""}`}>
            {t.label} <span className={`badge badge-${t.color||"navy"}`} style={{marginLeft:4}}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{marginBottom:16,padding:"12px 16px"}}>
        <div className="search-bar" style={{maxWidth:400}}>
          <Search size={16} color="var(--muted)"/>
          <input placeholder="Cari no invoice, outlet, salesman..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        <div className="table-head">
          <h2>
            {tab==="priority" && <AlertTriangle size={16} color="var(--red)" style={{marginRight:6}}/>}
            {tab==="all"?"Semua Invoice":tab==="normal"?"Invoice Normal (14-30 Hari)":tab==="overdue"?"Invoice Overdue (30-90 Hari)":"Invoice Priority (>90 Hari)"}
            {" "}({filtered.length})
          </h2>
          <div style={{fontSize:13,color:"var(--muted)"}}>Total Sisa: <strong style={{color:"var(--navy)"}}>{FMT(totalSisa)}</strong></div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table>
            <thead>
              <tr>
                <th>No Invoice</th>
                <th>Outlet</th>
                <th>Salesman</th>
                <th>Tgl Invoice</th>
                <th>Jatuh Tempo</th>
                <th>Hari</th>
                <th>Jumlah</th>
                <th>Sisa</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv=>{
                const st = statusStyle(inv.status);
                return (
                  <tr key={inv.id} style={inv.status==="priority"?{background:"#fff5f5"}:{}}>
                    <td style={{fontWeight:700,color:inv.status==="priority"?"var(--red)":"inherit"}}>{inv.noInvoice}</td>
                    <td style={{fontWeight:600,fontSize:13}}>{inv.outlet}</td>
                    <td style={{fontSize:13}}>{inv.salesman}</td>
                    <td style={{fontSize:12,color:"var(--muted)"}}>{inv.tanggalInvoice}</td>
                    <td style={{fontSize:12,fontWeight:600,color:inv.status==="priority"?"var(--red)":inv.status==="overdue"?"var(--orange)":"inherit"}}>{inv.tanggalJatuhTempo}</td>
                    <td style={{textAlign:"center"}}>
                      <span style={{background:st.bg,color:st.text,border:`1px solid ${st.border}`,borderRadius:999,padding:"2px 8px",fontSize:11,fontWeight:700}}>
                        {inv.hari > 0 ? `+${inv.hari}h` : `${inv.hari}h`}
                      </span>
                    </td>
                    <td style={{fontSize:13}}>{FMT(inv.jumlah)}</td>
                    <td style={{fontWeight:700,color:inv.sisa===0?"var(--green)":inv.status==="priority"?"var(--red)":"inherit"}}>{FMT(inv.sisa)}</td>
                    <td>
                      <span style={{background:st.bg,color:st.text,border:`1px solid ${st.border}`,borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700}}>{st.label}</span>
                    </td>
                    <td>
                      <div style={{display:"flex",gap:4}}>
                        <button className="icon-btn" title="Lihat" onClick={()=>openView(inv)}><Eye size={14}/></button>
                        {session?.role!=="sales" && (
                          <button className="icon-btn" title="Edit" onClick={()=>openEdit(inv)}><Edit2 size={14}/></button>
                        )}
                        {inv.sisa>0 && (
                          <button className="icon-btn" title="Bayar" style={{background:"#f0fdf4",color:"var(--green)",borderColor:"var(--green)"}} onClick={()=>{setBayarModal(inv);setBayarAmt("");}}>
                            <DollarSign size={14}/>
                          </button>
                        )}
                        {session?.role==="owner" && (
                          <button className="icon-btn danger" title="Hapus" onClick={()=>setDelConfirm(inv.id)}><Trash2 size={14}/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan={10} style={{textAlign:"center",color:"var(--muted)",padding:40}}>Tidak ada invoice</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit/View Modal */}
      {(modal==="add"||modal==="edit"||modal==="view") && (
        <div className="modal-backdrop" onClick={()=>setModal(null)}>
          <div className="modal" style={{maxWidth:580}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:"0 0 20px",fontSize:18,fontWeight:800}}>
              {modal==="add"?"Tambah Invoice":modal==="edit"?"Edit Invoice":"Detail Invoice"}
            </h3>
            <div className="form-grid2">
              <div>
                <label className="form-label">No Invoice</label>
                <input className="form-input" value={form.noInvoice||""} disabled onChange={e=>setForm(f=>({...f,noInvoice:e.target.value}))}/>
              </div>
              <div>
                <label className="form-label">Outlet<span style={{color:"var(--red)"}}>*</span></label>
                {modal==="view"
                  ? <input className="form-input" value={form.outlet} disabled/>
                  : <select className="form-input" value={form.outlet||""} onChange={e=>setForm(f=>({...f,outlet:e.target.value}))}>
                      <option value="">-- Pilih Outlet --</option>
                      {outletList.map(o=><option key={o}>{o}</option>)}
                    </select>
                }
              </div>
              <div>
                <label className="form-label">Salesman</label>
                {modal==="view"||session?.role==="sales"
                  ? <input className="form-input" value={form.salesman||""} disabled/>
                  : <select className="form-input" value={form.salesman||""} onChange={e=>setForm(f=>({...f,salesman:e.target.value}))}>
                      <option value="">-- Pilih --</option>
                      {salesList.map(s=><option key={s}>{s}</option>)}
                    </select>
                }
              </div>
              <div>
                <label className="form-label">Tgl Invoice</label>
                <input className="form-input" type="date" value={form.tanggalInvoice||""} disabled={modal==="view"} onChange={e=>setForm(f=>({...f,tanggalInvoice:e.target.value}))}/>
              </div>
              <div>
                <label className="form-label">Jatuh Tempo<span style={{color:"var(--red)"}}>*</span></label>
                <input className="form-input" type="date" value={form.tanggalJatuhTempo||""} disabled={modal==="view"} onChange={e=>setForm(f=>({...f,tanggalJatuhTempo:e.target.value}))}/>
              </div>
              <div>
                <label className="form-label">Jumlah<span style={{color:"var(--red)"}}>*</span></label>
                <input className="form-input" type="number" value={form.jumlah||""} disabled={modal==="view"} onChange={e=>setForm(f=>({...f,jumlah:e.target.value}))}/>
              </div>
              <div>
                <label className="form-label">Sisa Tagihan</label>
                <input className="form-input" type="number" value={form.sisa||""} disabled={modal==="view"} onChange={e=>setForm(f=>({...f,sisa:e.target.value}))}/>
              </div>
              <div>
                <label className="form-label">Status</label>
                {modal==="view"
                  ? <span className={`badge badge-${form.status==="normal"?"green":form.status==="overdue"?"orange":"red"}`}>{form.status}</span>
                  : <select className="form-input" value={form.status||"normal"} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                      <option value="normal">Normal</option>
                      <option value="overdue">Overdue</option>
                      <option value="priority">Priority</option>
                    </select>
                }
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label className="form-label">Keterangan</label>
                <textarea className="form-input" rows={2} value={form.keterangan||""} disabled={modal==="view"}
                  onChange={e=>setForm(f=>({...f,keterangan:e.target.value}))} style={{resize:"vertical"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:24,justifyContent:"flex-end"}}>
              <button className="secondary-btn" onClick={()=>setModal(null)}>Tutup</button>
              {modal!=="view" && <button className="primary-btn" onClick={save}>{modal==="add"?"Simpan":"Update"}</button>}
            </div>
          </div>
        </div>
      )}

      {/* Bayar Modal */}
      {bayarModal && (
        <div className="modal-backdrop" onClick={()=>setBayarModal(null)}>
          <div className="modal" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800}}>Input Pembayaran</h3>
            <div style={{background:"var(--bg)",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
              <div style={{fontSize:13,color:"var(--muted)"}}>Invoice: <strong>{bayarModal.noInvoice}</strong></div>
              <div style={{fontSize:13,color:"var(--muted)"}}>Outlet: <strong>{bayarModal.outlet}</strong></div>
              <div style={{fontSize:15,fontWeight:800,color:"var(--red)",marginTop:8}}>Sisa: {FMT(bayarModal.sisa)}</div>
            </div>
            <label className="form-label">Jumlah Pembayaran</label>
            <input className="form-input" type="number" placeholder="Masukkan jumlah..." value={bayarAmt} onChange={e=>setBayarAmt(e.target.value)} style={{marginBottom:20}}/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="secondary-btn" onClick={()=>setBayarModal(null)}>Batal</button>
              <button className="primary-btn" onClick={bayar}>Konfirmasi Bayar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className="modal-backdrop" onClick={()=>setDelConfirm(null)}>
          <div className="modal" style={{maxWidth:380,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
            <Trash2 size={40} color="var(--red)" style={{margin:"0 auto 16px"}}/>
            <h3 style={{margin:"0 0 8px"}}>Hapus Invoice?</h3>
            <p style={{color:"var(--muted)",margin:"0 0 24px"}}>Data invoice ini akan dihapus permanen.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button className="secondary-btn" onClick={()=>setDelConfirm(null)}>Batal</button>
              <button className="primary-btn danger-btn" onClick={()=>{setInvoices(invoices.filter(x=>x.id!==delConfirm));setDelConfirm(null);addLog("Hapus Invoice","Invoice dihapus");}}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
