import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

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
  { min: 0,   title: "Junior Analyst 📋",     color: "#2CB5A0" },
  { min: 5,   title: "Asset Manager 💼",       color: "#3DBE6C" },
  { min: 15,  title: "Senior Trader 📈",       color: "#F0B429" },
  { min: 30,  title: "Portfolio Director 🎯",  color: "#C084FC" },
  { min: 50,  title: "VP of Emissions 🏢",     color: "#E05C6E" },
  { min: 75,  title: "Chief Gas Officer 🦨",    color: "#FB923C" },
  { min: 100, title: "Grand Poobah CFO 💩",    color: "#F0B429" },
];

function getRank(n) {
  return [...RANKS].reverse().find(r => n >= r.min) ?? RANKS[0];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sinceISO(unit) {
  const d = new Date();
  if (unit === "day")   d.setHours(0, 0, 0, 0);
  if (unit === "week")  { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); }
  if (unit === "month") { d.setDate(1); d.setHours(0, 0, 0, 0); }
  return d.toISOString();
}
function countSince(logs, unit) {
  const s = sinceISO(unit);
  return logs.filter(t => t >= s).length;
}
function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

// ─── SVG Logo ─────────────────────────────────────────────────────────────────
function FartfolioLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect x="6"  y="52" width="14" height="20" rx="3" fill={C.greenD} />
      <rect x="24" y="38" width="14" height="34" rx="3" fill={C.green} />
      <rect x="42" y="24" width="14" height="48" rx="3" fill={C.greenL} />
      <rect x="4"  y="72" width="56" height="3"  rx="1.5" fill={C.teal} opacity="0.5" />
      <ellipse cx="58" cy="18" rx="10" ry="8" fill="white" opacity="0.95" />
      <ellipse cx="50" cy="22" rx="8"  ry="6" fill="white" opacity="0.95" />
      <ellipse cx="66" cy="22" rx="7"  ry="5" fill="white" opacity="0.9"  />
      <ellipse cx="58" cy="26" rx="9"  ry="6" fill="white" opacity="0.95" />
      <path d="M49 24 Q47 18 50 14" stroke={C.teal} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ logs, days = 7, color = C.green }) {
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i)); d.setHours(0, 0, 0, 0);
    const e = new Date(d); e.setHours(23, 59, 59, 999);
    return logs.filter(t => { const ts = new Date(t); return ts >= d && ts <= e; }).length;
  });
  const max = Math.max(...buckets, 1);
  const W = 80, H = 28, pad = 2;
  const pts = buckets.map((v, i) => {
    const x = pad + (i / (days - 1)) * (W - pad * 2);
    const y = H - pad - ((v / max) * (H - pad * 2));
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {buckets.map((v, i) => {
        const x = pad + (i / (days - 1)) * (W - pad * 2);
        const y = H - pad - ((v / max) * (H - pad * 2));
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}

// ─── Fart Particle ────────────────────────────────────────────────────────────
function Particle({ onDone }) {
  const items = ["💨", "🌬️", "☁️", "💭", "📈", "🫧", "💹"];
  const item  = items[Math.floor(Math.random() * items.length)];
  const x     = 20 + Math.random() * 60;
  const dur   = 900 + Math.random() * 400;
  useEffect(() => { const t = setTimeout(onDone, dur + 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "absolute", left: `${x}%`, bottom: "55%",
      fontSize: `${1.2 + Math.random() * 0.8}rem`,
      animation: `particleRise ${dur}ms ease-out forwards`,
      pointerEvents: "none", zIndex: 30,
    }}>{item}</div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = C.green, emoji }) {
  return (
    <div style={{
      background: C.navy2, border: `1px solid ${C.navy3}`,
      borderRadius: 16, padding: "14px 12px",
      flex: 1, minWidth: 0, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: 60, height: 60,
        background: `radial-gradient(circle at top right, ${color}22, transparent 70%)`
      }} />
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        {emoji && <span style={{ marginRight: 4 }}>{emoji}</span>}{label}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 800, color: C.white, lineHeight: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "0.65rem", color: C.gray, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <div style={{
      minHeight: "100dvh", background: C.navy4,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');`}</style>

      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, justifyContent: "center" }}>
          <FartfolioLogo size={56} />
          <div>
            <div style={{ fontWeight: 900, fontSize: "2.4rem", color: C.white, lineHeight: 1, letterSpacing: -1 }}>
              Fart<span style={{ color: C.green }}>folio</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: C.gray, fontWeight: 600 }}>Track your assets.</div>
          </div>
        </div>

        <div style={{ background: C.navy2, border: `1px solid ${C.navy3}`, borderRadius: 24, padding: 32, marginTop: 32 }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: C.white, marginBottom: 6 }}>
            Open your account 💼
          </div>
          <div style={{ fontSize: "0.82rem", color: C.gray, marginBottom: 24 }}>
            Join thousands of serious investors tracking their most volatile assets.
          </div>
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            style={{
              width: "100%", padding: "14px 20px",
              background: loading ? C.navy3 : C.white,
              border: `2px solid ${C.navy3}`,
              borderRadius: 14, cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : `0 4px 20px ${C.green}33`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1rem",
              color: C.navy, transition: "all 0.2s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {loading ? "Redirecting…" : "Continue with Google"}
          </button>
          <p style={{ fontSize: "0.72rem", color: C.gray, marginTop: 16, textAlign: "center" }}>
            Your Google display name will appear on the leaderboard.
          </p>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.72rem", color: C.navy3 }}>
          Admin access: password <code style={{ color: C.gray }}>SBD1234</code>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ onBack }) {
  const [rows,    setRows] = useState([]);
  const [loading, setLd]   = useState(true);

  useEffect(() => {
    supabase.from("leaderboard").select("*").then(({ data, error }) => {
      if (!error) setRows(data ?? []);
      setLd(false);
    });
  }, []);

  const total  = rows.reduce((s, r) => s + Number(r.total),      0);
  const today  = rows.reduce((s, r) => s + Number(r.today),      0);
  const week   = rows.reduce((s, r) => s + Number(r.this_week),  0);
  const month  = rows.reduce((s, r) => s + Number(r.this_month), 0);

  return (
    <div style={{ minHeight: "100dvh", background: C.navy4, fontFamily: "'Plus Jakarta Sans',sans-serif", padding: "20px 16px 48px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <button onClick={onBack} style={{
          background: "transparent", border: `1px solid ${C.navy3}`, color: C.gray,
          borderRadius: 10, padding: "6px 16px", cursor: "pointer", fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 20, fontSize: "0.85rem",
        }}>← Portfolio</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <FartfolioLogo size={32} />
          <div style={{ fontWeight: 900, fontSize: "1.8rem", color: C.white, letterSpacing: -0.5 }}>
            Fart<span style={{ color: C.green }}>folio</span>
            <span style={{ fontSize: "0.85rem", color: C.gray, fontWeight: 600, marginLeft: 10 }}>Board of Directors</span>
          </div>
        </div>
        <div style={{ fontSize: "0.78rem", color: C.gray, marginBottom: 24 }}>Global Emissions Intelligence · Confidential</div>

        {loading ? (
          <div style={{ textAlign: "center", color: C.gray, padding: 40 }}>Auditing the books… 📚</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <StatCard label="Today"    value={today} emoji="☀️" color={C.gold}  />
              <StatCard label="Week"     value={week}  emoji="📅" color={C.teal}  />
              <StatCard label="Month"    value={month} emoji="🗓️" color="#C084FC" />
              <StatCard label="All Time" value={total} emoji="🏆" color={C.green} />
            </div>

            <div style={{
              background: C.navy2, border: `1px solid ${C.navy3}`, borderRadius: 16,
              padding: "14px 18px", marginBottom: 20, display: "flex", gap: 16,
            }}>
              {[
                { label: "Investors",      val: rows.length },
                { label: "Avg / Investor", val: rows.length ? (total / rows.length).toFixed(1) : 0 },
                { label: "Peak Today",     val: Math.max(0, ...rows.map(r => Number(r.today))) },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.6rem", color: C.green }}>{s.val}</div>
                  <div style={{ fontSize: "0.68rem", color: C.gray, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              📊 Top Performers
            </div>

            {rows.length === 0 ? (
              <div style={{ color: C.gray, textAlign: "center", padding: 30 }}>No assets tracked yet 🦗</div>
            ) : rows.map((u, i) => {
              const n = Number(u.total);
              const p = pct(n, total);
              const medals = ["🥇", "🥈", "🥉"];
              const rank = getRank(n);
              return (
                <div key={u.user_id} style={{
                  background: i === 0 ? `${C.green}18` : C.navy2,
                  border: `1px solid ${i === 0 ? C.green + "44" : C.navy3}`,
                  borderRadius: 14, padding: "12px 14px", marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${C.navy3}` }} />
                    : <div style={{ fontSize: "1.3rem", minWidth: 28 }}>{medals[i] || `#${i + 1}`}</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: C.white, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.display_name}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: C.gray, marginTop: 2 }}>
                      {rank.title} · {p}% of global emissions
                    </div>
                    <div style={{ marginTop: 6, background: C.navy3, borderRadius: 99, height: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p}%`, background: i === 0 ? C.green : C.teal, borderRadius: 99, transition: "width 1s ease" }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: "1.6rem", color: i === 0 ? C.green : C.white }}>{n}</div>
                    <div style={{ fontSize: "0.65rem", color: C.gray }}>today: {u.today}</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function MainApp({ user, profile }) {
  const [logs,       setLogs]      = useState([]);
  const [particles,  setParticles] = useState([]);
  const [joke,       setJoke]      = useState(JOKES[0]);
  const [pressed,    setPressed]   = useState(false);
  const [loading,    setLoading]   = useState(true);
  const [showAdmin,  setAdmin]     = useState(false);
  const [adminPwd,   setAdminPwd]  = useState("");
  const [adminErr,   setAdminErr]  = useState(false);
  const [globalData, setGlobal]    = useState({ total: 0, today: 0, users: 0 });
  const jokeIdx = useRef(0);
  const pId     = useRef(0);

  useEffect(() => {
    async function load() {
      const [{ data: myFarts }, { data: lb }] = await Promise.all([
        supabase.from("farts").select("created_at").eq("user_id", user.id).order("created_at"),
        supabase.from("leaderboard").select("total,today"),
      ]);
      setLogs((myFarts ?? []).map(r => r.created_at));
      const totals = (lb ?? []).reduce(
        (acc, r) => ({ total: acc.total + Number(r.total), today: acc.today + Number(r.today) }),
        { total: 0, today: 0 }
      );
      setGlobal({ ...totals, users: (lb ?? []).length });
      setLoading(false);
    }
    load();
  }, [user.id]);

  async function refreshGlobal() {
    const { data: lb } = await supabase.from("leaderboard").select("total,today");
    const totals = (lb ?? []).reduce(
      (acc, r) => ({ total: acc.total + Number(r.total), today: acc.today + Number(r.today) }),
      { total: 0, today: 0 }
    );
    setGlobal({ ...totals, users: (lb ?? []).length });
  }

  async function handleRip() {
    if (pressed) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 180);

    const id = ++pId.current;
    setParticles(p => [...p, id]);
    jokeIdx.current = (jokeIdx.current + 1) % JOKES.length;
    setJoke(JOKES[jokeIdx.current]);

    const ts = new Date().toISOString();
    setLogs(prev => [...prev, ts]);

    const { error } = await supabase.from("farts").insert({ user_id: user.id });
    if (error) {
      console.error(error);
      setLogs(prev => prev.filter(t => t !== ts));
    } else {
      await refreshGlobal();
    }
  }

  function tryAdmin() {
    if (adminPwd === "SBD1234") { setAdmin(true); setAdminPwd(""); }
    else { setAdminErr(true); setTimeout(() => setAdminErr(false), 1200); }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (showAdmin) return <AdminDashboard onBack={() => setAdmin(false)} />;

  const todayCnt = countSince(logs, "day");
  const weekCnt  = countSince(logs, "week");
  const monthCnt = countSince(logs, "month");
  const allTime  = logs.length;
  const rank     = getRank(allTime);
  const myPct    = pct(allTime, globalData.total);
  const todayPct = pct(todayCnt, globalData.today);

  const weekBuckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
    const e = new Date(d); e.setHours(23, 59, 59, 999);
    return logs.filter(t => { const ts = new Date(t); return ts >= d && ts <= e; }).length;
  });
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const todayDow  = new Date().getDay();
  const labels    = Array.from({ length: 7 }, (_, i) => dayLabels[(todayDow - 6 + i + 7) % 7]);

  return (
    <div style={{ minHeight: "100dvh", background: C.navy4, fontFamily: "'Plus Jakarta Sans',sans-serif", color: C.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        @keyframes particleRise {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-110px) scale(1.5); }
        }
        @keyframes rippleOut {
          0%   { transform: scale(0.8); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 #3DBE6C55; }
          50%      { box-shadow: 0 0 0 16px #3DBE6C00; }
        }
        .rip-btn:active { transform: translate(-50%, -50%) scale(0.94) !important; }
      `}</style>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "16px 16px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FartfolioLogo size={36} />
            <div>
              <div style={{ fontWeight: 900, fontSize: "1.5rem", lineHeight: 1, letterSpacing: -0.5 }}>
                Fart<span style={{ color: C.green }}>folio</span>
              </div>
              <div style={{ fontSize: "0.65rem", color: C.gray, fontWeight: 600 }}>Track your assets.</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              display: "inline-block",
              background: `${rank.color}22`, border: `1px solid ${rank.color}55`,
              borderRadius: 99, padding: "3px 10px",
              fontSize: "0.68rem", fontWeight: 700, color: rank.color, marginBottom: 2,
            }}>{rank.title}</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.white }}>
              {profile?.display_name ?? user.email}
            </div>
            {profile?.avatar_url && (
              <img src={profile.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${C.navy3}`, display: "block", marginLeft: "auto", marginTop: 2 }} />
            )}
            <button onClick={handleSignOut} style={{
              background: "transparent", border: "none", color: C.gray,
              fontSize: "0.65rem", cursor: "pointer", padding: 0, fontFamily: "inherit",
            }}>sign out</button>
          </div>
        </div>

        {/* Analyst ticker */}
        <div style={{
          background: C.navy2, borderRadius: 10, padding: "8px 14px",
          marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
          border: `1px solid ${C.navy3}`, overflow: "hidden",
        }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: C.green, whiteSpace: "nowrap" }}>📡 ANALYST NOTE</span>
          <span style={{ fontSize: "0.75rem", color: C.grayL, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {loading ? "Compiling emissions report…" : joke}
          </span>
        </div>

        {/* RIP Button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, position: "relative", height: 230 }}>
          {pressed && [0, 1].map(i => (
            <div key={i} style={{
              position: "absolute", top: "50%", left: "50%",
              width: 170, height: 170, marginLeft: -85, marginTop: -85,
              borderRadius: "50%", border: `2px solid ${C.green}`,
              animation: `rippleOut 0.65s ease-out ${i * 0.12}s forwards`,
              pointerEvents: "none",
            }} />
          ))}
          {particles.map(id => (
            <Particle key={id} onDone={() => setParticles(p => p.filter(x => x !== id))} />
          ))}
          <button
            className="rip-btn"
            onClick={handleRip}
            disabled={loading}
            style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 170, height: 170, borderRadius: "50%",
              background: pressed
                ? `linear-gradient(145deg,${C.greenD},${C.navy3})`
                : `linear-gradient(145deg,${C.green},${C.greenD})`,
              border: `3px solid ${pressed ? C.greenD : C.green}`,
              boxShadow: pressed ? `0 4px 12px ${C.green}44` : `0 8px 32px ${C.green}55`,
              cursor: loading ? "default" : "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              animation: !pressed ? "pulse 2.5s ease-in-out infinite" : "none",
            }}
          >
            <span style={{ fontSize: "3.2rem", lineHeight: 1 }}>💨</span>
            <span style={{ fontWeight: 900, fontSize: "0.95rem", letterSpacing: 1.5, color: C.navy, marginTop: 6, textTransform: "uppercase" }}>
              RIP IT
            </span>
            <span style={{ fontSize: "0.65rem", color: `${C.navy}99`, fontWeight: 700, marginTop: 2 }}>
              EXECUTE ORDER
            </span>
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <StatCard label="Today" value={todayCnt} emoji="☀️" color={C.gold}
            sub={globalData.today > 0 ? `${todayPct}% of mkt` : undefined} />
          <StatCard label="Week"  value={weekCnt}  emoji="📅" color={C.teal} />
          <StatCard label="Month" value={monthCnt} emoji="🗓️" color="#C084FC" />
        </div>

        {/* All-time card */}
        <div style={{ background: C.navy2, border: `1px solid ${C.navy3}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Total Assets</div>
              <div style={{ fontWeight: 900, fontSize: "2.8rem", color: C.white, lineHeight: 1, letterSpacing: -1 }}>{allTime}</div>
              <div style={{ fontSize: "0.72rem", color: C.gray, marginTop: 4 }}>
                {globalData.users} investors · {globalData.total} total market
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Market Share</div>
              <div style={{ fontWeight: 900, fontSize: "2rem", color: C.green, lineHeight: 1 }}>{myPct}%</div>
              <Sparkline logs={logs} color={C.green} />
            </div>
          </div>
          <div style={{ background: C.navy3, borderRadius: 99, height: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${myPct}%`,
              background: `linear-gradient(90deg,${C.teal},${C.green})`,
              borderRadius: 99, transition: "width 1s ease",
              minWidth: allTime > 0 ? 6 : 0,
            }} />
          </div>
        </div>

        {/* 7-day bar chart */}
        <div style={{ background: C.navy2, border: `1px solid ${C.navy3}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
            📊 7-Day Emissions Report
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
            {weekBuckets.map((v, i) => {
              const maxV = Math.max(...weekBuckets, 1);
              const h    = Math.max((v / maxV) * 60, v > 0 ? 8 : 2);
              const isToday = i === 6;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: isToday ? C.green : C.gray }}>{v || ""}</div>
                  <div style={{
                    width: "100%", height: h,
                    background: isToday
                      ? `linear-gradient(180deg,${C.green},${C.greenD})`
                      : `linear-gradient(180deg,${C.teal}88,${C.teal}44)`,
                    borderRadius: "4px 4px 2px 2px", transition: "height 0.6s ease",
                  }} />
                  <div style={{ fontSize: "0.6rem", color: isToday ? C.green : C.gray, fontWeight: isToday ? 700 : 600 }}>{labels[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin */}
        <div style={{ background: C.navy2, border: `1px solid ${C.navy3}`, borderRadius: 16, padding: "14px 16px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            🔐 Board of Directors Access
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="password"
              value={adminPwd}
              onChange={e => setAdminPwd(e.target.value)}
              onKeyDown={e => e.key === "Enter" && tryAdmin()}
              placeholder="Enter board password…"
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 10,
                border: `1.5px solid ${adminErr ? C.red : C.navy3}`,
                background: C.navy3, color: C.white,
                fontFamily: "inherit", fontSize: "0.85rem", outline: "none",
                animation: adminErr ? "shake 0.3s ease" : "none",
              }}
            />
            <button onClick={tryAdmin} style={{
              background: `linear-gradient(135deg,${C.green},${C.greenD})`,
              border: "none", borderRadius: 10, padding: "9px 18px",
              fontWeight: 800, fontSize: "0.85rem", color: C.navy,
              cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5,
            }}>ENTER</button>
          </div>
          {adminErr && (
            <div style={{ color: C.red, fontSize: "0.72rem", marginTop: 6, fontWeight: 700 }}>
              Access denied. That one really stinks. 🦨
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setProfile(null); return; }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [session?.user?.id]);

  if (session === undefined) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        background: C.navy4, fontFamily: "'Plus Jakarta Sans',sans-serif",
        color: C.gray, fontSize: "1rem", fontWeight: 700,
      }}>Loading portfolio… 💨</div>
    );
  }

  if (!session) return <LoginScreen />;

  return <MainApp user={session.user} profile={profile} />;
}