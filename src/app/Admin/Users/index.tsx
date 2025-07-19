import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEyeOff,
  IconUserCheck,
} from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/Admin/data-table";
import { useApiQuery } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

// Import Sonner Toaster and toast
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Match your backend schema
interface UserData {
  userID: string;
  userName: {
    firstName: string;
    lastName: string;
    displayName: string;
    slug?: string;
  };
  active: boolean;
  notes?: string;
  userInfo: {
    gender: string;
    nationality: string;
    address: {
      city: string;
      country: string;
    };
    profilePicture?: string;
  };
  role: "user" | "owner" | "admin" | "demo" | "tenant";
  contactInfo: {
    email: {
      email: string;
      verified: boolean;
      verifiedAt?: string;
      verificationCode: string;
    };
    phone: {
      countryCode: string;
      phoneNumber: string;
      verified: boolean;
      verifiedAt?: string;
      verificationCode: string;
    };
  };
  createdAt: string;
  id: number; // Add this property for DataTable compatibility
}

function StateCards({
  users,
  isLoading,
}: {
  users: UserData[];
  isLoading: boolean;
}) {
  const { t } = useTranslation("users");
  const total = users.length;
  const active = users.filter((u) => u.active).length;
  const disabled = users.filter((u) => !u.active).length;

  const cards = [
    {
      title: t("cards.totalUsers"),
      value: total,
      icon: <IconUserCheck className="h-6 w-6 text-primary" />,
      color: "bg-primary/10",
    },
    {
      title: t("cards.active"),
      value: active,
      icon: <IconUserCheck className="h-6 w-6 text-green-600" />,
      color: "bg-green-100",
    },
    {
      title: t("cards.disabled"),
      value: disabled,
      icon: <IconEyeOff className="h-6 w-6 text-destructive" />,
      color: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 px-6 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.title} className="@container/card w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.color}`}>{card.icon}</div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{card.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DataTableSkeleton({
  columns = 6,
  rows = 8,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="w-full overflow-hidden rounded-md border">
      <div className="flex bg-muted px-4 py-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="mx-2 h-5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex border-t px-4 py-3">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="mx-2 h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Modal and confirmation helpers
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onSave: (user: UserData) => void;
}) {
  const { t } = useTranslation("users");
  const [displayName, setDisplayName] = useState(
    user?.userName.displayName ?? "",
  );
  const [notes, setNotes] = useState(user?.notes ?? "");

  React.useEffect(() => {
    setDisplayName(user?.userName.displayName ?? "");
    setNotes(user?.notes ?? "");
  }, [user]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("actions.edit")} {user.userName.displayName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="displayName">{t("table.name")}</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onSave({
                ...user,
                userName: { ...user.userName, displayName },
                notes,
              });
              onOpenChange(false);
            }}
          >
            {t("actions.edit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div>{description}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Users() {
  const { t } = useTranslation("users");
  const [search, setSearch] = useState("");
  const { data: usersRaw = [], isLoading } = useApiQuery<UserData[]>({
    queryKey: ["users"],
    endpoint: "/data/users.json",
    useLocalJson: true,
  });

  // Local state for user list (simulate backend updates)
  const [users, setUsers] = useState<UserData[]>([]);
  React.useEffect(() => {
    setUsers(usersRaw.map((u, idx) => ({ ...u, id: idx })));
  }, [usersRaw]);

  // Tabs state
  const [activeTab, setActiveTab] = useState<"active" | "disabled" | "all">(
    "active",
  );

  // Dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    user: UserData | null;
  }>({ open: false, user: null });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: UserData | null;
    action: "disable" | "enable" | "delete" | null;
  }>({ open: false, user: null, action: null });

  // Handlers
  const handleEdit = (user: UserData) => setEditDialog({ open: true, user });
  const handleEditSave = (updated: UserData) => {
    setUsers((prev) =>
      prev.map((u) => (u.userID === updated.userID ? updated : u)),
    );
    toast.success(t("User updated!"), {
      description: t("actions.edit"),
    });
  };

  const handleDisableEnable = (user: UserData) =>
    setConfirmDialog({
      open: true,
      user,
      action: user.active ? "disable" : "enable",
    });

  const handleDelete = (user: UserData) =>
    setConfirmDialog({ open: true, user, action: "delete" });

  const handleConfirm = () => {
    if (!confirmDialog.user || !confirmDialog.action) return;
    if (confirmDialog.action === "delete") {
      setUsers((prev) =>
        prev.filter((u) => u.userID !== confirmDialog.user!.userID),
      );
      toast.success(t("User deleted!"), {
        description: t("actions.delete"),
      });
    } else if (confirmDialog.action === "disable") {
      setUsers((prev) =>
        prev.map((u) =>
          u.userID === confirmDialog.user!.userID ? { ...u, active: false } : u,
        ),
      );
      toast.success(t("User disabled!"), {
        description: t("actions.disable"),
      });
    } else if (confirmDialog.action === "enable") {
      setUsers((prev) =>
        prev.map((u) =>
          u.userID === confirmDialog.user!.userID ? { ...u, active: true } : u,
        ),
      );
      toast.success(t("User enabled!"), {
        description: t("actions.enable"),
      });
    }
  };

  // Filtering by tab and search
  const filteredUsers = users.filter((u) => {
    // Tab filter
    if (activeTab === "active" && !u.active) return false;
    if (activeTab === "disabled" && u.active) return false;
    // Search filter
    if (
      !(
        `${u.userName.firstName} ${u.userName.lastName} ${u.userName.displayName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        u.contactInfo.email.email
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
      )
    ) {
      return false;
    }
    return true;
  });

  const columns: ColumnDef<UserData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label={t("table.selectAll")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("table.selectRow")}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "userName.displayName",
      header: t("table.name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.userName.displayName}</span>
      ),
    },
    {
      accessorKey: "contactInfo.email.email",
      header: t("table.email"),
      cell: ({ row }) => row.original.contactInfo.email.email,
    },
    {
      accessorKey: "role",
      header: t("table.role"),
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {t(`roles.${row.original.role}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "active",
      header: t("table.status"),
      cell: ({ row }) => (
        <Badge
          variant={row.original.active ? "default" : "destructive"}
          className="px-1.5"
        >
          {row.original.active ? (
            <IconUserCheck className="mr-1 h-4 w-4" />
          ) : (
            <IconEyeOff className="mr-1 h-4 w-4" />
          )}
          {row.original.active ? t("status.active") : t("status.disabled")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("table.created"),
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : "-",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">{t("table.openMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <IconEdit className="mr-2 h-4 w-4" />
              {t("actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDisableEnable(row.original)}>
              <IconEyeOff className="mr-2 h-4 w-4" />
              {row.original.active ? t("actions.disable") : t("actions.enable")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original)}>
              <IconTrash className="mr-2 h-4 w-4" />
              {t("actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const columnLabels: Record<string, string> = {
    userName_displayName: t("table.name"),
    contactInfo_email_email: t("table.email"),
    role: t("table.role"),
    active: t("table.status"),
    createdAt: t("table.created"),
  };

  // Tab definitions
  const tabs = [
    {
      key: "active",
      label: t("status.active"),
      badge: users.filter((u) => u.active).length,
    },
    {
      key: "disabled",
      label: t("status.disabled"),
      badge: users.filter((u) => !u.active).length,
    },
    {
      key: "all",
      label: t("cards.totalUsers"),
      badge: users.length,
    },
  ];

  return (
    <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Sonner Toaster */}
      <Toaster />
      <StateCards users={users} isLoading={isLoading} />
      <div className="mb-2 flex items-center justify-between px-4 lg:px-6">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {isLoading ? (
        <DataTableSkeleton columns={columns.length} rows={8} />
      ) : (
        <DataTable
          data={filteredUsers}
          columns={columns}
          tabs={tabs}
          defaultTab="active"
          activeTab={activeTab}
          onTabChange={(tabKey: string) =>
            setActiveTab(tabKey as "active" | "disabled" | "all")
          }
          showAddButton={true}
          addButtonText={t("Add user")}
          onAddClick={() => toast.info(t("Add user clicked!"))}
          paginated={true}
          showColumnCustomization={true}
          columnLabels={columnLabels}
        />
      )}

      {/* Edit dialog */}
      <EditUserDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog((prev) => ({ ...prev, open }))}
        user={editDialog.user}
        onSave={handleEditSave}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={
          confirmDialog.action === "delete"
            ? t("actions.delete")
            : confirmDialog.action === "disable"
              ? t("actions.disable")
              : t("actions.enable")
        }
        description={
          confirmDialog.action === "delete"
            ? t("Are you sure you want to delete this user?")
            : confirmDialog.action === "disable"
              ? t("Are you sure you want to disable this user?")
              : t("Are you sure you want to enable this user?")
        }
        onConfirm={handleConfirm}
        confirmLabel={
          confirmDialog.action === "delete"
            ? t("actions.delete")
            : confirmDialog.action === "disable"
              ? t("actions.disable")
              : t("actions.enable")
        }
      />
    </main>
  );
}
