import React, { useState } from "react";
import { Plus, Search, Download, Edit2, Trash2, X, Save, MapPin, Phone, User, Store, ToggleLeft, ToggleRight } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";

const EMPTY = { nama:"", owner:"", telp:"", alamat:"", area:"", sales:"", program:"", status:"Aktif" };

const SEED = [
  { id:1, nama:"Toko Maju Sejahtera",  owner:"Budi Hartono",   telp:"0812-1234-5678", alamat:"Jl. Sudirman No.12, Jakarta Pusat",      area:"Jakarta",  sales:"Sari Dewi",    program:"Diskon Akhir Tahun", status:"Aktif"    },
  { id:2, nama:"CV. Berkah Mandiri",   owner:"Rina Susanti",   telp:"0821-2345-6789", alamat:"Jl. Gatot Subroto No.45, Bandung",        area:"Bandung",  sales:"Budi Santoso", program:"Bonus Volume",       status:"Aktif"    },
  { id:3, nama:"UD. Sumber Rezeki",    owner:"Hendra Wijaya",  telp:"0831-3456-7890", alamat:"Jl. Ahmad Yani No.88, Surabaya",           area:"Surabaya", sales:"Eka Permana",  program:"-",                  status:"Aktif"    },
  { id:4, nama:"Toko Harapan Baru",    owner:"Dewi Lestari",   telp:"0851-4567-8901", alamat:"Jl. Diponegoro No.23, Semarang",           area:"Semarang", sales:"Sari Dewi",    program:"-",                  status:"Nonaktif" },
  { id:5, nama:"PT. Sentosa Abadi",    owner:"Anton Halim",    telp:"0877-6543-2109", alamat:"Jl. Pemuda No.67, Medan",                  area:"Medan",    sales:"Budi Santoso", program:"Promo Lebaran",      status:"Aktif"    },
  { id:6, nama:"CV. Maju Terus",       owner:"Sri Wulan",      telp:"0856-9876-5432", alamat:"Jl. Kebon Jeruk No.14, Jakarta Barat",     area:"Jakarta",  sales:"Sari Dewi",    program:"Bonus Volume",       status:"Aktif"    },
  { id:7, nama:"UD. Karya Nyata",      owner:"Fajar Nugroho",  telp:"0899-1122-3344", alamat:"Jl. Raya Darmo No.55, Surabaya",           area:"Surabaya", sales:"Eka Permana",  program:"-",                  status:"Nonaktif" },
];

const SALES_LIST = ["Sari Dewi","Budi Santoso","Eka Permana"];
const AREA_LIST  = ["Jakarta","Bandung","Surabaya","Semarang","Medan","Makassar"];

