import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Save, ShieldCheck, Crown, UserCog, ShoppingBag } from "lucide-react";
import { useApp, ROLES } from "./context.jsx";

const EMPTY = { name:"", email:"", role:"sales", avatar:"", password:"" };

const ROLE_ICON = { owner: Crown, admin: UserCog, sales: ShoppingBag };
const ROLE_COLOR = { owner:"badge-red", admin:"badge-navy", sales:"badge-green" };

export default function UserManagement() {
  const { users, setUsers, addLog, session } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [del, setDel]     = useState(null);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (u) => { setForm({...u}); setEditId(u.id); setModal(true); };

  const save = () => {
    if (!form.name || !form.email) return;
    const avatar = form.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
    const item   = { ...form, avatar: form.avatar || avatar, id: editId || Date.now() };
    if (editId) {
      setUsers(users.map(x => x.id === editId ? item : x));
      addLog("Edit User", `${item.name} (${ROLES[item.role]?.label}) diperbarui`, "auth");
    } else {
      setUsers([...users, item]);
      addLog("Tambah User", `${item.name} sebagai ${ROLES[item.role]?.label}`, "auth");
    }
    setModal(false);
  };

  const remove = (id) => {
    if (id === session?.id) { alert("Tidak bisa menghapus akun Anda sendiri!"); setDel(null); return; }
    const item = users.find(x => x.id === id);
    setUsers(users.filter(x => x.id !== id));
    addLog("Hapus User", `${item.name} dihapus`, "auth");
    setDel(null);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Manajemen User & Role</h1>
          <p>Kelola akun pengguna dan hak akses sistem</p>
        </div>
        <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah User</button>
      </div>

      {/* Role summary */}
      <div className="summary-row" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        {Object.entries(ROLES).map(([key, {label, perms}]) => {
          const Icon = ROLE_ICON[key] || ShieldCheck;
          return (
            <div className="card stat-card" key={key}>
              <div className="stat-top">
                <span className={`badge ${ROLE_COLOR[key]}`}><Icon size={12}/> {label}</span>
              </div>
              <strong style={{fontSize:32,marginTop:8,display:"block"}}>{users.filter(u => u.role === key).length}</strong>
              <p style={{margin:"4px 0 0",color:"var(--muted)",fontSize:12}}>
                {perms.includes("all") ? "Akses penuh" : `${perms.length} modul`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="card table-card" style={{marginTop:24}}>
        <div className="table-head">
          <h2>Daftar Pengguna</h2>
          <span className="badge badge-muted">{users.length} akun terdaftar</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Pengguna</th><th>Email</th><th>Role</th><th>Akses Modul</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const Icon = ROLE_ICON[u.role] || ShieldCheck;
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <div className="avatar" style={{width:34,height:34,fontSize:12}}>{u.avatar}</div>
                      <div>
                        <strong>{u.name}</strong>
                        {u.id === session?.id && <span className="badge badge-blue" style={{marginLeft:8,fontSize:10}}>Anda</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{color:"var(--muted)",fontSize:13}}>{u.email}</td>
                  <td>
                    <span className={`badge ${ROLE_COLOR[u.role] || "badge-muted"}`}>
                      <Icon size={12}/> {ROLES[u.role]?.label || u.role}
                    </span>
                  </td>
                  <td>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {ROLES[u.role]?.perms.includes("all")
                        ? <span className="badge badge-red" style={{fontSize:10}}>Semua Modul</span>
                        : ROLES[u.role]?.perms.slice(0,4).map(p => (
                            <span key={p} className="badge badge-muted" style={{fontSize:10}}>{p}</span>
                          ))
                      }
                    </div>
                  </td>
                  <td>
                    <div style={{display:"flex",gap:8}}>
                      <button className="icon-btn" onClick={() => openEdit(u)}><Edit2 size={15}/></button>
                      <button className="icon-btn danger" onClick={() => setDel(u.id)} disabled={u.id === session?.id}>
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matriks Akses */}
      <div className="card" style={{marginTop:24}}>
        <h2 style={{marginBottom:20}}>Matriks Hak Akses Role</h2>
        <table>
          <thead>
            <tr>
              <th>Modul</th>
              {Object.entries(ROLES).map(([key, {label}]) => <th key={key}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {["dashboard","inventory","cashflow","supplier","customer","reports","audit","users"].map(mod => (
              <tr key={mod}>
                <td><strong style={{textTransform:"capitalize"}}>{mod}</strong></td>
                {Object.entries(ROLES).map(([key, {perms}]) => (
                  <td key={key} style={{textAlign:"center",fontSize:16}}>
                    {perms.includes("all") || perms.includes(mod) ? "✅" : "❌"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editId ? "Edit" : "Tambah"} User</h2>
              <button className="icon-btn" onClick={() => setModal(false)}><X size={18}/></button>
            </div>
            <div className="form-grid2">
              <div style={{gridColumn:"1/-1"}}>
                <label>Nama Lengkap</label>
                <input className="field" value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} placeholder="Nama lengkap"/>
              </div>
              <div>
                <label>Email</label>
                <input className="field" type="email" value={form.email} onChange={e => setForm(f => ({...f,email:e.target.value}))} placeholder="email@domain.com"/>
              </div>
              <div>
                <label>Role</label>
                <select className="field" value={form.role} onChange={e => setForm(f => ({...f,role:e.target.value}))}>
                  {Object.entries(ROLES).map(([key, {label}]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label>Password {editId && <span style={{fontWeight:400,textTransform:"none"}}>(kosongkan jika tidak diubah)</span>}</label>
                <input className="field" type="password" value={form.password} onChange={e => setForm(f => ({...f,password:e.target.value}))} placeholder="Minimal 8 karakter"/>
              </div>
            </div>
            {form.role && (
              <div style={{padding:"12px 16px",background:"var(--bg)",borderRadius:12,marginBottom:16,fontSize:13,color:"var(--muted)"}}>
                <strong style={{color:"var(--text)"}}>{ROLES[form.role]?.label}</strong> —{" "}
                {ROLES[form.role]?.perms.includes("all") ? "Akses ke semua modul" : `Akses: ${ROLES[form.role]?.perms.join(", ")}`}
              </div>
            )}
            <button className="primary-btn full" onClick={save}><Save size={16}/>Simpan</button>
          </div>
        </div>
      )}

      {del && (
        <div className="modal-overlay" onClick={() => setDel(null)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <h2>Hapus User?</h2>
            <p>Akun <strong>{users.find(x=>x.id===del)?.name}</strong> akan dihapus permanen.</p>
            <div style={{display:"flex",gap:12,marginTop:24}}>
              <button className="secondary-btn" style={{flex:1}} onClick={() => setDel(null)}>Batal</button>
              <button className="primary-btn danger-btn" style={{flex:1}} onClick={() => remove(del)}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
