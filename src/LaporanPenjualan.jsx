import React, { useState } from "react";
import { Search, Download, TrendingUp, Users, ShoppingCart, Target } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");

const SEED_TRANSAKSI = [
  { id:"TRX-001", tanggal:"2025-01-13", sales:"Sari Dewi",    area:"Jakarta",  outlet:"Toko Maju Sejahtera", produk:"Edge Compute Unit v2",       qty:5,  harga:6500000,  total:32500000  },
  { id:"TRX-002", tanggal:"2025-01-13", sales:"Sari Dewi",    area:"Jakarta",  outlet:"CV. Maju Terus",       produk:"Solid State Array 12TB",      qty:12, harga:2500000,  total:30000000  },
  { id:"TRX-003", tanggal:"2025-01-13", sales:"Budi Santoso", area:"Bandung",  outlet:"CV. Berkah Mandiri",   produk:"Neural Interface Bridge",     qty:8,  harga:3200000,  total:25600000  },
  { id:"TRX-004", tanggal:"2025-01-13", sales:"Eka Permana",  area:"Surabaya", outlet:"UD. Sumber Rezeki",    produk:"Fiber Module 5G Compatible",  qty:20, harga:450000,   total:9000000   },
  { id:"TRX-005", tanggal:"2025-01-12", sales:"Sari Dewi",    area:"Jakarta",  outlet:"UD. Karya Nyata",      produk:"Neural Interface Bridge",     qty:3,  harga:3200000,  total:9600000   },
  { id:"TRX-006", tanggal:"2025-01-12", sales:"Budi Santoso", area:"Bandung",  outlet:"PT. Sentosa Abadi",    produk:"Power Backup UPS 2000VA",     qty:4,  harga:1800000,  total:7200000   },
  { id:"TRX-007", tanggal:"2025-01-11", sales:"Eka Permana",  area:"Surabaya", outlet:"UD. Prima Jaya",       produk:"RAM Server 64GB DDR5",        qty:2,  harga:4200000,  total:8400000   },
  { id:"TRX-008", tanggal:"2025-01-11", sales:"Sari Dewi",    area:"Jakarta",  outlet:"Toko Maju Sejahtera", produk:"Quantum Processor X1",        qty:1,  harga:18000000, total:18000000  },
  { id:"TRX-009", tanggal:"2025-01-10", sales:"Budi Santoso", area:"Bandung",  outlet:"CV. Berkah Mandiri",   produk:"Kabel CAT8 100m",             qty:10, harga:320000,   total:3200000   },
  { id:"TRX-010", tanggal:"2025-01-10", sales:"Eka Permana",  area:"Surabaya", outlet:"UD. Sumber Rezeki",    produk:"Edge Compute Unit v2",        qty:3,  harga:6500000,  total:19500000  },
];

const SALES_TARGET = [
  { sales:"Sari Dewi",    area:"Jakarta",  target:500000000, realisasi:412000000 },
  { sales:"Budi Santoso", area:"Bandung",  target:450000000, realisasi:387500000 },
  { sales:"Eka Permana",  area:"Surabaya", target:400000000, realisasi:310000000 },
];

const TREND_DATA = [
  {bulan:"Agu",nilai:280},{bulan:"Sep",nilai:310},{bulan:"Okt",nilai:295},
  {bulan:"Nov",nilai:370},{bulan:"Des",nilai:425},{bulan:"Jan",nilai:412},
];

const SALES_LIST = ["Sari Dewi","Budi Santoso","Eka Permana"];
const PIE_COLORS = ["var(--navy)","var(--orange)","var(--green)"];

