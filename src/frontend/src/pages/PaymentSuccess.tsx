import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispenseViaWifi } from "../hooks/useQueries";
import { useGetStripeSessionStatus } from "../hooks/useStripeCheckout";

type DispenseOutcome = "pending" | "success" | "error" | "no_data";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const getSessionStatus = useGetStripeSessionStatus();
  const dispenseViaWifi = useDispenseViaWifi();

  const getSessionStatusRef = useRef(getSessionStatus.mutateAsync);
  const dispenseRef = useRef(dispenseViaWifi.mutateAsync);
  useEffect(() => {
    getSessionStatusRef.current = getSessionStatus.mutateAsync;
  });
  useEffect(() => {
    dispenseRef.current = dispenseViaWifi.mutateAsync;
  });

  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dispenseOutcome, setDispenseOutcome] =
    useState<DispenseOutcome>("pending");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setVerificationStatus("error");
      setErrorMessage("No session ID found in URL");
      return;
    }

    getSessionStatusRef
      .current(sessionId)
      .then(async (status) => {
        if (status.__kind__ === "completed") {
          setVerificationStatus("success");

          const pendingJuice = sessionStorage.getItem("pendingJuice");
          const pendingSize = sessionStorage.getItem("pendingSize");

          if (!pendingJuice || !pendingSize) {
            setDispenseOutcome("no_data");
            return;
          }

          sessionStorage.removeItem("pendingJuice");
          sessionStorage.removeItem("pendingSize");

          try {
            await dispenseRef.current({
              juice: pendingJuice,
              size: Number.parseInt(pendingSize, 10),
            });
            setDispenseOutcome("success");
          } catch {
            setDispenseOutcome("error");
          }
        } else {
          setVerificationStatus("error");
          setErrorMessage(
            (status as { failed?: { error?: string } }).failed?.error ||
              "Payment verification failed",
          );
        }
      })
      .catch((err: unknown) => {
        setVerificationStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to verify payment",
        );
      });
  }, []);

  return (
    <div className="grand-bg min-h-screen flex items-center justify-center p-6 relative">
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          top: -100,
          left: "20%",
          background: "oklch(0.55 0.22 140)",
        }}
      />
      <div
        className="orb"
        style={{
          width: 300,
          height: 300,
          bottom: -50,
          right: "15%",
          background: "oklch(0.65 0.22 85)",
          animationDelay: "3s",
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
          {verificationStatus === "verifying" && (
            <>
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "oklch(0.82 0.18 85 / 0.12)",
                  border: "1px solid oklch(0.82 0.18 85 / 0.25)",
                }}
              >
                <Loader2
                  className="h-8 w-8 animate-spin"
                  style={{ color: "oklch(0.82 0.18 85)" }}
                />
              </div>
              <CardTitle
                className="font-display text-2xl font-bold"
                style={{ color: "oklch(0.96 0.01 90)" }}
              >
                Verifying Payment
              </CardTitle>
              <CardDescription style={{ color: "oklch(0.55 0.04 270)" }}>
                Please wait while we confirm your payment…
              </CardDescription>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "oklch(0.58 0.24 140 / 0.15)",
                  border: "1px solid oklch(0.68 0.22 140 / 0.35)",
                  boxShadow: "0 0 24px oklch(0.68 0.22 140 / 0.25)",
                }}
              >
                <CheckCircle2
                  className="h-8 w-8"
                  style={{ color: "oklch(0.72 0.22 140)" }}
                />
              </div>
              <CardTitle
                className="font-display text-2xl font-bold"
                style={{ color: "oklch(0.96 0.01 90)" }}
              >
                Payment Successful!
              </CardTitle>
              <CardDescription style={{ color: "oklch(0.55 0.04 270)" }}>
                Your payment has been confirmed.
              </CardDescription>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "oklch(0.55 0.24 25 / 0.15)",
                  border: "1px solid oklch(0.65 0.22 25 / 0.35)",
                }}
              >
                <AlertCircle
                  className="h-8 w-8"
                  style={{ color: "oklch(0.68 0.22 25)" }}
                />
              </div>
              <CardTitle
                className="font-display text-2xl font-bold"
                style={{ color: "oklch(0.96 0.01 90)" }}
              >
                Verification Failed
              </CardTitle>
              <CardDescription style={{ color: "oklch(0.55 0.04 270)" }}>
                We could not verify your payment.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {verificationStatus === "success" && (
            <>
              {dispenseOutcome === "pending" && (
                <Alert data-ocid="dispense.loading_state">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Connecting to vending machine…
                  </AlertDescription>
                </Alert>
              )}

              {dispenseOutcome === "success" && (
                <Alert data-ocid="dispense.success_state">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Your juice is being dispensed now!
                  </AlertDescription>
                </Alert>
              )}

              {dispenseOutcome === "error" && (
                <Alert data-ocid="dispense.error_state">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Payment received but could not connect to the vending
                    machine. Please show this page to staff.
                  </AlertDescription>
                </Alert>
              )}

              {dispenseOutcome === "no_data" && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Payment successful. Return to the vending machine to collect
                    your juice.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {verificationStatus === "error" && (
            <Alert data-ocid="dispense.error_state" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

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
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
