import React, { useState } from "react";
import { Download, FileText, TrendingUp, Package, Users, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useApp } from "./context.jsx";
import { exportToExcel } from "./utils.js";

const FMT = v => "Rp " + (v||0).toLocaleString("id-ID");
const COLORS = ["#002b7f","#16a34a","#f97316","#dc2626","#7c3aed","#0891b2"];

export default function Reports() {
  const { itemsIn, itemsOut, cashflow, suppliers, customers, addLog } = useApp();
  const [period, setPeriod] = useState("7D");

  const totalPenjualan = itemsOut.reduce((s,x)=>s+x.total,0);
  const totalPembelian = itemsIn.reduce((s,x)=>s+x.total,0);
  const cashMasuk  = cashflow.filter(x=>x.jenis==="masuk").reduce((s,x)=>s+x.jumlah,0);
  const cashKeluar = cashflow.filter(x=>x.jenis==="keluar").reduce((s,x)=>s+x.jumlah,0);

  const trendData = ["Jan","Feb","Mar","Apr","Mei","Jun"].map((m,i)=>({
    m, penjualan:[145,188,162,240,198,275][i], pembelian:[80,95,78,115,90,120][i]
  }));

  const cashData = ["Jan","Feb","Mar","Apr","Mei","Jun"].map((m,i)=>({
    m, masuk:[120,145,98,200,178,195][i], keluar:[60,80,55,90,85,75][i]
  }));

  // Category distribution from items out
  const catMap = {};
  itemsOut.forEach(x => { catMap[x.nama] = (catMap[x.nama]||0) + x.total; });
  const pieData = Object.entries(catMap).map(([name,value])=>({name,value}));

  const doExport = (type) => {
    if (type==="penjualan") {
      exportToExcel(itemsOut, "Laporan_Penjualan", ["tanggal","kode","nama","qty","satuan","harga","customer","total"]);
      addLog("Export Excel", "Laporan Penjualan diekspor", "export");
    } else if (type==="pembelian") {
      exportToExcel(itemsIn, "Laporan_Pembelian", ["tanggal","kode","nama","qty","satuan","harga","supplier","total"]);
      addLog("Export Excel", "Laporan Pembelian diekspor", "export");
    } else if (type==="cashflow") {
      exportToExcel(cashflow, "Laporan_CashFlow", ["tanggal","kode","keterangan","jenis","kategori","jumlah"]);
      addLog("Export Excel", "Laporan Cash Flow diekspor", "export");
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Laporan & Analitik</h1>
          <p>Ringkasan performa bisnis dan ekspor laporan</p>
        </div>
        <div className="header-actions">
          {["7D","30D","3M","1Y"].map(p=>(
            <button key={p} className={`pill-btn${period===p?" active":""}`} onClick={()=>setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="summary-row" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {[
          ["Total Penjualan",FMT(totalPenjualan),TrendingUp,"green"],
          ["Total Pembelian",FMT(totalPembelian),Package,"blue"],
          ["Cash Masuk",FMT(cashMasuk),Wallet,"green"],
          ["Net Profit",FMT(cashMasuk-cashKeluar),TrendingUp,cashMasuk>cashKeluar?"green":"red"],
        ].map(([label,val,Icon,color])=>(
          <div className="card stat-card" key={label}>
            <div className="stat-top"><span className="icon-badge"><Icon size={20}/></span></div>
            <h3>{label}</h3>
            <strong>{val}</strong>
          </div>
        ))}
      </div>

      <section className="grid-2">
        <div className="card">
          <div className="card-title">
            <h2>Trend Penjualan vs Pembelian</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <XAxis dataKey="m"/>
              <Tooltip/>
              <Line type="monotone" dataKey="penjualan" stroke="var(--navy)" strokeWidth={3} name="Penjualan" dot={{r:4}}/>
              <Line type="monotone" dataKey="pembelian" stroke="var(--orange)" strokeWidth={3} name="Pembelian" dot={{r:4}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">
            <h2>Arus Kas</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cashData}>
              <XAxis dataKey="m"/>
              <Tooltip/>
              <Bar dataKey="masuk"  name="Masuk"  fill="var(--green)" radius={[6,6,0,0]}/>
              <Bar dataKey="keluar" name="Keluar" fill="var(--red)"   radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid-bottom" style={{marginTop:24}}>
        <div className="card">
          <div className="card-title"><h2>Distribusi Penjualan per Produk</h2></div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={v=>FMT(v)}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 style={{marginBottom:20}}>Ekspor Laporan</h2>
          <div style={{display:"grid",gap:12}}>
            {[
              ["Laporan Penjualan","penjualan",itemsOut.length+" transaksi"],
              ["Laporan Pembelian","pembelian",itemsIn.length+" transaksi"],
              ["Laporan Cash Flow","cashflow",cashflow.length+" entri"],
            ].map(([label,type,sub])=>(
              <button key={type} className="secondary-btn" style={{justifyContent:"space-between"}} onClick={()=>doExport(type)}>
                <span style={{display:"flex",alignItems:"center",gap:10}}><FileText size={16}/><div style={{textAlign:"left"}}><div>{label}</div><small style={{color:"var(--muted)",fontWeight:400}}>{sub}</small></div></span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><Download size={15}/>Excel</span>
              </button>
            ))}
          </div>
          <div style={{marginTop:20,padding:"16px 20px",background:"var(--bg)",borderRadius:16,border:"1px solid var(--line)"}}>
            <p style={{margin:0,fontSize:13,color:"var(--muted)"}}>📊 Summary</p>
            <p style={{margin:"8px 0 0",fontSize:14}}><strong>{suppliers.length}</strong> supplier aktif · <strong>{customers.length}</strong> customer · Saldo: <strong style={{color:cashMasuk>cashKeluar?"var(--green)":"var(--red)"}}>{FMT(cashMasuk-cashKeluar)}</strong></p>
          </div>
        </div>
      </section>
    </>
  );
}
