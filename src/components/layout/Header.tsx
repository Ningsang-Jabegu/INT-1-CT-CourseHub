import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Plus, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const roleLink = (() => {
    if (user?.role === "admin") return { path: "/admin", label: "Admin" };
    if (user?.role === "teacher") return { path: "/teacher", label: "Teacher" };
    if (user?.role === "student") return { path: "/student", label: "Student" };
    return null;
  })();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and brand */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">CourseHub</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button 
            variant={location.pathname === "/" ? "secondary" : "ghost"} 
            size="sm" 
            asChild
          >
            <Link to="/" className="text-black">Courses</Link>
          </Button>

          <Button 
            variant={location.pathname === "/verify-certificate" ? "secondary" : "ghost"} 
            size="sm" 
            asChild
          >
            <Link to="/verify-certificate" className="text-black flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Verify
            </Link>
          </Button>
          
          {isAuthenticated ? (
            <>
              {roleLink && (
                <Button
                  variant={location.pathname === roleLink.path ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to={roleLink.path} className="text-black">
                    <Plus className="h-4 w-4 text-black" />
                    {roleLink.label}
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              asChild
            >
              <Link to="/login">Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
