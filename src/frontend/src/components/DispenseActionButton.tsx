import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDispenseViaWifi } from "../hooks/useQueries";
import { useCreateCheckoutSession } from "../hooks/useStripeCheckout";

interface DispenseActionButtonProps {
  juice: string;
  size: number | null;
  priceInCents: number;
  canProceed: boolean;
  isFreeDispense: boolean;
}

export default function DispenseActionButton({
  juice,
  size,
  priceInCents,
  canProceed,
  isFreeDispense,
}: DispenseActionButtonProps) {
  const { identity } = useInternetIdentity();
  const createCheckoutSession = useCreateCheckoutSession();
  const dispenseViaWifi = useDispenseViaWifi();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isDispensing, setIsDispensing] = useState(false);
  const [dispenseSuccess, setDispenseSuccess] = useState(false);

  const isAuthenticated = !!identity;
  const isPending = isDispensing || createCheckoutSession.isPending;

  const handleDispense = async () => {
    setError(null);
    setDispenseSuccess(false);

    if (!isAuthenticated) {
      setError("Please log in to dispense juice");
      return;
    }

    if (!canProceed || size === null) {
      setError("Please select both juice type and size");
      return;
    }

    if (isFreeDispense) {
      // Free dispense: make a direct WiFi call to the vending machine
      setIsDispensing(true);
      try {
        await dispenseViaWifi.mutateAsync({ juice, size });
        toast.success(`Juice dispensed! Enjoy your ${juice}.`);
        setDispenseSuccess(true);
        // Invalidate teacher free-chances queries so the UI reflects updated credits
        queryClient.invalidateQueries({ queryKey: ["teacherFreeChances"] });
        queryClient.invalidateQueries({
          queryKey: ["canTeacherDispenseForFree"],
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to dispense juice";
        toast.error(message);
        setError(message);
      } finally {
        setIsDispensing(false);
      }
      return;
    }

    // Paid flow — save pending juice to sessionStorage before redirecting to Stripe
    sessionStorage.setItem("pendingJuice", juice);
    sessionStorage.setItem("pendingSize", String(size));

    try {
      const items = [
        {
          productName: `${juice} - ${size}ml`,
          productDescription: `Fresh ${juice} juice`,
          priceInCents: BigInt(priceInCents),
          quantity: BigInt(1),
          currency: "USD",
        },
      ];

      const session = await createCheckoutSession.mutateAsync(items);
      if (!session?.url) {
        throw new Error("Stripe session missing url");
      }
      window.location.href = session.url;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create checkout session";
      console.error("Checkout error:", err);
      setError(message);
    }
  };

  return (
    <div className="space-y-4">
      {isPending && (
        <div
          data-ocid="dispense.loading_state"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {isDispensing ? "Dispensing juice…" : "Processing payment…"}
        </div>
      )}

      <Button
        data-ocid="dispense.primary_button"
        onClick={handleDispense}
        disabled={!canProceed || isPending}
        className="w-full"
        size="lg"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isDispensing ? "Dispensing…" : "Processing…"}
          </>
        ) : isFreeDispense ? (
          "Dispense (Free)"
        ) : (
          "Pay & Dispense"
        )}
      </Button>

      {dispenseSuccess && (
        <Alert
          data-ocid="dispense.success_state"
          className="border-green-500/50 bg-green-50 dark:bg-green-950/20"
        >
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            Your {juice} is being dispensed. Enjoy!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert data-ocid="dispense.error_state" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isAuthenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to dispense juice</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
