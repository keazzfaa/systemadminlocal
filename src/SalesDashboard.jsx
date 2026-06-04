import React from "react";
import { DollarSign, Wallet, CreditCard, TrendingUp, Package, Users, ArrowUpRight, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useApp } from "./context.jsx";
import { useNavigate } from "react-router-dom";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");

export default function SalesDashboard() {
  const { itemsIn, itemsOut, cashflow, customers, suppliers, auditLog, session } = useApp();
  const nav = useNavigate();

  const totalIn   = itemsIn.reduce((s,x)=>s+x.total,0);
  const totalOut  = itemsOut.reduce((s,x)=>s+x.total,0);
  const totalMasuk  = cashflow.filter(x=>x.jenis==="masuk").reduce((s,x)=>s+x.jumlah,0);
  const totalKeluar = cashflow.filter(x=>x.jenis==="keluar").reduce((s,x)=>s+x.jumlah,0);
  const netProfit   = totalMasuk - totalKeluar;

  const barData = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d,i)=>({
    d, masuk:[42,66,52,92,72,58,82][i]*1000000, keluar:[22,30,28,45,35,20,30][i]*1000000
  }));

  const trendData = ["Jan","Feb","Mar","Apr","Mei","Jun"].map((m,i)=>({
    m, v:[145,188,162,240,198,275][i]
  }));

  const recentLog = auditLog.slice(0,5);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Selamat datang, {session?.name?.split(" ")[0]} 👋</h1>
          <p>Ringkasan operasional per {new Date().toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
        </div>
      </div>

      <section className="stat-grid">
        {[
            ["Total Penjualan", FMT(totalOut), "+12%", TrendingUp, "green", "/barang-keluar"],
            ["Total Customer", customers.length, "Aktif", Users, "blue", "/customer"],
            ["Total Transaksi", itemsOut.length, "Hari Ini", Package, "orange", "/barang-keluar"],
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

      <section className="grid-bottom" style={{marginTop:24}}>
        <div className="card table-card">
          <div className="table-head">
            <h2>Transaksi Barang Keluar Terbaru</h2>
            <button className="secondary-btn small" onClick={()=>nav("/barang-keluar")}>
              Lihat Semua <ArrowUpRight size={15}/>
            </button>
          </div>
          <table>
            <thead><tr><th>Tanggal</th><th>Kode</th><th>Nama Barang</th><th>Qty</th><th>Total</th></tr></thead>
            <tbody>
              {itemsOut.slice(0,4).map(r=>(
                <tr key={r.id}>
                  <td>{r.tanggal}</td>
                  <td><span className="badge badge-blue">{r.kode}</span></td>
                  <td><strong>{r.nama}</strong></td>
                  <td>{r.qty} {r.satuan}</td>
                  <td><strong>{FMT(r.total)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
