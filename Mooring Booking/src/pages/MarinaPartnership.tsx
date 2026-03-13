import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Anchor, ArrowRight, ArrowLeft, CheckCircle2, Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type Step = "hero" | "form" | "success";

interface MarinaForm {
  marinaName: string;
  country: string;
  city: string;
  availableBerths: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  declarationAccepted: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  "Croatia", "Greece", "Italy", "Spain", "France",
  "Turkey", "Albania", "Malta", "Slovenia", "Montenegro", "Cyprus",
];

const BENEFITS = [
  { label: "15% Commission", desc: "Standard rate (under 50 berths)" },
  { label: "10,000+ Sailors", desc: "Estimated audience, 2026 season" },
  { label: "12% Commission", desc: "For marinas with 50+ berths" },
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
  qGroup: { marginBottom: 20 },
  qLabel: { fontSize: 14, fontWeight: 600, color: "#cbd5e1", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(56,189,248,0.22)",
    borderRadius: 12, color: "#f0f9ff", fontSize: 15, outline: "none",
    boxSizing: "border-box" as const, marginTop: 4,
  },
  select: {
    width: "100%", padding: "12px 14px",
    background: "rgba(10,20,45,0.8)",
    border: "1.5px solid rgba(56,189,248,0.22)",
    borderRadius: 12, color: "#f0f9ff", fontSize: 15, outline: "none",
    boxSizing: "border-box" as const, marginTop: 4, cursor: "pointer",
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
  successIcon: {
    width: 80, height: 80, borderRadius: "50%",
    background: "rgba(56,189,248,0.15)", border: "2px solid #38bdf8",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 24px",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────────
const MarinaPartnershipPage = () => {
  const [step, setStep] = useState<Step>("hero");
  const [data, setData] = useState<MarinaForm>({
    marinaName: "", country: "", city: "", availableBerths: "",
    contactName: "", email: "", phone: "", website: "",
    declarationAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Validation ──────────────────────────────────────────────────────────────────
  const formValid =
    data.marinaName.trim().length > 1 &&
    data.country !== "" &&
    data.city.trim().length > 1 &&
    data.availableBerths.trim() !== "" &&
    Number(data.availableBerths) > 0 &&
    data.contactName.trim().length > 1 &&
    data.email.trim().includes("@") &&
    data.phone.trim().length >= 6 &&
    data.declarationAccepted;

  // ── Submit ──────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      // 1. Save application to Supabase
      const { error: dbError } = await supabase.from("marina_applications").insert({
        marina_name: data.marinaName.trim(),
        location: data.city.trim(),
        country: data.country,
        contact_name: data.contactName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        website: data.website.trim() || null,
        number_of_berths: parseInt(data.availableBerths) || 0,
        status: "pending",
      });
      if (dbError) throw dbError;

      // 2. Send confirmation email via Edge Function
      await supabase.functions.invoke("send-marina-application", {
        body: {
          to: data.email.trim(),
          contactName: data.contactName.trim(),
          marinaName: data.marinaName.trim(),
          city: data.city.trim(),
          country: data.country,
          availableBerths: data.availableBerths,
          phone: data.phone.trim(),
          website: data.website.trim() || "",
        },
      });

      setStep("success");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render Hero ─────────────────────────────────────────────────────────────────
  const renderHero = () => (
    <div style={S.card}>
      <div style={S.heroTitle}>AI Smart Search for Available Berths</div>
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

      <button style={S.ctaBtn} onClick={() => setStep("form")}>
        List your marina for free <ArrowRight size={20} />
      </button>

      <p style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 16 }}>
        Free registration · 12% for 50+ berths · 15% standard · Cancel anytime
      </p>
    </div>
  );

  // ── Render Form ─────────────────────────────────────────────────────────────────
  const renderForm = () => (
    <div style={S.card}>
      <button style={S.backBtn} onClick={() => setStep("hero")}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={S.stepLabel}>Marina Application</div>
      <div style={S.stepTitle}>Tell us about your marina</div>

      {/* Marina Name */}
      <div style={S.qGroup}>
        <label style={S.qLabel}>Marina name *</label>
        <input style={S.input} placeholder="e.g. ACI Marina Split"
          value={data.marinaName} onChange={(e) => setData({ ...data, marinaName: e.target.value })} />
      </div>

      {/* Country + City */}
      <div style={{ ...S.qGroup, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={S.qLabel}>Country *</label>
          <select style={S.select} value={data.country}
            onChange={(e) => setData({ ...data, country: e.target.value })}>
            <option value="">Select...</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={S.qLabel}>City / Region *</label>
          <input style={S.input} placeholder="e.g. Split"
            value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
        </div>
      </div>

      {/* Available Berths */}
      <div style={S.qGroup}>
        <label style={S.qLabel}>Number of available berths *</label>
        <input style={S.input} type="number" min="1" placeholder="e.g. 213"
          value={data.availableBerths}
          onChange={(e) => setData({ ...data, availableBerths: e.target.value })} />
      </div>

      {/* Contact Name + Phone */}
      <div style={{ ...S.qGroup, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={S.qLabel}>Contact person *</label>
          <input style={S.input} placeholder="Full name"
            value={data.contactName} onChange={(e) => setData({ ...data, contactName: e.target.value })} />
        </div>
        <div>
          <label style={S.qLabel}>Phone *</label>
          <input style={S.input} type="tel" placeholder="+385 21 123 456"
            value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
        </div>
      </div>

      {/* Email */}
      <div style={S.qGroup}>
        <label style={S.qLabel}>Email address *</label>
        <input style={S.input} type="email" placeholder="marina@example.com"
          value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
      </div>

      {/* Website */}
      <div style={S.qGroup}>
        <label style={S.qLabel}>Marina website (optional)</label>
        <input style={S.input} placeholder="https://marina.com"
          value={data.website} onChange={(e) => setData({ ...data, website: e.target.value })} />
      </div>

      {/* Declaration */}
      <div style={{ ...S.qGroup, marginBottom: 28 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={data.declarationAccepted}
            onChange={(e) => setData({ ...data, declarationAccepted: e.target.checked })}
            style={{ marginTop: 3, width: 18, height: 18, accentColor: "#38bdf8", flexShrink: 0 }} />
          <span style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>
            I confirm that I am an{" "}
            <strong style={{ color: "#e0f2fe" }}>authorised representative</strong>{" "}
            of the listed marina and have legal authority to enter this partnership agreement.
          </span>
        </label>
      </div>

      {error && <div style={S.error}>⚠ {error}</div>}

      <button
        style={{
          ...S.ctaBtn,
          opacity: formValid && !loading ? 1 : 0.4,
          cursor: formValid && !loading ? "pointer" : "not-allowed",
        }}
        disabled={!formValid || loading}
        onClick={handleSubmit}
      >
        {loading
          ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Sending...</>
          : <>Submit application <ArrowRight size={20} /></>
        }
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Render Success ──────────────────────────────────────────────────────────────
  const renderSuccess = () => (
    <div style={{ ...S.card, textAlign: "center" }}>
      <div style={S.successIcon}>
        <CheckCircle2 size={40} color="#38bdf8" />
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
        Thank you for applying! 🎉
      </h2>
      <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
        We have received your marina application.<br />
        <strong style={{ color: "#e0f2fe" }}>
          Someone from our team will contact you shortly.
        </strong>
      </p>

      <div style={{
        background: "rgba(56,189,248,0.07)",
        border: "1px solid rgba(56,189,248,0.18)",
        borderRadius: 14, padding: "20px 24px", marginBottom: 28, textAlign: "left",
      }}>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Your application:</p>
        <p style={{ color: "#e0f2fe", fontSize: 15, fontWeight: 600 }}>{data.marinaName}</p>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>{data.city}, {data.country}</p>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>{data.availableBerths} berths · {data.email}</p>
      </div>

      <button style={S.ctaBtn} onClick={() => window.location.href = "/"}>
        <Anchor size={20} /> Back to home
      </button>

      <p style={{ color: "#475569", fontSize: 13, marginTop: 16 }}>
        A confirmation email has been sent to {data.email}
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
        {step === "form" && renderForm()}
        {step === "success" && renderSuccess()}

        <p style={{ textAlign: "center", color: "#1e293b", fontSize: 12, marginTop: 32 }}>
          © {new Date().getFullYear()} Mooring Booking · Marina Partnership Portal
        </p>
      </div>
    </div>
  );
};

export default MarinaPartnershipPage;
