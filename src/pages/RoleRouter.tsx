import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { CuraLogo } from "@/components/CuraLogo";
import { Loader2 } from "lucide-react";

const ROLE_PATH: Record<AppRole, string> = {
  patient: "/patient",
  doctor: "/doctor",
  volunteer_driver: "/driver",
  admin: "/doctor",
};

export default function RoleRouter({
  children,
  require,
}: {
  children?: ReactNode;
  require?: AppRole;
}) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <CuraLogo size="lg" />
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div>
          <CuraLogo size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">Setting up your profile…</p>
        </div>
      </div>
    );
  }

  // No specific requirement: redirect to dashboard for the role
  if (!require) {
    return <Navigate to={ROLE_PATH[profile.role]} replace />;
  }

  // Wrong role: bounce them to their own dashboard
  if (profile.role !== require) {
    return <Navigate to={ROLE_PATH[profile.role]} replace />;
  }

  return <>{children}</>;
}
