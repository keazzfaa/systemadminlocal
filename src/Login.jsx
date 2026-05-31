import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, EyeOff, Eye, ArrowRight, Network, ShieldCheck, AlertCircle } from "lucide-react";
import { useApp } from "./context.jsx";

export default function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@neuralops.id");
  const [pass, setPass] = useState("admin123");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const DEMOS = [
    { label:"Admin",   email:"admin@neuralops.id",   pass:"admin123"   },
    { label:"Manager", email:"marcus@neuralops.id",  pass:"manager123" },
    { label:"Staff",   email:"sari@neuralops.id",    pass:"staff123"   },
  ];

  const submit = () => {
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(email.trim(), pass);
      if (ok) nav("/dashboard");
      else setErr("Email atau password salah.");
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
          <p>Kelola inventaris, keuangan, supplier, dan pelanggan dalam satu platform terintegrasi yang aman.</p>
        </div>
        <div className="feature-pills">
          {["Multi Role","Audit Log","Barang Masuk/Keluar","Cash Flow","Export Excel","Dark Mode"].map(f => (
            <span className="pill-feature" key={f}>✓ {f}</span>
          ))}
        </div>
        <div className="login-preview">
          <div className="preview-grid">{Array.from({length:9}).map((_,i)=><span key={i}/>)}</div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Masuk ke Workspace</h2>
          <p>Masukkan kredensial Anda untuk mengakses sistem</p>

          <div className="demo-creds">
            <p>Demo akun:</p>
            <div className="demo-grid">
              {DEMOS.map(d => (
                <button key={d.label} className="demo-btn" onClick={() => { setEmail(d.email); setPass(d.pass); }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {err && <div className="alert-error"><AlertCircle size={16}/>{err}</div>}

          <label>Email</label>
          <div className="input-group">
            <Mail size={17}/>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@perusahaan.com"/>
          </div>

          <div className="label-row">
            <label>Password</label>
          </div>
          <div className="input-group">
            <Lock size={17}/>
            <input type={show?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="••••••••"/>
            <button style={{background:"none",border:0,cursor:"pointer",color:"var(--muted)"}} onClick={()=>setShow(s=>!s)}>
              {show?<Eye size={17}/>:<EyeOff size={17}/>}
            </button>
          </div>

          <button className="primary-btn full" onClick={submit} disabled={loading}>
            {loading ? "Memproses..." : <><span>Masuk</span><ArrowRight size={18}/></>}
          </button>

          <div className="encryption"><ShieldCheck size={14}/>AES-256 Enterprise Encryption</div>
        </div>
      </div>
    </section>
  );
}
