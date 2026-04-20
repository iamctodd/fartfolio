import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:      "#090d18",
  bg2:     "#0f1624",
  bg3:     "#151e2e",
  card:    "#131b2a",
  card2:   "#1a2438",
  border:  "rgba(255,255,255,0.07)",
  green:   "#4ade80",
  lime:    "#a3e635",
  glow:    "rgba(74,222,128,0.2)",
  gold:    "#fbbf24",
  red:     "#f87171",
  text:    "#e2e8f0",
  muted:   "#4e6080",
  muted2:  "#7a93b0",
};

const JOKES = [
  "Past performance is no guarantee of future emissions. 📉",
  "Our analysts predict rising gas prices. 📊",
  "Diversify your portfolio. Don't put all your toots in one basket. 🧺",
  "Buy the dip. Rip the… well, you know. 💹",
  "Maximizing shareholder value, one toot at a time. 🏦",
  "Some assets are best held silently. 🤫",
  "ESG: Environmental, Social, and Gaseous. ♻️",
  "Risk tolerance: can you handle the smell? 👃",
  "Your gut is always right. Just like the market. 📈",
  "Alternative energy generation. Saving the planet. 🌍",
  "Q3 earnings are looking particularly… fragrant. 💼",
  "Liquid assets? We prefer gaseous ones. 💨",
  "Our ROI: Return On Intestines. 🏆",
  "The invisible hand of the market. Also smelly. 🫧",
  "Short selling? Never. We only go long. And loud. 🔊",
];

const RANKS = [
  { min: 0,   title: "Junior Analyst",     emoji: "📋", color: "#7a93b0" },
  { min: 5,   title: "Asset Manager",      emoji: "💼", color: "#4ade80" },
  { min: 15,  title: "Senior Trader",      emoji: "📈", color: "#fbbf24" },
  { min: 30,  title: "Portfolio Director", emoji: "🎯", color: "#c084fc" },
  { min: 50,  title: "VP of Emissions",    emoji: "🏢", color: "#f87171" },
  { min: 75,  title: "Chief Gas Officer",  emoji: "🦨", color: "#fb923c" },
  { min: 100, title: "Grand Poobah CFO",   emoji: "💩", color: "#fbbf24" },
];

// ── Add admin email addresses here ──────────────────────────────────────────
// Leave empty [] to show admin button to ALL users (good for testing)
// e.g. const ADMIN_EMAILS = ["you@gmail.com"];
const ADMIN_EMAILS = [];

function getRank(n) { return [...RANKS].reverse().find(r => n >= r.min) ?? RANKS[0]; }

function sinceISO(unit) {
  const d = new Date();
  if (unit === "day")   d.setHours(0,0,0,0);
  if (unit === "week")  { d.setDate(d.getDate()-d.getDay()); d.setHours(0,0,0,0); }
  if (unit === "month") { d.setDate(1); d.setHours(0,0,0,0); }
  return d.toISOString();
}
function countSince(logs, unit) { return logs.filter(t => t >= sinceISO(unit)).length; }
function pct(a, b) { return b > 0 ? Math.round((a/b)*100) : 0; }

