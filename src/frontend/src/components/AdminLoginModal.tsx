import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Shield } from "lucide-react";
import { useState } from "react";

const ADMIN_PASSWORD = "Manoj9225";
const SESSION_KEY = "adminAuth";

interface AdminLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminLoginModal({
  open,
  onOpenChange,
}: AdminLoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setError(null);
      setPassword("");
      onOpenChange(false);
      navigate({ to: "/admin" });
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="admin_login.dialog"
        className="sm:max-w-[400px] rounded-3xl border-0 p-0 overflow-hidden"
        style={{
          background: "oklch(0.14 0.04 280)",
          boxShadow:
            "0 0 0 1px oklch(0.82 0.18 85 / 0.15), 0 24px 64px oklch(0.08 0.04 280 / 0.9)",
        }}
      >
        {/* Header gradient band */}
        <div
          className="px-6 pt-8 pb-6 text-center"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.20 0.07 275) 0%, oklch(0.14 0.04 280) 100%)",
            borderBottom: "1px solid oklch(0.82 0.18 85 / 0.10)",
          }}
        >
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl glow-pulse"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.18 85 / 0.20), oklch(0.72 0.18 85 / 0.10))",
              border: "1px solid oklch(0.82 0.18 85 / 0.35)",
            }}
          >
            <Shield
              className="h-8 w-8"
              style={{ color: "oklch(0.82 0.18 85)" }}
            />
          </div>
          <DialogHeader>
            <DialogTitle
              className="font-display font-bold text-2xl text-center"
              style={{ color: "oklch(0.96 0.01 90)" }}
            >
              Admin Login
            </DialogTitle>
            <DialogDescription
              className="text-center mt-1"
              style={{ color: "oklch(0.55 0.04 270)" }}
            >
              Enter the admin password to access the control panel.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="admin-modal-password"
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "oklch(0.82 0.18 85)" }}
            >
              Password
            </Label>
            <Input
              id="admin-modal-password"
              data-ocid="admin_login.input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Enter admin password"
              autoFocus
              className="rounded-xl font-medium"
              style={{
                background: "oklch(0.18 0.04 275)",
                border: "1px solid oklch(0.32 0.06 275)",
                color: "oklch(0.92 0.02 90)",
              }}
            />
          </div>

          {error && (
            <Alert data-ocid="admin_login.error_state" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-3 pt-2 flex-row">
            <Button
              data-ocid="admin_login.cancel_button"
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl font-semibold"
              style={{
                background: "oklch(0.18 0.04 275)",
                border: "1px solid oklch(0.32 0.06 275)",
                color: "oklch(0.70 0.04 270)",
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin_login.submit_button"
              type="submit"
              disabled={!password}
              className="flex-1 rounded-xl font-extrabold border-0 shadow-lg transition-all duration-200 hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.18 85) 0%, oklch(0.72 0.20 75) 100%)",
                color: "oklch(0.12 0.04 280)",
                boxShadow: "0 4px 20px oklch(0.82 0.18 85 / 0.35)",
              }}
            >
              Enter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
