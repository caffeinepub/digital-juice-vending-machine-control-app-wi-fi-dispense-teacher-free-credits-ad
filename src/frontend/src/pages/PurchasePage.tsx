import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Droplets, Sparkles } from "lucide-react";
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

// Rich jewel-tone gradient per juice
const JUICE_GRADIENTS: Record<string, string> = {
  Mazza:
    "linear-gradient(135deg, oklch(0.60 0.22 50) 0%, oklch(0.45 0.24 35) 100%)",
  Coke: "linear-gradient(135deg, oklch(0.40 0.22 25) 0%, oklch(0.30 0.24 20) 100%)",
  Lime: "linear-gradient(135deg, oklch(0.52 0.24 140) 0%, oklch(0.40 0.22 150) 100%)",
  Water:
    "linear-gradient(135deg, oklch(0.48 0.20 230) 0%, oklch(0.38 0.22 250) 100%)",
  Pepsi:
    "linear-gradient(135deg, oklch(0.38 0.20 280) 0%, oklch(0.28 0.22 270) 100%)",
};

const JUICE_GLOW: Record<string, string> = {
  Mazza: "oklch(0.72 0.22 50 / 0.5)",
  Coke: "oklch(0.55 0.22 25 / 0.5)",
  Lime: "oklch(0.65 0.22 140 / 0.5)",
  Water: "oklch(0.60 0.18 230 / 0.5)",
  Pepsi: "oklch(0.55 0.20 280 / 0.5)",
};

const JUICE_BORDER: Record<string, string> = {
  Mazza: "oklch(0.82 0.18 55)",
  Coke: "oklch(0.65 0.20 25)",
  Lime: "oklch(0.72 0.20 140)",
  Water: "oklch(0.68 0.18 230)",
  Pepsi: "oklch(0.62 0.18 280)",
};

