import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AccessDeniedScreen() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            {isAuthenticated
              ? "You do not have permission to access this page. Admin access is required."
              : "Please log in to access this page."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!isAuthenticated ? (
            <Button onClick={login} disabled={isLoggingIn} className="w-full">
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Return to Home</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
