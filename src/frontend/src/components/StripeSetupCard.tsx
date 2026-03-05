import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../hooks/useQueries";

export default function StripeSetupCard() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US,CA,GB");

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error("Please enter your Stripe secret key");
      return;
    }

    const countryList = countries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (countryList.length === 0) {
      toast.error("Please enter at least one valid country code");
      return;
    }

    try {
      await setConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countryList,
      });
      toast.success("Stripe configuration saved successfully!");
      setSecretKey("");
    } catch (error) {
      toast.error("Failed to save Stripe configuration");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading Stripe configuration...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Stripe Configured
          </CardTitle>
          <CardDescription>
            Your Stripe payment integration is active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Stripe is configured and ready to accept payments. To update your
              configuration, enter new details below.
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Stripe Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_live_..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries">
                Allowed Countries (comma-separated)
              </Label>
              <Input
                id="countries"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="US,CA,GB"
              />
              <p className="text-sm text-muted-foreground">
                Two-letter country codes (e.g., US, CA, GB)
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={setConfig.isPending}
              className="w-full"
            >
              {setConfig.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Configuration"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Payment Setup</CardTitle>
        <CardDescription>
          Configure Stripe to accept payments for juice purchases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Stripe is not configured. Please enter your Stripe credentials to
            enable payment processing.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_live_..."
            />
            <p className="text-sm text-muted-foreground">
              Your Stripe secret key from the Stripe dashboard
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries">
              Allowed Countries (comma-separated)
            </Label>
            <Input
              id="countries"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              placeholder="US,CA,GB"
            />
            <p className="text-sm text-muted-foreground">
              Two-letter country codes (e.g., US, CA, GB)
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={setConfig.isPending}
            className="w-full"
          >
            {setConfig.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
