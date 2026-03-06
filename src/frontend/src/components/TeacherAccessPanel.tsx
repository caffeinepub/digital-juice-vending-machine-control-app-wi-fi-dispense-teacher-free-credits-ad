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
import { AlertCircle, GraduationCap, LogOut, Star } from "lucide-react";
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

  const updated: TeacherSession = {
    ...session,
    freeCredits: Math.max(0, session.freeCredits - 1),
  };
  saveTeacherSession(updated);

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
      <Card className="grand-card rounded-3xl overflow-hidden border-0">
        <CardHeader
          className="pb-4"
          style={{
            background: hasCredits
              ? "linear-gradient(135deg, oklch(0.28 0.12 140) 0%, oklch(0.20 0.08 150) 100%)"
              : "linear-gradient(135deg, oklch(0.20 0.06 275) 0%, oklch(0.16 0.05 280) 100%)",
            borderBottom: hasCredits
              ? "1px solid oklch(0.68 0.22 140 / 0.25)"
              : "1px solid oklch(0.82 0.18 85 / 0.12)",
          }}
        >
          <CardTitle
            className="flex items-center gap-2 font-display font-bold text-xl"
            style={{ color: "oklch(0.96 0.01 90)" }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{
                background: hasCredits
                  ? "oklch(0.68 0.22 140 / 0.25)"
                  : "oklch(0.82 0.18 85 / 0.15)",
              }}
            >
              <GraduationCap
                className="h-4 w-4"
                style={{
                  color: hasCredits
                    ? "oklch(0.78 0.22 140)"
                    : "oklch(0.82 0.18 85)",
                }}
              />
            </div>
            Teacher Access
          </CardTitle>
          <CardDescription style={{ color: "oklch(0.62 0.04 270)" }}>
            Logged in as{" "}
            <strong style={{ color: "oklch(0.88 0.04 270)" }}>
              {session.name}
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-semibold"
              style={{ color: "oklch(0.62 0.04 270)" }}
            >
              Free Credits Remaining
            </span>
            <Badge
              className="text-base px-5 py-1.5 rounded-full font-extrabold border-0 shadow-lg"
              style={
                hasCredits
                  ? {
                      background:
                        "linear-gradient(135deg, oklch(0.58 0.24 140), oklch(0.48 0.22 150))",
                      color: "white",
                      boxShadow: "0 4px 16px oklch(0.58 0.24 140 / 0.4)",
                    }
                  : {
                      background: "oklch(0.25 0.04 275)",
                      color: "oklch(0.55 0.04 270)",
                    }
              }
            >
              <Star className="h-3 w-3 mr-1 inline" />
              {session.freeCredits} / 30
            </Badge>
          </div>

          {!hasCredits && (
            <p
              className="text-sm font-medium rounded-xl px-4 py-3"
              style={{
                color: "oklch(0.72 0.18 55)",
                background: "oklch(0.68 0.22 55 / 0.08)",
                border: "1px solid oklch(0.68 0.22 55 / 0.20)",
              }}
            >
              You have used all your free credits. Payment is required.
            </p>
          )}

          <Button
            data-ocid="teacher.secondary_button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "oklch(0.18 0.05 275)",
              border: "1px solid oklch(0.35 0.06 275)",
              color: "oklch(0.75 0.04 270)",
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="grand-card rounded-3xl overflow-hidden border-0">
      <CardHeader
        className="pb-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.20 0.06 275) 0%, oklch(0.16 0.05 280) 100%)",
          borderBottom: "1px solid oklch(0.82 0.18 85 / 0.12)",
        }}
      >
        <CardTitle
          className="flex items-center gap-2 font-display font-bold text-xl"
          style={{ color: "oklch(0.96 0.01 90)" }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: "oklch(0.68 0.22 140 / 0.18)" }}
          >
            <GraduationCap
              className="h-4 w-4"
              style={{ color: "oklch(0.78 0.22 140)" }}
            />
          </div>
          Teacher Login
        </CardTitle>
        <CardDescription style={{ color: "oklch(0.62 0.04 270)" }}>
          Teachers receive 30 free juice dispenses 🎓
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="teacher-login-name"
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "oklch(0.82 0.18 85)" }}
            >
              Name
            </Label>
            <Input
              id="teacher-login-name"
              data-ocid="teacher.input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Your name"
              className="rounded-xl font-medium"
              style={{
                background: "oklch(0.18 0.04 275)",
                border: "1px solid oklch(0.32 0.06 275)",
                color: "oklch(0.92 0.02 90)",
              }}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="teacher-login-password"
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "oklch(0.82 0.18 85)" }}
            >
              Password
            </Label>
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
              className="rounded-xl font-medium"
              style={{
                background: "oklch(0.18 0.04 275)",
                border: "1px solid oklch(0.32 0.06 275)",
                color: "oklch(0.92 0.02 90)",
              }}
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
            className="w-full font-extrabold py-5 rounded-xl text-base shadow-lg transition-all duration-200 hover:scale-[1.02] border-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.62 0.24 140) 0%, oklch(0.52 0.22 150) 100%)",
              color: "white",
              boxShadow: "0 4px 24px oklch(0.62 0.24 140 / 0.4)",
            }}
            disabled={!name || !password}
          >
            🎓 Teacher Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
