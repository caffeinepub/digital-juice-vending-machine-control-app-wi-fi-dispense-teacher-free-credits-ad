import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Loader2 } from "lucide-react";
import { Variant_teacherFree_stripePaid } from "../backend";
import { useGetMyTransactions } from "../hooks/useQueries";
import { formatPrice } from "../lib/vendingCatalog";

export default function TransactionsTable() {
  const { data: transactions, isLoading } = useGetMyTransactions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View all dispense transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Currently showing your personal transactions only. Admin view of all
            transactions is not yet fully implemented.
          </AlertDescription>
        </Alert>

        {!transactions || transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Juice</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={Number(tx.transactionId)}>
                    <TableCell className="font-mono text-sm">
                      {Number(tx.transactionId)}
                    </TableCell>
                    <TableCell>{tx.juice}</TableCell>
                    <TableCell>{Number(tx.size)}ml</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.transactionType ===
                          Variant_teacherFree_stripePaid.teacherFree
                            ? "default"
                            : "secondary"
                        }
                      >
                        {tx.transactionType ===
                        Variant_teacherFree_stripePaid.teacherFree
                          ? "Free"
                          : "Paid"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(Number(tx.price))}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.transactionStatus.__kind__ === "success"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {tx.transactionStatus.__kind__ === "success"
                          ? "Success"
                          : "Failed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(
                        Number(tx.timestamp) / 1000000,
                      ).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
