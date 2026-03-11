import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Anchor, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff,
  Loader2, Phone, Mail, User, Lock, Ship, Star, TrendingUp, Shield, Users
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingAnswers {
  // Map of mooring type id → quantity (number string). Empty map = nothing selected.
  mooringTypes: Record<string, string>;
  phone: string;
  declarationAccepted: boolean;
}

type Step = "hero" | "questions" | "register" | "success";

// ─── Data ─────────────────────────────────────────────────────────────────────

const MOORING_TYPES = [
  { id: "buoy", label: "Private Buoy", icon: "⚓" },
  { id: "berth", label: "Marina Berth", icon: "🏗️" },
  { id: "dock", label: "Dock / Pier", icon: "🛥️" },
  { id: "other", label: "Other", icon: "🌊" },
];


const BENEFITS = [
  { icon: Shield,   label: "Bez skrivenih troškova", desc: "Listanje je potpuno besplatno" },
  { icon: TrendingUp, label: "Samo 15%",             desc: "Provizija samo od ostvarene zarade" },
];

// ─── Styles ────────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020817 0%, #0c1a3a 50%, #051525 100%)",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: "#f0f9ff",
    overflowX: "hidden",
  },
  container: { maxWidth: 680, margin: "0 auto", padding: "20px 20px 60px" },
  logo: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "24px 0 0", justifyContent: "center",
    color: "#38bdf8", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(56,189,248,0.18)",
    borderRadius: 24,
    padding: "40px 36px",
    marginTop: 32,
    boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
  },
  heroTitle: {
    fontSize: 42, fontWeight: 900, lineHeight: 1.1,
    background: "linear-gradient(135deg, #e0f2fe, #38bdf8, #7dd3fc)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text", marginBottom: 16, textAlign: "center",
  },
  heroSub: {
    color: "#94a3b8", textAlign: "center", fontSize: 17, lineHeight: 1.7,
    marginBottom: 36, maxWidth: 520, margin: "0 auto 40px",
  },
  benefitsGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 14, marginBottom: 36,
  },
  benefit: {
    background: "rgba(56,189,248,0.06)",
    border: "1px solid rgba(56,189,248,0.12)",
    borderRadius: 14, padding: "16px 18px",
  },
  benefitStat: { fontSize: 24, fontWeight: 800, color: "#38bdf8" },
  benefitDesc: { fontSize: 13, color: "#64748b", marginTop: 2 },
  ctaBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    width: "100%", padding: "16px 24px",
    background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
    border: "none", borderRadius: 14, color: "#fff",
    fontSize: 18, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 24px rgba(14,165,233,0.45)",
    transition: "opacity 0.2s, transform 0.15s",
  },
  stepLabel: {
    textAlign: "center", fontSize: 13, color: "#38bdf8",
    letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8,
  },
  stepTitle: { fontSize: 26, fontWeight: 800, marginBottom: 28, textAlign: "center" },
  qGroup: { marginBottom: 26 },
  qLabel: { fontSize: 15, fontWeight: 600, color: "#cbd5e1", marginBottom: 12 },
  optionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  input: {
    width: "100%", padding: "13px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(56,189,248,0.22)",
    borderRadius: 12, color: "#f0f9ff", fontSize: 15, outline: "none",
    boxSizing: "border-box" as const, marginTop: 8,
  },
  inputLabel: { fontSize: 14, fontWeight: 500, color: "#cbd5e1" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: 14, color: "#475569", pointerEvents: "none" as const },
  inputWithIcon: {
    width: "100%", padding: "13px 14px 13px 44px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(56,189,248,0.22)",
    borderRadius: 12, color: "#f0f9ff", fontSize: 15, outline: "none",
    boxSizing: "border-box" as const,
  },
  eyeBtn: {
    position: "absolute", right: 14, background: "none", border: "none",
    cursor: "pointer", color: "#64748b", padding: 0, lineHeight: 1,
  },
  backBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "none", border: "none", color: "#64748b",
    cursor: "pointer", fontSize: 14, padding: "0 0 20px",
  },
  error: {
    color: "#f87171", fontSize: 13, padding: "10px 14px",
    background: "rgba(239,68,68,0.1)", borderRadius: 10, marginTop: 12,
  },
  stepDots: { display: "flex", justifyContent: "center", gap: 8, marginTop: 28 },
  successIcon: {
    width: 80, height: 80, borderRadius: "50%",
    background: "rgba(56,189,248,0.15)", border: "2px solid #38bdf8",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 24px",
  },
  divider: {
    display: "flex", alignItems: "center", gap: 12, margin: "24px 0",
  },
  dividerLine: {
    flex: 1, height: 1,
    background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent)",
  },
  dividerText: { fontSize: 12, color: "#475569", whiteSpace: "nowrap" },
};

