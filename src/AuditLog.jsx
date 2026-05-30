import React, { useState } from "react";
import { Search, Download, Database, Filter, Clock } from "lucide-react";
import { useApp } from "./context.jsx";
import { exportToExcel, exportJSON } from "./utils.js";

const TYPE_COLOR = { auth:"badge-blue", data:"badge-navy", inventory:"badge-green", export:"badge-orange", system:"badge-muted" };
const TYPE_ICON  = { auth:"🔐", data:"📝", inventory:"📦", export:"📊", system:"⚙️" };

export default function AuditLog() {
  const { auditLog, addLog, itemsIn, itemsOut, cashflow, suppliers, customers, users } = useApp();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("semua");
  const [backupMsg, setBackupMsg] = useState("");

  const filtered = auditLog.filter(x => {
    const matchSearch = x.action.toLowerCase().includes(search.toLowerCase()) ||
      x.detail.toLowerCase().includes(search.toLowerCase()) ||
      x.user.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType==="semua" || x.type===filterType;
    return matchSearch && matchType;
  });

  const doBackup = () => {
    const backup = { timestamp: new Date().toISOString(), itemsIn, itemsOut, cashflow, suppliers, customers, users, auditLog };
    exportJSON(backup, `NeuralOps_Backup_${new Date().toISOString().slice(0,10)}`);
    addLog("Backup Database", `Backup berhasil (${JSON.stringify(backup).length} bytes)`, "system");
    setBackupMsg("✅ Backup berhasil diunduh!");
    setTimeout(()=>setBackupMsg(""),3000);
  };

  const doExportLog = () => {
    exportToExcel(filtered, "Audit_Log", ["id","ts","user","action","detail","type"]);
    addLog("Export Excel", "Audit Log diekspor", "export");
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Audit Log & Backup</h1>
          <p>Rekam jejak semua aktivitas pengguna dan sistem</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={doExportLog}><Download size={16}/>Export Log</button>
          <button className="primary-btn" onClick={doBackup}><Database size={16}/>Backup Database</button>
        </div>
      </div>

      {backupMsg && (
        <div className="alert-success">{backupMsg}</div>
      )}

      <div className="summary-row">
        <div className="card stat-card"><h3>Total Log</h3><strong>{auditLog.length}</strong></div>
        <div className="card stat-card"><h3>Aktivitas Hari Ini</h3><strong>{auditLog.filter(x=>x.ts.includes("2025-01-13")).length}</strong></div>
        <div className="card stat-card"><h3>User Aktif</h3><strong>{[...new Set(auditLog.map(x=>x.user))].length}</strong></div>
      </div>

      <div className="card table-card" style={{marginTop:24}}>
        <div className="table-head">
          <h2>Riwayat Aktivitas</h2>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            <div className="filter-tabs">
              {["semua","auth","data","inventory","export","system"].map(t=>(
                <button key={t} className={`pill-btn small${filterType===t?" active":""}`} onClick={()=>setFilterType(t)}>
                  {TYPE_ICON[t]||"📋"} {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
            <div className="search-bar" style={{minWidth:220}}>
              <Search size={16}/>
              <input placeholder="Cari aksi, user, detail..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>
        </div>
        <table>
          <thead><tr>
            <th>Waktu</th><th>User</th><th>Aksi</th><th>Detail</th><th>Tipe</th>
          </tr></thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}>
                <td style={{whiteSpace:"nowrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <Clock size={13} style={{color:"var(--muted)"}}/>
                    <span style={{fontSize:13}}>{r.ts}</span>
                  </div>
                </td>
                <td><strong>{r.user}</strong></td>
                <td><strong>{r.action}</strong></td>
                <td style={{color:"var(--muted)",fontSize:14}}>{r.detail}</td>
                <td><span className={`badge ${TYPE_COLOR[r.type]||"badge-muted"}`}>{TYPE_ICON[r.type]} {r.type}</span></td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"var(--muted)",padding:40}}>Tidak ada data</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card" style={{marginTop:24}}>
        <div className="card-title">
          <h2><Database size={18}/> Backup & Restore</h2>
        </div>
        <p style={{color:"var(--muted)",marginBottom:20}}>Backup mengunduh semua data dalam format JSON yang bisa dipulihkan kembali.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
          {[
            ["Barang Masuk",itemsIn.length,"📦"],
            ["Barang Keluar",itemsOut.length,"📤"],
            ["Cash Flow",cashflow.length,"💰"],
            ["Supplier",suppliers.length,"🚚"],
            ["Customer",customers.length,"👥"],
            ["Audit Log",auditLog.length,"📋"],
          ].map(([label,count,emoji])=>(
            <div key={label} style={{padding:"16px 20px",background:"var(--bg)",borderRadius:16,border:"1px solid var(--line)"}}>
              <p style={{margin:0,fontSize:24}}>{emoji}</p>
              <strong style={{display:"block",fontSize:22,color:"var(--navy)"}}>{count}</strong>
              <p style={{margin:"4px 0 0",fontSize:13,color:"var(--muted)"}}>{label}</p>
            </div>
          ))}
        </div>
        <button className="primary-btn" style={{marginTop:20}} onClick={doBackup}>
          <Database size={16}/>Download Backup Sekarang
        </button>
      </div>
    </>
  );
}