// ─── Global Styles ────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
      body { background:${T.bg}; margin:0; }
      @keyframes floaty {
        0%,100% { transform:translateY(0) rotate(-3deg); }
        50%      { transform:translateY(-4px) rotate(3deg); }
      }
      @keyframes slideIn {
        from { opacity:0; transform:translateY(-8px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(16px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes particleRise {
        0%   { opacity:1; transform:translateY(0) scale(1); }
        100% { opacity:0; transform:translateY(-100px) scale(1.4); }
      }
      @keyframes rippleOut {
        0%   { transform:scale(0.8); opacity:0.7; }
        100% { transform:scale(2.4); opacity:0; }
      }
      @keyframes pulse {
        0%,100% { box-shadow:0 0 0 0 rgba(74,222,128,0.2); }
        50%      { box-shadow:0 0 0 18px rgba(74,222,128,0); }
      }
      @keyframes shake {
        0%,100% { transform:translateX(0); }
        25%     { transform:translateX(-5px); }
        75%     { transform:translateX(5px); }
      }
      .log-btn:active { transform:translate(-50%,-50%) scale(0.96) !important; }
      input:-webkit-autofill {
        -webkit-box-shadow:0 0 0 100px ${T.bg3} inset !important;
        -webkit-text-fill-color:${T.text} !important;
      }
    `}</style>
  );
}

// ─── SVG Logo ─────────────────────────────────────────────────────────────────
function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect x="6"  y="52" width="14" height="20" rx="3" fill="#2EA05A"/>
      <rect x="24" y="38" width="14" height="34" rx="3" fill="#4ade80"/>
      <rect x="42" y="24" width="14" height="48" rx="3" fill="#86efac"/>
      <rect x="4"  y="72" width="56" height="3"  rx="1.5" fill="#2CB5A0" opacity="0.5"/>
      <ellipse cx="58" cy="18" rx="10" ry="8" fill="white" opacity="0.95"/>
      <ellipse cx="50" cy="22" rx="8"  ry="6" fill="white" opacity="0.95"/>
      <ellipse cx="66" cy="22" rx="7"  ry="5" fill="white" opacity="0.9"/>
      <ellipse cx="58" cy="26" rx="9"  ry="6" fill="white" opacity="0.95"/>
    </svg>
  );
}

// ─── Brand Row ────────────────────────────────────────────────────────────────
function BrandRow() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ animation:"floaty 4s ease-in-out infinite", display:"inline-block" }}>
        <Logo size={34}/>
      </div>
      <div>
        <div style={{
          fontFamily:"'Bebas Neue',sans-serif", fontSize:30, letterSpacing:2, lineHeight:1,
          background:`linear-gradient(120deg,#fff 0%,${T.green} 55%,${T.lime} 100%)`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
        }}>Fartfolio</div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted, marginTop:1 }}>
          Track your assets.
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Input ───────────────────────────────────────────────────────────
function Field({ label, type="text", value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:14 }}>
      {label && (
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:T.muted2, marginBottom:6 }}>
          {label}
        </div>
      )}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", padding:"12px 14px", borderRadius:12,
          border:`1.5px solid ${focused ? T.green : T.border}`,
          background:T.bg3, color:T.text,
          fontFamily:"'DM Sans',sans-serif", fontSize:"0.9rem", outline:"none",
          transition:"border-color 0.2s",
        }}
      />
    </div>
  );
}

// ─── Google Button ────────────────────────────────────────────────────────────
function GoogleBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width:"100%", padding:"12px 16px",
      background:"white", border:`1.5px solid ${T.border}`,
      borderRadius:12, cursor: loading?"default":"pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:10,
      fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:"0.9rem",
      color:"#1a1a2e", boxShadow:"0 2px 12px rgba(0,0,0,0.3)",
      transition:"all 0.2s",
    }}>
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      {loading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
      <div style={{ flex:1, height:1, background:T.border }}/>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:T.muted, letterSpacing:1 }}>OR</span>
      <div style={{ flex:1, height:1, background:T.border }}/>
    </div>
  );
}

function Alert({ msg, type="success" }) {
  if (!msg) return null;
  const c = type==="success" ? { bg:"rgba(74,222,128,0.1)", border:"rgba(74,222,128,0.3)", color:"#4ade80" }
                             : { bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.3)", color:"#f87171" };
  return (
    <div style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:"0.82rem", color:c.color, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>
      {msg}
    </div>
  );
}