// Size color classes
const SIZE_CLASS: Record<number, string> = {
  60: "size-btn-60",
  120: "size-btn-120",
  180: "size-btn-180",
  240: "size-btn-240",
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
  const [sessionKey, setSessionKey] = useState(0);
  const [juiceAnimKey, setJuiceAnimKey] = useState(0);

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const teacherSession = getTeacherSession();
  const isFreeDispense = !!(teacherSession && teacherSession.freeCredits > 0);

  const selectedPrice = prices?.find(
    (p) =>
      p.juiceSize.juice === selectedJuice &&
      Number(p.juiceSize.size) === selectedSize,
  );

  const priceInCents = selectedPrice ? Number(selectedPrice.price) : 0;
  const canProceed = !!(selectedJuice && selectedSize && priceInCents > 0);

  const handleSessionChange = () => setSessionKey((k) => k + 1);

  const handleSelectJuice = (juice: string) => {
    setSelectedJuice(juice);
    setJuiceAnimKey((k) => k + 1);
  };

  return (
    <>
      <ProfileSetupDialog open={showProfileSetup} />

      <div className="grand-bg relative overflow-hidden">
        <div className="relative z-10 container max-w-6xl py-10">
          {/* ── Grand Hero Section ── */}
          <div className="mb-12 text-center">
            <div className="relative inline-block mb-6">
              <img
                src="/assets/generated/vending-hero-grand.dim_1600x900.jpg"
                alt="Juice Vending Machine"
                className="w-full max-w-3xl mx-auto rounded-3xl shadow-2xl"
                style={{
                  border: "2px solid oklch(0.82 0.18 85 / 0.30)",
                  boxShadow:
                    "0 0 0 1px oklch(0.82 0.18 85 / 0.10), 0 24px 64px oklch(0.10 0.04 280 / 0.8), 0 0 40px oklch(0.82 0.18 85 / 0.12)",
                }}
              />
              {/* Gold shine overlay */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.82 0.18 85 / 0.05) 0%, transparent 40%, oklch(0.82 0.18 85 / 0.03) 100%)",
                }}
              />
            </div>

            <h1
              className="font-display font-extrabold text-5xl sm:text-6xl mb-3 leading-tight shimmer-text"
              style={{ letterSpacing: "-0.03em" }}
            >
              Fresh Juice Vending
            </h1>
            <p
              className="text-lg font-medium flex items-center justify-center gap-2"
              style={{ color: "oklch(0.62 0.04 270)" }}
            >
              <Sparkles
                className="h-4 w-4"
                style={{ color: "oklch(0.82 0.18 85)" }}
              />
              Pick your flavour, choose your size — enjoy!
              <Sparkles
                className="h-4 w-4"
                style={{ color: "oklch(0.82 0.18 85)" }}
              />
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── Selection Card ── */}
            <Card className="grand-card rounded-3xl overflow-hidden border-0">
              <CardHeader
                className="pb-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.20 0.06 275) 0%, oklch(0.16 0.05 280) 100%)",
                  borderBottom: "1px solid oklch(0.82 0.18 85 / 0.12)",
                }}
              >
                <CardTitle
                  className="flex items-center gap-2 text-xl font-display font-bold"
                  style={{ color: "oklch(0.96 0.01 90)" }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: "oklch(0.82 0.18 85 / 0.15)" }}
                  >
                    <Droplets
                      className="h-4 w-4"
                      style={{ color: "oklch(0.82 0.18 85)" }}
                    />
                  </div>
                  Choose Your Juice
                </CardTitle>
                <CardDescription style={{ color: "oklch(0.62 0.04 270)" }}>
                  Tap a juice, then pick your size
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {/* ── Big juice image preview ── */}
                <div className="flex justify-center items-center">
                  <div
                    className="relative rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{
                      width: 220,
                      height: 220,
                      background: selectedJuice
                        ? JUICE_GRADIENTS[selectedJuice]
                        : "linear-gradient(135deg, oklch(0.20 0.05 275) 0%, oklch(0.16 0.04 280) 100%)",
                      transition: "background 0.4s ease",
                      border: selectedJuice
                        ? `2px solid ${JUICE_BORDER[selectedJuice]}`
                        : "2px solid oklch(0.28 0.06 275)",
                      boxShadow: selectedJuice
                        ? `0 0 40px ${JUICE_GLOW[selectedJuice]}, 0 8px 32px oklch(0.10 0.04 280 / 0.6)`
                        : "0 8px 32px oklch(0.10 0.04 280 / 0.4)",
                    }}
                  >
                    {selectedJuice ? (
                      <img
                        key={juiceAnimKey}
                        src={JUICE_IMAGES[selectedJuice]}
                        alt={selectedJuice}
                        className="juice-pop-enter juice-float"
                        style={{
                          width: 170,
                          height: 170,
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center px-4">
                        <span className="text-6xl">🧃</span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "oklch(0.55 0.04 270)" }}
                        >
                          Select a juice
                        </span>
                      </div>
                    )}
                    {selectedJuice && (
                      <div
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold shadow-lg"
                        style={{
                          background: "oklch(0.10 0.04 280 / 0.75)",
                          color: "white",
                          border: `1px solid ${JUICE_BORDER[selectedJuice]}`,
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {selectedJuice}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Juice selection grid ── */}
                <div className="space-y-3">
                  <p
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "oklch(0.82 0.18 85)" }}
                  >
                    Juice Type
                  </p>
                  <div
                    data-ocid="purchase.list"
                    className="grid grid-cols-5 gap-2"
                  >
                    {JUICE_TYPES.map((juice, idx) => {
                      const isSelected = selectedJuice === juice;
                      return (
                        <button
                          key={juice}
                          data-ocid={`purchase.item.${idx + 1}`}
                          type="button"
                          onClick={() => handleSelectJuice(juice)}
                          className="flex flex-col items-center gap-1.5 rounded-2xl p-2 border cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2"
                          style={
                            isSelected
                              ? {
                                  background: JUICE_GRADIENTS[juice],
                                  border: `2px solid ${JUICE_BORDER[juice]}`,
                                  boxShadow: `0 0 20px ${JUICE_GLOW[juice]}, 0 4px 16px oklch(0.10 0.04 280 / 0.5)`,
                                  transform: "scale(1.06)",
                                }
                              : {
                                  background: "oklch(0.20 0.04 275)",
                                  border: "1px solid oklch(0.30 0.06 275)",
                                }
                          }
                          aria-pressed={isSelected}
                        >
                          <img
                            src={JUICE_IMAGES[juice]}
                            alt={juice}
                            className={`w-11 h-11 object-contain juice-float juice-float-d${idx + 1}`}
                          />
                          <span
                            className="text-xs font-bold truncate w-full text-center"
                            style={{
                              color: isSelected
                                ? "white"
                                : "oklch(0.75 0.04 270)",
                            }}
                          >
                            {juice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Size selection ── */}
                <div className="space-y-3">
                  <p
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "oklch(0.82 0.18 85)" }}
                  >
                    Size
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {SIZE_OPTIONS.map((size, idx) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          data-ocid={`purchase.size.item.${idx + 1}`}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={[
                            SIZE_CLASS[size],
                            "rounded-xl px-2 py-3 font-bold text-sm transition-all duration-150 relative overflow-hidden",
                            isSelected
                              ? "scale-105 ring-2 ring-white/40 shadow-xl"
                              : "opacity-80 hover:opacity-100 hover:scale-102",
                          ].join(" ")}
                          aria-pressed={isSelected}
                        >
                          {isSelected && (
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background:
                                  "linear-gradient(135deg, white/10 0%, transparent 60%)",
                              }}
                            />
                          )}
                          <div className="text-base leading-tight font-extrabold">
                            {formatSize(size)}
                          </div>
                          <div className="text-xs opacity-75 mt-0.5 font-medium">
                            {size === 60
                              ? "4s"
                              : size === 120
                                ? "8s"
                                : size === 180
                                  ? "12s"
                                  : "16s"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Price Display ── */}
                {canProceed && (
                  <div
                    className="pt-5 mt-2"
                    style={{
                      borderTop: "1px solid oklch(0.82 0.18 85 / 0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-base font-bold"
                        style={{ color: "oklch(0.80 0.04 270)" }}
                      >
                        Total
                      </span>
                      <Badge
                        className="text-lg px-6 py-2 rounded-full font-extrabold shadow-lg border-0"
                        style={
                          isFreeDispense
                            ? {
                                background:
                                  "linear-gradient(135deg, oklch(0.58 0.24 140), oklch(0.48 0.22 150))",
                                color: "white",
                                boxShadow:
                                  "0 4px 20px oklch(0.58 0.24 140 / 0.4)",
                              }
                            : {
                                background:
                                  "linear-gradient(135deg, oklch(0.82 0.18 85), oklch(0.72 0.20 75))",
                                color: "oklch(0.12 0.04 280)",
                                boxShadow:
                                  "0 4px 20px oklch(0.82 0.18 85 / 0.4)",
                              }
                        }
                      >
                        {isFreeDispense ? "🎉 FREE" : formatPrice(priceInCents)}
                      </Badge>
                    </div>
                  </div>
                )}

                {!canProceed && selectedJuice && selectedSize && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Price not configured for this combination. Please contact
                      an administrator.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* ── Teacher Access & Dispense Card ── */}
            <div className="space-y-6" key={sessionKey}>
              <TeacherAccessPanel onSessionChange={handleSessionChange} />

              <Card className="grand-card rounded-3xl overflow-hidden border-0">
                <CardHeader
                  className="pb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.20 0.06 275) 0%, oklch(0.16 0.05 280) 100%)",
                    borderBottom: "1px solid oklch(0.82 0.18 85 / 0.12)",
                  }}
                >
                  <CardTitle
                    className="text-xl font-display font-bold flex items-center gap-2"
                    style={{ color: "oklch(0.96 0.01 90)" }}
                  >
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full"
                      style={{ background: "oklch(0.82 0.18 85 / 0.15)" }}
                    >
                      <Sparkles
                        className="h-4 w-4"
                        style={{ color: "oklch(0.82 0.18 85)" }}
                      />
                    </div>
                    Dispense
                  </CardTitle>
                  <CardDescription style={{ color: "oklch(0.62 0.04 270)" }}>
                    {isFreeDispense
                      ? "Use your free teacher credit"
                      : "Payment required to dispense juice"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
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
      </div>
    </>
  );
}
