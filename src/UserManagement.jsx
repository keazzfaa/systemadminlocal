import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Save, ShieldCheck } from "lucide-react";
import { useApp, ROLES } from "./context.jsx";

const EMPTY = { name:"", email:"", role:"staff", avatar:"", password:"" };

export default function UserManagement() {
  const { users, setUsers, addLog, session } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [del, setDel] = useState(null);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (u) => { setForm({...u}); setEditId(u.id); setModal(true); };

  const save = () => {
    const avatar = form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const item = { ...form, avatar: form.avatar || avatar, id: editId || Date.now() };
    if (editId) {
      setUsers(prev => prev.map(x => x.id===editId ? item : x));
      addLog("Edit User", `${item.name} (${item.role}) diperbarui`, "auth");
    } else {
      setUsers(prev => [...prev, item]);
      addLog("Tambah User", `${item.name} dengan role ${item.role} ditambahkan`, "auth");
    }
    setModal(false);
  };

  const remove = (id) => {
    if (id === session?.id) { alert("Tidak bisa menghapus akun sendiri!"); setDel(null); return; }
    const item = users.find(x=>x.id===id);
    setUsers(prev=>prev.filter(x=>x.id!==id));
    addLog("Hapus User", `${item.name} dihapus`, "auth");
    setDel(null);
  };

  const ROLE_COLOR = { admin:"badge-red", manager:"badge-navy", staff:"badge-green", viewer:"badge-muted" };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Manajemen User & Role</h1>
          <p>Atur akses pengguna dan hak akses sistem</p>
        </div>
        <button className="primary-btn" onClick={openAdd}><Plus size={16}/>Tambah User</button>
      </div>

      <div className="summary-row">
        {Object.entries(ROLES).map(([key,{label,color}])=>(
          <div className="card stat-card" key={key}>
            <span className={`badge badge-${color}`} style={{marginBottom:8}}>{label}</span>
            <strong style={{fontSize:28}}>{users.filter(u=>u.role===key).length}</strong>
            <p style={{margin:"4px 0 0",color:"var(--muted)",fontSize:13}}>
              {ROLES[key].perms.includes("all") ? "Akses penuh" : ROLES[key].perms.length+" modul"}
            </p>
          </div>
        ))}
      </div>

      <div className="card table-card" style={{marginTop:24}}>
        <div className="table-head">
          <h2>Daftar Pengguna</h2>
        </div>
        <table>
          <thead><tr>
            <th>Pengguna</th><th>Email</th><th>Role</th><th>Akses Modul</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id}>
                <td>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div className="avatar">{u.avatar}</div>
                    <div>
                      <strong>{u.name}</strong>
                      {u.id===session?.id && <span className="badge badge-blue" style={{marginLeft:8,fontSize:11}}>Anda</span>}
                    </div>
                  </div>
                </td>
                <td>{u.email}</td>
                <td><span className={`badge ${ROLE_COLOR[u.role]}`}><ShieldCheck size={12}/> {ROLES[u.role]?.label}</span></td>
                <td>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {ROLES[u.role]?.perms.includes("all")
                      ? <span className="badge badge-red">Semua Modul</span>
                      : ROLES[u.role]?.perms.map(p=><span key={p} className="badge badge-muted" style={{fontSize:11}}>{p}</span>)
                    }
                  </div>
                </td>
                <td>
                  <div style={{display:"flex",gap:8}}>
                    <button className="icon-btn" onClick={()=>openEdit(u)}><Edit2 size={15}/></button>
                    <button className="icon-btn danger" onClick={()=>setDel(u.id)} disabled={u.id===session?.id}><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{marginTop:24}}>
        <h2 style={{marginBottom:16}}>Matriks Hak Akses Role</h2>
        <table>
          <thead>
            <tr>
              <th>Modul</th>
              {Object.entries(ROLES).map(([key,{label}])=><th key={key}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {["dashboard","inventory","sales","cashflow","supplier","customer","reports"].map(mod=>(
              <tr key={mod}>
                <td><strong style={{textTransform:"capitalize"}}>{mod}</strong></td>
                {Object.entries(ROLES).map(([key,{perms}])=>(
                  <td key={key} style={{textAlign:"center"}}>
                    {perms.includes("all")||perms.includes(mod) ? "✅" : "❌"}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td><strong>Admin (Audit/User)</strong></td>
              {Object.entries(ROLES).map(([key,{perms}])=>(
                <td key={key} style={{textAlign:"center"}}>{perms.includes("all")?"✅":"❌"}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editId?"Edit":"Tambah"} User</h2>
              <button className="icon-btn" onClick={()=>setModal(false)}><X size={18}/></button>
            </div>
            <div className="form-grid2">
              <div>
                <label>Nama Lengkap</label>
                <input className="field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
              </div>
              <div>
                <label>Email</label>
                <input className="field" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
              </div>
              <div>
                <label>Role</label>
                <select className="field" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                  {Object.entries(ROLES).map(([key,{label}])=><option key={key} value={key}>{label}</option>)}
                </select>
              </div>
              <div>
                <label>Password</label>
                <input className="field" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder={editId?"Kosongkan jika tidak diubah":""}/>
              </div>
            </div>
            {form.role && (
              <div style={{padding:"12px 16px",background:"var(--bg)",borderRadius:12,marginBottom:16,fontSize:13}}>
                <strong>Akses {ROLES[form.role]?.label}:</strong>{" "}
                {ROLES[form.role]?.perms.includes("all") ? "Semua modul" : ROLES[form.role]?.perms.join(", ")}
              </div>
            )}
            <button className="primary-btn full" onClick={save}><Save size={16}/>Simpan</button>
          </div>
        </div>
      )}

      {del && (
        <div className="modal-overlay" onClick={()=>setDel(null)}>
          <div className="modal confirm-modal" onClick={e=>e.stopPropagation()}>
            <h2>Hapus User?</h2>
            <p>Akun pengguna akan dihapus permanen.</p>
            <div style={{display:"flex",gap:12,marginTop:24}}>
              <button className="secondary-btn" style={{flex:1}} onClick={()=>setDel(null)}>Batal</button>
              <button className="primary-btn danger-btn" style={{flex:1}} onClick={()=>remove(del)}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
