import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

// These paths are always accessible to everyone, regardless of role
const ALWAYS_ALLOWED = [
  "/become-provider",
  "/auth",
  "/provider-portal",
  "/marina-partnership",
  "/join-as-provider",
];

interface AppRouteGuardProps {
  children: ReactNode;
}

/**
 * Global route guard.
 *
 * - Not logged in         → redirect to /become-provider
 * - role = 'user'         → redirect to /become-provider
 * - role = 'provider'     → redirect to /become-provider (provider portal only)
 * - role = 'admin'        → full access
 */
export default function AppRouteGuard({ children }: AppRouteGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const isAllowedPath = ALWAYS_ALLOWED.some((p) =>
    location.pathname.startsWith(p)
  );

  useEffect(() => {
    // Wait until auth + profile are resolved
    if (authLoading || profileLoading) return;

    // Admin on become-provider → redirect to dashboard
    if (profile?.role === "admin" && location.pathname.startsWith("/become-provider")) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Already on an always-allowed path → do nothing
    if (isAllowedPath) return;

    // Not logged in → send to become-provider
    if (!user) {
      navigate("/become-provider", { replace: true });
      return;
    }

    // Logged in but role is 'user' or 'provider' → send to become-provider
    if (profile && (profile.role === "user" || profile.role === "provider")) {
      navigate("/become-provider", { replace: true });
    }

    // role = 'admin' → allow, nothing to do
  }, [authLoading, profileLoading, user, profile, isAllowedPath, navigate]);

  // Show a loading spinner while we determine access
  if ((authLoading || profileLoading) && !isAllowedPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    );
  }

  return <>{children}</>;
}
