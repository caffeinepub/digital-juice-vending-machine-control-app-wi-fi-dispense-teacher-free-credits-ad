import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, Settings } from "lucide-react";
import { useAuthorization } from "../hooks/useAuthorization";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function AppHeader() {
  const { identity, clear, login, isLoggingIn } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { isAdmin } = useAuthorization();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/vending-logo.dim_512x512.png"
            alt="Juice Vending"
            className="h-10 w-10"
          />
          <span className="font-bold text-lg">Juice Vending</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && userProfile && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {userProfile.name}
            </span>
          )}

          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          )}

          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            variant={isAuthenticated ? "outline" : "default"}
            size="sm"
          >
            {isLoggingIn ? (
              "Logging in..."
            ) : isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
