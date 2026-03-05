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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { JuicePrice } from "../backend";
import { useGetPrices, useSetPrices } from "../hooks/useQueries";
import { JUICE_TYPES, SIZE_OPTIONS, formatSize } from "../lib/vendingCatalog";

export default function PriceMatrixEditor() {
  const { data: prices, isLoading } = useGetPrices();
  const setPrices = useSetPrices();
  const [priceMatrix, setPriceMatrix] = useState<Record<string, number>>({});

  useEffect(() => {
    if (prices) {
      const matrix: Record<string, number> = {};
      for (const p of prices) {
        const key = `${p.juiceSize.juice}-${p.juiceSize.size}`;
        matrix[key] = Number(p.price);
      }
      setPriceMatrix(matrix);
    }
  }, [prices]);

  const handlePriceChange = (juice: string, size: number, value: string) => {
    const key = `${juice}-${size}`;
    const numValue = Number.parseInt(value) || 0;
    setPriceMatrix((prev) => ({ ...prev, [key]: numValue }));
  };

  const handleSave = async () => {
    const priceList: JuicePrice[] = [];
    for (const juice of JUICE_TYPES) {
      for (const size of SIZE_OPTIONS) {
        const key = `${juice}-${size}`;
        const price = priceMatrix[key] || 0;
        priceList.push({
          juiceSize: { juice, size: BigInt(size) },
          price: BigInt(price),
        });
      }
    }

    try {
      await setPrices.mutateAsync(priceList);
      toast.success("Prices updated successfully!");
    } catch (error) {
      toast.error("Failed to update prices");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading prices...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Matrix</CardTitle>
        <CardDescription>
          Set prices for each juice type and size combination (in cents)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Juice Type</TableHead>
                {SIZE_OPTIONS.map((size) => (
                  <TableHead key={size} className="text-center">
                    {formatSize(size)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {JUICE_TYPES.map((juice) => (
                <TableRow key={juice}>
                  <TableCell className="font-medium">{juice}</TableCell>
                  {SIZE_OPTIONS.map((size) => {
                    const key = `${juice}-${size}`;
                    const value = priceMatrix[key] || 0;
                    return (
                      <TableCell key={size}>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={value}
                          onChange={(e) =>
                            handlePriceChange(juice, size, e.target.value)
                          }
                          className="w-24"
                          placeholder="0"
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={setPrices.isPending}>
            {setPrices.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Prices"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
