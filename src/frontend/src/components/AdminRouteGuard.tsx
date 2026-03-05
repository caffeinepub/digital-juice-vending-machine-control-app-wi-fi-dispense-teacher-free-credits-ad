import type { ReactNode } from "react";
import { useAuthorization } from "../hooks/useAuthorization";
import AccessDeniedScreen from "./AccessDeniedScreen";

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAdmin, isLoading } = useAuthorization();

  if (isLoading) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
