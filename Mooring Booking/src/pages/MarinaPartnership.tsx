import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Anchor, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff,
  Loader2, Mail, User, Lock,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type Step = "hero" | "questions" | "register" | "success";

interface MarinaAnswers {
  marinaName: string;
  country: string;
  city: string;
  numberOfBerths: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  declarationAccepted: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  "Croatia", "Greece", "Italy", "Spain", "France",
  "Turkey", "Albania", "Malta", "Slovenia", "Montenegro", "Cyprus",
];

const BENEFITS = [
  { label: "12% Commission", desc: "Only on completed bookings" },
  { label: "10,000+ Sailors", desc: "Estimated audience, 2026 season" },
  { label: "Free Listing", desc: "No upfront costs" },
  { label: "Free Registration", desc: "No hidden costs" },
];

// ─── Styles ─────────────────────────────────────────────────────────────────────
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
  badge: {
    marginLeft: 10, fontSize: 11, fontWeight: 600, letterSpacing: 2,
    color: "#38bdf8", background: "rgba(56,189,248,0.12)",
    padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" as const,
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
    fontSize: 38, fontWeight: 900, lineHeight: 1.15,
    background: "linear-gradient(135deg, #e0f2fe, #38bdf8, #7dd3fc)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text", marginBottom: 16, textAlign: "center" as const,
  },
  heroSub: {
    color: "#94a3b8", textAlign: "center" as const, fontSize: 16, lineHeight: 1.7,
    marginBottom: 36, maxWidth: 520, margin: "0 auto 36px",
  },
  benefitsGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 14, marginBottom: 28,
  },
  benefit: {
    background: "rgba(56,189,248,0.06)",
    border: "1px solid rgba(56,189,248,0.12)",
    borderRadius: 14, padding: "16px 18px",
  },
  benefitStat: { fontSize: 17, fontWeight: 800, color: "#38bdf8" },
  benefitDesc: { fontSize: 13, color: "#64748b", marginTop: 3 },
  ctaBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    width: "100%", padding: "16px 24px",
    background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
    border: "none", borderRadius: 14, color: "#fff",
    fontSize: 17, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 24px rgba(14,165,233,0.45)",
    transition: "opacity 0.2s, transform 0.15s",
  },
  stepLabel: {
    textAlign: "center" as const, fontSize: 13, color: "#38bdf8",
    letterSpacing: 1.5, textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 8,
  },
  stepTitle: { fontSize: 26, fontWeight: 800, marginBottom: 28, textAlign: "center" as const },
  qGroup: { marginBottom: 22 },
  qLabel: { fontSize: 14, fontWeight: 600, color: "#cbd5e1", marginBottom: 8 },
  input: {
    width: "100%", padding: "13px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(56,189,248,0.22)",
    borderRadius: 12, color: "#f0f9ff", fontSize: 15, outline: "none",
    boxSizing: "border-box" as const, marginTop: 6,
  },
  select: {
    width: "100%", padding: "13px 16px",
    background: "rgba(10,20,45,0.8)",
    border: "1.5px solid rgba(56,189,248,0.22)",
    borderRadius: 12, color: "#f0f9ff", fontSize: 15, outline: "none",
    boxSizing: "border-box" as const, marginTop: 6, cursor: "pointer",
  },
  inputLabel: { fontSize: 14, fontWeight: 500, color: "#cbd5e1" },
  inputWrap: { position: "relative" as const, display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute" as const, left: 14, color: "#475569", pointerEvents: "none" as const },
  inputWithIcon: {
    width: "100%", padding: "13px 14px 13px 44px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(56,189,248,0.22)",
    borderRadius: 12, color: "#f0f9ff", fontSize: 15, outline: "none",
    boxSizing: "border-box" as const,
  },
  eyeBtn: {
    position: "absolute" as const, right: 14, background: "none", border: "none",
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
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "24px 0" },
  dividerLine: {
    flex: 1, height: 1,
    background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent)",
  },
  dividerText: { fontSize: 12, color: "#475569", whiteSpace: "nowrap" as const },
};

const dotStyle = (active: boolean): React.CSSProperties => ({
  width: active ? 24 : 8, height: 8, borderRadius: 4,
  background: active ? "#38bdf8" : "rgba(56,189,248,0.2)",
  transition: "all 0.3s",
});

