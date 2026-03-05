import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Droplets } from "lucide-react";
import { useState } from "react";
import DispenseActionButton from "../components/DispenseActionButton";
import ProfileSetupDialog from "../components/ProfileSetupDialog";
import TeacherAccessPanel, {
  getTeacherSession,
} from "../components/TeacherAccessPanel";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile, useGetPrices } from "../hooks/useQueries";
import {
  JUICE_TYPES,
  SIZE_OPTIONS,
  formatPrice,
  formatSize,
} from "../lib/vendingCatalog";

// Mapping of juice names to their cartoon image paths
const JUICE_IMAGES: Record<string, string> = {
  Mazza: "/assets/generated/juice-mazza-cartoon.dim_512x512.png",
  Coke: "/assets/generated/juice-coke-cartoon.dim_512x512.png",
  Lime: "/assets/generated/juice-lime-cartoon.dim_512x512.png",
  Water: "/assets/generated/juice-water-cartoon.dim_512x512.png",
  Pepsi: "/assets/generated/juice-pepsi-cartoon.dim_512x512.png",
};

export default function PurchasePage() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { data: prices } = useGetPrices();

  const [selectedJuice, setSelectedJuice] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  // Used to force re-render when teacher session changes
  const [sessionKey, setSessionKey] = useState(0);

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Determine if teacher can dispense for free using sessionStorage
  const teacherSession = getTeacherSession();
  const isFreeDispense = !!(teacherSession && teacherSession.freeCredits > 0);

  // Find price for selected juice and size
  const selectedPrice = prices?.find(
    (p) =>
      p.juiceSize.juice === selectedJuice &&
      Number(p.juiceSize.size) === selectedSize,
  );

  const priceInCents = selectedPrice ? Number(selectedPrice.price) : 0;
  const canProceed = !!(selectedJuice && selectedSize && priceInCents > 0);

  const handleSessionChange = () => {
    setSessionKey((k) => k + 1);
  };

  return (
    <>
      <ProfileSetupDialog open={showProfileSetup} />

      <div className="container max-w-6xl py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <img
            src="/assets/generated/vending-hero.dim_1600x900.png"
            alt="Juice Vending Machine"
            className="w-full max-w-3xl mx-auto rounded-lg shadow-lg mb-6"
          />
          <h1 className="text-4xl font-bold mb-2">Fresh Juice Vending</h1>
          <p className="text-muted-foreground text-lg">
            Select your favorite juice and size
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Make Your Selection
              </CardTitle>
              <CardDescription>Choose your juice type and size</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Juice Selection */}
              <div className="space-y-2">
                <Label htmlFor="juice">Juice Type</Label>
                <Select value={selectedJuice} onValueChange={setSelectedJuice}>
                  <SelectTrigger id="juice" data-ocid="purchase.select">
                    {selectedJuice ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={JUICE_IMAGES[selectedJuice]}
                          alt={selectedJuice}
                          className="w-6 h-6 object-contain rounded"
                        />
                        <span>{selectedJuice}</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Select a juice" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {JUICE_TYPES.map((juice) => (
                      <SelectItem key={juice} value={juice}>
                        <div className="flex items-center gap-2">
                          <img
                            src={JUICE_IMAGES[juice]}
                            alt={juice}
                            className="w-6 h-6 object-contain rounded"
                          />
                          <span>{juice}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size Selection */}
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select
                  value={selectedSize?.toString() || ""}
                  onValueChange={(val) => setSelectedSize(Number(val))}
                >
                  <SelectTrigger id="size" data-ocid="purchase.select">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {formatSize(size)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Display */}
              {canProceed && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Price:</span>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {isFreeDispense ? "FREE" : formatPrice(priceInCents)}
                    </Badge>
                  </div>
                </div>
              )}

              {!canProceed && selectedJuice && selectedSize && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Price not configured for this combination. Please contact an
                    administrator.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Teacher Access & Dispense Card */}
          <div className="space-y-6" key={sessionKey}>
            {/* Teacher panel is always visible — teachers login here */}
            <TeacherAccessPanel onSessionChange={handleSessionChange} />

            <Card>
              <CardHeader>
                <CardTitle>Dispense</CardTitle>
                <CardDescription>
                  {isFreeDispense
                    ? "Use your free teacher credit"
                    : "Payment required to dispense juice"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DispenseActionButton
                  juice={selectedJuice}
                  size={selectedSize}
                  priceInCents={priceInCents}
                  canProceed={canProceed}
                  isFreeDispense={isFreeDispense}
                  onCreditsUpdated={handleSessionChange}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