// Dynamic style helpers (extracted from S to avoid Record<string, CSSProperties> conflict)
const optionStyle = (selected: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 10,
  padding: "12px 16px", borderRadius: 12, cursor: "pointer",
  border: selected ? "2px solid #38bdf8" : "1.5px solid rgba(56,189,248,0.15)",
  background: selected ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)",
  color: selected ? "#e0f2fe" : "#94a3b8",
  fontWeight: selected ? 600 : 400, fontSize: 14,
  transition: "all 0.15s",
});

const optionCountStyle = (selected: boolean): React.CSSProperties => ({
  padding: "10px 16px", borderRadius: 12, cursor: "pointer",
  border: selected ? "2px solid #38bdf8" : "1.5px solid rgba(56,189,248,0.15)",
  background: selected ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)",
  color: selected ? "#e0f2fe" : "#94a3b8",
  fontWeight: selected ? 700 : 400, fontSize: 14,
  transition: "all 0.15s", textAlign: "center",
});

const dotStyle = (active: boolean): React.CSSProperties => ({
  width: active ? 24 : 8, height: 8, borderRadius: 4,
  background: active ? "#38bdf8" : "rgba(56,189,248,0.2)",
  transition: "all 0.3s",
});

// ─── Main Component ────────────────────────────────────────────────────────────

