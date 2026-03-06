import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { GraduationCap, Pencil, Trash2, UserPlus } from "lucide-react";
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

interface EditState {
  index: number;
  name: string;
  password: string;
}

export default function TeacherAdminManager() {
  const [accounts, setAccounts] =
    useState<LocalTeacherAccount[]>(getTeacherAccounts);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [editState, setEditState] = useState<EditState | null>(null);

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

  const handleEditOpen = (index: number) => {
    setEditState({ index, name: accounts[index].name, password: "" });
  };

  const handleEditSave = () => {
    if (!editState) return;
    const trimmedName = editState.name.trim();
    if (!trimmedName) {
      toast.error("Teacher name cannot be empty");
      return;
    }
    const duplicate = accounts.some(
      (a, i) =>
        i !== editState.index &&
        a.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicate) {
      toast.error("A teacher with this name already exists");
      return;
    }
    const updated = accounts.map((a, i) => {
      if (i !== editState.index) return a;
      return {
        ...a,
        name: trimmedName,
        password: editState.password.trim() || a.password,
      };
    });
    saveTeacherAccounts(updated);
    setAccounts(updated);
    setEditState(null);
    toast.success("Teacher updated");
  };

  const handleEditCancel = () => {
    setEditState(null);
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          data-ocid={`teacher.edit_button.${index + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOpen(index)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          data-ocid={`teacher.delete_button.${index + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Teacher Dialog */}
      <Dialog
        open={editState !== null}
        onOpenChange={(open) => !open && handleEditCancel()}
      >
        <DialogContent className="sm:max-w-md" data-ocid="teacher.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Teacher
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-teacher-name">Teacher Name</Label>
              <Input
                id="edit-teacher-name"
                data-ocid="teacher.input"
                value={editState?.name ?? ""}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev,
                  )
                }
                placeholder="Teacher name"
                onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-teacher-password">
                New Password{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (leave blank to keep existing)
                </span>
              </Label>
              <Input
                id="edit-teacher-password"
                data-ocid="teacher.input"
                type="password"
                value={editState?.password ?? ""}
                onChange={(e) =>
                  setEditState((prev) =>
                    prev ? { ...prev, password: e.target.value } : prev,
                  )
                }
                placeholder="Enter new password"
                onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              data-ocid="teacher.cancel_button"
              variant="outline"
              onClick={handleEditCancel}
            >
              Cancel
            </Button>
            <Button data-ocid="teacher.save_button" onClick={handleEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
