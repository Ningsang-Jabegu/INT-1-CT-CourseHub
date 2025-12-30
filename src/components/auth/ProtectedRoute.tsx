import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "teacher" | "student";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [hasShownError, setHasShownError] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole && !hasShownError) {
      toast({
        title: "Access Denied",
        description: `You do not have privilege to access this ${requiredRole} page`,
        variant: "destructive",
      });
      setHasShownError(true);
    }
  }, [isLoading, isAuthenticated, requiredRole, user?.role, hasShownError]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to their own dashboard
    const redirectPath = user?.role === "admin" ? "/admin" : user?.role === "teacher" ? "/teacher" : "/student";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