export default function LaporanPenjualan() {
  const { session, addLog } = useApp();
  const [transaksi]         = useState(SEED_TRANSAKSI);
  const [search, setSearch] = useState("");
  const [filterSales, setFS] = useState("all");
  const [filterArea, setFA]  = useState("all");
  const [filterDate, setFD]  = useState("");
  const [activeView, setView] = useState("transaksi");

  const filtered = transaksi.filter(x=>{
    const q = search.toLowerCase();
    const mQ = x.outlet.toLowerCase().includes(q)||x.produk.toLowerCase().includes(q)||x.sales.toLowerCase().includes(q)||x.id.toLowerCase().includes(q);
    const mS = filterSales==="all"||x.sales===filterSales;
    const mA = filterArea==="all"||x.area===filterArea;
    const mD = !filterDate||x.tanggal===filterDate;
    return mQ&&mS&&mA&&mD;
  });

  const totalPenjualan = filtered.reduce((a,x)=>a+x.total,0);
  const totalQty       = filtered.reduce((a,x)=>a+x.qty,0);
  const areas = [...new Set(transaksi.map(x=>x.area))];

  // Pie per sales
  const pieData = SALES_LIST.map(s=>({
    name:s.split(" ")[0],
    value: transaksi.filter(x=>x.sales===s).reduce((a,x)=>a+x.total,0)/1000000
  }));

  // Bar per hari
  const dates = [...new Set(transaksi.map(x=>x.tanggal))].sort().slice(-5);
  const barData = dates.map(d=>({
    d:d.slice(5),
    ...Object.fromEntries(SALES_LIST.map(s=>[s.split(" ")[0], transaksi.filter(x=>x.tanggal===d&&x.sales===s).reduce((a,x)=>a+x.total,0)/1000000]))
  }));

  const doExport = () => {
    exportToExcel(filtered,"Laporan_Penjualan",["id","tanggal","sales","area","outlet","produk","qty","harga","total"]);
    addLog("Export Excel","Laporan Penjualan diekspor","export");
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Laporan Penjualan Sales</h1>
          <p>Monitoring transaksi, target, dan performa salesman</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExport}><Download size={16}/>Export</button>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-row">
        {[
          ["Total Penjualan",  FMT(totalPenjualan)],
          ["Total Transaksi",  filtered.length+" transaksi"],
          ["Total Qty",        totalQty+" unit"],
          ["Sales Aktif",      SALES_LIST.length+" orang"],
        ].map(([l,v])=>(
          <div className="card stat-card" key={l}>
            <h3>{l}</h3>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-title"><h2>Penjualan per Sales (jt Rp)</h2></div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Tooltip formatter={v=>`Rp ${Number(v).toFixed(0)} jt`}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title"><h2>Trend Penjualan Bulanan (jt)</h2></div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_DATA}>
              <XAxis dataKey="bulan"/>
              <Tooltip formatter={v=>`Rp ${v} jt`}/>
              <Line type="monotone" dataKey="nilai" strokeWidth={3} stroke="var(--navy)" dot={{r:5}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tab View */}
      <div className="card" style={{marginBottom:16,padding:"16px 20px"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {[["transaksi","Detail Transaksi"],["target","Target vs Realisasi"],["harian","Penjualan Harian"]].map(([k,l])=>(
            <button key={k} className={`pill-btn${activeView===k?" active":""}`} onClick={()=>setView(k)}>{l}</button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:10,flexWrap:"wrap"}}>
            <div className="search-bar" style={{minWidth:200}}>
              <Search size={16} style={{color:"var(--muted)",flexShrink:0}}/>
              <input placeholder="Cari..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <input type="date" value={filterDate} onChange={e=>setFD(e.target.value)}
              style={{padding:"8px 12px",borderRadius:10,border:"1px solid var(--line)",background:"var(--bg)",color:"var(--text)",fontSize:14}}/>
            <div style={{display:"flex",gap:6}}>
              {["all",...SALES_LIST].map(s=>(
                <button key={s} className={`pill-btn small${filterSales===s?" active":""}`} onClick={()=>setFS(s)}>
                  {s==="all"?"Semua":s.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE: Transaksi */}
      {activeView==="transaksi" && (
        <div className="card table-card">
          <div style={{overflowX:"auto"}}>
            <table>
              <thead>
                <tr>
                  {["ID","Tanggal","Sales","Area","Outlet","Produk","Qty","Harga","Total"].map(h=><th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:32,color:"var(--muted)"}}>Tidak ada data</td></tr>}
                {filtered.map(x=>(
                  <tr key={x.id}>
                    <td><span className="badge badge-blue">{x.id}</span></td>
                    <td>{x.tanggal}</td>
                    <td><strong>{x.sales}</strong></td>
                    <td><span className="badge badge-blue">{x.area}</span></td>
                    <td>{x.outlet}</td>
                    <td>{x.produk}</td>
                    <td style={{fontWeight:700}}>{x.qty} unit</td>
                    <td>{FMT(x.harga)}</td>
                    <td><strong style={{color:"var(--navy)"}}>{FMT(x.total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:10,display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--muted)"}}>
            <span>Menampilkan {filtered.length} transaksi</span>
            <strong>Total: {FMT(totalPenjualan)}</strong>
          </div>
        </div>
      )}

      {/* TABLE: Target vs Realisasi */}
      {activeView==="target" && (
        <div className="card">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
            {SALES_TARGET.map(s=>{
              const pct = Math.round(s.realisasi/s.target*100);
              const color = pct>=80?"var(--green)":pct>=60?"var(--orange)":"var(--red)";
              return (
                <div key={s.sales} style={{background:"var(--bg)",borderRadius:16,padding:20,border:"1px solid var(--line)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:16}}>{s.sales}</div>
                      <div style={{fontSize:13,color:"var(--muted)"}}>{s.area}</div>
                    </div>
                    <div style={{background:color,color:"#fff",borderRadius:999,padding:"6px 14px",fontWeight:800,fontSize:18,height:"fit-content"}}>
                      {pct}%
                    </div>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                      <span style={{color:"var(--muted)"}}>Realisasi</span>
                      <strong>{FMT(s.realisasi)}</strong>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                      <span style={{color:"var(--muted)"}}>Target</span>
                      <span>{FMT(s.target)}</span>
                    </div>
                  </div>
                  <div style={{background:"var(--line)",borderRadius:999,height:10,overflow:"hidden"}}>
                    <div style={{background:color,borderRadius:999,height:10,width:pct+"%",transition:"width .6s"}}/>
                  </div>
                  <div style={{fontSize:12,color:"var(--muted)",marginTop:6}}>
                    Sisa: {FMT(s.target-s.realisasi)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TABLE: Penjualan Harian per Sales */}
      {activeView==="harian" && (
        <div className="card">
          <div className="card-title"><h2>Penjualan Harian per Sales (juta Rp)</h2></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="d"/>
              <YAxis/>
              <Tooltip formatter={v=>`Rp ${Number(v).toFixed(0)} jt`}/>
              <Legend/>
              {SALES_LIST.map((s,i)=>(
                <Bar key={s} dataKey={s.split(" ")[0]} name={s} fill={PIE_COLORS[i]} radius={[4,4,0,0]}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
