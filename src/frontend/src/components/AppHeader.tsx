import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useState } from "react";
import AdminLoginModal from "./AdminLoginModal";

export default function AppHeader() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <header className="grand-header sticky top-0 z-50 w-full">
      <div className="container flex h-18 items-center justify-between py-3">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="relative">
            <img
              src="/assets/generated/vending-logo-grand.dim_512x512.png"
              alt="Juice Vending"
              className="h-11 w-11 rounded-full shadow-lg border-2 glow-pulse"
              style={{ borderColor: "oklch(0.82 0.18 85 / 0.6)" }}
            />
          </div>
          <div className="flex flex-col">
            <span
              className="font-display font-bold text-xl leading-tight shimmer-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              Juice Vending
            </span>
            <span
              className="text-xs font-medium leading-none"
              style={{ color: "oklch(0.62 0.04 270)" }}
            >
              Smart Dispensing System
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            data-ocid="admin_login.open_modal_button"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="font-semibold shadow-lg transition-all duration-200 hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.18 85) 0%, oklch(0.75 0.20 75) 100%)",
              color: "oklch(0.12 0.04 280)",
              border: "none",
              boxShadow: "0 2px 16px oklch(0.82 0.18 85 / 0.35)",
            }}
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Login
          </Button>
        </div>
      </div>

      <AdminLoginModal open={modalOpen} onOpenChange={setModalOpen} />
    </header>
  );
}
