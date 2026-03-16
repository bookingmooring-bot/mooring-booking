import { useState, useEffect } from "react";
import { Anchor, Lock } from "lucide-react";

const SITE_PASSWORD = "mooring2026";
const STORAGE_KEY = "mb_site_access";

// Routes that are publicly accessible without password
const PUBLIC_ROUTES = ["/join-as-provider", "/auth"];

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate = ({ children }: PasswordGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Check if current route is public (using window.location since we're outside BrowserRouter)
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    window.location.pathname.startsWith(route)
  );

  // Allow public routes without password
  if (isPublicRoute || isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1628 0%, #0d2137 30%, #0a1628 60%, #061018 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.5; }
          75% { transform: translateY(-25px) translateX(15px); opacity: 0.7; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes anchorBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
      `}</style>

      <div
        style={{
          background: "linear-gradient(180deg, rgba(13,33,55,0.95) 0%, rgba(10,22,40,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "48px 40px",
          maxWidth: "440px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,150,255,0.05)",
          animation: "fadeIn 0.6s ease-out",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Anchor Icon */}
        <div
          style={{
            marginBottom: "24px",
            animation: "anchorBob 3s ease-in-out infinite",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              background: "linear-gradient(135deg, rgba(0,180,255,0.15), rgba(0,100,200,0.1))",
              borderRadius: "20px",
              border: "1px solid rgba(0,180,255,0.2)",
            }}
          >
            <Anchor size={36} color="#00b4ff" />
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            color: "#00b4ff",
            fontSize: "28px",
            fontWeight: 700,
            margin: "0 0 8px",
            letterSpacing: "0.5px",
          }}
        >
          Mooring Booking
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "3px",
            margin: "0 0 32px",
          }}
        >
          Site is currently under construction
        </p>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.3)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px" }}>
            <Lock size={12} />
            <span>Access</span>
          </div>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: "0 0 24px" }}>
          To continue, please enter the access password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              position: "relative",
              marginBottom: "16px",
              animation: isAnimating ? "shake 0.5s ease-in-out" : "none",
            }}
          >
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              style={{
                width: "100%",
                padding: "16px 48px 16px 20px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${error ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "12px",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
                transition: "border-color 0.3s, box-shadow 0.3s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = error ? "rgba(255,80,80,0.5)" : "rgba(0,180,255,0.4)";
                e.target.style.boxShadow = error ? "0 0 0 3px rgba(255,80,80,0.1)" : "0 0 0 3px rgba(0,180,255,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.08)";
                e.target.style.boxShadow = "none";
              }}
              autoFocus
            />
            <Lock
              size={18}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: error ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.2)",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#ff5050", fontSize: "13px", margin: "-8px 0 12px", textAlign: "left" }}>
              Incorrect password. Please try again.
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #00a0e3 0%, #00c4ff 50%, #00a0e3 100%)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 16px rgba(0,160,227,0.3)",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.target as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(0,160,227,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = "translateY(0)";
              (e.target as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,160,227,0.3)";
            }}
          >
            Access Site →
          </button>
        </form>

        {/* Footer */}
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "32px" }}>
          ⚓ Coming soon — Mooring Booking Platform
        </p>
      </div>
    </div>
  );
};

export default PasswordGate;
