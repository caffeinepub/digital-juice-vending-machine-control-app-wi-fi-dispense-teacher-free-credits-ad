import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useGetTeacherFreeChances } from "../hooks/useQueries";

export default function TeacherAccessPanel() {
  const { data: freeChances } = useGetTeacherFreeChances();

  const remainingChances = Number(freeChances ?? BigInt(0));
  const hasChances = remainingChances > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Teacher Access
        </CardTitle>
        <CardDescription>Your free dispense credits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Remaining Credits:</span>
          <Badge
            variant={hasChances ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {remainingChances}
          </Badge>
        </div>
        {!hasChances && (
          <p className="text-sm text-muted-foreground mt-3">
            You have no free credits remaining. Payment is required.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