// ─── Auth Screen ─────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode,    setMode]    = useState("welcome"); // welcome | login | signup
  const [email,   setEmail]   = useState("");
  const [password,setPassword]= useState("");
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  function reset() { setError(""); setSuccess(""); }

  async function handleGoogle() {
    setLoading(true); reset();
    await supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo:window.location.origin } });
  }

  async function handleLogin() {
    if (!email||!password) { setError("Please fill in all fields."); return; }
    setLoading(true); reset();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
  }

  async function handleSignup() {
    if (!name||!email||!password) { setError("Please fill in all fields."); return; }
    if (password.length < 6)      { setError("Password must be at least 6 characters."); return; }
    setLoading(true); reset();
    const { error } = await supabase.auth.signUp({ email, password, options:{ data:{ full_name:name } } });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess("✅ Check your email to confirm your account, then log in!"); setMode("login"); setLoading(false); }
  }

  async function handleForgot() {
    if (!email) { setError("Enter your email above first."); return; }
    await supabase.auth.resetPasswordForEmail(email);
    setSuccess("Password reset email sent!");
  }

  const PrimaryBtn = ({ label, onClick }) => (
    <button onClick={onClick} disabled={loading} style={{
      width:"100%", padding:"13px",
      background: loading ? T.bg3 : `linear-gradient(135deg,${T.green},#22c55e)`,
      border:"none", borderRadius:12,
      cursor: loading?"default":"pointer",
      color:"#0a1628", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"0.95rem",
      transition:"all 0.2s", marginTop:4,
    }}>{loading ? "Please wait…" : label}</button>
  );

  const BackBtn = ({ to }) => (
    <button onClick={()=>{ setMode(to); reset(); }} style={{
      background:"transparent", border:`1px solid ${T.border}`, color:T.muted2,
      borderRadius:20, padding:"6px 14px", cursor:"pointer", fontSize:"0.8rem",
      fontFamily:"'DM Sans',sans-serif", marginBottom:24,
    }}>← Back</button>
  );

  return (
    <div style={{ minHeight:"100dvh", background:T.bg, fontFamily:"'DM Sans',sans-serif", color:T.text, position:"relative" }}>
      <GlobalStyles/>
      <div style={{ position:"fixed", inset:0, background:`radial-gradient(ellipse 600px 400px at 50% -100px, rgba(74,222,128,0.06) 0%, transparent 70%)`, pointerEvents:"none" }}/>
      <div style={{ maxWidth:390, margin:"0 auto", minHeight:"100dvh", display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>

        <div style={{ padding:"24px 20px 0" }}><BrandRow/></div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"24px 20px 48px" }}>

          {/* ── Welcome ── */}
          {mode==="welcome" && (
            <div style={{ animation:"fadeUp 0.4s ease both" }}>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:44, letterSpacing:1, margin:"0 0 8px", lineHeight:1 }}>
                Welcome to<br/>
                <span style={{ background:`linear-gradient(120deg,${T.green},${T.lime})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  Fartfolio
                </span>
              </h1>
              <p style={{ color:T.muted2, fontSize:"0.88rem", lineHeight:1.6, fontWeight:300, marginBottom:32 }}>
                The world's most serious flatulence portfolio management platform. Track your assets. Own your wind.
              </p>

              <GoogleBtn onClick={handleGoogle} loading={loading}/>
              <Divider/>

              <button onClick={()=>setMode("signup")} style={{
                width:"100%", padding:"12px", marginBottom:12,
                background:`linear-gradient(135deg,rgba(74,222,128,0.12),rgba(163,230,53,0.08))`,
                border:`1.5px solid rgba(74,222,128,0.25)`,
                borderRadius:12, cursor:"pointer", color:T.green,
                fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:"0.9rem",
              }}>Sign up with Email 💨</button>

              <button onClick={()=>setMode("login")} style={{
                width:"100%", padding:"12px",
                background:"transparent", border:`1.5px solid ${T.border}`,
                borderRadius:12, cursor:"pointer", color:T.muted2,
                fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:"0.9rem",
              }}>Log In</button>
            </div>
          )}

          {/* ── Sign Up ── */}
          {mode==="signup" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <BackBtn to="welcome"/>
              <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:1, marginBottom:4 }}>Create Account</h2>
              <p style={{ color:T.muted2, fontSize:"0.82rem", marginBottom:20, fontWeight:300 }}>Join the global emissions market.</p>
              <GoogleBtn onClick={handleGoogle} loading={loading}/>
              <Divider/>
              <Alert msg={error} type="error"/>
              <Alert msg={success} type="success"/>
              <Field label="Your Name"   value={name}     onChange={e=>setName(e.target.value)}     placeholder="Warren Buffart…"/>
              <Field label="Email"       type="email"     value={email}    onChange={e=>setEmail(e.target.value)}    placeholder="you@example.com"/>
              <Field label="Password"    type="password"  value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters"/>
              <PrimaryBtn label="Sign Up 💨" onClick={handleSignup}/>
              <p style={{ textAlign:"center", marginTop:16, fontSize:"0.8rem", color:T.muted2 }}>
                Already have an account?{" "}
                <span onClick={()=>{ setMode("login"); reset(); }} style={{ color:T.green, cursor:"pointer", fontWeight:600 }}>Log in</span>
              </p>
            </div>
          )}

          {/* ── Login ── */}
          {mode==="login" && (
            <div style={{ animation:"fadeUp 0.3s ease both" }}>
              <BackBtn to="welcome"/>
              <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:1, marginBottom:4 }}>Login Now</h2>
              <p style={{ color:T.muted2, fontSize:"0.82rem", marginBottom:20, fontWeight:300 }}>Welcome back, investor.</p>
              <GoogleBtn onClick={handleGoogle} loading={loading}/>
              <Divider/>
              <Alert msg={error} type="error"/>
              <Alert msg={success} type="success"/>
              <Field label="Email"    type="email"    value={email}    onChange={e=>setEmail(e.target.value)}    placeholder="you@example.com"/>
              <Field label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/>
              <div style={{ textAlign:"right", marginTop:-8, marginBottom:16 }}>
                <span onClick={handleForgot} style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", color:T.muted2, cursor:"pointer" }}>
                  Forgot password?
                </span>
              </div>
              <PrimaryBtn label="Login 💨" onClick={handleLogin}/>
              <p style={{ textAlign:"center", marginTop:16, fontSize:"0.8rem", color:T.muted2 }}>
                Don't have an account?{" "}
                <span onClick={()=>{ setMode("signup"); reset(); }} style={{ color:T.green, cursor:"pointer", fontWeight:600 }}>Sign up</span>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Fart Particle ────────────────────────────────────────────────────────────
function Particle({ onDone }) {
  const items = ["💨","💨","💨","🌿","⚡","✨","💚"];
  const item  = items[Math.floor(Math.random()*items.length)];
  const x     = 20 + Math.random()*60;
  const dur   = 900 + Math.random()*400;
  useEffect(()=>{ const t=setTimeout(onDone,dur+100); return()=>clearTimeout(t); },[]);
  return (
    <div style={{
      position:"absolute", left:`${x}%`, bottom:"55%",
      fontSize:`${1.1+Math.random()*0.7}rem`,
      animation:`particleRise ${dur}ms ease-out forwards`,
      pointerEvents:"none", zIndex:30,
    }}>{item}</div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ onBack }) {
  const [rows,    setRows]  = useState([]);
  const [loading, setLd]   = useState(true);

  useEffect(()=>{
    supabase.from("leaderboard").select("*").then(({data,error})=>{
      if(!error) setRows(data??[]);
      setLd(false);
    });
  },[]);

  const total = rows.reduce((s,r)=>s+Number(r.total),0);
  const today = rows.reduce((s,r)=>s+Number(r.today),0);
  const week  = rows.reduce((s,r)=>s+Number(r.this_week),0);
  const month = rows.reduce((s,r)=>s+Number(r.this_month),0);

  return (
    <div style={{ minHeight:"100dvh", background:T.bg, fontFamily:"'DM Sans',sans-serif", color:T.text, position:"relative" }}>
      <GlobalStyles/>
      <div style={{ position:"fixed", inset:0, background:`radial-gradient(ellipse 600px 400px at 50% -100px, rgba(74,222,128,0.05) 0%, transparent 70%)`, pointerEvents:"none" }}/>
      <div style={{ maxWidth:390, margin:"0 auto", padding:"20px 16px 48px", position:"relative", zIndex:1 }}>

        <button onClick={onBack} style={{
          background:T.bg3, border:`1px solid ${T.border}`, color:T.muted2,
          borderRadius:20, padding:"7px 16px", cursor:"pointer", fontWeight:600,
          fontFamily:"'DM Sans',sans-serif", marginBottom:20, fontSize:"0.82rem",
        }}>← Portfolio</button>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:2 }}>
          <Logo size={26}/>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:2 }}>Board of Directors</div>
        </div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted, marginBottom:20 }}>
          Global Emissions Intelligence · Confidential
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
          {[{l:"Today",v:today,c:T.gold},{l:"Week",v:week,c:T.green},{l:"Month",v:month,c:"#c084fc"},{l:"All",v:total,c:T.lime}].map(s=>(
            <div key={s.l} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"11px 6px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:s.c, lineHeight:1 }}>{s.v}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:1, textTransform:"uppercase", color:T.muted, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"12px", marginBottom:20, display:"flex" }}>
          {[{l:"Investors",v:rows.length},{l:"Avg/Investor",v:rows.length?(total/rows.length).toFixed(1):0},{l:"Peak Today",v:Math.max(0,...rows.map(r=>Number(r.today)))}].map((s,i)=>(
            <div key={s.l} style={{ flex:1, textAlign:"center", borderRight:i<2?`1px solid ${T.border}`:"none" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:T.green, lineHeight:1 }}>{s.v}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:1, textTransform:"uppercase", color:T.muted, marginTop:3, lineHeight:1.4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted, marginBottom:10 }}>Top Performers</div>

        {loading ? (
          <div style={{ textAlign:"center", color:T.muted, padding:40 }}>Auditing the books… 📚</div>
        ) : rows.length===0 ? (
          <div style={{ textAlign:"center", color:T.muted, padding:30 }}>No assets tracked yet 🦗</div>
        ) : rows.map((u,i)=>{
          const n=Number(u.total), p=pct(n,total), medals=["🥇","🥈","🥉"], rank=getRank(n);
          return (
            <div key={u.user_id} style={{
              background:i===0?"rgba(74,222,128,0.05)":T.card,
              border:`1px solid ${i===0?"rgba(74,222,128,0.25)":T.border}`,
              borderRadius:14, padding:"11px 14px", marginBottom:8,
              display:"flex", alignItems:"center", gap:12,
            }}>
              {u.avatar_url
                ? <img src={u.avatar_url} alt="" style={{ width:34,height:34,borderRadius:"50%",border:`1px solid ${T.border}` }}/>
                : <div style={{ fontSize:"1.2rem", minWidth:24 }}>{medals[i]||`#${i+1}`}</div>
              }
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:"0.9rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.display_name}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.62rem", color:T.muted, marginTop:2 }}>{rank.emoji} {rank.title} · {p}% market share</div>
                <div style={{ marginTop:5, background:T.bg3, borderRadius:99, height:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${p}%`, background:i===0?T.green:T.muted2, borderRadius:99, transition:"width 1s ease" }}/>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:i===0?T.green:T.text, lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", color:T.muted }}>+{u.today} today</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function MainApp({ user, profile }) {
  const [logs,      setLogs]      = useState([]);
  const [particles, setParticles] = useState([]);
  const [joke,      setJoke]      = useState(JOKES[0]);
  const [pressed,   setPressed]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [showAdmin, setAdmin]     = useState(false);
  const [globalData,setGlobal]    = useState({ total:0, today:0, users:0 });
  const jokeIdx = useRef(0);
  const pId     = useRef(0);

  // Admin check: show button if ADMIN_EMAILS is empty (dev mode) OR email matches
  const isAdmin = ADMIN_EMAILS.length===0 || ADMIN_EMAILS.includes(user.email);

  useEffect(()=>{
    async function load() {
      const [{data:myFarts},{data:lb}] = await Promise.all([
        supabase.from("farts").select("created_at").eq("user_id",user.id).order("created_at"),
        supabase.from("leaderboard").select("total,today"),
      ]);
      setLogs((myFarts??[]).map(r=>r.created_at));
      const t=(lb??[]).reduce((acc,r)=>({total:acc.total+Number(r.total),today:acc.today+Number(r.today)}),{total:0,today:0});
      setGlobal({...t,users:(lb??[]).length});
      setLoading(false);
    }
    load();
  },[user.id]);

  async function refreshGlobal() {
    const {data:lb}=await supabase.from("leaderboard").select("total,today");
    const t=(lb??[]).reduce((acc,r)=>({total:acc.total+Number(r.total),today:acc.today+Number(r.today)}),{total:0,today:0});
    setGlobal({...t,users:(lb??[]).length});
  }

  async function handleRip() {
    if(pressed) return;
    setPressed(true);
    setTimeout(()=>setPressed(false),180);
    new Audio("https://www.myinstants.com/media/sounds/fast-fart.mp3").play().catch(()=>{});
    const id=++pId.current;
    setParticles(p=>[...p,id]);
    jokeIdx.current=(jokeIdx.current+1)%JOKES.length;
    setJoke(JOKES[jokeIdx.current]);
    const ts=new Date().toISOString();
    setLogs(prev=>[...prev,ts]);
    const {error}=await supabase.from("farts").insert({user_id:user.id});
    if(error){ console.error(error); setLogs(prev=>prev.filter(t=>t!==ts)); }
    else await refreshGlobal();
  }

  if(showAdmin) return <AdminDashboard onBack={()=>setAdmin(false)}/>;

  const todayCnt=countSince(logs,"day"), weekCnt=countSince(logs,"week");
  const monthCnt=countSince(logs,"month"), allTime=logs.length;
  const rank=getRank(allTime), myPct=pct(allTime,globalData.total), todayPct=pct(todayCnt,globalData.today);

  const weekBuckets=Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i)); d.setHours(0,0,0,0);
    const e=new Date(d); e.setHours(23,59,59,999);
    return logs.filter(t=>{const ts=new Date(t);return ts>=d&&ts<=e;}).length;
  });
  const dayLabels=["Su","Mo","Tu","We","Th","Fr","Sa"];
  const labels=Array.from({length:7},(_,i)=>dayLabels[(new Date().getDay()-6+i+7)%7]);

  const displayName=profile?.display_name??user.email?.split("@")[0]??"Investor";
  const hour=new Date().getHours();
  let contextNote="tap to log · smart context on";
  if(hour>=19&&hour<=21) contextNote="🕗 peak emission hour detected";
  else if(hour>=12&&hour<=14) contextNote="🍽️ post-lunch window · go for it";
  else if(hour>=6&&hour<=9)  contextNote="☕ morning routine detected";

  return (
    <div style={{ minHeight:"100dvh", background:T.bg, fontFamily:"'DM Sans',sans-serif", color:T.text, position:"relative" }}>
      <GlobalStyles/>
      <div style={{ position:"fixed", inset:0, background:`radial-gradient(ellipse 600px 400px at 50% -100px, rgba(74,222,128,0.06) 0%, transparent 70%)`, pointerEvents:"none" }}/>

      <div style={{ maxWidth:390, margin:"0 auto", minHeight:"100dvh", display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>

        {/* Status bar */}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 24px 6px", fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:600, opacity:0.6 }}>
          <span>{new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
          <span>💨 {allTime}</span>
        </div>

        {/* Header */}
        <div style={{ padding:"4px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <BrandRow/>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {profile?.avatar_url && <img src={profile.avatar_url} alt="" style={{ width:30,height:30,borderRadius:"50%",border:`1.5px solid ${T.border}` }}/>}
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"0.75rem", fontWeight:600 }}>{displayName}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:rank.color, letterSpacing:0.5 }}>{rank.emoji} {rank.title}</div>
              <button onClick={()=>supabase.auth.signOut()} style={{ background:"transparent", border:"none", color:T.muted, fontSize:"0.62rem", cursor:"pointer", padding:0, fontFamily:"inherit" }}>sign out</button>
            </div>
          </div>
        </div>

        {/* Insight banner */}
        <div style={{
          margin:"10px 16px 0",
          background:`linear-gradient(135deg,rgba(74,222,128,0.08),rgba(163,230,53,0.05))`,
          border:`1px solid rgba(74,222,128,0.2)`, borderRadius:14, padding:"11px 14px",
          display:"flex", alignItems:"flex-start", gap:10, animation:"slideIn 0.5s ease 0.2s both",
        }}>
          <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>📡</span>
          <div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.green, marginBottom:2 }}>Analyst Note</div>
            <div style={{ fontSize:"0.78rem", color:T.text, lineHeight:1.4, fontWeight:300 }}>
              {loading ? "Compiling emissions report…" : joke}
            </div>
          </div>
        </div>

        {/* 4 stat tiles */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, padding:"10px 16px" }}>
          {[
            { label:"Today", val:todayCnt, sub:globalData.today>0?`${todayPct}%`:null },
            { label:"Week",  val:weekCnt },
            { label:"Month", val:monthCnt },
            { label:"All",   val:allTime },
          ].map((s,i)=>(
            <div key={s.label} style={{
              background:T.card, border:`1px solid ${i===0?"rgba(74,222,128,0.2)":T.border}`,
              borderRadius:14, padding:"11px 6px 9px", textAlign:"center",
              position:"relative", overflow:"hidden",
            }}>
              <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 50% 0%, rgba(74,222,128,0.08), transparent 70%)`, opacity:i===0?1:0 }}/>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:1.5, textTransform:"uppercase", color:T.muted, marginBottom:3 }}>{s.label}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:T.green, letterSpacing:1, lineHeight:1 }}>{s.val}</div>
              {s.sub && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:T.muted2, marginTop:2 }}>{s.sub} mkt</div>}
            </div>
          ))}
        </div>

        {/* Big log button */}
        <div style={{ padding:"6px 16px 0", display:"flex", justifyContent:"center" }}>
          <div style={{ position:"relative", width:"100%", height:188, display:"flex", justifyContent:"center" }}>
            {pressed&&[0,1].map(i=>(
              <div key={i} style={{
                position:"absolute", top:"50%", left:"50%",
                width:158,height:158,marginLeft:-79,marginTop:-79,
                borderRadius:"50%", border:`1.5px solid ${T.green}`,
                animation:`rippleOut 0.6s ease-out ${i*0.12}s forwards`, pointerEvents:"none",
              }}/>
            ))}
            {particles.map(id=><Particle key={id} onDone={()=>setParticles(p=>p.filter(x=>x!==id))}/>)}
            <button
              className="log-btn"
              onClick={handleRip}
              disabled={loading}
              style={{
                position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
                width:158, height:158, borderRadius:"50%",
                background:pressed
                  ? `linear-gradient(145deg,rgba(74,222,128,0.12),rgba(163,230,53,0.06))`
                  : `linear-gradient(145deg,rgba(74,222,128,0.18),rgba(163,230,53,0.1))`,
                border:`2px solid ${pressed?"rgba(74,222,128,0.4)":"rgba(74,222,128,0.3)"}`,
                boxShadow:pressed?`0 0 24px rgba(74,222,128,0.12)`:`0 0 40px rgba(74,222,128,0.18), inset 0 1px 0 rgba(255,255,255,0.05)`,
                cursor:loading?"default":"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                animation:!pressed?"pulse 2.5s ease-in-out infinite":"none",
                transition:"all 0.15s",
              }}
            >
              <span style={{ fontSize:"2.8rem", lineHeight:1 }}>💨</span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:2, color:T.green, marginTop:6 }}>LOG EMISSION</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.55rem", color:T.muted, marginTop:3, textAlign:"center", padding:"0 12px", lineHeight:1.4 }}>{contextNote}</span>
            </button>
          </div>
        </div>

        {/* Market share */}
        <div style={{ margin:"8px 16px", background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"13px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:2, textTransform:"uppercase", color:T.muted, marginBottom:3 }}>Total Assets</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:T.text, lineHeight:1, letterSpacing:-0.5 }}>{allTime}</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:T.muted, marginTop:3 }}>{globalData.users} investors · {globalData.total} total</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:2, textTransform:"uppercase", color:T.muted, marginBottom:3 }}>Market Share</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, color:T.green, lineHeight:1 }}>{myPct}%</div>
            </div>
          </div>
          <div style={{ background:T.bg3, borderRadius:99, height:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${myPct}%`, background:`linear-gradient(90deg,${T.green},${T.lime})`, borderRadius:99, transition:"width 1s ease", minWidth:allTime>0?4:0 }}/>
          </div>
        </div>

        {/* 7-day chart */}
        <div style={{ margin:"0 16px", background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"13px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.muted }}>7-Day Emissions</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:T.muted }}>Total: {weekBuckets.reduce((a,b)=>a+b,0)}</div>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:66 }}>
            {weekBuckets.map((v,i)=>{
              const maxV=Math.max(...weekBuckets,1), h=Math.max((v/maxV)*54,v>0?5:2), isToday=i===6;
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.58rem", color:isToday?T.green:T.muted }}>{v||""}</div>
                  <div style={{
                    width:"100%", height:h,
                    background:isToday?`linear-gradient(180deg,${T.green},#22c55e)`:`linear-gradient(180deg,rgba(74,222,128,0.3),rgba(74,222,128,0.12))`,
                    borderRadius:"3px 3px 2px 2px", transition:"height 0.6s ease",
                  }}/>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.55rem", color:isToday?T.green:T.muted }}>{labels[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin button — only for admins */}
        {isAdmin && (
          <div style={{ margin:"10px 16px 32px" }}>
            <button onClick={()=>setAdmin(true)} style={{
              width:"100%", padding:"10px",
              background:`rgba(74,222,128,0.05)`,
              border:`1px solid rgba(74,222,128,0.15)`,
              borderRadius:12, cursor:"pointer",
              fontFamily:"'DM Mono',monospace", fontSize:"0.72rem",
              letterSpacing:1, textTransform:"uppercase", color:T.muted2,
              transition:"all 0.2s",
            }}>📊 Board of Directors</button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setSession(session));
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session?.user){ setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id",session.user.id).single().then(({data})=>setProfile(data));
  },[session?.user?.id]);

  if(session===undefined) return (
    <div style={{ minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,color:T.muted,fontFamily:"'DM Mono',monospace",fontSize:"0.85rem",letterSpacing:1 }}>
      Loading portfolio… 💨
    </div>
  );

  if(!session) return <AuthScreen/>;
  return <MainApp user={session.user} profile={profile}/>;
}