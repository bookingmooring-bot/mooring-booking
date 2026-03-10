import { useState } from "react";

// Routes that bypass PasswordGate entirely (public provider pages)
const PUBLIC_PROVIDER_PATHS = ["/join-as-provider", "/provider-portal"];

const STORAGE_KEY = "mb_gate_auth";
const CORRECT_PASSWORD = "Brod.96.vez";

interface PasswordGateProps {
    children: React.ReactNode;
}

const PasswordGate = ({ children }: PasswordGateProps) => {
    // Read sessionStorage SYNCHRONOUSLY so there is zero delay / flash.
    // This avoids the old checking=true → null flash that broke production.
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        () => sessionStorage.getItem(STORAGE_KEY) === "true"
    );
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ─── Bypass: public provider pages skip the gate entirely ─────────────────
    if (PUBLIC_PROVIDER_PATHS.some(p => window.location.pathname.startsWith(p))) {
        return <>{children}</>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            sessionStorage.setItem(STORAGE_KEY, "true");
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setShake(true);
            setPassword("");
            setTimeout(() => setShake(false), 600);
        }
    };

    if (isAuthenticated) return <>{children}</>;

    return (
        <div style={styles.overlay}>
            {/* Animated background waves */}
            <div style={styles.wavesContainer}>
                <svg style={styles.wavesSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <defs>
                        <style>{`
              @keyframes wave1 { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
              @keyframes wave2 { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
              @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
              @keyframes floatAnchor { 0%, 100% { transform: translateY(0px) rotate(-5deg); } 50% { transform: translateY(-12px) rotate(5deg); } }
              @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 20%, 40%, 60%, 80% { transform: translateX(8px); } }
              @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 20px rgba(56, 189, 248, 0.3); } 50% { box-shadow: 0 0 40px rgba(56, 189, 248, 0.6); } }
            `}</style>
                    </defs>
                </svg>
            </div>

            {/* Stars background */}
            <div style={styles.starsLayer} aria-hidden="true">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            width: Math.random() * 3 + 1 + "px",
                            height: Math.random() * 3 + 1 + "px",
                            background: "white",
                            borderRadius: "50%",
                            top: Math.random() * 60 + "%",
                            left: Math.random() * 100 + "%",
                            opacity: Math.random() * 0.7 + 0.3,
                            animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
                            animationDelay: Math.random() * 2 + "s",
                        }}
                    />
                ))}
            </div>

            {/* Main card */}
            <div style={{ ...styles.card, animation: shake ? "shake 0.6s ease-in-out" : "fadeInUp 0.8s ease-out forwards" }}>
                {/* Anchor icon */}
                <div style={styles.iconWrapper}>
                    <span style={styles.anchorIcon}>⚓</span>
                </div>

                {/* Title */}
                <h1 style={styles.title}>Mooring Booking</h1>
                <p style={styles.subtitle}>Site is currently under construction</p>

                {/* Divider */}
                <div style={styles.divider}>
                    <div style={styles.dividerLine} />
                    <span style={styles.dividerText}>🔒 access</span>
                    <div style={styles.dividerLine} />
                </div>

                <p style={styles.description}>
                    To continue, please enter the access password.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            placeholder="Enter password..."
                            style={{
                                ...styles.input,
                                ...(error ? styles.inputError : {}),
                            }}
                            autoFocus
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                            tabIndex={-1}
                        >
                            {showPassword ? "👁️" : "🔒"}
                        </button>
                    </div>

                    {error && (
                        <p style={styles.errorText}>❌ Incorrect password. Please try again.</p>
                    )}

                    <button type="submit" style={styles.submitButton}>
                        <span>Access Site</span>
                        <span style={styles.arrow}>→</span>
                    </button>
                </form>

                {/* Footer */}
                <p style={styles.footerText}>
                    🌊 Coming soon — Mooring Booking Platform
                </p>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #020817 0%, #0c1a3a 40%, #0a2a4a 70%, #051525 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        overflow: "hidden",
        minHeight: "100vh",
    },
    wavesContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "200px",
        overflow: "hidden",
        opacity: 0.15,
    },
    wavesSvg: {
        width: "200%",
        height: "100%",
        fill: "#38bdf8",
    },
    starsLayer: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
    },
    card: {
        position: "relative",
        zIndex: 10,
        background: "rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: "24px",
        padding: "48px 44px",
        maxWidth: "440px",
        width: "90%",
        boxShadow: "0 0 60px rgba(56, 189, 248, 0.15), 0 25px 80px rgba(0,0,0,0.5)",
        textAlign: "center",
        animation: "glowPulse 4s ease-in-out infinite",
    },
    iconWrapper: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "16px",
    },
    anchorIcon: {
        fontSize: "56px",
        display: "inline-block",
        animation: "floatAnchor 4s ease-in-out infinite",
        filter: "drop-shadow(0 0 12px rgba(56, 189, 248, 0.6))",
    },
    title: {
        fontSize: "28px",
        fontWeight: "800",
        color: "#f0f9ff",
        margin: "0 0 6px 0",
        letterSpacing: "-0.5px",
        background: "linear-gradient(135deg, #e0f2fe, #38bdf8, #0ea5e9)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    },
    subtitle: {
        fontSize: "14px",
        color: "#94a3b8",
        margin: "0 0 24px 0",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
    },
    divider: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
    },
    dividerLine: {
        flex: 1,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)",
    },
    dividerText: {
        fontSize: "12px",
        color: "#64748b",
        whiteSpace: "nowrap",
        letterSpacing: "1px",
        textTransform: "uppercase",
    },
    description: {
        fontSize: "15px",
        color: "#cbd5e1",
        marginBottom: "28px",
        lineHeight: "1.6",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    inputWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    input: {
        width: "100%",
        padding: "14px 50px 14px 18px",
        background: "rgba(255,255,255,0.06)",
        border: "1.5px solid rgba(56,189,248,0.25)",
        borderRadius: "12px",
        color: "#f0f9ff",
        fontSize: "16px",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxSizing: "border-box",
        letterSpacing: "0.5px",
    },
    inputError: {
        borderColor: "rgba(239,68,68,0.6)",
        boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
    },
    eyeButton: {
        position: "absolute",
        right: "14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "18px",
        padding: "0",
        lineHeight: "1",
        opacity: 0.6,
        transition: "opacity 0.2s",
    },
    errorText: {
        color: "#f87171",
        fontSize: "13px",
        margin: "0",
        textAlign: "left",
        padding: "0 4px",
    },
    submitButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "15px 24px",
        background: "linear-gradient(135deg, #0284c7, #0ea5e9, #38bdf8)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        letterSpacing: "0.3px",
        boxShadow: "0 4px 20px rgba(14,165,233,0.4)",
        marginTop: "4px",
    },
    arrow: {
        fontSize: "18px",
        transition: "transform 0.2s",
    },
    footerText: {
        marginTop: "28px",
        fontSize: "12px",
        color: "#475569",
        letterSpacing: "0.5px",
    },
};

export default PasswordGate;
