import React, { useState } from "react";
import { Search, Download, Filter, AlertTriangle, Clock, CheckCircle, ShieldAlert, FileText, Phone, X, Eye } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const FMT = v => "Rp " + (v || 0).toLocaleString("id-ID");

const SEED_INVOICES = [
  { id:"INV-2025-001", toko:"Toko Maju Sejahtera",  sales:"Sari Dewi",    area:"Jakarta",  nominal:45000000,  tglInvoice:"2024-12-22", tglJatuhTempo:"2025-01-22", hari:22,  status:"normal",   keterangan:"Pembayaran tempo normal" },
  { id:"INV-2025-002", toko:"CV. Berkah Mandiri",   sales:"Budi Santoso", area:"Bandung",  nominal:28500000,  tglInvoice:"2024-12-20", tglJatuhTempo:"2025-01-28", hari:28,  status:"normal",   keterangan:"Sisa tagihan PO-120" },
  { id:"INV-2025-003", toko:"UD. Prima Jaya",       sales:"Eka Permana",  area:"Surabaya", nominal:62000000,  tglInvoice:"2024-11-29", tglJatuhTempo:"2025-01-03", hari:45,  status:"overdue",  keterangan:"Follow-up 3x, belum bayar" },
  { id:"INV-2025-004", toko:"Toko Karya Utama",     sales:"Sari Dewi",    area:"Jakarta",  nominal:18750000,  tglInvoice:"2024-11-11", tglJatuhTempo:"2024-12-16", hari:68,  status:"overdue",  keterangan:"Owner tidak dapat dihubungi" },
  { id:"INV-2025-005", toko:"PT. Sentosa Abadi",    sales:"Budi Santoso", area:"Medan",    nominal:125000000, tglInvoice:"2024-10-05", tglJatuhTempo:"2024-11-04", hari:95,  status:"priority", keterangan:"URGENT – perlu tindak hukum" },
  { id:"INV-2025-006", toko:"CV. Makmur Jaya",      sales:"Eka Permana",  area:"Surabaya", nominal:87500000,  tglInvoice:"2024-09-23", tglJatuhTempo:"2024-10-23", hari:112, status:"priority", keterangan:"Owner kabur, aset disita" },
  { id:"INV-2025-007", toko:"UD. Sumber Rezeki",    sales:"Sari Dewi",    area:"Semarang", nominal:33200000,  tglInvoice:"2024-09-10", tglJatuhTempo:"2024-10-10", hari:145, status:"priority", keterangan:"Proses hukum berjalan" },
  { id:"INV-2025-008", toko:"Toko Harapan Baru",    sales:"Budi Santoso", area:"Bandung",  nominal:19800000,  tglInvoice:"2024-12-28", tglJatuhTempo:"2025-01-27", hari:16,  status:"normal",   keterangan:"Cicilan ke-2 dari 3" },
];

const STATUS_CONFIG = {
  normal:   { label:"Normal (14-30 hr)",   color:"var(--green)",  bg:"rgba(22,163,74,0.08)",  Icon:CheckCircle },
  overdue:  { label:"Overdue (30-90 hr)",  color:"var(--orange)", bg:"rgba(249,115,22,0.06)", Icon:Clock       },
  priority: { label:"Priority (>90 hr)",   color:"var(--red)",    bg:"rgba(220,38,38,0.08)",  Icon:ShieldAlert },
};

const PIE_COLORS = ["#16a34a","#f97316","#dc2626"];

