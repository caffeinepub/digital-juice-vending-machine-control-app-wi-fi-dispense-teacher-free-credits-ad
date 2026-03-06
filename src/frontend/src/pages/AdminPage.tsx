import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import AdminPasswordGate from "../components/AdminPasswordGate";
import AdminRouteGuard from "../components/AdminRouteGuard";
import PriceMatrixEditor from "../components/PriceMatrixEditor";
import StripeSetupCard from "../components/StripeSetupCard";
import TeacherAdminManager from "../components/TeacherAdminManager";
import TransactionsTable from "../components/TransactionsTable";
import VendingConfigForm from "../components/VendingConfigForm";

export default function AdminPage() {
  return (
    <AdminPasswordGate>
      <AdminRouteGuard>
        <div className="grand-bg relative min-h-screen">
          {/* Decorative orbs */}
          <div
            className="orb"
            style={{
              width: 400,
              height: 400,
              top: -100,
              right: -100,
              background: "oklch(0.55 0.20 280)",
            }}
          />
          <div
            className="orb"
            style={{
              width: 300,
              height: 300,
              bottom: 100,
              left: -80,
              background: "oklch(0.65 0.18 50)",
              animationDelay: "4s",
            }}
          />

          <div className="relative z-10 container max-w-7xl py-10">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.82 0.18 85 / 0.20), oklch(0.72 0.18 85 / 0.10))",
                    border: "1px solid oklch(0.82 0.18 85 / 0.30)",
                    boxShadow: "0 4px 20px oklch(0.82 0.18 85 / 0.15)",
                  }}
                >
                  <Shield
                    className="h-6 w-6"
                    style={{ color: "oklch(0.82 0.18 85)" }}
                  />
                </div>
                <div>
                  <h1
                    className="font-display font-extrabold text-4xl shimmer-text leading-tight"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Admin Panel
                  </h1>
                  <p
                    style={{ color: "oklch(0.55 0.04 270)" }}
                    className="text-sm mt-0.5"
                  >
                    Manage vending machine settings and operations
                  </p>
                </div>
              </div>
              <div
                className="h-px w-full mt-4"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.82 0.18 85 / 0.25) 0%, oklch(0.82 0.18 85 / 0.05) 100%)",
                }}
              />
            </div>

            <Tabs defaultValue="pricing" className="space-y-6">
              <TabsList
                className="grid w-full grid-cols-5 p-1 rounded-2xl gap-1"
                style={{
                  background: "oklch(0.15 0.04 280)",
                  border: "1px solid oklch(0.28 0.06 275)",
                }}
              >
                {[
                  {
                    value: "pricing",
                    label: "Pricing",
                    ocid: "admin.pricing.tab",
                  },
                  {
                    value: "config",
                    label: "Configuration",
                    ocid: "admin.config.tab",
                  },
                  {
                    value: "stripe",
                    label: "Stripe",
                    ocid: "admin.stripe.tab",
                  },
                  {
                    value: "teachers",
                    label: "Teachers",
                    ocid: "admin.teachers.tab",
                  },
                  {
                    value: "transactions",
                    label: "Transactions",
                    ocid: "admin.transactions.tab",
                  },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    data-ocid={tab.ocid}
                    value={tab.value}
                    className="rounded-xl font-semibold text-sm transition-all duration-200 data-[state=active]:shadow-lg"
                    style={
                      {
                        color: "oklch(0.55 0.04 270)",
                        "--tw-ring-color": "transparent",
                      } as React.CSSProperties
                    }
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="pricing">
                <PriceMatrixEditor />
              </TabsContent>

              <TabsContent value="config">
                <VendingConfigForm />
              </TabsContent>

              <TabsContent value="stripe">
                <StripeSetupCard />
              </TabsContent>

              <TabsContent value="teachers">
                <TeacherAdminManager />
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionsTable />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AdminRouteGuard>
    </AdminPasswordGate>
  );
}
