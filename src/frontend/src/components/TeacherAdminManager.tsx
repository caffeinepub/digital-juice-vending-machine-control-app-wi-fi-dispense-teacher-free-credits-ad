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
import { GraduationCap, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "teacherAccounts";
const FREE_CREDITS_DEFAULT = 30;

export interface LocalTeacherAccount {
  name: string;
  password: string;
  freeCredits: number;
}

export function getTeacherAccounts(): LocalTeacherAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalTeacherAccount[];
  } catch {
    return [];
  }
}

export function saveTeacherAccounts(accounts: LocalTeacherAccount[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export default function TeacherAdminManager() {
  const [accounts, setAccounts] =
    useState<LocalTeacherAccount[]>(getTeacherAccounts);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleAdd = () => {
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      toast.error("Please enter a teacher name");
      return;
    }
    if (!trimmedPassword) {
      toast.error("Please enter a password");
      return;
    }
    if (
      accounts.some((a) => a.name.toLowerCase() === trimmedName.toLowerCase())
    ) {
      toast.error("A teacher with this name already exists");
      return;
    }

    const newAccount: LocalTeacherAccount = {
      name: trimmedName,
      password: trimmedPassword,
      freeCredits: FREE_CREDITS_DEFAULT,
    };
    const updated = [...accounts, newAccount];
    saveTeacherAccounts(updated);
    setAccounts(updated);
    setName("");
    setPassword("");
    toast.success(
      `Teacher "${trimmedName}" added with ${FREE_CREDITS_DEFAULT} free credits`,
    );
  };

  const handleDelete = (index: number) => {
    const updated = accounts.filter((_, i) => i !== index);
    saveTeacherAccounts(updated);
    setAccounts(updated);
    toast.success("Teacher account removed");
  };

  return (
    <div className="space-y-6">
      {/* Add Teacher Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Teacher Account
          </CardTitle>
          <CardDescription>
            Create a teacher account with a name and password. Each teacher gets{" "}
            {FREE_CREDITS_DEFAULT} free dispense credits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teacher-name">Teacher Name</Label>
              <Input
                id="teacher-name"
                data-ocid="teacher.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mrs. Smith"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-password">Password</Label>
              <Input
                id="teacher-password"
                data-ocid="teacher.input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a password"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
          </div>
          <Button
            data-ocid="teacher.primary_button"
            onClick={handleAdd}
            className="w-full sm:w-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </CardContent>
      </Card>

      {/* Teacher List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Teacher Accounts
          </CardTitle>
          <CardDescription>
            {accounts.length === 0
              ? "No teacher accounts yet."
              : `${accounts.length} teacher${accounts.length !== 1 ? "s" : ""} registered`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div
              data-ocid="teacher.empty_state"
              className="py-10 text-center text-muted-foreground"
            >
              <GraduationCap className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>No teachers added yet. Use the form above to add one.</p>
            </div>
          ) : (
            <Table data-ocid="teacher.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Free Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account, index) => (
                  <TableRow
                    key={account.name}
                    data-ocid={`teacher.item.${index + 1}`}
                  >
                    <TableCell className="font-medium">
                      {account.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          account.freeCredits > 0
                            ? "text-green-600 font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        {account.freeCredits} / {FREE_CREDITS_DEFAULT}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        data-ocid={`teacher.delete_button.${index + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
