import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminRouteGuard from "../components/AdminRouteGuard";
import PriceMatrixEditor from "../components/PriceMatrixEditor";
import StripeSetupCard from "../components/StripeSetupCard";
import TeacherAdminManager from "../components/TeacherAdminManager";
import TransactionsTable from "../components/TransactionsTable";
import VendingConfigForm from "../components/VendingConfigForm";

export default function AdminPage() {
  return (
    <AdminRouteGuard>
      <div className="container max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage vending machine settings and operations
          </p>
        </div>

        <Tabs defaultValue="pricing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
    </AdminRouteGuard>
  );
}