// ─── Main Component ───────────────────────────────────────────────────────────────
const MarinaPartnershipPage = () => {
  const [step, setStep] = useState<Step>("hero");
  const [answers, setAnswers] = useState<MarinaAnswers>({
    marinaName: "", country: "", city: "", numberOfBerths: "",
    contactName: "", phone: "", email: "", website: "",
    declarationAccepted: false,
  });
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignIn, setIsSignIn] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────────
  const questionsValid =
    answers.marinaName.trim().length > 1 &&
    answers.country !== "" &&
    answers.city.trim().length > 1 &&
    answers.numberOfBerths.trim() !== "" &&
    Number(answers.numberOfBerths) > 0 &&
    answers.contactName.trim().length > 1 &&
    answers.phone.trim().length >= 6 &&
    answers.declarationAccepted;

  const formValid = isSignIn
    ? (form.email.trim() && form.password)
    : (form.name.trim() && form.email.trim() && form.password.length >= 6);

  // ── Submit ──────────────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignIn) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (signInError) throw signInError;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await saveMarinaApplication(user.id);
        window.location.href = "/";
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim() || answers.contactName.trim(),
            registered_as_marina: true,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (data.user) await saveMarinaApplication(data.user.id);

      setStep("success");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveMarinaApplication = async (userId: string) => {
    try {
      await supabase.from("marina_applications").insert({
        marina_name: answers.marinaName.trim(),
        location: answers.city.trim(),
        country: answers.country,
        contact_name: answers.contactName.trim(),
        email: answers.email.trim() || form.email.trim(),
        phone: answers.phone.trim(),
        website: answers.website.trim() || null,
        number_of_berths: parseInt(answers.numberOfBerths) || 0,
        status: "pending",
        user_id: userId,
      });
    } catch {
      console.warn("Marina application could not be saved");
    }
  };

  // ── Render Hero ─────────────────────────────────────────────────────────────────
  const renderHero = () => (
    <div style={S.card}>
      <div style={S.heroTitle}>
        AI Smart Search for Available Berths<br />in Your Marina
      </div>
      <p style={S.heroSub}>
        List your marina on Mooring Booking and connect with 10,000+{" "}
        potential sailors across the Mediterranean — no upfront costs.
      </p>

      <div style={S.benefitsGrid}>
        {BENEFITS.map((b) => (
          <div key={b.label} style={S.benefit}>
            <div style={S.benefitStat}>{b.label}</div>
            <div style={S.benefitDesc}>{b.desc}</div>
          </div>
        ))}
      </div>

      <button style={S.ctaBtn} onClick={() => setStep("questions")}>
        List your marina for free <ArrowRight size={20} />
      </button>

      <p style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 16 }}>
        Free registration · 12% commission on earnings only · Cancel anytime
      </p>
    </div>
  );

  // ── Render Questions ────────────────────────────────────────────────────────────
  const renderQuestions = () => (
    <div style={S.card}>
      <button style={S.backBtn} onClick={() => setStep("hero")}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={S.stepLabel}>Step 1 of 2</div>
      <div style={S.stepTitle}>Tell us about your marina</div>

      {/* Marina Name */}
      <div style={S.qGroup}>
        <label style={S.qLabel}>Marina name *</label>
        <input
          style={S.input}
          placeholder="e.g. ACI Marina Split"
          value={answers.marinaName}
          onChange={(e) => setAnswers({ ...answers, marinaName: e.target.value })}
          required
        />
      </div>

      {/* Country + City */}
      <div style={{ ...S.qGroup, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={S.qLabel}>Country *</label>
          <select
            style={S.select}
            value={answers.country}
            onChange={(e) => setAnswers({ ...answers, country: e.target.value })}
            required
          >
            <option value="">Select...</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={S.qLabel}>City / Region *</label>
          <input
            style={S.input}
            placeholder="e.g. Split"
            value={answers.city}
            onChange={(e) => setAnswers({ ...answers, city: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Number of Berths */}
      <div style={S.qGroup}>
        <label style={S.qLabel}>Total number of berths *</label>
        <input
          style={S.input}
          type="number"
          min="1"
          placeholder="e.g. 250"
          value={answers.numberOfBerths}
          onChange={(e) => setAnswers({ ...answers, numberOfBerths: e.target.value })}
          required
        />
      </div>

      {/* Contact Name + Phone */}
      <div style={{ ...S.qGroup, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={S.qLabel}>Contact person *</label>
          <input
            style={S.input}
            placeholder="Full name"
            value={answers.contactName}
            onChange={(e) => setAnswers({ ...answers, contactName: e.target.value })}
            required
          />
        </div>
        <div>
          <label style={S.qLabel}>Phone *</label>
          <input
            style={S.input}
            type="tel"
            placeholder="+385 21 123 456"
            value={answers.phone}
            onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Website */}
      <div style={S.qGroup}>
        <label style={S.qLabel}>Marina website (optional)</label>
        <input
          style={S.input}
          placeholder="https://marina.com"
          value={answers.website}
          onChange={(e) => setAnswers({ ...answers, website: e.target.value })}
        />
      </div>

      {/* Declaration */}
      <div style={{ ...S.qGroup, marginBottom: 28 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={answers.declarationAccepted}
            onChange={(e) => setAnswers({ ...answers, declarationAccepted: e.target.checked })}
            style={{ marginTop: 3, width: 18, height: 18, accentColor: "#38bdf8", flexShrink: 0 }}
          />
          <span style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>
            I confirm that I am an{" "}
            <strong style={{ color: "#e0f2fe" }}>authorised representative</strong>{" "}
            of the listed marina and have legal authority to enter this partnership agreement.
            I agree to a 12% commission on bookings made through the platform.
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
        Continue <ArrowRight size={20} />
      </button>

      <div style={S.stepDots}>
        <div style={dotStyle(true)} />
        <div style={dotStyle(false)} />
      </div>
    </div>
  );

  // ── Render Register ─────────────────────────────────────────────────────────────
  const renderRegister = () => (
    <div style={S.card}>
      <button style={S.backBtn} onClick={() => setStep("questions")}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={S.stepLabel}>Step 2 of 2</div>
      <div style={S.stepTitle}>
        {isSignIn ? "Sign in to continue" : "Create your marina account"}
      </div>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {!isSignIn && (
          <div>
            <label style={S.inputLabel}>Full name</label>
            <div style={S.inputWrap}>
              <User size={16} style={S.inputIcon} />
              <input
                type="text"
                style={S.inputWithIcon}
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        <div>
          <label style={S.inputLabel}>Email address</label>
          <div style={S.inputWrap}>
            <Mail size={16} style={S.inputIcon} />
            <input
              type="email"
              style={S.inputWithIcon}
              placeholder="marina@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label style={S.inputLabel}>Password</label>
          <div style={S.inputWrap}>
            <Lock size={16} style={S.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              style={{ ...S.inputWithIcon, paddingRight: 44 }}
              placeholder={isSignIn ? "Your password" : "At least 6 characters"}
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
            <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Please wait...</>
          ) : isSignIn ? (
            <><span>Sign in</span> <ArrowRight size={18} /></>
          ) : (
            <><span>Submit application</span> <ArrowRight size={18} /></>
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      <div style={S.divider}>
        <div style={S.dividerLine} />
        <span style={S.dividerText}>or</span>
        <div style={S.dividerLine} />
      </div>

      <button
        style={{
          background: "none", border: "none", color: "#38bdf8",
          cursor: "pointer", width: "100%", fontSize: 14, padding: 4,
        }}
        onClick={() => { setIsSignIn(!isSignIn); setError(""); }}
      >
        {isSignIn ? "No account? Register here" : "Already have an account? Sign in"}
      </button>

      <div style={S.stepDots}>
        <div style={dotStyle(false)} />
        <div style={dotStyle(true)} />
      </div>
    </div>
  );

  // ── Render Success ──────────────────────────────────────────────────────────────
  const renderSuccess = () => (
    <div style={{ ...S.card, textAlign: "center" }}>
      <div style={S.successIcon}>
        <CheckCircle2 size={40} color="#38bdf8" />
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Application received! 🎉
      </h2>
      <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
        Your marina has been successfully submitted for partnership.<br />
        <strong style={{ color: "#e0f2fe" }}>
          Our B2B team will contact you within 24 hours
        </strong>{" "}
        to discuss the details and get you onboarded.
      </p>

      <div style={{
        background: "rgba(56,189,248,0.07)",
        border: "1px solid rgba(56,189,248,0.18)",
        borderRadius: 14, padding: "20px 24px", marginBottom: 28, textAlign: "left",
      }}>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Your application:</p>
        <p style={{ color: "#e0f2fe", fontSize: 15, fontWeight: 600 }}>{answers.marinaName}</p>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>{answers.city}, {answers.country}</p>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>{answers.numberOfBerths} berths · {answers.phone}</p>
      </div>

      <button style={S.ctaBtn} onClick={() => window.location.href = "/"}>
        <Anchor size={20} /> Back to home
      </button>

      <p style={{ color: "#475569", fontSize: 13, marginTop: 16 }}>
        Check your email for next steps from our B2B team.
      </p>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.logo}>
          <Anchor size={28} />
          Mooring Booking
          <span style={S.badge}>For Marinas</span>
        </div>

        {step === "hero" && renderHero()}
        {step === "questions" && renderQuestions()}
        {step === "register" && renderRegister()}
        {step === "success" && renderSuccess()}

        <p style={{ textAlign: "center", color: "#1e293b", fontSize: 12, marginTop: 32 }}>
          © {new Date().getFullYear()} Mooring Booking · Marina Partnership Portal
        </p>
      </div>
    </div>
  );
};

export default MarinaPartnershipPage;
