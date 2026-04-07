import { useState, useEffect, useRef, useCallback } from "react";

// ─── Brand & Theme ────────────────────────────────────────────────────────────
const C = {
  navy:    "#1B2B4B",
  navy2:   "#243554",
  navy3:   "#2E4268",
  navy4:   "#1a2438",
  green:   "#3DBE6C",
  greenD:  "#2EA05A",
  greenL:  "#5DD485",
  teal:    "#2CB5A0",
  white:   "#FFFFFF",
  offWhite:"#F0F4F8",
  gray:    "#8A9BB8",
  grayL:   "#C8D4E8",
  red:     "#E05C6E",
  gold:    "#F0B429",
};

const JOKES = [
  "Past performance is no guarantee of future emissions. 📉",
  "Our analysts predict rising gas prices. 📊",
  "Diversify your gas portfolio. Don't put all your toots in one basket. 🧺",
  "Buy the dip. Rip the… well, you know. 💹",
  "Maximizing shareholder value, one toot at a time. 🏦",
  "Some assets are best held silently. 🤫",
  "ESG Rating: Environmental, Social, and Gaseous. ♻️",
  "Risk tolerance: can you handle the smell? 👃",
  "Your gut is always right. Just like the market. 📈",
  "Alternative energy generation. We're saving the planet. 🌍",
  "Q3 earnings are looking particularly… fragrant. 💼",
  "Liquid assets? We prefer gaseous ones. 💨",
  "Our ROI: Return On Intestines. 🏆",
  "The invisible hand of the market. Also invisible. Also smelly. 🫧",
  "Short selling? Never. We only go long. And loud. 🔊",
];

const RANKS = [
  { min: 0,   title: "Junior Analyst 📋",        color: C.teal },
  { min: 5,   title: "Asset Manager 💼",          color: C.green },
  { min: 15,  title: "Senior Trader 📈",          color: C.gold },
  { min: 30,  title: "Portfolio Director 🎯",     color: "#C084FC" },
  { min: 50,  title: "VP of Emissions 🏢",        color: C.red },
  { min: 75,  title: "Chief Gas Officer 🦨",       color: "#FB923C" },
  { min: 100, title: "Grand Poobah CFO 💩",       color: C.gold },
];

function getRank(n) { return [...RANKS].reverse().find(r => n >= r.min) ?? RANKS[0]; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sinceISO(unit) {
  const d = new Date();
  if (unit === "day")   d.setHours(0,0,0,0);
  if (unit === "week")  { d.setDate(d.getDate()-d.getDay()); d.setHours(0,0,0,0); }
  if (unit === "month") { d.setDate(1); d.setHours(0,0,0,0); }
  return d.toISOString();
}
function countSince(logs, unit) {
  const s = sinceISO(unit);
  return logs.filter(t => t >= s).length;
}
function genId() { return "u_" + Math.random().toString(36).slice(2,10); }
function pct(a,b) { return b > 0 ? Math.round((a/b)*100) : 0; }

// ─── SVG Logo ─────────────────────────────────────────────────────────────────
function FartfolioLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Bars */}
      <rect x="6"  y="52" width="14" height="20" rx="3" fill={C.greenD} />
      <rect x="24" y="38" width="14" height="34" rx="3" fill={C.green} />
      <rect x="42" y="24" width="14" height="48" rx="3" fill={C.greenL} />
      {/* Ground line */}
      <rect x="4" y="72" width="56" height="3" rx="1.5" fill={C.teal} opacity="0.5"/>
      {/* Cloud */}
      <ellipse cx="58" cy="18" rx="10" ry="8" fill="white" opacity="0.95"/>
      <ellipse cx="50" cy="22" rx="8"  ry="6" fill="white" opacity="0.95"/>
      <ellipse cx="66" cy="22" rx="7"  ry="5" fill="white" opacity="0.9"/>
      <ellipse cx="58" cy="26" rx="9"  ry="6" fill="white" opacity="0.95"/>
      {/* Squiggle from top bar to cloud */}
      <path d="M49 24 Q47 18 50 14" stroke={C.teal} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  );
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ logs, days = 7, color = C.green }) {
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days-1-i)); d.setHours(0,0,0,0);
    const e = new Date(d); e.setHours(23,59,59,999);
    return logs.filter(t => { const ts = new Date(t); return ts >= d && ts <= e; }).length;
  });
  const max = Math.max(...buckets, 1);
  const W = 80, H = 28, pad = 2;
  const pts = buckets.map((v,i) => {
    const x = pad + (i / (days-1)) * (W - pad*2);
    const y = H - pad - ((v/max) * (H - pad*2));
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {buckets.map((v,i) => {
        const x = pad + (i / (days-1)) * (W - pad*2);
        const y = H - pad - ((v/max) * (H - pad*2));
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color}/>;
      })}
    </svg>
  );
}

