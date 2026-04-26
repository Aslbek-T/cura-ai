import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard";
import DriverDashboard from "./DriverDashboard";
import { CuraLogo } from "@/components/CuraLogo";
import { Loader2 } from "lucide-react";

const Index = () => {
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

  switch (profile.role) {
    case "patient":
      return <PatientDashboard />;
    case "doctor":
      return <DoctorDashboard />;
    case "volunteer_driver":
      return <DriverDashboard />;
    default:
      return <PatientDashboard />;
  }
};

export default Index;
