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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetVendingConfig,
  useUpdateVendingConfig,
} from "../hooks/useQueries";
import { JUICE_TYPES, SIZE_OPTIONS } from "../lib/vendingCatalog";

export default function VendingConfigForm() {
  const { data: config, isLoading } = useGetVendingConfig();
  const updateConfig = useUpdateVendingConfig();
  const [vendingUrl, setVendingUrl] = useState("");

  useEffect(() => {
    if (config) {
      setVendingUrl(config.vendingUrl);
    }
  }, [config]);

  const handleSave = async () => {
    if (!vendingUrl.trim()) {
      toast.error("Please enter a vending machine URL");
      return;
    }

    try {
      await updateConfig.mutateAsync({
        vendingUrl: vendingUrl.trim(),
        juiceTypes: [...JUICE_TYPES],
        sizeOptions: SIZE_OPTIONS.map((s) => BigInt(s)),
        prices: [],
      });
      toast.success("Configuration updated successfully!");
    } catch (error) {
      toast.error("Failed to update configuration");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vending Machine Configuration</CardTitle>
        <CardDescription>
          Configure the Wi-Fi connection to your vending machine
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="vendingUrl">Machine Base URL</Label>
          <Input
            id="vendingUrl"
            type="url"
            value={vendingUrl}
            onChange={(e) => setVendingUrl(e.target.value)}
            placeholder="http://192.168.1.100:8080"
          />
          <p className="text-sm text-muted-foreground">
            The base URL of your vending machine's Wi-Fi API (e.g.,
            http://192.168.1.100:8080)
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? (
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