// ─── Fart Particle ────────────────────────────────────────────────────────────
function Particle({ onDone }) {
  const items = ["💨","🌬️","☁️","💭","📈","🫧","💹"];
  const item  = items[Math.floor(Math.random()*items.length)];
  const x     = 20 + Math.random()*60;
  const dur   = 900 + Math.random()*400;
  useEffect(() => { const t = setTimeout(onDone, dur+100); return ()=>clearTimeout(t); }, []);
  return (
    <div style={{
      position:"absolute", left:`${x}%`, bottom:"55%",
      fontSize:`${1.2+Math.random()*0.8}rem`,
      animation:`particleRise ${dur}ms ease-out forwards`,
      pointerEvents:"none", zIndex:30,
    }}>{item}</div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, trend, color = C.green, emoji }) {
  const up = trend >= 0;
  return (
    <div style={{
      background: C.navy2,
      border: `1px solid ${C.navy3}`,
      borderRadius: 16,
      padding: "14px 12px",
      flex: 1, minWidth: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position:"absolute", top:0, right:0, width:60, height:60,
        background:`radial-gradient(circle at top right, ${color}22, transparent 70%)` }}/>
      <div style={{ fontSize:"0.7rem", fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>
        {emoji && <span style={{marginRight:4}}>{emoji}</span>}{label}
      </div>
      <div style={{ fontSize:"2rem", fontWeight:800, color:C.white, lineHeight:1, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:"0.65rem", color:C.gray, marginTop:3 }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ fontSize:"0.7rem", fontWeight:700, color: up ? C.green : C.red, marginTop:4 }}>
          {up ? "▲" : "▼"} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onDone }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim() || busy) return;
    setBusy(true);
    const userId = genId();
    const profile = { userId, name: name.trim(), joined: new Date().toISOString() };
    await window.storage.set("ff:profile", JSON.stringify(profile));
    await window.storage.set(`ff:user:${userId}`, JSON.stringify({ name:name.trim(), logs:[] }), true);
    onDone(profile);
  }

  return (
    <div style={{
      minHeight:"100dvh", background:C.navy4,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:24, fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');`}</style>

      <div style={{ width:"100%", maxWidth:380 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8, justifyContent:"center" }}>
          <FartfolioLogo size={56}/>
          <div>
            <div style={{ fontWeight:900, fontSize:"2.4rem", color:C.white, lineHeight:1, letterSpacing:-1 }}>
              <span style={{ color:C.white }}>Fart</span><span style={{ color:C.green }}>folio</span>
            </div>
            <div style={{ fontSize:"0.8rem", color:C.gray, fontWeight:600 }}>Track your assets.</div>
          </div>
        </div>

        <div style={{ background:C.navy2, border:`1px solid ${C.navy3}`, borderRadius:24, padding:32, marginTop:32 }}>
          <div style={{ fontSize:"1.1rem", fontWeight:800, color:C.white, marginBottom:6 }}>
            Open your account 💼
          </div>
          <div style={{ fontSize:"0.82rem", color:C.gray, marginBottom:24 }}>
            Join thousands of serious investors tracking their most volatile assets.
          </div>
          <label style={{ fontSize:"0.75rem", fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:8 }}>
            Investor Name
          </label>
          <input
            value={name} onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            placeholder="e.g. Warren Buffart..."
            maxLength={24}
            style={{
              width:"100%", boxSizing:"border-box",
              padding:"12px 16px", borderRadius:12,
              border:`1.5px solid ${name.trim() ? C.green : C.navy3}`,
              background:C.navy3, color:C.white,
              fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:"1rem",
              outline:"none", transition:"border-color 0.2s",
            }}
          />
          <button
            onClick={submit} disabled={!name.trim()||busy}
            style={{
              marginTop:16, width:"100%", padding:"14px",
              background: name.trim() ? `linear-gradient(135deg,${C.green},${C.greenD})` : C.navy3,
              color: name.trim() ? C.navy : C.gray,
              fontWeight:800, fontSize:"0.95rem", borderRadius:12,
              border:"none", cursor: name.trim() ? "pointer" : "default",
              transition:"all 0.2s", letterSpacing:0.5,
            }}
          >{busy ? "Opening account…" : "START INVESTING 🚀"}</button>
        </div>

        <div style={{ textAlign:"center", marginTop:20, fontSize:"0.72rem", color:C.navy3 }}>
          Admin access: password <code style={{color:C.gray}}>SBD1234</code>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ onBack }) {
  const [rows, setRows]   = useState([]);
  const [loading, setLd]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.list("ff:user:", true);
        const all = await Promise.all((res?.keys||[]).map(async k=>{
          try { const r=await window.storage.get(k,true); return r?JSON.parse(r.value):null; }
          catch{ return null; }
        }));
        setRows(all.filter(Boolean).sort((a,b)=>(b.logs?.length||0)-(a.logs?.length||0)));
      } catch{}
      setLd(false);
    })();
  }, []);

  const total  = rows.reduce((s,r)=>s+(r.logs?.length||0),0);
  const today  = rows.reduce((s,r)=>s+countSince(r.logs||[],"day"),0);
  const week   = rows.reduce((s,r)=>s+countSince(r.logs||[],"week"),0);
  const month  = rows.reduce((s,r)=>s+countSince(r.logs||[],"month"),0);

  return (
    <div style={{ minHeight:"100dvh", background:C.navy4, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"20px 16px 48px" }}>
      <div style={{ maxWidth:480, margin:"0 auto" }}>
        <button onClick={onBack} style={{
          background:"transparent", border:`1px solid ${C.navy3}`, color:C.gray,
          borderRadius:10, padding:"6px 16px", cursor:"pointer", fontWeight:700,
          fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:20, fontSize:"0.85rem",
        }}>← Portfolio</button>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <FartfolioLogo size={32}/>
          <div style={{ fontWeight:900, fontSize:"1.8rem", color:C.white, letterSpacing:-0.5 }}>
            <span>Fart</span><span style={{color:C.green}}>folio</span>
            <span style={{ fontSize:"0.85rem", color:C.gray, fontWeight:600, marginLeft:10 }}>Board of Directors</span>
          </div>
        </div>
        <div style={{ fontSize:"0.78rem", color:C.gray, marginBottom:24 }}>Global Emissions Intelligence · Confidential</div>

        {loading ? (
          <div style={{ textAlign:"center", color:C.gray, padding:40 }}>Auditing the books… 📚</div>
        ) : <>
          {/* Global KPIs */}
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <StatCard label="Today"    value={today} emoji="☀️" color={C.gold}/>
            <StatCard label="Week"     value={week}  emoji="📅" color={C.teal}/>
            <StatCard label="Month"    value={month} emoji="🗓️" color="#C084FC"/>
            <StatCard label="All Time" value={total} emoji="🏆" color={C.green}/>
          </div>

          {/* Summary */}
          <div style={{
            background:C.navy2, border:`1px solid ${C.navy3}`, borderRadius:16,
            padding:"14px 18px", marginBottom:20, display:"flex", gap:16,
          }}>
            {[
              { label:"Investors",    val: rows.length },
              { label:"Avg / Investor", val: rows.length ? (total/rows.length).toFixed(1) : 0 },
              { label:"Peak Today",  val: Math.max(0,...rows.map(r=>countSince(r.logs||[],"day"))) },
            ].map(s=>(
              <div key={s.label} style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontWeight:800, fontSize:"1.6rem", color:C.green }}>{s.val}</div>
                <div style={{ fontSize:"0.68rem", color:C.gray, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div style={{ fontSize:"0.75rem", fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>
            📊 Top Performers
          </div>
          {rows.length === 0
            ? <div style={{ color:C.gray, textAlign:"center", padding:30 }}>No assets tracked yet 🦗</div>
            : rows.map((u,i)=>{
              const n = u.logs?.length||0;
              const p = pct(n, total);
              const medals = ["🥇","🥈","🥉"];
              const rank = getRank(n);
              return (
                <div key={u.name+i} style={{
                  background: i===0 ? `${C.green}18` : C.navy2,
                  border:`1px solid ${i===0 ? C.green+"44" : C.navy3}`,
                  borderRadius:14, padding:"12px 14px", marginBottom:8,
                  display:"flex", alignItems:"center", gap:12,
                }}>
                  <div style={{ fontSize:"1.3rem", minWidth:28 }}>{medals[i]||`#${i+1}`}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, color:C.white, fontSize:"0.95rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</div>
                    <div style={{ fontSize:"0.68rem", color:C.gray, marginTop:2 }}>{rank.title} · {p}% of global emissions</div>
                    <div style={{ marginTop:6, background:C.navy3, borderRadius:99, height:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${p}%`, background:i===0?C.green:C.teal, borderRadius:99, transition:"width 1s ease" }}/>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:800, fontSize:"1.6rem", color: i===0 ? C.green : C.white }}>{n}</div>
                    <div style={{ fontSize:"0.65rem", color:C.gray }}>today: {countSince(u.logs||[],"day")}</div>
                  </div>
                </div>
              );
            })
          }
        </>}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function MainApp({ profile, onLogout }) {
  const [logs,       setLogs]      = useState([]);
  const [particles,  setParticles] = useState([]);
  const [joke,       setJoke]      = useState(JOKES[0]);
  const [pressed,    setPressed]   = useState(false);
  const [loading,    setLoading]   = useState(true);
  const [showAdmin,  setAdmin]     = useState(false);
  const [adminPwd,   setAdminPwd]  = useState("");
  const [adminErr,   setAdminErr]  = useState(false);
  const [globalData, setGlobal]    = useState({ total:0, today:0, users:0 });
  const [tab,        setTab]       = useState("dashboard"); // dashboard | history
  const jokeIdx = useRef(0);
  const pId     = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("ff:logs");
        const saved = r ? JSON.parse(r.value) : [];
        setLogs(saved);
        await loadGlobal();
      } catch{}
      setLoading(false);
    })();
  }, []);

  async function syncShared(l) {
    try { await window.storage.set(`ff:user:${profile.userId}`,JSON.stringify({name:profile.name,logs:l}),true); }
    catch{}
  }

  async function loadGlobal() {
    try {
      const res = await window.storage.list("ff:user:", true);
      let total=0, today=0;
      for (const k of (res?.keys||[])) {
        try {
          const r = await window.storage.get(k,true);
          if(r) {
            const d = JSON.parse(r.value);
            total += d.logs?.length||0;
            today += countSince(d.logs||[],"day");
          }
        } catch{}
      }
      setGlobal({ total, today, users:(res?.keys||[]).length });
    } catch{}
  }

  async function handleRip() {
    if (pressed) return;
    setPressed(true);
    setTimeout(()=>setPressed(false), 180);

    const id = ++pId.current;
    setParticles(p=>[...p,id]);
    jokeIdx.current = (jokeIdx.current+1) % JOKES.length;
    setJoke(JOKES[jokeIdx.current]);

    const ts = new Date().toISOString();
    const newLogs = [...logs, ts];
    setLogs(newLogs);
    try {
      await window.storage.set("ff:logs", JSON.stringify(newLogs));
      await syncShared(newLogs);
      await loadGlobal();
    } catch(e){ console.error(e); }
  }

  function tryAdmin() {
    if (adminPwd === "SBD1234") { setAdmin(true); setAdminPwd(""); }
    else { setAdminErr(true); setTimeout(()=>setAdminErr(false),1200); }
  }

  if (showAdmin) return <AdminDashboard onBack={()=>setAdmin(false)}/>;

  const todayCnt  = countSince(logs,"day");
  const weekCnt   = countSince(logs,"week");
  const monthCnt  = countSince(logs,"month");
  const allTime   = logs.length;
  const rank      = getRank(allTime);
  const myPct     = pct(allTime, globalData.total);
  const todayPct  = pct(todayCnt, globalData.today);

  // Last 7 days for chart
  const weekBuckets = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i)); d.setHours(0,0,0,0);
    const e=new Date(d); e.setHours(23,59,59,999);
    return logs.filter(t=>{const ts=new Date(t);return ts>=d&&ts<=e;}).length;
  });
  const dayLabels = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const todayDow  = new Date().getDay();
  const labels    = Array.from({length:7},(_,i)=>dayLabels[(todayDow-6+i+7)%7]);

  return (
    <div style={{ minHeight:"100dvh", background:C.navy4, fontFamily:"'Plus Jakarta Sans',sans-serif", color:C.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        @keyframes particleRise {
          0%   { opacity:1; transform:translateY(0) scale(1); }
          100% { opacity:0; transform:translateY(-110px) scale(1.5); }
        }
        @keyframes rippleOut {
          0%   { transform:scale(0.8); opacity:0.7; }
          100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes shake {
          0%,100%{ transform:translateX(0); }
          25%    { transform:translateX(-5px); }
          75%    { transform:translateX(5px); }
        }
        @keyframes pulse {
          0%,100%{ box-shadow:0 0 0 0 ${C.green}55; }
          50%    { box-shadow:0 0 0 16px ${C.green}00; }
        }
        .rip-btn { transition: transform 0.12s, box-shadow 0.12s; }
        .rip-btn:active { transform: scale(0.94) !important; }
      `}</style>

      <div style={{ maxWidth:440, margin:"0 auto", padding:"16px 16px 80px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <FartfolioLogo size={36}/>
            <div>
              <div style={{ fontWeight:900, fontSize:"1.5rem", lineHeight:1, letterSpacing:-0.5 }}>
                Fart<span style={{color:C.green}}>folio</span>
              </div>
              <div style={{ fontSize:"0.65rem", color:C.gray, fontWeight:600 }}>Track your assets.</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{
              display:"inline-block",
              background:`${rank.color}22`, border:`1px solid ${rank.color}55`,
              borderRadius:99, padding:"3px 10px",
              fontSize:"0.68rem", fontWeight:700, color:rank.color, marginBottom:2,
            }}>{rank.title}</div>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:C.white }}>{profile.name}</div>
            <button onClick={onLogout} style={{
              background:"transparent", border:"none", color:C.gray,
              fontSize:"0.65rem", cursor:"pointer", padding:0, fontFamily:"inherit",
            }}>sign out</button>
          </div>
        </div>

        {/* ── Ticker Joke ── */}
        <div style={{
          background:C.navy2, borderRadius:10, padding:"8px 14px",
          marginBottom:16, display:"flex", alignItems:"center", gap:8,
          border:`1px solid ${C.navy3}`, overflow:"hidden",
        }}>
          <span style={{ fontSize:"0.7rem", fontWeight:800, color:C.green, whiteSpace:"nowrap" }}>📡 ANALYST NOTE</span>
          <span style={{ fontSize:"0.75rem", color:C.grayL, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {loading ? "Compiling emissions report…" : joke}
          </span>
        </div>

        {/* ── BIG RIP BUTTON ── */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20, position:"relative", height:230 }}>
          {/* ripple rings */}
          {pressed && [0,1].map(i=>(
            <div key={i} style={{
              position:"absolute", top:"50%", left:"50%",
              width:170, height:170, marginLeft:-85, marginTop:-85,
              borderRadius:"50%", border:`2px solid ${C.green}`,
              animation:`rippleOut 0.65s ease-out ${i*0.12}s forwards`,
              pointerEvents:"none",
            }}/>
          ))}
          {/* particles */}
          {particles.map(id=>(
            <Particle key={id} onDone={()=>setParticles(p=>p.filter(x=>x!==id))}/>
          ))}
          {/* button */}
          <button
            className="rip-btn"
            onClick={handleRip}
            disabled={loading}
            style={{
              position:"absolute", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              width:170, height:170, borderRadius:"50%",
              background: pressed
                ? `linear-gradient(145deg,${C.greenD},${C.navy3})`
                : `linear-gradient(145deg,${C.green},${C.greenD})`,
              border:`3px solid ${pressed ? C.greenD : C.green}`,
              boxShadow: pressed
                ? `0 4px 12px ${C.green}44`
                : `0 8px 32px ${C.green}55, 0 0 0 0 ${C.green}33`,
              cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              animation: !pressed ? "pulse 2.5s ease-in-out infinite" : "none",
            }}
          >
            <span style={{ fontSize:"3.2rem", lineHeight:1 }}>💨</span>
            <span style={{
              fontWeight:900, fontSize:"0.95rem", letterSpacing:1.5,
              color:C.navy, marginTop:6, textTransform:"uppercase",
            }}>RIP IT</span>
            <span style={{ fontSize:"0.65rem", color:`${C.navy}99`, fontWeight:700, marginTop:2 }}>
              EXECUTE ORDER
            </span>
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <StatCard label="Today"  value={todayCnt} emoji="☀️" color={C.gold}
            sub={globalData.today>0?`${todayPct}% of mkt`:undefined}/>
          <StatCard label="Week"   value={weekCnt}  emoji="📅" color={C.teal}/>
          <StatCard label="Month"  value={monthCnt} emoji="🗓️" color="#C084FC"/>
        </div>

        {/* ── All-time portfolio ── */}
        <div style={{
          background:C.navy2, border:`1px solid ${C.navy3}`,
          borderRadius:16, padding:"16px", marginBottom:12,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:"0.7rem", fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>
                Total Assets
              </div>
              <div style={{ fontWeight:900, fontSize:"2.8rem", color:C.white, lineHeight:1, letterSpacing:-1 }}>
                {allTime}
              </div>
              <div style={{ fontSize:"0.72rem", color:C.gray, marginTop:4 }}>
                {globalData.users} investors · {globalData.total} total market
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"0.7rem", fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>
                Market Share
              </div>
              <div style={{ fontWeight:900, fontSize:"2rem", color:C.green, lineHeight:1 }}>
                {myPct}%
              </div>
              <Sparkline logs={logs} color={C.green}/>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ background:C.navy3, borderRadius:99, height:6, overflow:"hidden" }}>
            <div style={{
              height:"100%", width:`${myPct}%`,
              background:`linear-gradient(90deg,${C.teal},${C.green})`,
              borderRadius:99, transition:"width 1s ease",
              minWidth: allTime>0 ? 6 : 0,
            }}/>
          </div>
        </div>

        {/* ── 7-Day Bar Chart ── */}
        <div style={{
          background:C.navy2, border:`1px solid ${C.navy3}`,
          borderRadius:16, padding:"16px", marginBottom:12,
        }}>
          <div style={{ fontSize:"0.7rem", fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>
            📊 7-Day Emissions Report
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:70 }}>
            {weekBuckets.map((v,i)=>{
              const maxV = Math.max(...weekBuckets,1);
              const h    = Math.max((v/maxV)*60, v>0?8:2);
              const isToday = i===6;
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ fontSize:"0.7rem", fontWeight:700, color:isToday?C.green:C.gray }}>{v||""}</div>
                  <div style={{
                    width:"100%", height:h,
                    background: isToday
                      ? `linear-gradient(180deg,${C.green},${C.greenD})`
                      : `linear-gradient(180deg,${C.teal}88,${C.teal}44)`,
                    borderRadius:"4px 4px 2px 2px",
                    transition:"height 0.6s ease",
                  }}/>
                  <div style={{ fontSize:"0.6rem", color:isToday?C.green:C.gray, fontWeight:isToday?700:600 }}>{labels[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Admin ── */}
        <div style={{
          background:C.navy2, border:`1px solid ${C.navy3}`,
          borderRadius:16, padding:"14px 16px",
        }}>
          <div style={{ fontSize:"0.7rem", fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>
            🔐 Board of Directors Access
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input
              type="password"
              value={adminPwd}
              onChange={e=>setAdminPwd(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&tryAdmin()}
              placeholder="Enter board password…"
              style={{
                flex:1, padding:"9px 14px", borderRadius:10,
                border:`1.5px solid ${adminErr ? C.red : C.navy3}`,
                background:C.navy3, color:C.white,
                fontFamily:"inherit", fontSize:"0.85rem", outline:"none",
                animation: adminErr ? "shake 0.3s ease" : "none",
              }}
            />
            <button onClick={tryAdmin} style={{
              background:`linear-gradient(135deg,${C.green},${C.greenD})`,
              border:"none", borderRadius:10,
              padding:"9px 18px", fontWeight:800, fontSize:"0.85rem",
              color:C.navy, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.5,
            }}>ENTER</button>
          </div>
          {adminErr && <div style={{ color:C.red, fontSize:"0.72rem", marginTop:6, fontWeight:700 }}>
            Access denied. That one really stinks. 🦨
          </div>}
        </div>

      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [profile, setProfile] = useState(undefined);

  useEffect(()=>{
    (async()=>{
      try {
        const r = await window.storage.get("ff:profile");
        setProfile(r ? JSON.parse(r.value) : null);
      } catch { setProfile(null); }
    })();
  },[]);

  if (profile === undefined) return (
    <div style={{
      minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center",
      background:C.navy4, fontFamily:"'Plus Jakarta Sans',sans-serif",
      color:C.gray, fontSize:"1rem", fontWeight:700,
    }}>Loading portfolio… 💨</div>
  );

  if (!profile) return <SetupScreen onDone={setProfile}/>;

  return <MainApp profile={profile} onLogout={async()=>{ await window.storage.delete("ff:profile"); await window.storage.delete("ff:logs"); setProfile(null); }}/>;
}