export default function RegisterOutlet() {
  const { session, addLog } = useApp();
  const [outlets, setOutlets] = useState(SEED);
  const [search, setSearch]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterArea, setFilterArea]     = useState("all");
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [del, setDel]     = useState(null);

  const isOwnerOrAdmin = session?.role === "owner" || session?.role === "admin";

  const filtered = outlets.filter(x => {
    const q = search.toLowerCase();
    const matchQ = x.nama.toLowerCase().includes(q) || x.owner.toLowerCase().includes(q) || x.area.toLowerCase().includes(q) || x.sales.toLowerCase().includes(q);
    const matchS  = filterStatus === "all" || x.status === filterStatus;
    const matchA  = filterArea   === "all" || x.area   === filterArea;
    return matchQ && matchS && matchA;
  });

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (o)  => { setForm({...o}); setEditId(o.id); setModal(true); };

  const save = () => {
    if (!form.nama || !form.owner || !form.telp) return;
    if (editId) {
      setOutlets(prev => prev.map(x => x.id === editId ? {...form, id:editId} : x));
      addLog("Edit Outlet", `${form.nama} diperbarui`, "data");
    } else {
      const neo = {...form, id: Date.now()};
      setOutlets(prev => [neo, ...prev]);
      addLog("Tambah Outlet", `${form.nama} didaftarkan`, "data");
    }
    setModal(false);
  };

  const remove = (id) => {
    const o = outlets.find(x => x.id === id);
    setOutlets(prev => prev.filter(x => x.id !== id));
    addLog("Hapus Outlet", `${o.nama} dihapus`, "data");
    setDel(null);
  };

  const toggleStatus = (id) => {
    setOutlets(prev => prev.map(x => x.id === id ? {...x, status: x.status==="Aktif"?"Nonaktif":"Aktif"} : x));
    const o = outlets.find(x=>x.id===id);
    addLog("Toggle Outlet", `${o.nama} → ${o.status==="Aktif"?"Nonaktif":"Aktif"}`, "data");
  };

  const doExport = () => {
    exportToExcel(filtered, "Register_Outlet", ["nama","owner","telp","alamat","area","sales","program","status"]);
    addLog("Export Excel","Register Outlet diekspor","export");
  };

  const areas = [...new Set(outlets.map(x=>x.area))];

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Register Outlet</h1>
          <p>Kelola data outlet dan status aktif/nonaktif</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export</button>
          {isOwnerOrAdmin && <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah Outlet</button>}
        </div>
      </div>

      {/* Summary */}
      <div className="summary-row">
        {[
          ["Total Outlet",    outlets.length],
          ["Aktif",           outlets.filter(x=>x.status==="Aktif").length],
          ["Nonaktif",        outlets.filter(x=>x.status==="Nonaktif").length],
          ["Area Coverage",   areas.length+" area"],
        ].map(([l,v])=>(
          <div className="card stat-card" key={l}>
            <h3>{l}</h3>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div className="search-bar" style={{minWidth:240}}>
            <Search size={16} style={{color:"var(--muted)",flexShrink:0}}/>
            <input placeholder="Cari outlet, owner, area..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all","Aktif","Nonaktif"].map(s=>(
              <button key={s} className={`pill-btn small${filterStatus===s?" active":""}`} onClick={()=>setFilterStatus(s)}>
                {s==="all"?"Semua Status":s}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["all",...areas].map(a=>(
              <button key={a} className={`pill-btn small${filterArea===a?" active":""}`} onClick={()=>setFilterArea(a)}>
                {a==="all"?"Semua Area":a}
              </button>
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
                {["Nama Outlet","Nama Owner","No. Telp","Alamat","Area","Sales","Program","Status","Aksi"].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{textAlign:"center",padding:32,color:"var(--muted)"}}>Tidak ada data</td></tr>
              )}
              {filtered.map(o=>(
                <tr key={o.id}>
                  <td><strong>{o.nama}</strong></td>
                  <td><span style={{display:"flex",alignItems:"center",gap:4}}><User size={13} style={{color:"var(--muted)"}}/>  {o.owner}</span></td>
                  <td><span style={{color:"var(--navy)",fontWeight:600}}>{o.telp}</span></td>
                  <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    <span style={{display:"flex",alignItems:"center",gap:4}} title={o.alamat}><MapPin size={13} style={{color:"var(--muted)",flexShrink:0}}/>{o.alamat}</span>
                  </td>
                  <td><span className="badge badge-blue">{o.area}</span></td>
                  <td>{o.sales}</td>
                  <td>{o.program!=="-"?<span className="badge badge-green">{o.program}</span>:<span style={{color:"var(--muted)"}}>-</span>}</td>
                  <td>
                    <span style={{background:o.status==="Aktif"?"var(--green)":"var(--muted)",color:"#fff",borderRadius:999,padding:"3px 12px",fontSize:12,fontWeight:700,cursor:isOwnerOrAdmin?"pointer":"default"}}
                          onClick={()=>isOwnerOrAdmin&&toggleStatus(o.id)}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {isOwnerOrAdmin && (
                      <div style={{display:"flex",gap:4}}>
                        <button className="icon-btn" onClick={()=>openEdit(o)} title="Edit"><Edit2 size={14}/></button>
                        <button className="icon-btn danger" onClick={()=>setDel(o)} title="Hapus"><Trash2 size={14}/></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:12,color:"var(--muted)",fontSize:13}}>
          Menampilkan {filtered.length} dari {outlets.length} outlet
        </div>
      </div>

      {/* Modal Add/Edit */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId?"Edit Outlet":"Tambah Outlet Baru"}</h3>
              <button className="icon-btn" onClick={()=>setModal(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                {[
                  ["Nama Outlet","nama","text","Nama toko/outlet"],
                  ["Nama Owner","owner","text","Nama pemilik"],
                  ["No. Telp","telp","text","08xx-xxxx-xxxx"],
                  ["Alamat","alamat","text","Jl. ..."],
                ].map(([label,key,type,ph])=>(
                  <div className="form-group" key={key}>
                    <label>{label}</label>
                    <input type={type} placeholder={ph} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}/>
                  </div>
                ))}
                <div className="form-group">
                  <label>Area</label>
                  <select value={form.area} onChange={e=>setForm(p=>({...p,area:e.target.value}))}>
                    <option value="">Pilih area</option>
                    {AREA_LIST.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sales</label>
                  <select value={form.sales} onChange={e=>setForm(p=>({...p,sales:e.target.value}))}>
                    <option value="">Pilih sales</option>
                    {SALES_LIST.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Program</label>
                  <input placeholder="Nama program (opsional)" value={form.program} onChange={e=>setForm(p=>({...p,program:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                    <option>Aktif</option>
                    <option>Nonaktif</option>
                  </select>
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

      {/* Confirm Delete */}
      {del && (
        <div className="modal-overlay" onClick={()=>setDel(null)}>
          <div className="modal" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Hapus Outlet</h3><button className="icon-btn" onClick={()=>setDel(null)}><X size={16}/></button></div>
            <div className="modal-body"><p>Hapus <strong>{del.nama}</strong>? Tindakan ini tidak bisa dibatalkan.</p></div>
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