const ProviderLanding = () => {
  const [step, setStep] = useState<Step>("hero");
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    mooringTypes: {}, phone: "", declarationAccepted: false,
  });
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignIn, setIsSignIn] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const questionsValid =
    Object.keys(answers.mooringTypes).length > 0 &&
    Object.values(answers.mooringTypes).every(q => q.trim() !== "" && Number(q) > 0) &&
    answers.phone.trim().length >= 6 &&
    answers.declarationAccepted;

  const formValid = isSignIn
    ? (form.email.trim() && form.password)
    : (form.name.trim() && form.email.trim() && form.password.length >= 6);

  const getPortalUrl = () => `${window.location.origin}/provider-portal`;

  // ── Send welcome email via Resend (calls the existing edge function) ──────────

  const sendWelcomeEmail = async (email: string, name: string) => {
    try {
      const typeSummary = Object.entries(answers.mooringTypes)
        .map(([id, qty]) => `${MOORING_TYPES.find(t => t.id === id)?.label ?? id}: ${qty}`)
        .join(", ");
      await supabase.functions.invoke("send-provider-welcome", {
        body: {
          to: email,
          name: name || email.split("@")[0],
          portal_url: getPortalUrl(),
          mooring_type: typeSummary,
          quantity: Object.values(answers.mooringTypes).reduce((s, v) => s + Number(v), 0).toString(),
        },
      });
    } catch {
      console.warn("Welcome email could not be sent");
    }
  };

  // ── Set role to provider on the profile ───────────────────────────────────────

  const setProviderRole = async (userId: string, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: "provider",
          phone: answers.phone || null,
          provider_consent_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (!error) break;
      await new Promise((r) => setTimeout(r, 800));
    }
  };

  // ── Save onboarding answers to provider_onboarding table ──────────────────────

  const saveOnboardingData = async (userId: string) => {
    try {
      await supabase.from("provider_onboarding").upsert({
        user_id: userId,
        mooring_types: answers.mooringTypes,   // JSONB: { buoy: 2, berth: 5 }
        phone: answers.phone || null,
        declaration_accepted: answers.declarationAccepted,
        declaration_accepted_at: answers.declarationAccepted ? new Date().toISOString() : null,
      }, { onConflict: "user_id" });
    } catch {
      // Non-fatal
      console.warn("Onboarding data could not be saved");
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignIn) {
        // Sign in existing user and redirect to portal
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (signInError) throw signInError;
        // For existing sign-ins from this page, also ensure provider role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await setProviderRole(user.id);
        window.location.href = "/provider-portal";
        return;
      }

      // New registration
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.name.trim(), registered_as_provider: true },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Set provider role (with retries since profile trigger may be slightly delayed)
        await setProviderRole(data.user.id);
        // Save full onboarding form data to DB
        await saveOnboardingData(data.user.id);
        // Send welcome email with portal link
        await sendWelcomeEmail(form.email.trim(), form.name.trim());
      }

      setStep("success");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────────

  const renderHero = () => (
    <div style={S.card}>
      <div style={S.heroTitle}>Iznajmite vaš vez.<br />Zaradite pasivno.</div>
      <p style={S.heroSub}>
        Prijavite vaš privatni vez, bovu ili privezište i počnite zarađivati
        bez skrivenih troškova i upfront naknada.
      </p>

      <div style={{ ...S.benefitsGrid, gridTemplateColumns: "1fr 1fr", maxWidth: 400, margin: "0 auto 32px" }}>
        {BENEFITS.map((b) => (
          <div key={b.label} style={S.benefit}>
            <div style={S.benefitStat}>{b.label}</div>
            <div style={S.benefitDesc}>{b.desc}</div>
          </div>
        ))}
      </div>

      <button style={S.ctaBtn} onClick={() => setStep("questions")}>
        Počni besplatno <ArrowRight size={20} />
      </button>

      <p style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 16 }}>
        Bez početnih troškova · 15% provizija samo od zarade · Otkaz u bilo kada
      </p>
    </div>
  );

  // Toggle a mooring type on/off in the multi-select map
  const toggleMooringType = (id: string) => {
    setAnswers(prev => {
      const next = { ...prev.mooringTypes };
      if (next[id] !== undefined) {
        delete next[id];
      } else {
        next[id] = "1";
      }
      return { ...prev, mooringTypes: next };
    });
  };

  const setTypeQty = (id: string, val: string) => {
    setAnswers(prev => ({
      ...prev,
      mooringTypes: { ...prev.mooringTypes, [id]: val },
    }));
  };

  const renderQuestions = () => (
    <div style={S.card}>
      <button style={S.backBtn} onClick={() => setStep("hero")}>
        <ArrowLeft size={16} /> Natrag
      </button>
      <div style={S.stepLabel}>Korak 1 od 2</div>
      <div style={S.stepTitle}>Recite nam o vašem vezu</div>

      {/* Multi-select mooring types */}
      <div style={S.qGroup}>
        <div style={S.qLabel}>Koje vrste veza imate? <span style={{ color: "#475569", fontWeight: 400 }}>(odaberite sve što se primjenjuje)</span></div>
        <div style={S.optionGrid}>
          {MOORING_TYPES.map((t) => {
            const selected = answers.mooringTypes[t.id] !== undefined;
            return (
              <div key={t.id}>
                <div
                  style={optionStyle(selected)}
                  onClick={() => toggleMooringType(t.id)}
                >
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  {t.label}
                  {selected && <span style={{ marginLeft: "auto", color: "#38bdf8", fontSize: 18 }}>✓</span>}
                </div>
                {/* Per-type quantity input, shown only when selected */}
                {selected && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#94a3b8", fontSize: 13, whiteSpace: "nowrap" }}>
                      Koliko {t.label}?
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      style={{
                        ...S.input,
                        marginTop: 0,
                        width: 90,
                        padding: "8px 12px",
                        textAlign: "center",
                      }}
                      value={answers.mooringTypes[t.id]}
                      onChange={(e) => setTypeQty(t.id, e.target.value)}
                      placeholder="Qty"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Telefon — obavezan */}
      <div style={S.qGroup}>
        <label style={S.qLabel}>
          <Phone size={15} style={{ display: "inline", marginRight: 6 }} />
          Broj telefona <span style={{ color: "#f87171", fontWeight: 500 }}>*</span>
        </label>
        <input
          style={S.input}
          placeholder="+385 91 234 5678"
          value={answers.phone}
          onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
          required
        />
      </div>

      {/* Izjava o pravu raspolaganja */}
      <div style={{ ...S.qGroup, marginBottom: 28 }}>
        <label style={{
          display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer",
        }}>
          <input
            type="checkbox"
            checked={answers.declarationAccepted}
            onChange={(e) => setAnswers({ ...answers, declarationAccepted: e.target.checked })}
            style={{ marginTop: 3, width: 18, height: 18, accentColor: "#38bdf8", flexShrink: 0 }}
          />
          <span style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>
            Potvrđujem da imam <strong style={{ color: "#e0f2fe" }}>zakonsko pravo iznajmljivanja</strong> navedenih
            vezova — temeljem vlasništva, koncesije ili pisane ovlasti vlasnika ili koncesionara.
          </span>
        </label>
      </div>

      <button
        style={{
          ...S.ctaBtn,
          opacity: questionsValid ? 1 : 0.4,
          cursor: questionsValid ? "pointer" : "not-allowed",
        }}
        disabled={!questionsValid}
        onClick={() => setStep("register")}
      >
        Nastavi <ArrowRight size={20} />
      </button>

      <div style={S.stepDots}>
        <div style={dotStyle(true)} />
        <div style={dotStyle(false)} />
      </div>
    </div>
  );

  const renderRegister = () => (
    <div style={S.card}>
      <button style={S.backBtn} onClick={() => setStep("questions")}>
        <ArrowLeft size={16} /> Natrag
      </button>
      <div style={S.stepLabel}>Korak 2 od 2</div>
      <div style={S.stepTitle}>
        {isSignIn ? "Prijavite se za nastavak" : "Kreirajte provajder račun"}
      </div>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {!isSignIn && (
          <div>
            <label style={S.inputLabel}>Ime i prezime</label>
            <div style={S.inputWrap}>
              <User size={16} style={S.inputIcon} />
              <input
                type="text"
                style={S.inputWithIcon}
                placeholder="Vaše ime i prezime"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        <div>
          <label style={S.inputLabel}>E-mail adresa</label>
          <div style={S.inputWrap}>
            <Mail size={16} style={S.inputIcon} />
            <input
              type="email"
              style={S.inputWithIcon}
              placeholder="vi@primjer.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label style={S.inputLabel}>Lozinka</label>
          <div style={S.inputWrap}>
            <Lock size={16} style={S.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              style={{ ...S.inputWithIcon, paddingRight: 44 }}
              placeholder={isSignIn ? "Vaša lozinka" : "Najmanje 6 znakova"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={isSignIn ? undefined : 6}
            />
            <button
              type="button"
              style={S.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <div style={S.error}>⚠ {error}</div>}

        <button
          type="submit"
          style={{
            ...S.ctaBtn,
            opacity: formValid && !loading ? 1 : 0.5,
            cursor: formValid && !loading ? "pointer" : "not-allowed",
          }}
          disabled={!formValid || loading}
        >
          {loading ? (
            <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Molimo pričekajte...</>
          ) : isSignIn ? (
            <><span>Prijava i pristup portalu</span> <ArrowRight size={18} /></>
          ) : (
            <><span>Kreiraj račun i dobij link portala</span> <ArrowRight size={18} /></>
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      <div style={S.divider}>
        <div style={S.dividerLine} />
        <span style={S.dividerText}>ili</span>
        <div style={S.dividerLine} />
      </div>

      <button
        style={{
          background: "none", border: "none", color: "#38bdf8",
          cursor: "pointer", width: "100%", fontSize: 14, padding: 4,
        }}
        onClick={() => { setIsSignIn(!isSignIn); setError(""); }}
      >
        {isSignIn ? "Nemate račun? Registrirajte se" : "Već imate račun? Prijavite se"}
      </button>

      <div style={S.stepDots}>
        <div style={dotStyle(false)} />
        <div style={dotStyle(true)} />
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div style={{ ...S.card, textAlign: "center" }}>
      <div style={S.successIcon}>
        <CheckCircle2 size={40} color="#38bdf8" />
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Dobrodošli! 🎉
      </h2>
      <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
        Vaš provajder račun je uspješno kreiran.<br />
        <strong style={{ color: "#e0f2fe" }}>
          Provjerite e-mail — poslali smo vam privatni link za vaš Provider Portal
        </strong>{" "}
        gdje možete odmah početi postavljati vaše vezove.
      </p>

      <div style={{
        background: "rgba(56,189,248,0.07)",
        border: "1px solid rgba(56,189,248,0.18)",
        borderRadius: 14, padding: "20px 24px", marginBottom: 28, textAlign: "left",
      }}>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>Vaš Provider Portal:</p>
        <p style={{ color: "#38bdf8", fontSize: 15, fontWeight: 600, wordBreak: "break-all" }}>
          {getPortalUrl()}
        </p>
      </div>

      <button
        style={S.ctaBtn}
        onClick={() => window.location.href = "/provider-portal"}
      >
        <Ship size={20} /> Idi na moj Provider Portal
      </button>

      <p style={{ color: "#475569", fontSize: 13, marginTop: 16 }}>
        Spremite ovaj link — to je vaš privatni radni prostor.
      </p>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Logo */}
        <div style={S.logo}>
          <Anchor size={28} />
          Mooring Booking
          <span style={{
            marginLeft: 10, fontSize: 11, fontWeight: 600, letterSpacing: 2,
            color: "#38bdf8", background: "rgba(56,189,248,0.12)",
            padding: "3px 10px", borderRadius: 20, textTransform: "uppercase",
          }}>
          Za Pružatelje
          </span>
        </div>

        {step === "hero" && renderHero()}
        {step === "questions" && renderQuestions()}
        {step === "register" && renderRegister()}
        {step === "success" && renderSuccess()}

        <p style={{ textAlign: "center", color: "#1e293b", fontSize: 12, marginTop: 32 }}>
          © {new Date().getFullYear()} Mooring Booking · Privatni provajder portal
        </p>
      </div>
    </div>
  );
};

export default ProviderLanding;
