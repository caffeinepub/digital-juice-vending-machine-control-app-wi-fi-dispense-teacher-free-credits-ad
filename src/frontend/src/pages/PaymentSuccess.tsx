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

  // Stable refs so the one-time effect doesn't need them in the deps array
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

    // Verify payment then attempt WiFi dispense
    getSessionStatusRef
      .current(sessionId)
      .then(async (status) => {
        if (status.__kind__ === "completed") {
          setVerificationStatus("success");

          // Read pending juice data from sessionStorage
          const pendingJuice = sessionStorage.getItem("pendingJuice");
          const pendingSize = sessionStorage.getItem("pendingSize");

          if (!pendingJuice || !pendingSize) {
            setDispenseOutcome("no_data");
            return;
          }

          // Clear sessionStorage immediately so we don't double-dispense on reload
          sessionStorage.removeItem("pendingJuice");
          sessionStorage.removeItem("pendingSize");

          // Attempt WiFi dispense
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
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="text-center">
          {verificationStatus === "verifying" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verifying Payment</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment…
              </CardDescription>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>
                Your payment has been confirmed.
              </CardDescription>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Verification Failed</CardTitle>
              <CardDescription>
                We could not verify your payment.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
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
                <Alert
                  data-ocid="dispense.success_state"
                  className="border-green-500/50 bg-green-50 dark:bg-green-950/20"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Your juice is being dispensed now!
                  </AlertDescription>
                </Alert>
              )}

              {dispenseOutcome === "error" && (
                <Alert
                  data-ocid="dispense.error_state"
                  className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20"
                >
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
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
            className="w-full"
            variant="outline"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