export default function InvoicePiutang() {
  const { session, addLog } = useApp();
  const [invoices]     = useState(SEED_INVOICES);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState("all");
  const [filterSales, setFilterS] = useState("all");
  const [detail, setDetail]       = useState(null);

  const isOwnerOrAdmin = session?.role === "owner" || session?.role === "admin";
  const salesList = [...new Set(invoices.map(x=>x.sales))];

  const filtered = invoices.filter(x=>{
    const q = search.toLowerCase();
    const mQ = x.toko.toLowerCase().includes(q) || x.id.toLowerCase().includes(q) || x.sales.toLowerCase().includes(q);
    const mS = filterStatus==="all" || x.status===filterStatus;
    const mSales = filterSales==="all" || x.sales===filterSales;
    return mQ && mS && mSales;
  });

  // Summary stats
  const byStatus = ["normal","overdue","priority"].map(s=>({
    key:s,
    list: invoices.filter(x=>x.status===s),
    total: invoices.filter(x=>x.status===s).reduce((a,x)=>a+x.nominal,0),
  }));
  const grandTotal = invoices.reduce((a,x)=>a+x.nominal,0);

  const pieData = byStatus.map(b=>({name:STATUS_CONFIG[b.key].label.split(" ")[0], value:b.total/1000000}));
  const barData = salesList.map(s=>({
    s,
    normal:   invoices.filter(x=>x.sales===s&&x.status==="normal").reduce((a,x)=>a+x.nominal,0)/1000000,
    overdue:  invoices.filter(x=>x.sales===s&&x.status==="overdue").reduce((a,x)=>a+x.nominal,0)/1000000,
    priority: invoices.filter(x=>x.sales===s&&x.status==="priority").reduce((a,x)=>a+x.nominal,0)/1000000,
  }));

  const doExport = () => {
    exportToExcel(filtered,"Invoice_Piutang",["id","toko","sales","area","nominal","tglInvoice","tglJatuhTempo","hari","status","keterangan"]);
    addLog("Export Excel","Invoice Piutang diekspor","export");
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Invoice Piutang</h1>
          <p>Monitoring tagihan, overdue, dan priority collection</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export</button>
        </div>
      </div>

      {/* Summary Cards */}
      <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:20}}>
        {byStatus.map(({key,list,total})=>{
          const cfg = STATUS_CONFIG[key];
          return (
            <div className="card" key={key} style={{borderLeft:`4px solid ${cfg.color}`,cursor:"pointer",background:filterStatus===key?cfg.bg:"var(--card)"}} onClick={()=>setFilter(filterStatus===key?"all":key)}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <cfg.Icon size={16} color={cfg.color}/>
                <span style={{fontWeight:700,color:cfg.color,fontSize:13}}>{cfg.label}</span>
              </div>
              <div style={{fontSize:22,fontWeight:800}}>{FMT(total)}</div>
              <div style={{color:"var(--muted)",fontSize:13,marginTop:4}}>{list.length} invoice</div>
            </div>
          );
        })}
        <div className="card" style={{borderLeft:"4px solid var(--navy)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <FileText size={16} color="var(--navy)"/>
            <span style={{fontWeight:700,color:"var(--navy)",fontSize:13}}>Total Piutang</span>
          </div>
          <div style={{fontSize:22,fontWeight:800}}>{FMT(grandTotal)}</div>
          <div style={{color:"var(--muted)",fontSize:13,marginTop:4}}>{invoices.length} invoice total</div>
        </div>
      </section>

      {/* Charts */}
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-title"><h2>Distribusi Piutang</h2></div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Tooltip formatter={v=>`Rp ${v.toFixed(0)} jt`}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title"><h2>Piutang per Sales</h2></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="s" tick={{fontSize:12}}/>
              <Tooltip formatter={v=>`Rp ${v.toFixed(0)} jt`}/>
              <Bar dataKey="normal"   name="Normal"   stackId="a" fill="#16a34a" radius={[0,0,0,0]}/>
              <Bar dataKey="overdue"  name="Overdue"  stackId="a" fill="#f97316"/>
              <Bar dataKey="priority" name="Priority" stackId="a" fill="#dc2626" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:16,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div className="search-bar" style={{minWidth:240}}>
            <Search size={16} style={{color:"var(--muted)",flexShrink:0}}/>
            <input placeholder="Cari invoice, toko, sales..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["all","normal","overdue","priority"].map(s=>(
              <button key={s} className={`pill-btn small${filterStatus===s?" active":""}`} onClick={()=>setFilter(s)}>
                {s==="all"?"Semua":STATUS_CONFIG[s]?.label.split(" ")[0]||s}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["all",...salesList].map(s=>(
              <button key={s} className={`pill-btn small${filterSales===s?" active":""}`} onClick={()=>setFilterS(s)}>
                {s==="all"?"Semua Sales":s.split(" ")[0]}
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
                {["No Invoice","Toko/Perusahaan","Sales","Area","Nominal","Tgl Invoice","Jatuh Tempo","Hari","Status","Aksi"].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={10} style={{textAlign:"center",padding:32,color:"var(--muted)"}}>Tidak ada data</td></tr>}
              {filtered.map(inv=>{
                const cfg = STATUS_CONFIG[inv.status];
                return (
                  <tr key={inv.id} style={{background:inv.status==="priority"?"rgba(220,38,38,0.06)":inv.status==="overdue"?"rgba(249,115,22,0.04)":"transparent"}}>
                    <td><span className="badge badge-blue">{inv.id}</span></td>
                    <td><strong>{inv.toko}</strong></td>
                    <td>{inv.sales}</td>
                    <td><span className="badge badge-blue">{inv.area}</span></td>
                    <td><strong>{FMT(inv.nominal)}</strong></td>
                    <td>{inv.tglInvoice}</td>
                    <td>{inv.tglJatuhTempo}</td>
                    <td style={{fontWeight:700,color:cfg.color}}>{inv.hari} hr</td>
                    <td>
                      <span style={{background:cfg.color,color:"#fff",borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
                        {inv.status==="priority"?"⚠️ Priority":inv.status==="overdue"?"Overdue":"Normal"}
                      </span>
                    </td>
                    <td>
                      <button className="icon-btn" onClick={()=>setDetail(inv)} title="Detail"><Eye size={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:12,display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--muted)"}}>
          <span>Menampilkan {filtered.length} dari {invoices.length} invoice</span>
          <strong>Total: {FMT(filtered.reduce((a,x)=>a+x.nominal,0))}</strong>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={()=>setDetail(null)}>
          <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Invoice</h3>
              <button className="icon-btn" onClick={()=>setDetail(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              {(() => {
                const cfg = STATUS_CONFIG[detail.status];
                return (
                  <>
                    <div style={{background:cfg.bg,border:`1px solid ${cfg.color}`,borderRadius:12,padding:16,marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                      <cfg.Icon size={22} color={cfg.color}/>
                      <div>
                        <div style={{fontWeight:700,color:cfg.color}}>{cfg.label}</div>
                        <div style={{fontSize:13,color:"var(--muted)"}}>{detail.hari} hari sejak jatuh tempo</div>
                      </div>
                    </div>
                    {[
                      ["No Invoice",    detail.id],
                      ["Toko",          detail.toko],
                      ["Sales",         detail.sales],
                      ["Area",          detail.area],
                      ["Nominal",       FMT(detail.nominal)],
                      ["Tgl Invoice",   detail.tglInvoice],
                      ["Jatuh Tempo",   detail.tglJatuhTempo],
                      ["Keterangan",    detail.keterangan],
                    ].map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--line)"}}>
                        <span style={{color:"var(--muted)"}}>{l}</span>
                        <strong style={{textAlign:"right",maxWidth:280}}>{v}</strong>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={()=>setDetail(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
