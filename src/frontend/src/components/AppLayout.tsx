import { Outlet } from "@tanstack/react-router";
import AppHeader from "./AppHeader";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer
        className="py-5 px-4 text-center text-sm font-medium relative z-10"
        style={{
          background: "oklch(0.10 0.04 280)",
          borderTop: "1px solid oklch(0.82 0.18 85 / 0.12)",
          color: "oklch(0.45 0.04 270)",
        }}
      >
        <p>
          © {new Date().getFullYear()} · Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition-opacity font-bold"
            style={{ color: "oklch(0.82 0.18 85)" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
