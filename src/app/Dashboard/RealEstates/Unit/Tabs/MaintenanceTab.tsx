import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconGripVertical,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useSortable } from "@dnd-kit/sortable";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface MaintenanceRequest {
  _id: string;
  title: string;
  status: "open" | "in-progress" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  reportedByUser?: { name: string; email: string };
  id: number; // For DataTable compatibility
}

interface MaintenanceTabProps {
  maintenanceRequests: MaintenanceRequest[];
  maintenanceLoading: boolean;
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

export default function MaintenanceTab({
  maintenanceRequests,
  maintenanceLoading,
}: MaintenanceTabProps) {
  const { t } = useTranslation("real-estates");
  const [activeTab, setActiveTab] = useState("all");

  // Filter data based on active tab
  const getFilteredData = () => {
    if (!maintenanceRequests) return [];

    switch (activeTab) {
      case "open":
        return maintenanceRequests.filter((request) => request.status === "open");
      case "in-progress":
        return maintenanceRequests.filter(
          (request) => request.status === "in-progress"
        );
      case "closed":
        return maintenanceRequests.filter((request) => request.status === "closed");
      case "all":
      default:
        return maintenanceRequests;
    }
  };

  // Transform the filtered data to add sequential id for DataTable compatibility
  const transformedData =
    getFilteredData().map((request, index) => ({
      ...request,
      id: index + 1,
    })) || [];

  const columns: ColumnDef<MaintenanceRequest>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t("maintenance.selectAll")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("maintenance.selectRow")}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: t("maintenance.columns.title"),
      cell: ({ row }) => (
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left"
        >
          {row.original.title}
        </Button>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: t("maintenance.columns.status"),
      cell: ({ row }) => {
        const statusColors = {
          open: "destructive",
          "in-progress": "default",
          closed: "secondary",
        } as const;
        return (
          <Badge variant={statusColors[row.original.status as keyof typeof statusColors]}>
            {t(`maintenance.statuses.${row.original.status.replace("-", "_")}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: t("maintenance.columns.priority"),
      cell: ({ row }) => {
        const priorityColors = {
          low: "secondary",
          medium: "default",
          high: "destructive",
        } as const;
        return (
          <Badge variant={priorityColors[row.original.priority as keyof typeof priorityColors]}>
            {t(`maintenance.priorities.${row.original.priority}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("maintenance.columns.createdDate"),
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "reportedByUser",
      header: t("maintenance.columns.reportedBy"),
      cell: ({ row }) => row.original.reportedByUser?.name || t("maintenance.unknown"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">{t("maintenance.openMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => console.log("View", row.original._id)}>
              <IconEye className="mr-2 h-4 w-4" />
              {t("maintenance.actions.view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Edit", row.original._id)}>
              <IconEdit className="mr-2 h-4 w-4" />
              {t("maintenance.actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Delete", row.original._id)}>
              <IconTrash className="mr-2 h-4 w-4" />
              {t("maintenance.actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleRowClick = (request: MaintenanceRequest) => {
    console.log("View request:", request);
  };

  if (maintenanceLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>

        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-4">
              {/* Search bar skeleton */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-10 w-80" />
              </div>

              {/* Table skeleton */}
              <div className="overflow-hidden rounded-lg border">
                <div className="bg-muted p-4">
                  <div className="flex space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-4 border-b last:border-b-0"
                    >
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination skeleton */}
              <div className="flex items-center justify-between px-4">
                <Skeleton className="h-4 w-40" />
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">{t("maintenance.title")}</h2>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("maintenance.newRequest")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-6">
          <DataTable
            data={transformedData}
            columns={columns}
            tabs={[
              { key: "all", label: t("maintenance.tabs.all") },
              {
                key: "open",
                label: t("maintenance.tabs.open"),
                badge: maintenanceRequests?.filter((r) => r.status === "open").length || 0,
              },
              {
                key: "in-progress",
                label: t("maintenance.tabs.inProgress"),
                badge: maintenanceRequests?.filter((r) => r.status === "in-progress").length || 0,
              },
              {
                key: "closed",
                label: t("maintenance.tabs.closed"),
                badge: maintenanceRequests?.filter((r) => r.status === "closed").length || 0,
              },
            ]}
            defaultTab="all"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchable={true}
            searchPlaceholder={t("maintenance.searchPlaceholder")}
            onRowClick={handleRowClick}
            emptyMessage={t("maintenance.emptyMessage")}
            draggable={true}
            paginated={true}
            showColumnCustomization={true}
            showAddButton={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
