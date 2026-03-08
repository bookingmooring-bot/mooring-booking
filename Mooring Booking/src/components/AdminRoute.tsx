import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

interface AdminRouteProps {
    children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile();

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    if (profile && profile.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
