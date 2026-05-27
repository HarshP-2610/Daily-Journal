import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const B = {
  50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe",
  300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6",
  600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a",
};

const S = {
  fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

function formatDate(str) {
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function initials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ── Reusable components ──────────────────────────────────────

function Input({ label, type = "text", value, onChange, placeholder, required, rows }) {
  const base = {
    width: "100%", boxSizing: "border-box", padding: "10px 14px",
    border: `1.5px solid ${B[200]}`, borderRadius: 10, fontSize: 14,
    fontFamily: S.fontFamily, color: "#1e293b", background: "#fff",
    outline: "none", transition: "border-color .18s",
    ...(rows ? { resize: "vertical", minHeight: 80 } : {}),
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: B[800], marginBottom: 5 }}>{label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}</label>}
      {rows
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} onFocus={e => e.target.style.borderColor = B[500]} onBlur={e => e.target.style.borderColor = B[200]} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} onFocus={e => e.target.style.borderColor = B[500]} onBlur={e => e.target.style.borderColor = B[200]} />}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, isLoading, style: extra = {} }) {
  const base = {
    border: "none", borderRadius: 10, fontFamily: S.fontFamily, fontWeight: 600,
    cursor: disabled || isLoading ? "not-allowed" : "pointer", transition: "all .18s",
    display: "inline-flex", alignItems: "center", gap: 6,
    ...(size === "sm" ? { padding: "6px 14px", fontSize: 13 } : { padding: "10px 22px", fontSize: 14 }),
    opacity: disabled || isLoading ? .6 : 1,
    ...extra,
  };
  const variants = {
    primary: { background: B[600], color: "#fff" },
    secondary: { background: B[50], color: B[700], border: `1.5px solid ${B[200]}` },
    danger: { background: "#fee2e2", color: "#dc2626", border: "1.5px solid #fecaca" },
    ghost: { background: "transparent", color: B[600] },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled || isLoading}>
      {isLoading && <svg style={{ animation: "spin 0.8s linear infinite" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>}
      {children}
    </button>
  );
}

function Badge({ children, color = "blue" }) {
  const map = {
    blue: { bg: B[100], text: B[800] },
    green: { bg: "#dcfce7", text: "#166534" },
    amber: { bg: "#fef3c7", text: "#92400e" },
    red: { bg: "#fee2e2", text: "#991b1b" },
  };
  const c = map[color] || map.blue;
  return <span style={{ background: c.bg, color: c.text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{children}</span>;
}

function Card({ children, style: extra = {} }) {
  return <div style={{ background: "#fff", border: `1px solid ${B[100]}`, borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(37,99,235,.06)", ...extra }}>{children}</div>;
}

// ── Auth Pages ────────────────────────────────────────────────

function AuthPage({ page, setPage, onLogin, onRegister, error, isLoading }) {
  const [loginF, setLoginF] = useState({ email: "", password: "", rememberMe: false });
  const [regF, setRegF] = useState({ name: "", email: "", password: "", confirm: "" });

  const isLogin = page === "login";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${B[50]} 0%, ${B[100]} 60%, #fff 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: S.fontFamily }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: B[600], display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: B[900], letterSpacing: -0.5 }}>Daily Journal</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>Track your daily learning journey</p>
        </div>

        <Card>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: B[50], borderRadius: 10, padding: 4, marginBottom: 24, border: `1px solid ${B[100]}` }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => setPage(t)} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 8, fontFamily: S.fontFamily, fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all .18s", background: page === t ? "#fff" : "transparent", color: page === t ? B[700] : "#64748b", boxShadow: page === t ? "0 1px 4px rgba(0,0,0,.08)" : "none" }}>
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {isLogin ? (
            <div>
              <Input label="Email Address" type="email" value={loginF.email} onChange={v => setLoginF(f => ({ ...f, email: v }))} placeholder="you@email.com" required />
              <Input label="Password" type="password" value={loginF.password} onChange={v => setLoginF(f => ({ ...f, password: v }))} placeholder="••••••••" required />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                <input type="checkbox" id="rememberMe" checked={loginF.rememberMe} onChange={e => setLoginF(f => ({ ...f, rememberMe: e.target.checked }))} style={{ cursor: "pointer", width: 16, height: 16, accentColor: B[600] }} />
                <label htmlFor="rememberMe" style={{ fontSize: 13, color: "#475569", cursor: "pointer", userSelect: "none" }}>Remember Me</label>
              </div>
            </div>
          ) : (
            <div>
              <Input label="Full Name" value={regF.name} onChange={v => setRegF(f => ({ ...f, name: v }))} placeholder="Your full name" required />
              <Input label="Email Address" type="email" value={regF.email} onChange={v => setRegF(f => ({ ...f, email: v }))} placeholder="you@email.com" required />
              <Input label="Password" type="password" value={regF.password} onChange={v => setRegF(f => ({ ...f, password: v }))} placeholder="Min. 6 characters" required />
              <Input label="Confirm Password" type="password" value={regF.confirm} onChange={v => setRegF(f => ({ ...f, confirm: v }))} placeholder="Repeat password" required />
            </div>
          )}

          {error && <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{error}</div>}

          <Btn onClick={() => isLogin ? onLogin(loginF) : onRegister(regF)} isLoading={isLoading} style={{ width: "100%", justifyContent: "center", padding: "12px 22px", fontSize: 15 }}>
            {isLogin ? "Sign In" : "Create Account"}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────

function Navbar({ page, setPage, user, onLogout }) {
  const links = [
    ...(user.role === "admin" ? [] : [{ id: "dashboard", label: "Dashboard", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> }]),
    { id: "topics", label: "Topics", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
    ...(user.role === "admin" ? [{ id: "admin", label: "Admin", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> }] : []),
  ];

  return (
    <nav style={{ background: "#fff", borderBottom: `1px solid ${B[100]}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(37,99,235,.05)", fontFamily: S.fontFamily }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: B[600], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="17" height="17" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 17, color: B[900], letterSpacing: -0.3 }}>Daily Journal</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
        {links.map(l => (
          <button key={l.id} onClick={() => setPage(l.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: S.fontFamily, fontWeight: 600, fontSize: 14, transition: "all .18s", background: page === l.id ? B[50] : "transparent", color: page === l.id ? B[700] : "#64748b", borderBottom: page === l.id ? `2px solid ${B[600]}` : "2px solid transparent" }}>
            {l.icon}{l.label}
          </button>
        ))}
      </div>

      {/* User area */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, justifyContent: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${B[100]} 0%, ${B[200]} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: B[700], border: `2px solid #fff`, boxShadow: "0 2px 4px rgba(0,0,0,.05)" }}>{initials(user.name)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{user.name}</div>
            <div style={{ display: "flex" }}>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", background: user.role === "admin" ? "#fffbeb" : B[50], color: user.role === "admin" ? "#d97706" : B[700], borderRadius: 12, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, border: `1px solid ${user.role === "admin" ? "#fef3c7" : B[100]}` }}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
        <div style={{ height: 24, width: 1, background: B[100] }} />
        <button
          onClick={onLogout}
          onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fecaca"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = B[200]; }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: `1.5px solid ${B[200]}`, borderRadius: 10, background: "#fff", color: "#64748b", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: S.fontFamily, transition: "all .2s ease", boxShadow: "0 1px 2px rgba(0,0,0,.02)" }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────

function DashboardPage({ user, entries }) {
  const myEntries = entries.filter(e => e.userId === user.id);
  const topics = [...new Set(myEntries.map(e => e.topic))].length;
  const tools = [...new Set(myEntries.flatMap(e => (e.tools || "").split(",").map(t => t.trim()).filter(Boolean)))].length;
  const today = myEntries.filter(e => e.date === todayStr()).length;
  const recent = [...myEntries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const stats = [
    { label: "Total Entries", val: myEntries.length, icon: <svg width="22" height="22" fill="none" stroke={B[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, color: B[600] },
    { label: "Topics Covered", val: topics, icon: <svg width="22" height="22" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>, color: "#7c3aed" },
    { label: "Tools Used", val: tools, icon: <svg width="22" height="22" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>, color: "#059669" },
    { label: "Today's Entries", val: today, icon: <svg width="22" height="22" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, color: "#d97706" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 28px", fontFamily: S.fontFamily }}>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: B[900] }}>Welcome back, {user.name.split(" ")[0]} 👋</h1>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 15 }}>{formatDate(todayStr())} · Keep tracking your progress!</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 36 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent entries */}
        <Card>
          <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: B[900] }}>Recent Learning Entries</h2>
          {recent.length === 0
            ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No entries yet. Start adding your daily learnings!</p>
            : recent.map(e => (
              <div key={e.id} style={{ padding: "12px 0", borderBottom: `1px solid ${B[50]}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.topic}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{formatDate(e.date)}</div>
                </div>
                <Badge color={e.tools ? "green" : "blue"} >{e.tools ? e.tools.split(",")[0].trim() || "Learning" : "Learning"}</Badge>
              </div>
            ))
          }
        </Card>

        {/* Quick info card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ background: `linear-gradient(135deg, ${B[600]} 0%, ${B[800]} 100%)`, border: "none" }}>
            <div style={{ color: "#bfdbfe", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>DAILY GOAL</div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Stay Consistent!</div>
            <div style={{ color: "#bfdbfe", fontSize: 13, lineHeight: 1.6 }}>Log at least one topic per day to build strong learning habits and track your growth over time.</div>
          </Card>

          <Card style={{ border: `1px solid ${B[100]}` }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: B[900] }}>Your Stats</h3>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 2 }}>
              <div>📅 Joined: {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              <div>📝 Total Entries: <strong style={{ color: B[700] }}>{myEntries.length}</strong></div>
              <div>🗂 Unique Topics: <strong style={{ color: B[700] }}>{topics}</strong></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Admin Dashboard Page ──────────────────────────────────────────

function AdminDashboardPage({ user, entries, users }) {
  const topics = [...new Set(entries.map(e => e.topic))].length;
  const today = entries.filter(e => e.date === todayStr()).length;
  const recent = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const stats = [
    { label: "Total Platform Users", val: users.length, icon: <svg width="22" height="22" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, color: "#0ea5e9" },
    { label: "Global Entries", val: entries.length, icon: <svg width="22" height="22" fill="none" stroke={B[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, color: B[600] },
    { label: "Global Topics", val: topics, icon: <svg width="22" height="22" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>, color: "#7c3aed" },
    { label: "Global Today Activity", val: today, icon: <svg width="22" height="22" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>, color: "#10b981" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 28px", fontFamily: S.fontFamily }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: B[900] }}>Admin Dashboard ⚙️</h1>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 15 }}>Platform overview and user management</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 36 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Global Recent entries */}
        <Card>
          <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: B[900] }}>Global Recent Activity</h2>
          {recent.length === 0
            ? <p style={{ color: "#94a3b8", fontSize: 14 }}>No entries yet.</p>
            : recent.map(e => (
              <div key={e.id} style={{ padding: "12px 0", borderBottom: `1px solid ${B[50]}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.topic}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{formatDate(e.date)} · <span style={{ color: B[600], fontWeight: 600 }}>{e.userName}</span></div>
                </div>
                <Badge color={e.tools ? "green" : "blue"} >{e.tools ? e.tools.split(",")[0].trim() || "Learning" : "Learning"}</Badge>
              </div>
            ))
          }
        </Card>

        {/* User list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: B[900] }}>All Registered Users</h3>
            <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 10 }}>
              {users.map(u => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${B[50]}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: B[100], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: B[700] }}>{initials(u.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{u.email}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 4 }}><Badge color={u.role === "admin" ? "amber" : "blue"}>{u.role}</Badge></div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{entries.filter(e => e.userId === u.id).length} Entries</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Entry Form Card ───────────────────────────────────────────

function EntryForm({ form, setForm, onSave, onCancel, isEdit, isSaving }) {
  return (
    <Card style={{ marginBottom: 28, border: `2px solid ${B[200]}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: B[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" stroke={B[700]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: B[900] }}>{isEdit ? "Edit Entry" : "New Learning Entry"}</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Fill in your learning details below</p>
          </div>
        </div>
        <button onClick={onCancel} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", fontSize: 20, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Input label="Date" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} required />
        <Input label="Topic / Module Name" value={form.topic} onChange={v => setForm(f => ({ ...f, topic: v }))} placeholder="e.g. React Hooks, JavaScript Async" required />
      </div>
      <Input label="Learning Details" value={form.learningDetails} onChange={v => setForm(f => ({ ...f, learningDetails: v }))} placeholder="What did you learn today? Describe in detail..." rows={4} required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Input label="Important Points" value={form.importantPoints} onChange={v => setForm(f => ({ ...f, importantPoints: v }))} placeholder="Key takeaways, concepts to remember..." rows={3} />
        <Input label="Query / Tasks" value={form.queries} onChange={v => setForm(f => ({ ...f, queries: v }))} placeholder="Questions, doubts, tasks to revisit..." rows={3} />
      </div>
      <Input label="Tools / Software Used" value={form.tools} onChange={v => setForm(f => ({ ...f, tools: v }))} placeholder="e.g. VS Code, Chrome DevTools, Figma" />

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={onSave} disabled={!form.topic || !form.learningDetails} isLoading={isSaving}>
          {!isSaving && <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
          {isEdit ? "Update Entry" : "Save Entry"}
        </Btn>
      </div>
    </Card>
  );
}

// ── Entry Card (display) ──────────────────────────────────────

function EntryCard({ entry, user, onEdit, onDelete, onAnswer }) {
  const [expanded, setExpanded] = useState(false);
  const canEdit = user.role === "admin" || entry.userId === user.id;

  const Field = ({ icon, label, val }) => val ? (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <span style={{ color: B[500] }}>{icon}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: B[700], textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, paddingLeft: 22, whiteSpace: "pre-wrap" }}>{val}</div>
    </div>
  ) : null;

  return (
    <Card style={{ marginBottom: 14, padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <div style={{ background: B[600], color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{formatDate(entry.date)}</div>
            {user.role === "admin" && entry.userId !== user.id && <Badge color="amber">{entry.userName}</Badge>}
          </div>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{entry.topic}</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b", display: "-webkit-box", WebkitLineClamp: expanded ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: expanded ? "visible" : "hidden" }}>{entry.learningDetails}</p>
        </div>

        {canEdit && (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => onAnswer(entry)} style={{ border: `1px solid ${B[200]}`, background: B[50], borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: B[700], display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, fontFamily: S.fontFamily }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
              Answer
            </button>
            <button onClick={() => onEdit(entry)} style={{ border: `1px solid ${B[200]}`, background: B[50], borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: B[700], display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, fontFamily: S.fontFamily }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Edit
            </button>
            <button onClick={() => onDelete(entry.id)} style={{ border: "1px solid #fecaca", background: "#fee2e2", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, fontFamily: S.fontFamily }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${B[100]}` }}>
          <Field icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>} label="Important Points" val={entry.importantPoints} />
          <Field icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>} label="Queries / Tasks" val={entry.queries} />
          {entry.answers && (
            <div style={{ marginTop: 12, marginBottom: 12, padding: "12px 14px", background: "#f8fafc", borderLeft: `3px solid ${B[500]}`, borderRadius: "0 8px 8px 0" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: B[700], textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Answers</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{entry.answers}</div>
            </div>
          )}
          {entry.tools && (
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                <span style={{ color: B[500] }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg></span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: B[700], textTransform: "uppercase", letterSpacing: 0.5 }}>Tools / Software</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, paddingLeft: 22 }}>
                {entry.tools.split(",").map(t => t.trim()).filter(Boolean).map((t, i) => <Badge key={i} color="green">{t}</Badge>)}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setExpanded(e => !e)} style={{ marginTop: 12, border: "none", background: "transparent", color: B[600], fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: S.fontFamily, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
        {expanded ? "▲ Show Less" : "▼ Show More Details"}
      </button>
    </Card>
  );
}

// ── Answer Form Card ──────────────────────────────────────────

function AnswerForm({ entry, onSave, onCancel, isSaving }) {
  const [answer, setAnswer] = useState(entry.answers || "");

  return (
    <Card style={{ marginBottom: 28, border: `2px solid ${B[200]}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: B[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" stroke={B[700]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: B[900] }}>Q&A for {entry.topic}</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Answer your questions and tasks</p>
          </div>
        </div>
        <button onClick={onCancel} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", fontSize: 20, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ marginBottom: 16, padding: "14px 16px", background: B[50], borderRadius: 10, border: `1px solid ${B[100]}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: B[700], marginBottom: 6, textTransform: "uppercase" }}>Questions / Tasks</div>
        <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {entry.queries || "No questions provided in this entry."}
        </div>
      </div>

      <Input label="Your Answers" value={answer} onChange={setAnswer} placeholder="Write your answers here..." rows={6} required />

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={() => onSave({ answers: answer })} disabled={!answer} isLoading={isSaving}>
          {!isSaving && <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
          Save Answers
        </Btn>
      </div>
    </Card>
  );
}

// ── Topics Page ───────────────────────────────────────────────

function TopicsPage({ user, entries, setEntries }) {
  const [showForm, setShowForm] = useState(false);
  const [showGlobal, setShowGlobal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [answeringEntry, setAnsweringEntry] = useState(null);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ date: todayStr(), topic: "", learningDetails: "", importantPoints: "", queries: "", tools: "", answers: "" });

  const displayedEntries = (user.role === "admin" && showGlobal) ? entries : entries.filter(e => e.userId === user.id);
  const filtered = displayedEntries.filter(e =>
    e.topic.toLowerCase().includes(search.toLowerCase()) ||
    e.learningDetails.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.topic || !form.learningDetails) return;
    setIsSaving(true);
    let updated;
    if (editingEntry) {
      try {
        const res = await fetch(`${API_URL}/entries/${editingEntry.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        if (res.ok) {
          const updatedEntry = await res.json();
          updated = entries.map(e => e.id === editingEntry.id ? updatedEntry : e);
        } else {
          console.error("Failed to update");
          setIsSaving(false);
          return;
        }
      } catch (err) { console.error(err); setIsSaving(false); return; }
    } else {
      try {
        const newEntryData = { userId: user.id, userName: user.name, ...form };
        const res = await fetch(`${API_URL}/entries`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntryData)
        });
        if (res.ok) {
          const newEntry = await res.json();
          updated = [newEntry, ...entries];
        } else {
          console.error("Failed to save");
          setIsSaving(false);
          return;
        }
      } catch (err) { console.error(err); setIsSaving(false); return; }
    }
    setEntries(updated);
    setForm({ date: todayStr(), topic: "", learningDetails: "", importantPoints: "", queries: "", tools: "", answers: "" });
    setEditingEntry(null);
    setShowForm(false);
    setIsSaving(false);
  };

  const handleEdit = (e) => {
    setEditingEntry(e);
    setForm({ date: e.date, topic: e.topic, learningDetails: e.learningDetails, importantPoints: e.importantPoints, queries: e.queries, tools: e.tools, answers: e.answers || "" });
    setShowForm(true);
    setAnsweringEntry(null);
    window.scrollTo(0, 0);
  };

  const handleAnswer = (e) => {
    setAnsweringEntry(e);
    setShowForm(false);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/entries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
      }
    } catch (err) { console.error(err); }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
    setForm({ date: todayStr(), topic: "", learningDetails: "", importantPoints: "", queries: "", tools: "", answers: "" });
  };

  const handleAnswerSave = async ({ answers }) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/entries/${answeringEntry.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answeringEntry, answers })
      });
      if (res.ok) {
        const updatedEntry = await res.json();
        setEntries(entries.map(e => e.id === answeringEntry.id ? updatedEntry : e));
        setAnsweringEntry(null);
      } else {
        console.error("Failed to update answers");
      }
    } catch (err) { console.error(err); }
    setIsSaving(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 28px", fontFamily: S.fontFamily }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: B[900] }}>Daily Learning Journal</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" fill="none" stroke={B[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <span style={{ color: B[600], fontSize: 14, fontWeight: 600 }}>{formatDate(todayStr())}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {user.role === "admin" && (
            <div style={{ display: "flex", background: B[50], borderRadius: 10, padding: 4, border: `1px solid ${B[100]}` }}>
              <button onClick={() => setShowGlobal(false)} style={{ padding: "6px 12px", border: "none", borderRadius: 6, fontFamily: S.fontFamily, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .18s", background: !showGlobal ? "#fff" : "transparent", color: !showGlobal ? B[700] : "#64748b", boxShadow: !showGlobal ? "0 1px 4px rgba(0,0,0,.08)" : "none" }}>My Entries</button>
              <button onClick={() => setShowGlobal(true)} style={{ padding: "6px 12px", border: "none", borderRadius: 6, fontFamily: S.fontFamily, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .18s", background: showGlobal ? "#fff" : "transparent", color: showGlobal ? B[700] : "#64748b", boxShadow: showGlobal ? "0 1px 4px rgba(0,0,0,.08)" : "none" }}>Global Entries</button>
            </div>
          )}
          {(!showForm && !answeringEntry) && (
            <Btn onClick={() => { setShowForm(true); setEditingEntry(null); setAnsweringEntry(null); setForm({ date: todayStr(), topic: "", learningDetails: "", importantPoints: "", queries: "", tools: "", answers: "" }); }}>
              <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add New Entry
            </Btn>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && <EntryForm form={form} setForm={setForm} onSave={handleSave} onCancel={handleCancel} isEdit={!!editingEntry} isSaving={isSaving} />}
      {answeringEntry && <AnswerForm entry={answeringEntry} onSave={handleAnswerSave} onCancel={() => setAnsweringEntry(null)} isSaving={isSaving} />}

      {/* Search */}
      {displayedEntries.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics or learning details..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 40px", border: `1.5px solid ${B[100]}`, borderRadius: 10, fontSize: 14, fontFamily: S.fontFamily, color: "#1e293b", background: "#fff", outline: "none" }} />
          </div>
        </div>
      )}

      {/* Count */}
      {displayedEntries.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{filtered.length} {filtered.length === 1 ? "entry" : "entries"} {user.role === "admin" ? "total" : "found"}</span>
        </div>
      )}

      {/* Entries */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: B[50], display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <svg width="28" height="28" fill="none" stroke={B[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 15, margin: 0 }}>{search ? "No entries match your search." : "No entries yet. Click 'Add New Entry' to get started!"}</p>
        </div>
      )}
      {filtered.map(e => <EntryCard key={e.id} entry={e} user={user} onEdit={handleEdit} onDelete={handleDelete} onAnswer={handleAnswer} />)}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────

export default function App() {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState("login");
  const [loadingAction, setLoadingAction] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [authErr, setAuthErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [uRes, eRes] = await Promise.all([
          fetch(`${API_URL}/users`).catch(() => null),
          fetch(`${API_URL}/entries`).catch(() => null)
        ]);
        const u = (uRes && uRes.ok) ? await uRes.json() : [];
        const e = (eRes && eRes.ok) ? await eRes.json() : [];
        setUsers(u);
        setEntries(e);

        const sessionStr = localStorage.getItem('journal-session') || sessionStorage.getItem('journal-session');
        if (sessionStr) {
          const s = JSON.parse(sessionStr);
          const found = u.find(x => x.id === s.userId);
          if (found) {
            setUser(found);
            if (found.role === "admin") setPage("admin");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const handleLogin = async (f) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.email, password: f.password })
      });
      const data = await res.json();
      if (!res.ok) { setAuthErr(data.message); return; }
      setUser(data);
      if (data.role === "admin") setPage("admin");
      else setPage("dashboard");

      const sessionData = JSON.stringify({ userId: data.id });
      if (f.rememberMe) {
        localStorage.setItem("journal-session", sessionData);
      } else {
        sessionStorage.setItem("journal-session", sessionData);
      }
      setAuthErr("");
    } catch (err) { setAuthErr("Server error. Ensure backend is running."); }
    finally { setLoadingAction(false); }
  };

  const handleRegister = async (f) => {
    if (!f.name || !f.email || !f.password) { setAuthErr("All fields are required."); return; }
    if (f.password !== f.confirm) { setAuthErr("Passwords do not match."); return; }
    if (f.password.length < 6) { setAuthErr("Password must be at least 6 characters."); return; }
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.name, email: f.email, password: f.password })
      });
      const data = await res.json();
      if (!res.ok) { setAuthErr(data.message); return; }
      const newUsers = [...users, data];
      setUsers(newUsers);
      setUser(data);
      if (data.role === "admin") setPage("admin");
      else setPage("dashboard");
      localStorage.setItem("journal-session", JSON.stringify({ userId: data.id }));
      setAuthErr("");
    } catch (err) { setAuthErr("Server error. Ensure backend is running."); }
    finally { setLoadingAction(false); }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("journal-session");
    sessionStorage.removeItem("journal-session");
    setAuthPage("login");
    setAuthErr("");
  };

  if (!ready) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: S.fontFamily, color: B[600], gap: 10 }}>
      <div style={{ width: 20, height: 20, border: `3px solid ${B[100]}`, borderTop: `3px solid ${B[600]}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Loading your journal...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return <AuthPage page={authPage} setPage={p => { setAuthPage(p); setAuthErr(""); }} onLogin={handleLogin} onRegister={handleRegister} error={authErr} isLoading={loadingAction} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: S.fontFamily }}>
      <Navbar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      {page === "dashboard" && <DashboardPage user={user} entries={entries} />}
      {page === "topics" && <TopicsPage user={user} entries={entries} setEntries={setEntries} />}
      {page === "admin" && user.role === "admin" && <AdminDashboardPage user={user} entries={entries} users={users} />}
    </div>
  );
}
