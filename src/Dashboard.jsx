import React, { useState } from "react";
import {
  DollarSign, Wallet, CreditCard, TrendingUp, Package, Users, ArrowUpRight,
  Store, FileText, MapPin, Truck, AlertTriangle, Clock, CheckCircle,
  BarChart3, Activity, Calendar, RefreshCw, ShoppingCart
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useApp } from "./context.jsx";
import { useNavigate } from "react-router-dom";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");
const FMT_SHORT = v => { if(v>=1000000000) return "Rp "+(v/1000000000).toFixed(1)+"M"; if(v>=1000000) return "Rp "+(v/1000000).toFixed(0)+"Jt"; return "Rp "+v.toLocaleString("id-ID"); };

// ─── OWNER DASHBOARD ──────────────────────────────────────────────────────────
function OwnerDashboard() {
  const { itemsIn, itemsOut, cashflow, customers, suppliers, outlets, invoices, auditLog, users, absensi } = useApp();
  const nav = useNavigate();

  const totalPenjualan = itemsOut.reduce((s,x)=>s+x.total,0);
  const totalMasuk  = cashflow.filter(x=>x.jenis==="masuk").reduce((s,x)=>s+x.jumlah,0);
  const totalKeluar = cashflow.filter(x=>x.jenis==="keluar").reduce((s,x)=>s+x.jumlah,0);
  const netProfit   = totalMasuk - totalKeluar;

  const invoiceNormal   = invoices.filter(x=>x.status==="normal");
  const invoiceOverdue  = invoices.filter(x=>x.status==="overdue");
  const invoicePriority = invoices.filter(x=>x.status==="priority");
  const totalPiutang    = invoices.reduce((s,x)=>s+x.sisa,0);

  const stockGudang = [
    { nama:"Edge Compute Unit v2", stok:20, satuan:"unit" },
    { nama:"Neural Interface Bridge", stok:5, satuan:"unit" },
    { nama:"Solid State Array 12TB", stok:20, satuan:"unit" },
    { nama:"Quantum Processor X1", stok:5, satuan:"unit" },
  ];

  const barData = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d,i)=>({
    d, masuk:[42,66,52,92,72,58,82][i]*1000000, keluar:[22,30,28,45,35,20,30][i]*1000000
  }));

  const salesPerf = [
    { name:"Sari Dewi",  penjualan:243000000, target:200000000 },
    { name:"Andi Kurnia",penjualan:180000000, target:200000000 },
    { name:"Dina Putri", penjualan:153000000, target:200000000 },
  ];

  return (
    <>
      {/* KPI Row 1 */}
      <section className="stat-grid">
        {[
          ["Total Penjualan",  FMT_SHORT(totalPenjualan), "+12.4%", TrendingUp, "green", "/barang-keluar"],
          ["Cash Masuk",       FMT_SHORT(totalMasuk),     "+8.2%",  Wallet,     "green", "/cashflow"],
          ["Cash Keluar",      FMT_SHORT(totalKeluar),    "-2.4%",  CreditCard, "red",   "/cashflow"],
          ["Net Profit",       FMT_SHORT(netProfit),      "+18.1%", DollarSign, "green", "/cashflow"],
          ["Total Supplier",   suppliers.length+" mitra", "Aktif",  Package,    "blue",  "/supplier"],
          ["Total Customer",   customers.length+" klien", "Aktif",  Users,      "blue",  "/customer"],
        ].map(([t,v,b,I,color,link])=>(
          <div className="card stat-card" key={t} onClick={()=>nav(link)} style={{cursor:"pointer"}}>
            <div className="stat-top">
              <span className="icon-badge"><I size={20}/></span>
              <span className={`badge badge-${color}`}>{b}</span>
            </div>
            <h3>{t}</h3>
            <strong>{v}</strong>
          </div>
        ))}
      </section>

      {/* Register Outlet & Piutang Summary */}
      <section
  className="stat-grid stat-grid-piutang"   
          style={{ marginBottom:20 }}
          >
        <div className="card stat-card" onClick={()=>nav("/register-outlet")} style={{cursor:"pointer"}}>
          <div className="stat-top"><span className="icon-badge"><Store size={20}/></span><span className="badge badge-blue">{outlets.filter(x=>x.status==="Aktif").length} Aktif</span></div>
          <h3>Total Outlet</h3>
          <strong>{outlets.length} outlet</strong>
        </div>
        <div className="card stat-card" onClick={()=>nav("/invoice-piutang")} style={{cursor:"pointer",borderLeft:"3px solid var(--green)"}}>
          <div className="stat-top"><span className="icon-badge"><FileText size={20}/></span><span className="badge badge-green">{invoiceNormal.length} invoice</span></div>
          <h3>Piutang Normal</h3>
          <strong style={{fontSize:13}}>{FMT_SHORT(invoiceNormal.reduce((s,x)=>s+x.sisa,0))}</strong>
          <small style={{color:"var(--muted)",fontSize:11}}>14–30 hari</small>
        </div>
        <div className="card stat-card" onClick={()=>nav("/invoice-piutang")} style={{cursor:"pointer",borderLeft:"3px solid var(--orange)"}}>
          <div className="stat-top"><span className="icon-badge"><Clock size={20}/></span><span className="badge badge-orange">{invoiceOverdue.length} invoice</span></div>
          <h3>Piutang Overdue</h3>
          <strong style={{fontSize:13}}>{FMT_SHORT(invoiceOverdue.reduce((s,x)=>s+x.sisa,0))}</strong>
          <small style={{color:"var(--muted)",fontSize:11}}>30–90 hari</small>
        </div>
        <div className="card stat-card" onClick={()=>nav("/invoice-piutang")} style={{cursor:"pointer",borderLeft:"3px solid var(--red)",background:"#fff5f5"}}>
          <div className="stat-top"><span className="icon-badge" style={{background:"#fee2e2"}}><AlertTriangle size={20} color="var(--red)"/></span><span className="badge badge-red">{invoicePriority.length} invoice</span></div>
          <h3>Piutang Priority</h3>
          <strong style={{fontSize:13,color:"var(--red)"}}>{FMT_SHORT(invoicePriority.reduce((s,x)=>s+x.sisa,0))}</strong>
          <small style={{color:"var(--red)",fontSize:11,fontWeight:700}}>⚠ &gt;90 hari</small>
        </div>
      </section>

      {/* Charts */}
      <section className="grid-2">
        <div className="card">
          <div className="card-title"><h2>Grafik Transaksi Mingguan</h2><span className="badge badge-blue">7 Hari</span></div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="d"/>
              <Tooltip formatter={v=>"Rp "+v.toLocaleString("id-ID")}/>
              <Bar dataKey="masuk" name="Masuk" radius={[6,6,0,0]} fill="var(--navy)"/>
              <Bar dataKey="keluar" name="Keluar" radius={[6,6,0,0]} fill="var(--orange)"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title"><h2>Performa Sales</h2></div>
          {salesPerf.map(s=>(
            <div key={s.name} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:600}}>{s.name}</span>
                <span style={{fontSize:12,color:"var(--muted)"}}>{FMT_SHORT(s.penjualan)} / {FMT_SHORT(s.target)}</span>
              </div>
              <div style={{height:8,background:"var(--line)",borderRadius:999,overflow:"hidden"}}>
                <div style={{height:"100%",background:s.penjualan>=s.target?"var(--green)":"var(--navy)",width:Math.min(100,(s.penjualan/s.target*100)).toFixed(0)+"%",borderRadius:999,transition:"width .5s"}}/>
              </div>
            </div>
          ))}
          <div style={{borderTop:"1px solid var(--line)",paddingTop:16,marginTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
              <span style={{color:"var(--muted)"}}>Total Piutang</span>
              <strong style={{color:"var(--navy)"}}>{FMT_SHORT(totalPiutang)}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Stock Gudang & Outlet Register */}
      <section className="grid-2" style={{marginTop:20}}>
        <div className="card table-card">
          <div className="table-head">
            <h2>Stock Gudang</h2>
            <button className="secondary-btn small" onClick={()=>nav("/barang-masuk")}><ArrowUpRight size={15}/></button>
          </div>
          <table>
            <thead><tr><th>Nama Barang</th><th>Stok</th><th>Status</th></tr></thead>
            <tbody>
              {stockGudang.map(r=>(
                <tr key={r.nama}>
                  <td style={{fontWeight:600}}>{r.nama}</td>
                  <td>{r.stok} {r.satuan}</td>
                  <td><span className={`badge badge-${r.stok<10?"red":"green"}`}>{r.stok<10?"Kritis":"Aman"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card table-card">
          <div className="table-head">
            <h2>Data Register Outlet Terbaru</h2>
            <button className="secondary-btn small" onClick={()=>nav("/register-outlet")}><ArrowUpRight size={15}/></button>
          </div>
          <table>
            <thead><tr><th>Nama Owner</th><th>Telp</th><th>Status</th></tr></thead>
            <tbody>
              {outlets.slice(0,5).map(r=>(
                <tr key={r.id}>
                  <td>
                    <div style={{fontWeight:600,fontSize:13}}>{r.namaOwner}</div>
                    <div style={{fontSize:11,color:"var(--muted)"}}>{r.namaOutlet}</div>
                  </td>
                  <td style={{fontSize:12}}>{r.telp}</td>
                  <td><span className={`badge badge-${r.status==="Aktif"?"green":"red"}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Priority Invoices */}
      {invoicePriority.length > 0 && (
        <section style={{marginTop:20}}>
          <div className="card table-card" style={{border:"2px solid var(--red)"}}>
            <div className="table-head" style={{background:"#fff5f5",margin:"-24px -24px 16px",padding:"16px 24px",borderRadius:"22px 22px 0 0"}}>
              <h2 style={{color:"var(--red)",display:"flex",alignItems:"center",gap:8}}><AlertTriangle size={18}/> Invoice Piutang PRIORITY (&gt;90 Hari)</h2>
              <button className="secondary-btn small" style={{borderColor:"var(--red)",color:"var(--red)"}} onClick={()=>nav("/invoice-piutang")}>Lihat Semua</button>
            </div>
            <table>
              <thead><tr><th>No Invoice</th><th>Outlet</th><th>Salesman</th><th>Jatuh Tempo</th><th>Sisa Tagihan</th></tr></thead>
              <tbody>
                {invoicePriority.map(r=>(
                  <tr key={r.id} style={{background:"#fff5f5"}}>
                    <td style={{fontWeight:700,color:"var(--red)"}}>{r.noInvoice}</td>
                    <td>{r.outlet}</td>
                    <td>{r.salesman}</td>
                    <td style={{color:"var(--red)",fontWeight:600}}>{r.tanggalJatuhTempo}</td>
                    <td style={{fontWeight:700,color:"var(--red)"}}>{FMT(r.sisa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
function AdminDashboard() {
  const { itemsIn, itemsOut, cashflow, suppliers, customers, outlets, invoices, absensi, users } = useApp();
  const nav = useNavigate();

  const totalMasuk  = cashflow.filter(x=>x.jenis==="masuk").reduce((s,x)=>s+x.jumlah,0);
  const totalKeluar = cashflow.filter(x=>x.jenis==="keluar").reduce((s,x)=>s+x.jumlah,0);
  const invoiceNormal   = invoices.filter(x=>x.status==="normal");
  const invoiceOverdue  = invoices.filter(x=>x.status==="overdue");
  const invoicePriority = invoices.filter(x=>x.status==="priority");

  const today = absensi.filter(x=>x.tanggal==="2025-01-13");

  const stockData = [
    { nama:"Edge Compute Unit v2", masuk:50, keluar:30, stok:20 },
    { nama:"Neural Interface", masuk:20, keluar:15, stok:5 },
    { nama:"Solid State Array", masuk:100, keluar:80, stok:20 },
    { nama:"Quantum Processor", masuk:10, keluar:5, stok:5 },
  ];

  const dailySales = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d,i)=>({
    d, nilai:[42,66,52,92,72,58,82][i]*1000000
  }));

  return (
    <>
      <section className="stat-grid">
        {[
          ["Barang Masuk",    itemsIn.reduce((s,x)=>s+x.qty,0)+" unit",  "Hari ini", PackageCheck, "green", "/barang-masuk"],
          ["Barang Keluar",   itemsOut.reduce((s,x)=>s+x.qty,0)+" unit", "Hari ini", PackageMinus, "orange","/barang-keluar"],
          ["Supplier Aktif",  suppliers.filter(x=>x.status==="Aktif").length+" mitra","Aktif",Truck,"blue","/supplier"],
          ["Customer Aktif",  customers.filter(x=>x.status==="Aktif").length+" klien","Aktif",Users,"blue","/customer"],
          ["Cash Masuk",      FMT_SHORT(totalMasuk),  "+8.2%", Wallet,    "green", "/cashflow"],
          ["Cash Keluar",     FMT_SHORT(totalKeluar), "-2.4%", CreditCard,"red",   "/cashflow"],
        ].map(([t,v,b,I,color,link])=>(
          <div className="card stat-card" key={t} onClick={()=>nav(link)} style={{cursor:"pointer"}}>
            <div className="stat-top"><span className="icon-badge"><I size={20}/></span><span className={`badge badge-${color}`}>{b}</span></div>
            <h3>{t}</h3>
            <strong>{v}</strong>
          </div>
        ))}
      </section>

      {/* Outlet register & absensi hari ini */}
      <section className="stat-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:20}}>
        <div className="card stat-card" onClick={()=>nav("/register-outlet")} style={{cursor:"pointer"}}>
          <div className="stat-top"><span className="icon-badge"><Store size={20}/></span><span className="badge badge-green">{outlets.filter(x=>x.status==="Aktif").length}</span></div>
          <h3>Outlet Aktif</h3>
          <strong>{outlets.length} total</strong>
        </div>
        <div className="card stat-card" onClick={()=>nav("/absensi")} style={{cursor:"pointer"}}>
          <div className="stat-top"><span className="icon-badge"><MapPin size={20}/></span><span className="badge badge-blue">{today.length}</span></div>
          <h3>Kunjungan Hari Ini</h3>
          <strong>{today.filter(x=>x.status==="Hadir").length} hadir</strong>
        </div>
        <div className="card stat-card" onClick={()=>nav("/invoice-piutang")} style={{cursor:"pointer",borderLeft:"3px solid var(--orange)"}}>
          <div className="stat-top"><span className="icon-badge"><Clock size={20}/></span><span className="badge badge-orange">{invoiceOverdue.length}</span></div>
          <h3>Invoice Overdue</h3>
          <strong style={{fontSize:13}}>{FMT_SHORT(invoiceOverdue.reduce((s,x)=>s+x.sisa,0))}</strong>
        </div>
        <div className="card stat-card" onClick={()=>nav("/invoice-piutang")} style={{cursor:"pointer",borderLeft:"3px solid var(--red)",background:"#fff5f5"}}>
          <div className="stat-top"><span className="icon-badge" style={{background:"#fee2e2"}}><AlertTriangle size={20} color="var(--red)"/></span><span className="badge badge-red">{invoicePriority.length}</span></div>
          <h3>Invoice Priority</h3>
          <strong style={{color:"var(--red)",fontSize:13}}>{FMT_SHORT(invoicePriority.reduce((s,x)=>s+x.sisa,0))}</strong>
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="card-title"><h2>Penjualan Harian</h2><span className="badge badge-blue">Minggu Ini</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailySales}>
              <XAxis dataKey="d"/><Tooltip formatter={v=>"Rp "+v.toLocaleString("id-ID")}/>
              <Bar dataKey="nilai" name="Penjualan" radius={[6,6,0,0]} fill="var(--navy)"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card table-card">
          <div className="table-head"><h2>Stock Gudang Hari Ini</h2><button className="secondary-btn small" onClick={()=>nav("/barang-masuk")}><ArrowUpRight size={15}/></button></div>
          <table>
            <thead><tr><th>Barang</th><th>Masuk</th><th>Keluar</th><th>Stok</th></tr></thead>
            <tbody>
              {stockData.map(r=>(
                <tr key={r.nama}>
                  <td style={{fontSize:12,fontWeight:600}}>{r.nama}</td>
                  <td><span className="badge badge-green">+{r.masuk}</span></td>
                  <td><span className="badge badge-orange">-{r.keluar}</span></td>
                  <td><span className={`badge badge-${r.stok<10?"red":"blue"}`}>{r.stok}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid-2" style={{marginTop:20}}>
        <div className="card table-card">
          <div className="table-head"><h2>Absensi & Kunjungan Sales Hari Ini</h2><button className="secondary-btn small" onClick={()=>nav("/absensi")}><ArrowUpRight size={15}/></button></div>
          <table>
            <thead><tr><th>Sales</th><th>Outlet</th><th>Jam</th><th>Status</th></tr></thead>
            <tbody>
              {today.slice(0,5).map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:600,fontSize:13}}>{r.salesman}</td>
                  <td style={{fontSize:12}}>{r.outlet}</td>
                  <td style={{fontSize:12}}>{r.jamMasuk}</td>
                  <td><span className={`badge badge-${r.status==="Hadir"?"green":"red"}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card table-card">
          <div className="table-head"><h2>Invoice Piutang Sales</h2><button className="secondary-btn small" onClick={()=>nav("/invoice-piutang")}><ArrowUpRight size={15}/></button></div>
          <table>
            <thead><tr><th>No Invoice</th><th>Sales</th><th>Sisa</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.slice(0,5).map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:600,fontSize:12}}>{r.noInvoice}</td>
                  <td style={{fontSize:12}}>{r.salesman}</td>
                  <td style={{fontSize:12,fontWeight:600}}>{FMT_SHORT(r.sisa)}</td>
                  <td>
                    <span className={`badge badge-${r.status==="normal"?"green":r.status==="overdue"?"orange":"red"}`}>
                      {r.status==="normal"?"Normal":r.status==="overdue"?"Overdue":"Priority"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Area penjualan */}
      <section style={{marginTop:20}}>
        <div className="card table-card">
          <div className="table-head"><h2>Data Area Penjualan & Pengiriman Sales</h2><button className="secondary-btn small" onClick={()=>nav("/register-outlet")}><ArrowUpRight size={15}/></button></div>
          <table>
            <thead><tr><th>Area</th><th>Sales</th><th>Jumlah Outlet</th><th>Outlet Aktif</th><th>Kunjungan Hari Ini</th></tr></thead>
            <tbody>
              {["Malang Kota","Batu","Kepanjen","Blitar","Lawang"].map(area=>{
                const areaOutlets = outlets.filter(x=>x.area===area);
                const aktif = areaOutlets.filter(x=>x.status==="Aktif").length;
                const kunjungan = today.filter(x=>areaOutlets.some(o=>o.namaOutlet===x.outlet)).length;
                const sales = [...new Set(areaOutlets.map(x=>x.salesman))].join(", ");
                return (
                  <tr key={area}>
                    <td style={{fontWeight:600}}>{area}</td>
                    <td style={{fontSize:12}}>{sales||"-"}</td>
                    <td style={{textAlign:"center"}}>{areaOutlets.length}</td>
                    <td style={{textAlign:"center"}}><span className="badge badge-green">{aktif}</span></td>
                    <td style={{textAlign:"center"}}><span className="badge badge-blue">{kunjungan}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ─── SALES DASHBOARD ─────────────────────────────────────────────────────────
function SalesDashboard() {
  const { session, outlets, invoices, absensi, itemsOut, itemsIn } = useApp();
  const nav = useNavigate();

  const myName = session?.name;
  const myOutlets = outlets.filter(x=>x.salesman===myName);
  const myInvoices = invoices.filter(x=>x.salesman===myName);
  const myAbsensi = absensi.filter(x=>x.salesman===myName);
  const todayAbsensi = myAbsensi.filter(x=>x.tanggal==="2025-01-13");

  const invNormal   = myInvoices.filter(x=>x.status==="normal");
  const invOverdue  = myInvoices.filter(x=>x.status==="overdue");
  const invPriority = myInvoices.filter(x=>x.status==="priority");

  const stockGudang = [
    { nama:"Edge Compute Unit v2", stok:20, satuan:"unit" },
    { nama:"Neural Interface Bridge", stok:5, satuan:"unit" },
    { nama:"Solid State Array 12TB", stok:20, satuan:"unit" },
    { nama:"Quantum Processor X1", stok:5, satuan:"unit" },
  ];

  const programOutlets = [
    { outlet:"Toko Maju Jaya", program:"Diskon 10%", periode:"Jan 2025", status:"Aktif" },
    { outlet:"Warung Berkah",  program:"Bonus Produk", periode:"Jan 2025", status:"Aktif" },
    { outlet:"Toko Prima",     program:"Free Ongkir",  periode:"Feb 2025", status:"Akan Datang" },
  ];

  return (
    <>
      <section className="stat-grid">
        {[
          ["Outlet Saya",    myOutlets.length+" outlet",   myOutlets.filter(x=>x.status==="Aktif").length+" aktif", Store,    "blue",   "/register-outlet"],
          ["Kunjungan Hari Ini", todayAbsensi.length+" outlet", todayAbsensi.filter(x=>x.status==="Hadir").length+" hadir", MapPin,"green","/absensi"],
          ["Invoice Normal",     invNormal.length+" inv",  "14-30 hari",  FileText, "green",  "/invoice-piutang"],
          ["Invoice Overdue",    invOverdue.length+" inv", "30-90 hari",  Clock,    "orange", "/invoice-piutang"],
        ].map(([t,v,b,I,color,link])=>(
          <div className="card stat-card" key={t} onClick={()=>nav(link)} style={{cursor:"pointer",gridColumn:"span 1"}}>
            <div className="stat-top"><span className="icon-badge"><I size={20}/></span><span className={`badge badge-${color}`}>{b}</span></div>
            <h3>{t}</h3>
            <strong>{v}</strong>
          </div>
        ))}
      </section>

      {/* Priority warning */}
      {invPriority.length > 0 && (
        <div className="card" style={{border:"2px solid var(--red)",background:"#fff5f5",marginBottom:20,padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <AlertTriangle size={24} color="var(--red)"/>
            <div>
              <div style={{fontWeight:800,color:"var(--red)",fontSize:15}}>⚠ {invPriority.length} Invoice PRIORITY ({">"} 90 Hari)</div>
              <div style={{fontSize:13,color:"var(--muted)"}}>Total: {FMT(invPriority.reduce((s,x)=>s+x.sisa,0))} — Segera tindak lanjuti!</div>
            </div>
          </div>
          <button className="primary-btn" style={{background:"var(--red)"}} onClick={()=>nav("/invoice-piutang")}>Lihat Detail</button>
        </div>
      )}

      <section className="grid-2">
        {/* Outlet saya by area */}
        <div className="card table-card">
          <div className="table-head"><h2>Outlet Area Saya</h2><button className="secondary-btn small" onClick={()=>nav("/register-outlet")}><ArrowUpRight size={15}/></button></div>
          <table>
            <thead><tr><th>Nama Outlet</th><th>Owner</th><th>Area</th><th>Status</th></tr></thead>
          <tbody>
            {myOutlets.map(r=>(
              <tr key={r.id}>
                <td style={{fontWeight:600,fontSize:13}}>{r.namaOutlet}</td>
                <td style={{fontSize:12}}>{r.namaOwner}</td>
                <td><span className="badge badge-blue">{r.area}</span></td>
                <td><span className={`badge badge-${r.status==="Aktif"?"green":"red"}`}>{r.status}</span></td>
              </tr>
            ))}
            {myOutlets.length===0 && <tr><td colSpan={4} style={{textAlign:"center",color:"var(--muted)"}}>Belum ada outlet</td></tr>}
          </tbody>
          </table>
        </div>

        {/* Stock gudang */}
        <div className="card table-card">
          <div className="table-head"><h2>Stock Gudang</h2><button className="secondary-btn small" onClick={()=>nav("/barang-masuk")}><ArrowUpRight size={15}/></button></div>
          <table>
            <thead><tr><th>Barang</th><th>Stok</th><th>Status</th></tr></thead>
            <tbody>
              {stockGudang.map(r=>(
                <tr key={r.nama}>
                  <td style={{fontSize:13,fontWeight:600}}>{r.nama}</td>
                  <td>{r.stok} {r.satuan}</td>
                  <td><span className={`badge badge-${r.stok<10?"red":"green"}`}>{r.stok<10?"Kritis":"Aman"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid-2" style={{marginTop:20}}>
        {/* Absensi hari ini */}
        <div className="card table-card">
          <div className="table-head"><h2>Absensi Kunjungan Hari Ini</h2><button className="secondary-btn small" onClick={()=>nav("/absensi")}><ArrowUpRight size={15}/></button></div>
          <table>
            <thead><tr><th>Outlet</th><th>Jam Masuk</th><th>Jam Keluar</th><th>Status</th></tr></thead>
            <tbody>
              {todayAbsensi.map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:600,fontSize:13}}>{r.outlet}</td>
                  <td>{r.jamMasuk}</td>
                  <td>{r.jamKeluar}</td>
                  <td><span className={`badge badge-${r.status==="Hadir"?"green":"red"}`}>{r.status}</span></td>
                </tr>
              ))}
              {todayAbsensi.length===0 && <tr><td colSpan={4} style={{textAlign:"center",color:"var(--muted)"}}>Belum ada kunjungan hari ini</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Invoice tagihan */}
        <div className="card table-card">
          <div className="table-head"><h2>Invoice Tagihan Saya</h2><button className="secondary-btn small" onClick={()=>nav("/invoice-piutang")}><ArrowUpRight size={15}/></button></div>
          <table>
            <thead><tr><th>No Invoice</th><th>Outlet</th><th>Sisa</th><th>Status</th></tr></thead>
            <tbody>
              {myInvoices.map(r=>(
                <tr key={r.id} style={r.status==="priority"?{background:"#fff5f5"}:{}}>
                  <td style={{fontWeight:600,fontSize:12,color:r.status==="priority"?"var(--red)":"inherit"}}>{r.noInvoice}</td>
                  <td style={{fontSize:12}}>{r.outlet}</td>
                  <td style={{fontWeight:600,fontSize:12}}>{FMT_SHORT(r.sisa)}</td>
                  <td><span className={`badge badge-${r.status==="normal"?"green":r.status==="overdue"?"orange":"red"}`}>{r.status==="normal"?"Normal":r.status==="overdue"?"Overdue":"Priority ⚠"}</span></td>
                </tr>
              ))}
              {myInvoices.length===0 && <tr><td colSpan={4} style={{textAlign:"center",color:"var(--muted)"}}>Tidak ada invoice</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Program outlet */}
      <section style={{marginTop:20}}>
        <div className="card table-card">
          <div className="table-head"><h2>Data List Outlet Program</h2></div>
          <table>
            <thead><tr><th>Outlet</th><th>Program</th><th>Periode</th><th>Status</th></tr></thead>
            <tbody>
              {programOutlets.map((r,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:600}}>{r.outlet}</td>
                  <td>{r.program}</td>
                  <td>{r.periode}</td>
                  <td><span className={`badge badge-${r.status==="Aktif"?"green":"blue"}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// Missing icons patch
function PackageCheck(props) { return <Package {...props}/>; }
function PackageMinus(props) { return <Package {...props}/>; }

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { session } = useApp();
  const role = session?.role;
  const now = new Date().toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const roleLabel = { owner:"Owner", admin:"Administrator", sales:"Sales" }[role] || role;

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Selamat datang, {session?.name?.split(" ")[0]} 👋</h1>
          <p>Dashboard <strong>{roleLabel}</strong> — {now}</p>
        </div>
        <div className="header-actions">
          <span className={`badge badge-${role==="owner"?"red":role==="admin"?"navy":"green"}`} style={{padding:"8px 16px",fontSize:13}}>
            {roleLabel}
          </span>
        </div>
      </div>

      {role === "owner" && <OwnerDashboard />}
      {role === "admin" && <AdminDashboard />}
      {role === "sales" && <SalesDashboard />}
    </>
  );
}
