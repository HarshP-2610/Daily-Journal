import { useState, useEffect } from "react";

const B = {
  50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe",
  300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6",
  600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a",
};

const S = {
  fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const DEFAULT_ADMIN = {
  id: "admin-001",
  name: "Admin",
  email: "admin@journal.com",
  password: "admin123",
  role: "admin",
  createdAt: new Date().toISOString(),
};

async function ls(key) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function ss(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

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

function Btn({ children, onClick, variant = "primary", size = "md", disabled, style: extra = {} }) {
  const base = {
    border: "none", borderRadius: 10, fontFamily: S.fontFamily, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", transition: "all .18s",
    display: "inline-flex", alignItems: "center", gap: 6,
    ...(size === "sm" ? { padding: "6px 14px", fontSize: 13 } : { padding: "10px 22px", fontSize: 14 }),
    opacity: disabled ? .6 : 1,
    ...extra,
  };
  const variants = {
    primary: { background: B[600], color: "#fff" },
    secondary: { background: B[50], color: B[700], border: `1.5px solid ${B[200]}` },
    danger: { background: "#fee2e2", color: "#dc2626", border: "1.5px solid #fecaca" },
    ghost: { background: "transparent", color: B[600] },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
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

function AuthPage({ page, setPage, onLogin, onRegister, error }) {
  const [loginF, setLoginF] = useState({ email: "", password: "" });
  const [regF, setRegF] = useState({ name: "", email: "", password: "", confirm: "" });

  const isLogin = page === "login";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${B[50]} 0%, ${B[100]} 60%, #fff 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: S.fontFamily }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: B[600], display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
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

          <Btn onClick={() => isLogin ? onLogin(loginF) : onRegister(regF)} style={{ width: "100%", justifyContent: "center", padding: "12px 22px", fontSize: 15 }}>
            {isLogin ? "Sign In" : "Create Account"}
          </Btn>

          {isLogin && (
            <div style={{ marginTop: 16, padding: "12px 14px", background: B[50], borderRadius: 10, fontSize: 12.5, color: "#475569", border: `1px solid ${B[100]}` }}>
              <strong style={{ color: B[700] }}>Default Admin:</strong> admin@journal.com / admin123
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────

function Navbar({ page, setPage, user, onLogout }) {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { id: "topics", label: "Topics", icon: <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  ];

  return (
    <nav style={{ background: "#fff", borderBottom: `1px solid ${B[100]}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(37,99,235,.05)", fontFamily: S.fontFamily }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: B[600], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="17" height="17" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 17, color: B[900], letterSpacing: -0.3 }}>Daily Journal</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 4 }}>
        {links.map(l => (
          <button key={l.id} onClick={() => setPage(l.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: S.fontFamily, fontWeight: 600, fontSize: 14, transition: "all .18s", background: page === l.id ? B[50] : "transparent", color: page === l.id ? B[700] : "#64748b", borderBottom: page === l.id ? `2px solid ${B[600]}` : "2px solid transparent" }}>
            {l.icon}{l.label}
          </button>
        ))}
      </div>

      {/* User area */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: B[100], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: B[700] }}>{initials(user.name)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", lineHeight: 1.2 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}><Badge color={user.role === "admin" ? "amber" : "blue"}>{user.role}</Badge></div>
          </div>
        </div>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: `1.5px solid ${B[100]}`, borderRadius: 9, background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: S.fontFamily, transition: "all .18s" }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </nav>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────

function DashboardPage({ user, entries, users }) {
  const myEntries = user.role === "admin" ? entries : entries.filter(e => e.userId === user.id);
  const topics = [...new Set(myEntries.map(e => e.topic))].length;
  const tools = [...new Set(myEntries.flatMap(e => e.tools.split(",").map(t => t.trim()).filter(Boolean)))].length;
  const today = myEntries.filter(e => e.date === todayStr()).length;
  const recent = [...myEntries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const stats = [
    { label: "Total Entries", val: myEntries.length, icon: <svg width="22" height="22" fill="none" stroke={B[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color: B[600] },
    { label: "Topics Covered", val: topics, icon: <svg width="22" height="22" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, color: "#7c3aed" },
    { label: "Tools Used", val: tools, icon: <svg width="22" height="22" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, color: "#059669" },
    { label: "Today's Entries", val: today, icon: <svg width="22" height="22" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, color: "#d97706" },
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
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{formatDate(e.date)}{user.role === "admin" && ` · ${e.userName}`}</div>
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

          {user.role === "admin" && (
            <Card>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: B[900] }}>All Users</h3>
              {users.map(u => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: B[100], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: B[700] }}>{initials(u.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{entries.filter(e => e.userId === u.id).length} entries</div>
                  </div>
                  <Badge color={u.role === "admin" ? "amber" : "blue"}>{u.role}</Badge>
                </div>
              ))}
            </Card>
          )}

          {user.role !== "admin" && (
            <Card style={{ border: `1px solid ${B[100]}` }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: B[900] }}>Your Stats</h3>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 2 }}>
                <div>📅 Joined: {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                <div>📝 Total Entries: <strong style={{ color: B[700] }}>{myEntries.length}</strong></div>
                <div>🗂 Unique Topics: <strong style={{ color: B[700] }}>{topics}</strong></div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Entry Form Card ───────────────────────────────────────────

function EntryForm({ form, setForm, onSave, onCancel, isEdit }) {
  return (
    <Card style={{ marginBottom: 28, border: `2px solid ${B[200]}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: B[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" stroke={B[700]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
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
        <Btn onClick={onSave} disabled={!form.topic || !form.learningDetails}>
          <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          {isEdit ? "Update Entry" : "Save Entry"}
        </Btn>
      </div>
    </Card>
  );
}

// ── Entry Card (display) ──────────────────────────────────────

function EntryCard({ entry, user, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const canEdit = user.role === "admin" || entry.userId === user.id;

  const Field = ({ icon, label, val }) => val ? (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <span style={{ color: B[500] }}>{icon}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: B[700], textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, paddingLeft: 22 }}>{val}</div>
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
            <button onClick={() => onEdit(entry)} style={{ border: `1px solid ${B[200]}`, background: B[50], borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: B[700], display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, fontFamily: S.fontFamily }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button onClick={() => onDelete(entry.id)} style={{ border: "1px solid #fecaca", background: "#fee2e2", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, fontFamily: S.fontFamily }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${B[100]}` }}>
          <Field icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} label="Important Points" val={entry.importantPoints} />
          <Field icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} label="Queries / Tasks" val={entry.queries} />
          {entry.tools && (
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                <span style={{ color: B[500] }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>
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

// ── Topics Page ───────────────────────────────────────────────

function TopicsPage({ user, entries, setEntries }) {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ date: todayStr(), topic: "", learningDetails: "", importantPoints: "", queries: "", tools: "" });

  const myEntries = user.role === "admin" ? entries : entries.filter(e => e.userId === user.id);
  const filtered = myEntries.filter(e =>
    e.topic.toLowerCase().includes(search.toLowerCase()) ||
    e.learningDetails.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.topic || !form.learningDetails) return;
    let updated;
    if (editingEntry) {
      updated = entries.map(e => e.id === editingEntry.id ? { ...e, ...form } : e);
    } else {
      const newEntry = { id: `entry-${Date.now()}`, userId: user.id, userName: user.name, ...form, createdAt: new Date().toISOString() };
      updated = [newEntry, ...entries];
    }
    setEntries(updated);
    await ss("journal-entries", updated);
    setForm({ date: todayStr(), topic: "", learningDetails: "", importantPoints: "", queries: "", tools: "" });
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleEdit = (e) => {
    setEditingEntry(e);
    setForm({ date: e.date, topic: e.topic, learningDetails: e.learningDetails, importantPoints: e.importantPoints, queries: e.queries, tools: e.tools });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    await ss("journal-entries", updated);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
    setForm({ date: todayStr(), topic: "", learningDetails: "", importantPoints: "", queries: "", tools: "" });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 28px", fontFamily: S.fontFamily }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: B[900] }}>Daily Learning Journal</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" fill="none" stroke={B[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span style={{ color: B[600], fontSize: 14, fontWeight: 600 }}>{formatDate(todayStr())}</span>
          </div>
        </div>
        {!showForm && (
          <Btn onClick={() => { setShowForm(true); setEditingEntry(null); setForm({ date: todayStr(), topic: "", learningDetails: "", importantPoints: "", queries: "", tools: "" }); }}>
            <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New Entry
          </Btn>
        )}
      </div>

      {/* Form */}
      {showForm && <EntryForm form={form} setForm={setForm} onSave={handleSave} onCancel={handleCancel} isEdit={!!editingEntry} />}

      {/* Search */}
      {myEntries.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics or learning details..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 40px", border: `1.5px solid ${B[100]}`, borderRadius: 10, fontSize: 14, fontFamily: S.fontFamily, color: "#1e293b", background: "#fff", outline: "none" }} />
          </div>
        </div>
      )}

      {/* Count */}
      {myEntries.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{filtered.length} {filtered.length === 1 ? "entry" : "entries"} {user.role === "admin" ? "total" : "found"}</span>
        </div>
      )}

      {/* Entries */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: B[50], display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <svg width="28" height="28" fill="none" stroke={B[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 15, margin: 0 }}>{search ? "No entries match your search." : "No entries yet. Click 'Add New Entry' to get started!"}</p>
        </div>
      )}
      {filtered.map(e => <EntryCard key={e.id} entry={e} user={user} onEdit={handleEdit} onDelete={handleDelete} />)}
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
  const [page, setPage] = useState("dashboard");
  const [authErr, setAuthErr] = useState("");

  useEffect(() => {
    (async () => {
      const u = await ls("journal-users") || [DEFAULT_ADMIN];
      const e = await ls("journal-entries") || [];
      const s = await ls("journal-session");
      if (!await ls("journal-users")) await ss("journal-users", u);
      setUsers(u);
      setEntries(e);
      if (s) {
        const found = u.find(x => x.id === s.userId);
        if (found) { setUser(found); }
      }
      setReady(true);
    })();
  }, []);

  const handleLogin = async (f) => {
    const found = users.find(u => u.email === f.email && u.password === f.password);
    if (!found) { setAuthErr("Invalid email or password."); return; }
    setUser(found);
    await ss("journal-session", { userId: found.id });
    setAuthErr("");
  };

  const handleRegister = async (f) => {
    if (!f.name || !f.email || !f.password) { setAuthErr("All fields are required."); return; }
    if (f.password !== f.confirm) { setAuthErr("Passwords do not match."); return; }
    if (f.password.length < 6) { setAuthErr("Password must be at least 6 characters."); return; }
    if (users.find(u => u.email === f.email)) { setAuthErr("Email already registered."); return; }
    const nu = { id: `user-${Date.now()}`, name: f.name, email: f.email, password: f.password, role: "user", createdAt: new Date().toISOString() };
    const nu2 = [...users, nu];
    setUsers(nu2);
    await ss("journal-users", nu2);
    setUser(nu);
    await ss("journal-session", { userId: nu.id });
    setAuthErr("");
  };

  const handleLogout = async () => {
    setUser(null);
    await ss("journal-session", null);
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

  if (!user) return <AuthPage page={authPage} setPage={p => { setAuthPage(p); setAuthErr(""); }} onLogin={handleLogin} onRegister={handleRegister} error={authErr} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: S.fontFamily }}>
      <Navbar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      {page === "dashboard"
        ? <DashboardPage user={user} entries={entries} users={users} />
        : <TopicsPage user={user} entries={entries} setEntries={setEntries} />
      }
    </div>
  );
}
