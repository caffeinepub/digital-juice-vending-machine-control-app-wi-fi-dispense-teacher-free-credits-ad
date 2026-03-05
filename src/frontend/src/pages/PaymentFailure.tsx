import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was not completed. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate({ to: "/" })} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
