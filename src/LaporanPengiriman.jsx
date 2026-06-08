import React, { useState } from "react";
import { Search, Download, Eye, X, Truck, CheckCircle, Clock, Package, MapPin } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const SEED = [
  { id:"DEL-001", tanggal:"2025-01-13", tujuan:"PT. Nusantara Digital",    area:"Jakarta",  produk:"Edge Compute Unit v2 x30",     driver:"Agus Santoso",  noKendaraan:"B 1234 CDE", sales:"Sari Dewi",    estimasi:"08:30-11:00", actual:"10:45", status:"Terkirim",          keterangan:"Tanda terima OK" },
  { id:"DEL-002", tanggal:"2025-01-13", tujuan:"CV. Berkah Jaya",           area:"Bandung",  produk:"Neural Interface Bridge x15",  driver:"Doni Wahyu",    noKendaraan:"D 5678 FGH", sales:"Budi Santoso", estimasi:"10:00-14:00", actual:"-",     status:"Dalam Perjalanan",  keterangan:"" },
  { id:"DEL-003", tanggal:"2025-01-13", tujuan:"PT. Mitra Solusi",          area:"Surabaya", produk:"Solid State Array 12TB x80",   driver:"Rudi Maulana",  noKendaraan:"L 9012 IJK", sales:"Eka Permana",  estimasi:"13:00-17:00", actual:"-",     status:"Proses",            keterangan:"Sedang dipacking" },
  { id:"DEL-004", tanggal:"2025-01-14", tujuan:"UD. Karya Mandiri",         area:"Jakarta",  produk:"Quantum Processor X1 x5",      driver:"Teguh Prasetyo",noKendaraan:"B 3456 LMN", sales:"Sari Dewi",    estimasi:"09:00-12:00", actual:"-",     status:"Jadwal",            keterangan:"Besok pagi" },
  { id:"DEL-005", tanggal:"2025-01-12", tujuan:"Toko Maju Sejahtera",       area:"Jakarta",  produk:"Fiber Module 5G x20",           driver:"Agus Santoso",  noKendaraan:"B 1234 CDE", sales:"Sari Dewi",    estimasi:"09:00-11:00", actual:"10:30", status:"Terkirim",          keterangan:"" },
  { id:"DEL-006", tanggal:"2025-01-12", tujuan:"CV. Makmur Jaya",           area:"Bandung",  produk:"RAM Server 64GB DDR5 x10",     driver:"Doni Wahyu",    noKendaraan:"D 5678 FGH", sales:"Budi Santoso", estimasi:"13:00-16:00", actual:"15:15", status:"Terkirim",          keterangan:"" },
  { id:"DEL-007", tanggal:"2025-01-12", tujuan:"UD. Sumber Rezeki",         area:"Surabaya", produk:"Power Backup UPS 2000VA x6",   driver:"Rudi Maulana",  noKendaraan:"L 9012 IJK", sales:"Eka Permana",  estimasi:"10:00-14:00", actual:"-",     status:"Gagal – Tujuan Tutup", keterangan:"Coba ulang besok" },
  { id:"DEL-008", tanggal:"2025-01-11", tujuan:"PT. Sentosa Abadi",         area:"Medan",    produk:"Kabel CAT8 100m x15",          driver:"Fahri Anwar",   noKendaraan:"BK 7890 OPQ",sales:"Budi Santoso", estimasi:"08:00-12:00", actual:"11:45", status:"Terkirim",          keterangan:"" },
];

const STATUS_COLOR = {
  "Terkirim":            "var(--green)",
  "Dalam Perjalanan":    "var(--navy)",
  "Proses":              "var(--orange)",
  "Jadwal":              "var(--muted)",
  "Gagal – Tujuan Tutup":"var(--red)",
};

const SALES_LIST = ["Sari Dewi","Budi Santoso","Eka Permana"];

