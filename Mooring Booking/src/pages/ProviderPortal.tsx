import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Anchor, Plus, Loader2, LogOut, Edit2, Trash2, CheckCircle2,
  Eye, EyeOff, Lock, Mail, Ship, MapPin, X, ArrowLeft, Save
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MooringRow {
  id: string;
  name: string;
  location: string;
  country: string;
  price_per_night: number;
  max_boat_length: number;
  mooring_units: number;
  status: string;
  created_at: string;
}

interface MooringForm {
  name: string;
  country: string;
  location: string;
  latitude: string;
  longitude: string;
  description: string;
  price_per_night: string;
  max_boat_length: string;
  max_draft: string;
  mooring_units: string;
}

const EMPTY_FORM: MooringForm = {
  name: "", country: "", location: "", latitude: "", longitude: "",
  description: "", price_per_night: "", max_boat_length: "", max_draft: "", mooring_units: "1",
};

const COUNTRIES = [
  "Croatia", "Greece", "Italy", "Spain", "France",
  "Montenegro", "Slovenia", "Turkey", "Malta", "Albania", "Cyprus",
];

// ─── Styles ────────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020817 0%, #0c1a3a 50%, #051525 100%)",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: "#f0f9ff",
  },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 32px",
    borderBottom: "1px solid rgba(56,189,248,0.1)",
    background: "rgba(2,8,23,0.6)", backdropFilter: "blur(12px)",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, color: "#38bdf8", fontWeight: 800, fontSize: 18 },
  badge: {
    fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
    color: "#38bdf8", background: "rgba(56,189,248,0.12)",
    padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" as const,
  },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 10, color: "#f87171", cursor: "pointer", padding: "8px 16px", fontSize: 14,
  },
  content: { maxWidth: 760, margin: "0 auto", padding: "32px 20px 60px" },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(56,189,248,0.15)",
    borderRadius: 20, padding: "32px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    marginBottom: 24,
  },
  ctaBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "13px 24px",
    background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
    border: "none", borderRadius: 12, color: "#fff",
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 20px rgba(14,165,233,0.4)",
  },
  input: {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(56,189,248,0.2)",
    borderRadius: 10, color: "#f0f9ff", fontSize: 14, outline: "none",
    boxSizing: "border-box" as const,
  },
  label: { fontSize: 13, color: "#94a3b8", fontWeight: 500, display: "block", marginBottom: 6 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  mooringCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(56,189,248,0.1)",
    borderRadius: 14, padding: "20px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 12,
  },
  textarea: {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(56,189,248,0.2)",
    borderRadius: 10, color: "#f0f9ff", fontSize: 14, outline: "none",
    boxSizing: "border-box" as const, resize: "vertical" as const,
    minHeight: 90,
  },
};

// Dynamic style helpers (kept outside S object to avoid Record<string, CSSProperties> type conflict)
const statusBadgeStyle = (s: string): React.CSSProperties => ({
  fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
  background: s === "approved" ? "rgba(34,197,94,0.15)" : s === "pending" ? "rgba(250,204,21,0.15)" : "rgba(239,68,68,0.15)",
  color: s === "approved" ? "#4ade80" : s === "pending" ? "#facc15" : "#f87171",
});

const iconBtnStyle = (color = "#64748b"): React.CSSProperties => ({
  background: "none", border: "none", cursor: "pointer", color, padding: 6,
  borderRadius: 8, transition: "background 0.15s",
});

