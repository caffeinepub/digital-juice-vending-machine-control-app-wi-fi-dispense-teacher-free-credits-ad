import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="grand-bg min-h-screen flex items-center justify-center p-6 relative">
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          top: -100,
          left: "20%",
          background: "oklch(0.55 0.22 25)",
        }}
      />

      <Card className="grand-card w-full max-w-md rounded-3xl border-0 overflow-hidden relative z-10">
        <CardHeader
          className="text-center pb-6 pt-8"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.20 0.07 275) 0%, oklch(0.14 0.04 280) 100%)",
            borderBottom: "1px solid oklch(0.82 0.18 85 / 0.10)",
          }}
        >
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "oklch(0.55 0.24 25 / 0.15)",
              border: "1px solid oklch(0.65 0.22 25 / 0.35)",
            }}
          >
            <XCircle
              className="h-8 w-8"
              style={{ color: "oklch(0.68 0.22 25)" }}
            />
          </div>
          <CardTitle
            className="font-display text-2xl font-bold"
            style={{ color: "oklch(0.96 0.01 90)" }}
          >
            Payment Cancelled
          </CardTitle>
          <CardDescription style={{ color: "oklch(0.55 0.04 270)" }}>
            Your payment was not completed. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button
            onClick={() => navigate({ to: "/" })}
            className="w-full font-extrabold rounded-xl py-5 border-0 shadow-lg transition-all duration-200 hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.18 85) 0%, oklch(0.72 0.20 75) 100%)",
              color: "oklch(0.12 0.04 280)",
              boxShadow: "0 4px 20px oklch(0.82 0.18 85 / 0.35)",
            }}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
