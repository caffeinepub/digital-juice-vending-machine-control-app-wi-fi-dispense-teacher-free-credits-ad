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
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInitializeTeacherAccount } from "../hooks/useQueries";

export default function TeacherAdminManager() {
  const [principalId, setPrincipalId] = useState("");
  const initializeAccount = useInitializeTeacherAccount();

  const handleInitialize = async () => {
    if (!principalId.trim()) {
      toast.error("Please enter a teacher principal ID");
      return;
    }

    try {
      await initializeAccount.mutateAsync(principalId.trim());
      toast.success("Teacher account initialized with 30 free credits!");
      setPrincipalId("");
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize teacher account");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Account Management</CardTitle>
        <CardDescription>
          Initialize teacher accounts with 30 free dispense credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Backend functionality is limited. Full teacher management (list all
            teachers, view remaining chances, reset credits) is not yet
            available.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principalId">Teacher Principal ID</Label>
            <Input
              id="principalId"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
            />
            <p className="text-sm text-muted-foreground">
              The Internet Identity principal of the teacher to initialize
            </p>
          </div>

          <Button
            onClick={handleInitialize}
            disabled={initializeAccount.isPending}
            className="w-full"
          >
            {initializeAccount.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize Teacher Account"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
