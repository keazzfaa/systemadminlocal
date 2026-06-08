import React, { useState } from "react";
import { Search, Download, MapPin, Clock, CheckCircle, X, Eye, Calendar, User } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const SEED = [
  { id:1,  tanggal:"2025-01-13", sales:"Sari Dewi",    outlet:"Toko Maju Sejahtera",  area:"Jakarta",  waktuIn:"08:15", waktuOut:"10:30", durasi:"2j 15m", lat:-6.2088, lng:106.8456, tagged:true,  catatan:"Presentasi produk baru" },
  { id:2,  tanggal:"2025-01-13", sales:"Sari Dewi",    outlet:"CV. Maju Terus",        area:"Jakarta",  waktuIn:"11:00", waktuOut:"13:00", durasi:"2j 00m", lat:-6.2297, lng:106.8295, tagged:true,  catatan:"Negosiasi order bulanan" },
  { id:3,  tanggal:"2025-01-13", sales:"Sari Dewi",    outlet:"UD. Karya Nyata",       area:"Jakarta",  waktuIn:"14:00", waktuOut:"15:45", durasi:"1j 45m", lat:-6.1944, lng:106.8229, tagged:true,  catatan:"Penagihan invoice" },
  { id:4,  tanggal:"2025-01-13", sales:"Budi Santoso", outlet:"CV. Berkah Mandiri",    area:"Bandung",  waktuIn:"09:00", waktuOut:"11:30", durasi:"2j 30m", lat:-6.9175, lng:107.6191, tagged:true,  catatan:"Demo produk" },
  { id:5,  tanggal:"2025-01-13", sales:"Budi Santoso", outlet:"PT. Sentosa Abadi",     area:"Bandung",  waktuIn:"13:00", waktuOut:"14:30", durasi:"1j 30m", lat:-6.9218, lng:107.6074, tagged:true,  catatan:"Follow-up piutang" },
  { id:6,  tanggal:"2025-01-13", sales:"Eka Permana",  outlet:"UD. Sumber Rezeki",     area:"Surabaya", waktuIn:"08:30", waktuOut:"10:00", durasi:"1j 30m", lat:-7.2575, lng:112.7521, tagged:true,  catatan:"Ambil PO" },
  { id:7,  tanggal:"2025-01-12", sales:"Sari Dewi",    outlet:"Toko Harapan Baru",     area:"Jakarta",  waktuIn:"09:00", waktuOut:"10:00", durasi:"1j 00m", lat:null,    lng:null,     tagged:false, catatan:"GPS off" },
  { id:8,  tanggal:"2025-01-12", sales:"Budi Santoso", outlet:"CV. Makmur Jaya",       area:"Bandung",  waktuIn:"10:00", waktuOut:"12:00", durasi:"2j 00m", lat:-6.9300, lng:107.6100, tagged:true,  catatan:"Order baru" },
  { id:9,  tanggal:"2025-01-12", sales:"Eka Permana",  outlet:"UD. Prima Jaya",        area:"Surabaya", waktuIn:"13:30", waktuOut:"15:00", durasi:"1j 30m", lat:null,    lng:null,     tagged:false, catatan:"Tagihan priority" },
  { id:10, tanggal:"2025-01-11", sales:"Sari Dewi",    outlet:"Toko Maju Sejahtera",  area:"Jakarta",  waktuIn:"08:00", waktuOut:"09:30", durasi:"1j 30m", lat:-6.2088, lng:106.8456, tagged:true,  catatan:"Cek stok outlet" },
];

const SALES_LIST = ["Sari Dewi","Budi Santoso","Eka Permana"];

