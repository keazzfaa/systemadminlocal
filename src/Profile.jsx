import React, { useState, useRef, useCallback } from "react";
import {
  User, Mail, Phone, MapPin, Lock, Camera, Trash2, Save, RotateCcw,
  Eye, EyeOff, CheckCircle2, AlertCircle, Shield, Clock, Activity,
  LogIn, Crown, UserCog, ShoppingBag, KeyRound, X, ZoomIn, ZoomOut,
  ChevronRight
} from "lucide-react";
import { useApp, ROLES } from "./context.jsx";

/* ─── Helpers ──────────────────────────────────────── */
const ROLE_ICON  = { owner: Crown, admin: UserCog, sales: ShoppingBag };
const ROLE_COLOR = { owner: "badge-red", admin: "badge-navy", sales: "badge-green" };
const PASS_STRENGTH = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const STRENGTH_LABEL = ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
const STRENGTH_COLOR = ["", "#dc2626", "#f97316", "#16a34a", "#0891b2"];

function Toast({ msg, type = "success", onClose }) {
  return (
    <div className={`profile-toast profile-toast-${type}`}>
      {type === "success" ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
      <span>{msg}</span>
      <button onClick={onClose} style={{background:"none",border:0,cursor:"pointer",color:"inherit",marginLeft:"auto",display:"flex",alignItems:"center"}}>
        <X size={16}/>
      </button>
    </div>
  );
}

/* ─── Avatar component ─────────────────────────────── */
function AvatarCircle({ session, size = 100, onClick, editable }) {
  return (
    <div className="profile-avatar-wrap" style={{"--av-size": size+"px"}} onClick={editable ? onClick : undefined}>
      {session?.photoUrl
        ? <img src={session.photoUrl} alt="avatar" className="profile-avatar-img"/>
        : <div className="profile-avatar-initials">{session?.avatar || "?"}</div>
      }
      {editable && (
        <div className="profile-avatar-overlay">
          <Camera size={22}/>
          <span>Ganti Foto</span>
        </div>
      )}
    </div>
  );
}

/* ─── Crop Modal ───────────────────────────────────── */
function CropModal({ src, onDone, onCancel }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState(null);
  const canvasRef = useRef();
  const imgRef = useRef();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    const S = 300;
    canvas.width = S; canvas.height = S;
    ctx.clearRect(0, 0, S, S);
    ctx.save();
    ctx.beginPath();
    ctx.arc(S/2, S/2, S/2, 0, Math.PI*2);
    ctx.clip();
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, S/2 - w/2 + offset.x, S/2 - h/2 + offset.y, w, h);
    ctx.restore();
  }, [scale, offset]);

  const handleMouseDown = (e) => { setDragging(true); setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const handleMouseMove = (e) => { if (!dragging) return; setOffset({ x: e.clientX - start.x, y: e.clientY - start.y }); };
  const handleMouseUp = () => setDragging(false);

  const apply = () => {
    draw();
    const canvas = canvasRef.current;
    onDone(canvas.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal crop-modal-inner" onClick={e => e.stopPropagation()} style={{width:"min(440px,95vw)"}}>
        <div className="modal-head">
          <h2>Sesuaikan Foto Profil</h2>
          <button className="icon-btn" onClick={onCancel}><X size={18}/></button>
        </div>
        <p style={{color:"var(--muted)",fontSize:13,marginBottom:16}}>Drag untuk menggeser · Scroll atau gunakan slider untuk zoom</p>
        <div className="crop-stage"
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onWheel={e => { e.preventDefault(); setScale(s => Math.min(3, Math.max(0.5, s - e.deltaY*0.001))); }}
        >
          <img ref={imgRef} src={src} style={{display:"none"}} onLoad={draw} alt="crop"/>
          <canvas ref={canvasRef} style={{cursor: dragging?"grabbing":"grab", borderRadius:"50%", display:"block"}}
            width={300} height={300}/>
        </div>
        <div className="crop-controls">
          <ZoomOut size={18} style={{color:"var(--muted)"}}/>
          <input type="range" min={0.5} max={3} step={0.01} value={scale}
            onChange={e => { setScale(Number(e.target.value)); setTimeout(draw,10); }}
            style={{flex:1, accentColor:"var(--navy)"}}/>
          <ZoomIn size={18} style={{color:"var(--muted)"}}/>
        </div>
        <div style={{display:"flex",gap:12,marginTop:20}}>
          <button className="secondary-btn" style={{flex:1}} onClick={onCancel}>Batal</button>
          <button className="primary-btn" style={{flex:1}} onClick={apply}><CheckCircle2 size={16}/>Terapkan</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Profile Page ────────────────────────────── */
export default function Profile() {
  const { session, users, updateProfile, addLog } = useApp();
  const user = users.find(u => u.id === session?.id) || session || {};

  const [tab, setTab]           = useState("info");
  const [toast, setToast]       = useState(null);
  const [cropSrc, setCropSrc]   = useState(null);
  const fileRef                 = useRef();

  /* edit form state */
  const [form, setForm] = useState({
    name:    user.name    || "",
    email:   user.email   || "",
    phone:   user.phone   || "",
    address: user.address || "",
    photoUrl: user.photoUrl || "",
  });
  const [formDirty, setFormDirty] = useState(false);
  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setFormDirty(true); };

  /* password state */
  const [pw, setPw] = useState({ old:"", newP:"", confirm:"" });
  const [showPw, setShowPw] = useState({ old:false, newP:false, confirm:false });
  const [pwConfirmModal, setPwConfirmModal] = useState(false);
  const strength = PASS_STRENGTH(pw.newP);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Photo upload ── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      showToast("Format file harus JPG, PNG, atau WEBP.", "error"); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran file maksimal 2MB.", "error"); return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropDone = (dataUrl) => {
    setCropSrc(null);
    setField("photoUrl", dataUrl);
    showToast("Foto berhasil dipotong. Klik Simpan untuk menyimpan perubahan.");
  };

  const removePhoto = () => {
    setField("photoUrl", "");
    showToast("Foto profil dihapus. Klik Simpan untuk menyimpan.");
  };

  /* ── Save profile ── */
  const saveProfile = () => {
    if (!form.name.trim()) { showToast("Nama tidak boleh kosong.", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showToast("Format email tidak valid.", "error"); return; }
    const avatar = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    updateProfile(user.id, { ...form, avatar });
    addLog("Update Profile", `${user.name} memperbarui profil`, "auth");
    showToast("Profil berhasil diperbarui!");
    setFormDirty(false);
  };

  const resetForm = () => {
    setForm({ name: user.name||"", email: user.email||"", phone: user.phone||"", address: user.address||"", photoUrl: user.photoUrl||"" });
    setFormDirty(false);
  };

  /* ── Change password ── */
  const doChangePassword = () => {
    if (!pw.old) { showToast("Password lama wajib diisi.", "error"); return; }
    if (pw.old !== user.password) { showToast("Password lama tidak cocok.", "error"); return; }
    if (pw.newP.length < 8) { showToast("Password baru minimal 8 karakter.", "error"); return; }
    if (pw.newP !== pw.confirm) { showToast("Konfirmasi password tidak cocok.", "error"); return; }
    setPwConfirmModal(true);
  };

  const confirmChangePassword = () => {
    updateProfile(user.id, { password: pw.newP });
    addLog("Change Password", `${user.name} mengubah password`, "auth");
    setPw({ old:"", newP:"", confirm:"" });
    setPwConfirmModal(false);
    showToast("Password berhasil diubah!");
  };

  /* ── recent activity from auditLog (filtered to this user) ── */
  const RoleIcon = ROLE_ICON[user.role] || Shield;

  const TABS = [
    { id:"info",  label:"Informasi Profil" },
    { id:"edit",  label:"Edit Profil"      },
    { id:"pass",  label:"Ubah Password"    },
    { id:"stats", label:"Statistik Akun"   },
  ];

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      {cropSrc && <CropModal src={cropSrc} onDone={handleCropDone} onCancel={() => setCropSrc(null)}/>}

      {pwConfirmModal && (
        <div className="modal-overlay" onClick={() => setPwConfirmModal(false)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <KeyRound size={40} style={{color:"var(--navy)",marginBottom:12}}/>
            <h2>Konfirmasi Ubah Password</h2>
            <p>Anda akan mengubah password akun <strong>{user.name}</strong>. Tindakan ini akan langsung berlaku.</p>
            <div style={{display:"flex",gap:12,marginTop:24}}>
              <button className="secondary-btn" style={{flex:1}} onClick={() => setPwConfirmModal(false)}>Batal</button>
              <button className="primary-btn" style={{flex:1}} onClick={confirmChangePassword}><CheckCircle2 size={16}/>Ya, Ubah</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-title">
          <h1>Profile Settings</h1>
          <p>Kelola informasi dan keamanan akun Anda</p>
        </div>
      </div>

      {/* ── Hero Card ── */}
      <div className="card profile-hero">
        <div className="profile-hero-bg"/>
        <div className="profile-hero-body">
          <AvatarCircle session={{...user, ...form}} size={96} editable={false}/>
          <div className="profile-hero-info">
            <h2>{user.name}</h2>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:6,alignItems:"center"}}>
              <span className={`badge ${ROLE_COLOR[user.role]||"badge-muted"}`}>
                <RoleIcon size={12}/> {ROLES[user.role]?.label || user.role}
              </span>
              <span className="badge badge-green"><CheckCircle2 size={11}/> {user.status || "Aktif"}</span>
              <span style={{color:"var(--muted)",fontSize:13}}>📧 {user.email}</span>
              {user.phone && <span style={{color:"var(--muted)",fontSize:13}}>📞 {user.phone}</span>}
            </div>
            <p style={{margin:"10px 0 0",color:"var(--muted)",fontSize:13}}>
              Bergabung sejak {user.createdAt || "-"} · Login terakhir: {user.lastLogin || "-"}
            </p>
          </div>
          <button className="secondary-btn" style={{marginLeft:"auto",flexShrink:0}} onClick={() => setTab("edit")}>
            Edit Profil <ChevronRight size={15}/>
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="profile-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`profile-tab${tab===t.id?" active":""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: Informasi Profil ══ */}
      {tab === "info" && (
        <div className="grid-2" style={{alignItems:"start"}}>
          <div className="card">
            <h3 className="section-title">Data Diri</h3>
            <div className="info-rows">
              {[
                [User,    "Nama Lengkap", user.name],
                [Mail,    "Email",        user.email],
                [Phone,   "Telepon",      user.phone || "-"],
                [MapPin,  "Alamat",       user.address || "-"],
                [Shield,  "Role",         ROLES[user.role]?.label || user.role],
                [Activity,"Status",       user.status || "Aktif"],
                [Clock,   "Bergabung",    user.createdAt || "-"],
              ].map(([Icon, label, val]) => (
                <div className="info-row" key={label}>
                  <div className="info-row-label"><Icon size={15}/> {label}</div>
                  <div className="info-row-val">{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div className="card" style={{textAlign:"center"}}>
              <h3 className="section-title">Foto Profil</h3>
              <div style={{display:"flex",justifyContent:"center",margin:"16px 0"}}>
                <AvatarCircle session={user} size={110} editable/>
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                <button className="secondary-btn small" onClick={() => fileRef.current?.click()}>
                  <Camera size={15}/>Ganti Foto
                </button>
                {user.photoUrl && (
                  <button className="icon-btn danger" title="Hapus foto" onClick={() => { removePhoto(); saveProfile(); }}>
                    <Trash2 size={15}/>
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} onChange={handleFileChange}/>
            </div>

            <div className="card">
              <h3 className="section-title">Keamanan Akun</h3>
              <div className="info-rows">
                <div className="info-row">
                  <div className="info-row-label"><Lock size={15}/> Password</div>
                  <div className="info-row-val">
                    <span style={{letterSpacing:3}}>••••••••</span>
                    <button className="secondary-btn small" style={{marginLeft:12,padding:"5px 12px",fontSize:11}} onClick={() => setTab("pass")}>Ubah</button>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-row-label"><LogIn size={15}/> Total Login</div>
                  <div className="info-row-val"><strong>{user.totalLogin || 0}x</strong></div>
                </div>
                <div className="info-row">
                  <div className="info-row-label"><Clock size={15}/> Login Terakhir</div>
                  <div className="info-row-val" style={{fontSize:13,color:"var(--muted)"}}>{user.lastLogin || "-"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: Edit Profil ══ */}
      {tab === "edit" && (
        <div className="grid-2" style={{alignItems:"start"}}>
          <div className="card">
            <h3 className="section-title">Edit Informasi</h3>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {[
                [User,   "Nama Lengkap", "name",    "text",  "Nama lengkap Anda"],
                [Mail,   "Email",        "email",   "email", "email@domain.com"],
                [Phone,  "Nomor Telepon","phone",   "tel",   "08xx-xxxx-xxxx"],
                [MapPin, "Alamat",       "address", "text",  "Jalan, Kota, Provinsi"],
              ].map(([Icon, label, key, type, placeholder]) => (
                <div key={key}>
                  <label>{label}</label>
                  <div className="input-group" style={{marginBottom:0}}>
                    <Icon size={16} style={{color:"var(--muted)",flexShrink:0}}/>
                    <input type={type} value={form[key]} placeholder={placeholder}
                      onChange={e => setField(key, e.target.value)}/>
                  </div>
                </div>
              ))}
              <div>
                <label>Role / Jabatan</label>
                <div className="input-group" style={{background:"var(--bg)",cursor:"not-allowed",marginBottom:0}}>
                  <RoleIcon size={16} style={{color:"var(--muted)",flexShrink:0}}/>
                  <input value={ROLES[user.role]?.label || user.role} readOnly
                    style={{background:"transparent",cursor:"not-allowed",color:"var(--muted)"}}/>
                  <span className="badge badge-muted" style={{fontSize:11,flexShrink:0}}>Read Only</span>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:12,marginTop:24}}>
              <button className="secondary-btn" onClick={resetForm} disabled={!formDirty}>
                <RotateCcw size={15}/>Reset
              </button>
              <button className="primary-btn" style={{flex:1}} onClick={saveProfile}>
                <Save size={15}/>Simpan Perubahan
              </button>
            </div>
          </div>

          <div className="card" style={{textAlign:"center"}}>
            <h3 className="section-title">Foto Profil</h3>
            <p style={{color:"var(--muted)",fontSize:13,marginBottom:16}}>Klik foto untuk mengganti. Maks. 2MB, format JPG/PNG/WEBP.</p>
            <div style={{display:"flex",justifyContent:"center",margin:"0 0 20px"}}>
              <AvatarCircle session={{...user, ...form}} size={120} editable onClick={() => fileRef.current?.click()}/>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} onChange={handleFileChange}/>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="secondary-btn" onClick={() => fileRef.current?.click()}>
                <Camera size={15}/>Upload Foto
              </button>
              {form.photoUrl && (
                <button className="secondary-btn" style={{color:"var(--red)",borderColor:"#fecaca"}} onClick={removePhoto}>
                  <Trash2 size={15}/>Hapus Foto
                </button>
              )}
            </div>
            {formDirty && (
              <div className="alert-success" style={{marginTop:16,fontSize:13}}>
                Ada perubahan yang belum disimpan. Klik "Simpan Perubahan".
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB: Ubah Password ══ */}
      {tab === "pass" && (
        <div style={{maxWidth:520}}>
          <div className="card">
            <h3 className="section-title"><KeyRound size={16}/> Ubah Password</h3>
            <p style={{color:"var(--muted)",fontSize:13,marginBottom:24}}>
              Masukkan password lama Anda untuk memverifikasi identitas, lalu buat password baru yang kuat.
            </p>

            {[
              ["Password Lama", "old",     "Masukkan password saat ini"],
              ["Password Baru", "newP",    "Minimal 8 karakter"],
              ["Konfirmasi Password Baru", "confirm", "Ulangi password baru"],
            ].map(([label, key, placeholder]) => (
              <div key={key} style={{marginBottom:18}}>
                <label>{label}</label>
                <div className="input-group" style={{marginBottom:0}}>
                  <Lock size={16} style={{color:"var(--muted)",flexShrink:0}}/>
                  <input type={showPw[key] ? "text" : "password"} value={pw[key]} placeholder={placeholder}
                    onChange={e => setPw(p => ({...p, [key]: e.target.value}))}/>
                  <button style={{background:"none",border:0,cursor:"pointer",color:"var(--muted)",display:"flex",alignItems:"center"}}
                    onClick={() => setShowPw(s => ({...s, [key]: !s[key]}))}>
                    {showPw[key] ? <Eye size={16}/> : <EyeOff size={16}/>}
                  </button>
                </div>
                {key === "newP" && pw.newP && (
                  <div style={{marginTop:8}}>
                    <div style={{display:"flex",gap:4,marginBottom:4}}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{flex:1,height:4,borderRadius:99,background:strength>=i?STRENGTH_COLOR[strength]:"var(--line)",transition:"background .3s"}}/>
                      ))}
                    </div>
                    <small style={{color:STRENGTH_COLOR[strength],fontWeight:700,fontSize:11}}>{STRENGTH_LABEL[strength]}</small>
                  </div>
                )}
                {key === "confirm" && pw.confirm && pw.newP && (
                  <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700}}>
                    {pw.newP === pw.confirm
                      ? <><CheckCircle2 size={13} style={{color:"var(--green)"}}/><span style={{color:"var(--green)"}}>Cocok</span></>
                      : <><AlertCircle  size={13} style={{color:"var(--red)"}}/><span style={{color:"var(--red)"}}>Tidak cocok</span></>}
                  </div>
                )}
              </div>
            ))}

            <div style={{background:"var(--bg)",borderRadius:14,padding:"14px 16px",marginBottom:20,fontSize:13,color:"var(--muted)"}}>
              <strong style={{color:"var(--text)"}}>Tips password kuat:</strong> Kombinasikan huruf besar, angka, dan simbol (!@#$%)
            </div>

            <button className="primary-btn full" onClick={doChangePassword}>
              <KeyRound size={16}/>Ubah Password
            </button>
          </div>
        </div>
      )}

      {/* ══ TAB: Statistik Akun ══ */}
      {tab === "stats" && (
        <>
          <div className="summary-row" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
            {[
              [LogIn,    "Total Login",       `${user.totalLogin || 0}x`,       "blue"  ],
              [Clock,    "Login Terakhir",    user.lastLogin || "-",             "navy"  ],
              [Activity, "Status Akun",       user.status || "Aktif",            "green" ],
              [RoleIcon, "Role",              ROLES[user.role]?.label || "-",    user.role==="owner"?"red":user.role==="admin"?"navy":"green"],
            ].map(([Icon, label, val, color]) => (
              <div className="card stat-card" key={label}>
                <div className="stat-top"><span className="icon-badge"><Icon size={20}/></span></div>
                <h3>{label}</h3>
                <strong style={{fontSize: val.length > 16 ? 14 : 22}}>{val}</strong>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{alignItems:"start"}}>
            <div className="card">
              <h3 className="section-title">Detail Akun</h3>
              <div className="info-rows">
                {[
                  ["ID Pengguna",    `#${user.id}`],
                  ["Nama",           user.name],
                  ["Email",          user.email],
                  ["Telepon",        user.phone || "-"],
                  ["Alamat",         user.address || "-"],
                  ["Tanggal Daftar", user.createdAt || "-"],
                  ["Login Terakhir", user.lastLogin || "-"],
                  ["Total Login",    `${user.totalLogin || 0} kali`],
                ].map(([k, v]) => (
                  <div className="info-row" key={k}>
                    <div className="info-row-label">{k}</div>
                    <div className="info-row-val">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">Hak Akses Modul</h3>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
                {(ROLES[user.role]?.perms.includes("all")
                  ? ["dashboard","inventory","cashflow","supplier","customer","reports","audit","users","profile"]
                  : [...(ROLES[user.role]?.perms||[]), "profile"]
                ).map(p => (
                  <div key={p} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,background:"var(--bg)",border:"1px solid var(--line)"}}>
                    <CheckCircle2 size={16} style={{color:"var(--green)",flexShrink:0}}/>
                    <span style={{textTransform:"capitalize",fontWeight:600,fontSize:14}}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
