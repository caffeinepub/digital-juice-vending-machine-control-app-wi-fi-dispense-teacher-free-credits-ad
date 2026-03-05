import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock } from "lucide-react";
import { type ReactNode, useState } from "react";

const ADMIN_PASSWORD = "Manoj9225";
const SESSION_KEY = "adminAuth";

interface AdminPasswordGateProps {
  children: ReactNode;
}

export default function AdminPasswordGate({
  children,
}: AdminPasswordGateProps) {
  const [authenticated, setAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === "true",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
      setError(null);
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="container max-w-md py-24 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                data-ocid="admin.input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            {error && (
              <Alert data-ocid="admin.error_state" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              data-ocid="admin.primary_button"
              type="submit"
              className="w-full"
              disabled={!password}
            >
              Enter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
