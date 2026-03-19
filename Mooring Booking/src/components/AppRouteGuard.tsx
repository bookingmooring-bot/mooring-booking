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
 * - Not logged in  → redirect to /become-provider
 * - Logged in, role = 'user' (lead) → redirect to /become-provider
 * - Logged in, role = 'provider' | 'admin' → full access
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

    // Already on an always-allowed path → do nothing
    if (isAllowedPath) return;

    // Not logged in → send to become-provider
    if (!user) {
      navigate("/become-provider", { replace: true });
      return;
    }

    // Logged in but role is 'user' (default lead) → send to become-provider
    if (profile && profile.role === "user") {
      navigate("/become-provider", { replace: true });
    }

    // role = 'provider' or 'admin' → allow, nothing to do
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
