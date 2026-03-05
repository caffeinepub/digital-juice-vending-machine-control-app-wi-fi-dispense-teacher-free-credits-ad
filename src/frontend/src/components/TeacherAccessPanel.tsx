import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, GraduationCap, LogOut } from "lucide-react";
import { useState } from "react";
import { getTeacherAccounts, saveTeacherAccounts } from "./TeacherAdminManager";

const SESSION_KEY = "teacherSession";

export interface TeacherSession {
  name: string;
  freeCredits: number;
}

export function getTeacherSession(): TeacherSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TeacherSession;
  } catch {
    return null;
  }
}

export function saveTeacherSession(session: TeacherSession | null): void {
  if (session === null) {
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function decrementTeacherCredit(): void {
  const session = getTeacherSession();
  if (!session) return;

  // Update sessionStorage
  const updated: TeacherSession = {
    ...session,
    freeCredits: Math.max(0, session.freeCredits - 1),
  };
  saveTeacherSession(updated);

  // Update localStorage
  const accounts = getTeacherAccounts();
  const updatedAccounts = accounts.map((a) =>
    a.name === session.name
      ? { ...a, freeCredits: Math.max(0, a.freeCredits - 1) }
      : a,
  );
  saveTeacherAccounts(updatedAccounts);
}

interface TeacherAccessPanelProps {
  onSessionChange?: () => void;
}

export default function TeacherAccessPanel({
  onSessionChange,
}: TeacherAccessPanelProps) {
  const [session, setSession] = useState<TeacherSession | null>(
    getTeacherSession,
  );
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const accounts = getTeacherAccounts();
    const match = accounts.find(
      (a) =>
        a.name.toLowerCase() === name.trim().toLowerCase() &&
        a.password === password,
    );

    if (!match) {
      setError("Incorrect name or password");
      setPassword("");
      return;
    }

    const newSession: TeacherSession = {
      name: match.name,
      freeCredits: match.freeCredits,
    };
    saveTeacherSession(newSession);
    setSession(newSession);
    setName("");
    setPassword("");
    onSessionChange?.();
  };

  const handleLogout = () => {
    saveTeacherSession(null);
    setSession(null);
    onSessionChange?.();
  };

  if (session) {
    const hasCredits = session.freeCredits > 0;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Teacher Access
          </CardTitle>
          <CardDescription>Logged in as {session.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Free Credits:</span>
            <Badge
              variant={hasCredits ? "default" : "secondary"}
              className="text-base px-4 py-1"
            >
              {session.freeCredits} / 30
            </Badge>
          </div>

          {!hasCredits && (
            <p className="text-sm text-muted-foreground">
              You have used all your free credits. Payment is required.
            </p>
          )}

          <Button
            data-ocid="teacher.secondary_button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Teacher Login
        </CardTitle>
        <CardDescription>Teachers get 30 free juice dispenses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacher-login-name">Name</Label>
            <Input
              id="teacher-login-name"
              data-ocid="teacher.input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacher-login-password">Password</Label>
            <Input
              id="teacher-login-password"
              data-ocid="teacher.input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Your password"
            />
          </div>

          {error && (
            <Alert data-ocid="teacher.error_state" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            data-ocid="teacher.primary_button"
            type="submit"
            className="w-full"
            disabled={!name || !password}
          >
            Teacher Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
