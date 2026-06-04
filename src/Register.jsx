import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Lock, EyeOff, Eye, ArrowRight,
  Network, ShieldCheck, AlertCircle, CheckCircle2, Briefcase
} from "lucide-react";
import { useApp, ROLES } from "./context.jsx";

const STRENGTH = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const STRENGTH_LABEL = ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
const STRENGTH_COLOR = ["", "#dc2626", "#f97316", "#16a34a", "#0891b2"];

export default function Register() {
  const { register } = useApp();
  const nav = useNavigate();

  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole]     = useState("sales");
  const [showP, setShowP]   = useState(false);
  const [showC, setShowC]   = useState(false);
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = STRENGTH(pass);

  const validate = () => {
    if (!name.trim())          return "Nama lengkap wajib diisi.";
    if (!email.trim())         return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Format email tidak valid.";
    if (pass.length < 8)       return "Password minimal 8 karakter.";
    if (pass !== confirm)      return "Konfirmasi password tidak cocok.";
    return null;
  };

  const submit = () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const result = register(name.trim(), email.trim(), pass, role);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => nav("/dashboard"), 1200);
      } else {
        setErr(result.msg);
      }
      setLoading(false);
    }, 700);
  };

  return (
    <section className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo"><Network size={28}/></div>
          <strong>Neural Ops</strong>
        </div>
        <div className="login-copy">
          <h1>Bergabung dan kelola bisnis lebih cerdas</h1>
          <p>Buat akun baru untuk mulai menggunakan platform manajemen operasional terpadu Neural Ops.</p>
        </div>

        <div className="register-info-cards">
          {Object.entries(ROLES).map(([key, {label, perms}]) => (
            <div className={`register-role-card ${role === key ? "active" : ""}`} key={key} onClick={() => setRole(key)}>
              <div className="role-card-head">
                <span className={`badge badge-${key === "owner" ? "red" : key === "admin" ? "navy" : "green"}`}>{label}</span>
                {role === key && <CheckCircle2 size={16} style={{color:"white"}}/>}
              </div>
              <p>{perms.includes("all") ? "Akses penuh ke semua fitur" : `Akses: ${perms.slice(0,3).join(", ")}${perms.length > 3 ? "..." : ""}`}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card register-card">
          <h2>Buat Akun Baru</h2>
          <p>Isi data di bawah untuk mendaftarkan akun Anda</p>

          {success && (
            <div className="alert-success" style={{display:"flex",alignItems:"center",gap:10}}>
              <CheckCircle2 size={18}/> Akun berhasil dibuat! Mengalihkan ke dashboard...
            </div>
          )}
          {err && <div className="alert-error"><AlertCircle size={16}/>{err}</div>}

          <label>Nama Lengkap</label>
          <div className="input-group">
            <User size={17}/>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Nama Lengkap Anda" autoComplete="name"
            />
          </div>

          <label>Email</label>
          <div className="input-group">
            <Mail size={17}/>
            <input
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@perusahaan.com" type="email" autoComplete="email"
            />
          </div>

          <label>Role / Jabatan</label>
          <div className="input-group" style={{paddingRight:12}}>
            <Briefcase size={17}/>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{border:0,background:"transparent",outline:"none",width:"100%",fontSize:14,color:"var(--text)",fontFamily:"inherit"}}
            >
              {Object.entries(ROLES).map(([key, {label}]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <label>Password</label>
          <div className="input-group">
            <Lock size={17}/>
            <input
              type={showP ? "text" : "password"}
              value={pass} onChange={e => setPass(e.target.value)}
              placeholder="Min. 8 karakter" autoComplete="new-password"
            />
            <button style={{background:"none",border:0,cursor:"pointer",color:"var(--muted)",display:"flex",alignItems:"center"}}
              onClick={() => setShowP(s => !s)} type="button">
              {showP ? <Eye size={17}/> : <EyeOff size={17}/>}
            </button>
          </div>
          {pass && (
            <div style={{marginTop:-12,marginBottom:14}}>
              <div style={{display:"flex",gap:4,marginBottom:4}}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex:1,height:4,borderRadius:99,
                    background: strength >= i ? STRENGTH_COLOR[strength] : "var(--line)",
                    transition:"background .3s"
                  }}/>
                ))}
              </div>
              <small style={{color:STRENGTH_COLOR[strength],fontWeight:700,fontSize:11}}>
                {STRENGTH_LABEL[strength]}
              </small>
            </div>
          )}

          <label>Konfirmasi Password</label>
          <div className="input-group">
            <Lock size={17}/>
            <input
              type={showC ? "text" : "password"}
              value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="Ulangi password" autoComplete="new-password"
            />
            <button style={{background:"none",border:0,cursor:"pointer",color:"var(--muted)",display:"flex",alignItems:"center"}}
              onClick={() => setShowC(s => !s)} type="button">
              {showC ? <Eye size={17}/> : <EyeOff size={17}/>}
            </button>
          </div>
          {confirm && pass && (
            <div style={{marginTop:-12,marginBottom:14,display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700}}>
              {pass === confirm
                ? <><CheckCircle2 size={13} style={{color:"var(--green)"}}/><span style={{color:"var(--green)"}}>Password cocok</span></>
                : <><AlertCircle  size={13} style={{color:"var(--red)"}}/><span style={{color:"var(--red)"}}>Password tidak cocok</span></>
              }
            </div>
          )}

          <button className="primary-btn full" onClick={submit} disabled={loading || success}>
            {loading ? "Mendaftarkan..." : <><span>Buat Akun</span><ArrowRight size={18}/></>}
          </button>

          <div className="login-divider"/>
          <p className="login-help">
            Sudah punya akun?{" "}
            <Link to="/login" style={{color:"var(--navy)",fontWeight:700}}>Masuk di sini</Link>
          </p>
          <div className="encryption"><ShieldCheck size={14}/>Data Anda aman & terenkripsi</div>
        </div>
      </div>
    </section>
  );
}