export default function AbsensiOutlet() {
  const { session, addLog } = useApp();
  const [data]              = useState(SEED);
  const [search, setSearch] = useState("");
  const [filterSales, setFilterS] = useState("all");
  const [filterTag,   setFilterT] = useState("all");
  const [filterDate,  setFilterD] = useState("");
  const [detail, setDetail]       = useState(null);

  const filtered = data.filter(x => {
    const q  = search.toLowerCase();
    const mQ = x.outlet.toLowerCase().includes(q) || x.sales.toLowerCase().includes(q) || x.area.toLowerCase().includes(q);
    const mS = filterSales === "all" || x.sales === filterSales;
    const mT = filterTag   === "all" || (filterTag === "tagged" ? x.tagged : !x.tagged);
    const mD = !filterDate  || x.tanggal === filterDate;
    return mQ && mS && mT && mD;
  });

  const doExport = () => {
    exportToExcel(filtered,"Absensi_Outlet",["tanggal","sales","outlet","area","waktuIn","waktuOut","durasi","tagged","catatan"]);
    addLog("Export Excel","Absensi Outlet diekspor","export");
  };

  // Stats
  const totalTagged    = filtered.filter(x=>x.tagged).length;
  const totalNotTagged = filtered.filter(x=>!x.tagged).length;
  const uniqueDays     = [...new Set(filtered.map(x=>x.tanggal))].length;
  const uniqueOutlets  = [...new Set(filtered.map(x=>x.outlet))].length;

  // Chart per sales per hari
  const dates = [...new Set(data.map(x=>x.tanggal))].sort().slice(-5);
  const chartData = dates.map(d=>({
    d: d.slice(5),
    ...Object.fromEntries(SALES_LIST.map(s=>[s.split(" ")[0], data.filter(x=>x.tanggal===d&&x.sales===s).length]))
  }));

  const COLORS = ["var(--navy)","var(--orange)","var(--green)"];

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Absensi & Tag Lokasi Outlet</h1>
          <p>Monitoring kunjungan sales ke setiap outlet beserta verifikasi GPS</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export</button>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-row">
        {[
          ["Total Kunjungan", filtered.length],
          ["GPS Tagged ✓",    totalTagged],
          ["Tidak Tagged ✗",  totalNotTagged],
          ["Hari Aktif",      uniqueDays+" hari"],
          ["Outlet Dikunjungi", uniqueOutlets+" outlet"],
        ].map(([l,v])=>(
          <div className="card stat-card" key={l}>
            <h3>{l}</h3>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title">
          <h2>Kunjungan per Sales (5 Hari Terakhir)</h2>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="d"/>
            <Tooltip/>
            {SALES_LIST.map((s,i)=>(
              <Bar key={s} dataKey={s.split(" ")[0]} name={s} fill={COLORS[i]} radius={[4,4,0,0]}/>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:16,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <div className="search-bar" style={{minWidth:220}}>
            <Search size={16} style={{color:"var(--muted)",flexShrink:0}}/>
            <input placeholder="Cari outlet, sales, area..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <input type="date" value={filterDate} onChange={e=>setFilterD(e.target.value)}
            style={{padding:"8px 12px",borderRadius:10,border:"1px solid var(--line)",background:"var(--bg)",color:"var(--text)",fontSize:14}}/>
          <div style={{display:"flex",gap:6}}>
            {["all",...SALES_LIST].map(s=>(
              <button key={s} className={`pill-btn small${filterSales===s?" active":""}`} onClick={()=>setFilterS(s)}>
                {s==="all"?"Semua Sales":s.split(" ")[0]}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            {[["all","Semua"],["tagged","✓ Tagged"],["untagged","✗ No Tag"]].map(([k,l])=>(
              <button key={k} className={`pill-btn small${filterTag===k?" active":""}`} onClick={()=>setFilterT(k)}>{l}</button>
            ))}
          </div>
          {(filterDate||filterSales!=="all"||filterTag!=="all"||search) && (
            <button className="pill-btn small" onClick={()=>{setSearch("");setFilterS("all");setFilterT("all");setFilterD("");}}>
              <X size={12}/> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        <div style={{overflowX:"auto"}}>
          <table>
            <thead>
              <tr>
                {["Tanggal","Sales","Outlet","Area","Check In","Check Out","Durasi","GPS Tag","Catatan","Aksi"].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&(
                <tr><td colSpan={10} style={{textAlign:"center",padding:32,color:"var(--muted)"}}>Tidak ada data</td></tr>
              )}
              {filtered.map(row=>(
                <tr key={row.id} style={{background:!row.tagged?"rgba(220,38,38,0.04)":"transparent"}}>
                  <td>{row.tanggal}</td>
                  <td><strong>{row.sales}</strong></td>
                  <td>{row.outlet}</td>
                  <td><span className="badge badge-blue">{row.area}</span></td>
                  <td style={{color:"var(--green)",fontWeight:700}}>{row.waktuIn}</td>
                  <td style={{color:"var(--orange)",fontWeight:700}}>{row.waktuOut}</td>
                  <td>{row.durasi}</td>
                  <td>
                    {row.tagged
                      ? <span style={{background:"var(--green)",color:"#fff",borderRadius:999,padding:"3px 10px",fontSize:12,fontWeight:700}}>✓ Tagged</span>
                      : <span style={{background:"var(--red)",color:"#fff",borderRadius:999,padding:"3px 10px",fontSize:12,fontWeight:700}}>✗ No Tag</span>}
                  </td>
                  <td style={{maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.catatan}</td>
                  <td>
                    <button className="icon-btn" onClick={()=>setDetail(row)} title="Detail"><Eye size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:10,fontSize:13,color:"var(--muted)"}}>Menampilkan {filtered.length} dari {data.length} kunjungan</div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={()=>setDetail(null)}>
          <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Kunjungan</h3>
              <button className="icon-btn" onClick={()=>setDetail(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div style={{background:detail.tagged?"rgba(22,163,74,0.08)":"rgba(220,38,38,0.08)",border:`1px solid ${detail.tagged?"var(--green)":"var(--red)"}`,borderRadius:12,padding:14,marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                <MapPin size={20} color={detail.tagged?"var(--green)":"var(--red)"}/>
                <div>
                  <div style={{fontWeight:700,color:detail.tagged?"var(--green)":"var(--red)"}}>
                    {detail.tagged?"GPS Terverifikasi":"GPS Tidak Terdeteksi"}
                  </div>
                  {detail.tagged && detail.lat && (
                    <div style={{fontSize:12,color:"var(--muted)"}}>
                      {detail.lat.toFixed(4)}, {detail.lng.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
              {[
                ["Tanggal",   detail.tanggal],
                ["Sales",     detail.sales],
                ["Outlet",    detail.outlet],
                ["Area",      detail.area],
                ["Check In",  detail.waktuIn],
                ["Check Out", detail.waktuOut],
                ["Durasi",    detail.durasi],
                ["Catatan",   detail.catatan],
              ].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--line)"}}>
                  <span style={{color:"var(--muted)"}}>{l}</span>
                  <strong>{v}</strong>
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