// ─── Login screen ──────────────────────────────────────────────────────────────

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) { setError(err.message); setLoading(false); return; }
    onLogin();
  };

  return (
    <div style={{ ...S.card, maxWidth: 420, margin: "80px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Anchor size={40} color="#38bdf8" style={{ margin: "0 auto 12px", display: "block" }} />
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Provider Portal</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Sign in to manage your moorings</p>
      </div>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={S.label}>Email</label>
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input type="email" style={{ ...S.input, paddingLeft: 38 }} placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
        </div>
        <div>
          <label style={S.label}>Password</label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input type={showPw ? "text" : "password"} style={{ ...S.input, paddingLeft: 38, paddingRight: 40 }}
              placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        {error && <div style={S.error}>{error}</div>}
        <button type="submit" style={S.ctaBtn} disabled={loading}>
          {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
          Sign in
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#475569" }}>
        Don't have an account?{" "}
        <a href="/join-as-provider" style={{ color: "#38bdf8", textDecoration: "none" }}>
          Register as a provider
        </a>
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Mooring form ──────────────────────────────────────────────────────────────

const MooringForm = ({
  initial, onSave, onCancel, loading
}: {
  initial?: MooringForm;
  onSave: (data: MooringForm) => void;
  onCancel: () => void;
  loading: boolean;
}) => {
  const [form, setForm] = useState<MooringForm>(initial || EMPTY_FORM);
  const f = (field: keyof MooringForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={{ ...S.card, borderColor: "rgba(56,189,248,0.3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>
          {initial?.name ? `Edit: ${initial.name}` : "Add New Mooring"}
        </h3>
        <button style={iconBtnStyle()} onClick={onCancel}><X size={20} /></button>
      </div>

      <div style={S.row}>
        <div>
          <label style={S.label}>Mooring Name *</label>
          <input style={S.input} placeholder="e.g. Buoy #3 — Hvar" value={form.name} onChange={f("name")} required />
        </div>
        <div>
          <label style={S.label}>Number of Spots *</label>
          <select style={S.input} value={form.mooring_units} onChange={f("mooring_units")}>
            {[...Array(20)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={S.row}>
        <div>
          <label style={S.label}>Country *</label>
          <select style={S.input} value={form.country} onChange={f("country")} required>
            <option value="">Select country...</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>City / Port *</label>
          <input style={S.input} placeholder="e.g. Hvar, Split, Dubrovnik" value={form.location} onChange={f("location")} required />
        </div>
      </div>

      <div style={S.row}>
        <div>
          <label style={S.label}>Latitude</label>
          <input style={S.input} type="number" step="0.000001" placeholder="43.1728" value={form.latitude} onChange={f("latitude")} />
        </div>
        <div>
          <label style={S.label}>Longitude</label>
          <input style={S.input} type="number" step="0.000001" placeholder="16.4412" value={form.longitude} onChange={f("longitude")} />
        </div>
      </div>

      <div style={S.row}>
        <div>
          <label style={S.label}>Price per Night (€) *</label>
          <input style={S.input} type="number" min="1" placeholder="80" value={form.price_per_night} onChange={f("price_per_night")} required />
        </div>
        <div>
          <label style={S.label}>Max Boat Length (m) *</label>
          <input style={S.input} type="number" min="1" placeholder="15" value={form.max_boat_length} onChange={f("max_boat_length")} required />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Max Draft (m)</label>
        <input style={S.input} type="number" step="0.1" placeholder="3.5" value={form.max_draft} onChange={f("max_draft")} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={S.label}>Description</label>
        <textarea style={S.textarea} placeholder="Describe the mooring location, amenities, access..."
          value={form.description} onChange={f("description")} />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={{ ...S.ctaBtn, flex: 1 }} onClick={() => onSave(form)} disabled={loading || !form.name || !form.country || !form.location || !form.price_per_night || !form.max_boat_length}>
          {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
          {initial?.name ? "Save Changes" : "Add Mooring"}
        </button>
        <button style={{ ...S.ctaBtn, background: "rgba(255,255,255,0.06)", boxShadow: "none" }} onClick={onCancel}>
          Cancel
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Main Portal ───────────────────────────────────────────────────────────────

const ProviderPortal = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [moorings, setMoorings] = useState<MooringRow[]>([]);
  const [loadingMoorings, setLoadingMoorings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTarget, setEditTarget] = useState<(MooringRow & { form: MooringForm }) | null>(null);
  const [savingMooring, setSavingMooring] = useState(false);
  const [error, setError] = useState("");

  // ── Auth ───────────────────────────────────────────────────────────────────

  const checkAuth = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    if (u) {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", u.id).single();
      setProfile(prof);
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  // ── Load moorings ──────────────────────────────────────────────────────────

  const loadMoorings = useCallback(async () => {
    if (!user) return;
    setLoadingMoorings(true);
    const { data } = await supabase
      .from("moorings")
      .select("id, name, location, country, price_per_night, max_boat_length, mooring_units, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMoorings(data || []);
    setLoadingMoorings(false);
  }, [user]);

  useEffect(() => { if (user) loadMoorings(); }, [user, loadMoorings]);

  // ── Save mooring ───────────────────────────────────────────────────────────

  const saveMooring = async (data: MooringForm) => {
    setSavingMooring(true);
    setError("");
    try {
      const payload = {
        name: data.name,
        country: data.country,
        location: data.location,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        description: data.description,
        price_per_night: parseFloat(data.price_per_night) || 0,
        max_boat_length: parseFloat(data.max_boat_length) || 0,
        max_draft: data.max_draft ? parseFloat(data.max_draft) : null,
        mooring_units: parseInt(data.mooring_units) || 1,
        user_id: user.id,
        status: "pending",
      };

      if (editTarget) {
        const { error: err } = await supabase.from("moorings").update(payload).eq("id", editTarget.id);
        if (err) throw err;
        setEditTarget(null);
      } else {
        const { error: err } = await supabase.from("moorings").insert(payload);
        if (err) throw err;
        setShowAddForm(false);
      }
      await loadMoorings();
    } catch (err: any) {
      setError(err.message || "Failed to save mooring.");
    } finally {
      setSavingMooring(false);
    }
  };

  // ── Delete mooring ─────────────────────────────────────────────────────────

  const deleteMooring = async (id: string) => {
    if (!window.confirm("Delete this mooring listing?")) return;
    await supabase.from("moorings").delete().eq("id", id);
    await loadMoorings();
  };

  // ── Sign out ───────────────────────────────────────────────────────────────

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "#020817", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color="#38bdf8" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020817 0%, #0c1a3a 50%, #051525 100%)", fontFamily: "'Inter',sans-serif", color: "#f0f9ff" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(56,189,248,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#38bdf8", fontWeight: 800, fontSize: 18 }}>
            <Anchor size={24} /> Mooring Booking <span style={{ fontSize: 11, letterSpacing: 2, background: "rgba(56,189,248,0.12)", padding: "3px 10px", borderRadius: 20 }}>PROVIDER PORTAL</span>
          </div>
        </div>
        <LoginScreen onLogin={checkAuth} />
      </div>
    );
  }

  if (profile && profile.role !== "provider" && profile.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#020817", display: "flex", alignItems: "center", justifyContent: "center", color: "#f0f9ff", fontFamily: "'Inter',sans-serif" }}>
        <div style={{ ...S.card, maxWidth: 420, textAlign: "center" }}>
          <Ship size={48} color="#64748b" style={{ margin: "0 auto 16px", display: "block" }} />
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>Provider Access Only</h2>
          <p style={{ color: "#64748b", marginBottom: 24 }}>
            Your account doesn't have provider access. Register as a provider to access this portal.
          </p>
          <a href="/join-as-provider" style={{ color: "#38bdf8", fontSize: 15 }}>
            → Register as a Provider
          </a>
        </div>
      </div>
    );
  }

  // ── Main portal UI ─────────────────────────────────────────────────────────

  return (
    <div style={{ ...S.page }}>
      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.logo}>
          <Anchor size={24} />
          Mooring Booking
          <span style={S.badge}>Provider Portal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#64748b", fontSize: 14 }}>
            {profile?.full_name || user.email}
          </span>
          <button style={S.logoutBtn} onClick={signOut}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </nav>

      <div style={S.content}>
        {/* Welcome Banner */}
        <div style={{ ...S.card, background: "linear-gradient(135deg, rgba(2,132,199,0.15), rgba(14,165,233,0.08))", borderColor: "rgba(56,189,248,0.25)", marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            Welcome, {profile?.full_name?.split(" ")[0] || "Provider"} 👋
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>
            This is your private mooring management portal. Add and manage your listings below.
            Listings go live after admin review (usually within 24 hours).
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ ...S.error, marginBottom: 20 }}>⚠ {error}</div>
        )}

        {/* Add form or edit form */}
        {showAddForm && !editTarget && (
          <MooringForm
            onSave={saveMooring}
            onCancel={() => setShowAddForm(false)}
            loading={savingMooring}
          />
        )}
        {editTarget && (
          <MooringForm
            initial={editTarget.form}
            onSave={saveMooring}
            onCancel={() => setEditTarget(null)}
            loading={savingMooring}
          />
        )}

        {/* Mooring list */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                My Moorings
              </h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                {moorings.length === 0 ? "No moorings listed yet" : `${moorings.length} mooring${moorings.length !== 1 ? "s" : ""} listed`}
              </p>
            </div>
            {!showAddForm && !editTarget && (
              <button style={S.ctaBtn} onClick={() => setShowAddForm(true)}>
                <Plus size={18} /> Add Mooring
              </button>
            )}
          </div>

          {loadingMoorings ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
              <Loader2 size={28} color="#38bdf8" style={{ animation: "spin 1s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : moorings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <Ship size={48} color="#1e293b" style={{ margin: "0 auto 16px", display: "block" }} />
              <p style={{ color: "#475569", marginBottom: 20 }}>No moorings yet. Add your first one!</p>
              <button style={S.ctaBtn} onClick={() => setShowAddForm(true)}>
                <Plus size={18} /> Add Your First Mooring
              </button>
            </div>
          ) : (
            moorings.map((m) => (
              <div key={m.id} style={S.mooringCard}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <strong style={{ fontSize: 16 }}>{m.name}</strong>
                    <span style={statusBadgeStyle(m.status)}>{m.status}</span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 14, display: "flex", gap: 16 }}>
                    <span><MapPin size={13} style={{ display: "inline", marginRight: 4 }} />{m.location}, {m.country}</span>
                    <span>€{m.price_per_night}/night</span>
                    <span>{m.max_boat_length}m max</span>
                    <span>{m.mooring_units} spot{m.mooring_units !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    style={iconBtnStyle("#38bdf8")}
                    title="Edit"
                    onClick={() => setEditTarget({
                      ...m,
                      form: {
                        name: m.name, country: m.country, location: m.location,
                        latitude: "", longitude: "", description: "",
                        price_per_night: String(m.price_per_night),
                        max_boat_length: String(m.max_boat_length), max_draft: "",
                        mooring_units: String(m.mooring_units),
                      }
                    })}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    style={iconBtnStyle("#f87171")}
                    onClick={() => deleteMooring(m.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info card */}
        <div style={{ ...S.card, borderColor: "rgba(250,204,21,0.15)", background: "rgba(250,204,21,0.04)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#facc15", marginBottom: 8 }}>📋 How it works</h3>
          <ul style={{ color: "#94a3b8", fontSize: 14, lineHeight: 2, paddingLeft: 20 }}>
            <li>Add your mooring details — name, location, price, boat specs</li>
            <li>Our team reviews and approves listings within 24h</li>
            <li>Approved listings appear in the booking platform for sailors</li>
            <li>You receive bookings and get 85% of each payment</li>
            <li>You can edit or deactivate listings at any time</li>
          </ul>
        </div>

        <p style={{ textAlign: "center", color: "#1e293b", fontSize: 12, marginTop: 24 }}>
          © {new Date().getFullYear()} Mooring Booking — Private Provider Portal
        </p>
      </div>
    </div>
  );
};

export default ProviderPortal;