export default function LaporanPengiriman() {
  const { session, addLog } = useApp();
  const [data]              = useState(SEED);
  const [search, setSearch] = useState("");
  const [filterStatus, setFS] = useState("all");
  const [filterSales, setFSl] = useState("all");
  const [filterDate, setFD]   = useState("");
  const [detail, setDetail]   = useState(null);

  const filtered = data.filter(x=>{
    const q = search.toLowerCase();
    const mQ = x.tujuan.toLowerCase().includes(q)||x.id.toLowerCase().includes(q)||x.driver.toLowerCase().includes(q)||x.produk.toLowerCase().includes(q);
    const mS = filterStatus==="all"||x.status===filterStatus;
    const mSl = filterSales==="all"||x.sales===filterSales;
    const mD = !filterDate||x.tanggal===filterDate;
    return mQ&&mS&&mSl&&mD;
  });

  const statuses = [...new Set(data.map(x=>x.status))];
  const summary  = statuses.map(s=>({s,n:data.filter(x=>x.status===s).length}));

  // Chart
  const dates = [...new Set(data.map(x=>x.tanggal))].sort().slice(-5);
  const chartData = dates.map(d=>({
    d:d.slice(5),
    Terkirim: data.filter(x=>x.tanggal===d&&x.status==="Terkirim").length,
    Proses:   data.filter(x=>x.tanggal===d&&x.status==="Proses").length,
    Lainnya:  data.filter(x=>x.tanggal===d&&!["Terkirim","Proses"].includes(x.status)).length,
  }));

  const doExport = () => {
    exportToExcel(filtered,"Laporan_Pengiriman",["id","tanggal","tujuan","area","produk","driver","noKendaraan","sales","estimasi","actual","status","keterangan"]);
    addLog("Export Excel","Laporan Pengiriman diekspor","export");
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Laporan Pengiriman</h1>
          <p>Monitoring status pengiriman ke semua outlet dan customer</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export</button>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="summary-row">
        {[
          ["Total Pengiriman", data.length],
          ["Terkirim ✓",       data.filter(x=>x.status==="Terkirim").length],
          ["Dalam Perjalanan", data.filter(x=>x.status==="Dalam Perjalanan").length],
          ["Proses / Jadwal",  data.filter(x=>["Proses","Jadwal"].includes(x.status)).length],
          ["Gagal ✗",          data.filter(x=>x.status.startsWith("Gagal")).length],
        ].map(([l,v])=>(
          <div className="card stat-card" key={l}>
            <h3>{l}</h3>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title"><h2>Pengiriman per Hari</h2></div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <XAxis dataKey="d"/>
            <Tooltip/>
            <Bar dataKey="Terkirim" fill="var(--green)"  radius={[4,4,0,0]}/>
            <Bar dataKey="Proses"   fill="var(--orange)" radius={[4,4,0,0]}/>
            <Bar dataKey="Lainnya"  fill="var(--muted)"  radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:16,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div className="search-bar" style={{minWidth:220}}>
            <Search size={16} style={{color:"var(--muted)",flexShrink:0}}/>
            <input placeholder="Cari tujuan, driver, ID..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <input type="date" value={filterDate} onChange={e=>setFD(e.target.value)}
            style={{padding:"8px 12px",borderRadius:10,border:"1px solid var(--line)",background:"var(--bg)",color:"var(--text)",fontSize:14}}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["all",...statuses].map(s=>(
              <button key={s} className={`pill-btn small${filterStatus===s?" active":""}`} onClick={()=>setFS(s)}>
                {s==="all"?"Semua Status":s}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            {["all",...SALES_LIST].map(s=>(
              <button key={s} className={`pill-btn small${filterSales===s?" active":""}`} onClick={()=>setFSl(s)}>
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
                {["ID","Tanggal","Tujuan","Area","Produk","Driver","Kendaraan","Sales","Estimasi","Actual","Status","Aksi"].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={12} style={{textAlign:"center",padding:32,color:"var(--muted)"}}>Tidak ada data</td></tr>}
              {filtered.map(x=>{
                const clr = STATUS_COLOR[x.status]||"var(--muted)";
                const failed = x.status.startsWith("Gagal");
                return (
                  <tr key={x.id} style={{background:failed?"rgba(220,38,38,0.05)":"transparent"}}>
                    <td><span className="badge badge-blue">{x.id}</span></td>
                    <td>{x.tanggal}</td>
                    <td><strong>{x.tujuan}</strong></td>
                    <td><span className="badge badge-blue">{x.area}</span></td>
                    <td style={{maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{x.produk}</td>
                    <td>{x.driver}</td>
                    <td style={{fontSize:12,color:"var(--muted)"}}>{x.noKendaraan}</td>
                    <td>{x.sales}</td>
                    <td style={{fontSize:12}}>{x.estimasi}</td>
                    <td style={{fontWeight:x.actual!=="-"?700:400,color:x.actual!=="-"?"var(--green)":"var(--muted)"}}>{x.actual}</td>
                    <td>
                      <span style={{background:clr,color:"#fff",borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{x.status}</span>
                    </td>
                    <td>
                      <button className="icon-btn" onClick={()=>setDetail(x)} title="Detail"><Eye size={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:10,fontSize:13,color:"var(--muted)"}}>Menampilkan {filtered.length} dari {data.length} pengiriman</div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={()=>setDetail(null)}>
          <div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Pengiriman – {detail.id}</h3>
              <button className="icon-btn" onClick={()=>setDetail(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div style={{background:STATUS_COLOR[detail.status]+"22",border:`1px solid ${STATUS_COLOR[detail.status]}`,borderRadius:12,padding:14,marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                <Truck size={20} color={STATUS_COLOR[detail.status]}/>
                <div style={{fontWeight:700,color:STATUS_COLOR[detail.status]}}>{detail.status}</div>
              </div>
              {[
                ["ID Pengiriman",detail.id],
                ["Tanggal",      detail.tanggal],
                ["Tujuan",       detail.tujuan],
                ["Area",         detail.area],
                ["Produk",       detail.produk],
                ["Driver",       detail.driver],
                ["No. Kendaraan",detail.noKendaraan],
                ["Sales",        detail.sales],
                ["Estimasi",     detail.estimasi],
                ["Tiba Aktual",  detail.actual],
                ["Keterangan",   detail.keterangan||"-"],
              ].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--line)"}}>
                  <span style={{color:"var(--muted)"}}>{l}</span>
                  <strong style={{textAlign:"right",maxWidth:280}}>{v}</strong>
                </div>
              ))}
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
