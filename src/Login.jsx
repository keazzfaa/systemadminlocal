import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, EyeOff, Eye, ArrowRight, Network, ShieldCheck, AlertCircle } from "lucide-react";
import { useApp } from "./context.jsx";

export default function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [show, setShow]     = useState(false);
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!email.trim() || !pass) { setErr("Email dan password wajib diisi."); return; }
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(email.trim(), pass);
      if (ok) nav("/dashboard");
      else setErr("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
    }, 600);
  };

  return (
    <section className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo"><Network size={28}/></div>
          <strong>Neural Ops</strong>
        </div>
        <div className="login-copy">
          <h1>Sistem Manajemen Operasional Terpadu</h1>
          <p>Kelola inventaris, keuangan, supplier, dan pelanggan dalam satu platform terintegrasi yang aman dan andal.</p>
        </div>
        <div className="feature-pills">
          {["Multi Role","Audit Log","Barang Masuk/Keluar","Cash Flow","Export Excel","Dark Mode"].map(f => (
            <span className="pill-feature" key={f}>✓ {f}</span>
          ))}
        </div>
          {/* <div className="login-preview">
            <div className="preview-grid">{Array.from({length:9}).map((_,i)=><span key={i}/>)}</div>
          </div> */}
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Masuk ke Workspace</h2>
          <p>Masukkan kredensial akun Anda untuk mengakses sistem</p>

          {err && <div className="alert-error"><AlertCircle size={16}/>{err}</div>}

          <label>Email</label>
          <div className="input-group">
            <Mail size={17}/>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="email@perusahaan.com"
              type="email"
              autoComplete="email"
            />
          </div>

          <label>Password</label>
          <div className="input-group">
            <Lock size={17}/>
            <input
              type={show ? "text" : "password"}
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              style={{background:"none",border:0,cursor:"pointer",color:"var(--muted)",display:"flex",alignItems:"center"}}
              onClick={() => setShow(s => !s)}
              type="button"
            >
              {show ? <Eye size={17}/> : <EyeOff size={17}/>}
            </button>
          </div>

          <button className="primary-btn full" onClick={submit} disabled={loading}>
            {loading ? "Memproses..." : <><span>Masuk</span><ArrowRight size={18}/></>}
          </button>

          <div className="login-divider"/>

          <p className="login-help">
            Belum punya akun?{" "}
            <Link to="/register" style={{color:"var(--navy)",fontWeight:700}}>Daftar sekarang</Link>
          </p>

          <div className="encryption"><ShieldCheck size={14}/>AES-256 Enterprise Encryption</div>
        </div>
      </div>
    </section>
  );
}
