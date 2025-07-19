import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
// import { Plus } from "lucide-react";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconGripVertical,
  IconCalendar,
  // IconCurrencyDollar,
  IconUsers,
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
import { useApiQuery } from "@/hooks/useApi";
import SaCurrency from "@/common/sa-currency";

interface Rental {
  _id: string;
  unitID: string;
  contractNumber: string;
  moveTypeID: string;
  startDate: string;
  endDate: string;
  rentalSourceID: string;
  startPrice: number;
  currentPrice: number;
  status: "active" | "completed" | "pending";
  securityDeposit: number;
  rentalAmount: number;
  isMonthly: boolean;
  monthsCount: number;
  roommates: number;
  notes: string;
  periodicIncrease: {
    increaseValue: number;
    periodicDuration: number;
    isPercentage: boolean;
  };
  participats: {
    owner: {
      userID: string;
      role: string;
    };
    tentant: {
      userID: string;
      role: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  restMonthsLeft: number;
  rentalSource: {
    name: string;
    description: string;
  };
  moveType: {
    name: string;
    description: string;
  };
  id: number; // For DataTable compatibility
}

interface RentalsTabProps {
  unitId?: string;
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
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <IconGripVertical className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

export default function RentalsTab({ unitId }: RentalsTabProps) {
  const { t } = useTranslation("real-estates");
  const [activeTab, setActiveTab] = useState("all");

  // Fix: Use correct type for the API query
  const {
    data: rentalsData,
    isLoading,
    error,
  } = useApiQuery<Rental[]>({
    queryKey: ["rentals"],
    endpoint: "/data/rentals.json",
    useLocalJson: true,
  });

  // Fix: Handle data properly with null checks and correct typing
  const allRentals = rentalsData || [];

  // Filter data based on unitId if provided, otherwise show all
  const filteredRentals = unitId
    ? allRentals.filter((rental) => rental.unitID === unitId)
    : allRentals;

  // Calculate summary statistics
  const totalRentalIncome = filteredRentals.reduce(
    (sum, rental) => sum + rental.rentalAmount,
    0,
  );
  const activeRentals = filteredRentals.filter(
    (rental) => rental.status === "active",
  ).length;
  const averageRent =
    filteredRentals.length > 0 ? totalRentalIncome / filteredRentals.length : 0;

  // Filter data based on active tab
  const getFilteredData = (): Rental[] => {
    switch (activeTab) {
      case "active":
        return filteredRentals.filter((rental) => rental.status === "active");
      case "completed":
        return filteredRentals.filter(
          (rental) => rental.status === "completed",
        );
      case "pending":
        return filteredRentals.filter((rental) => rental.status === "pending");
      case "all":
      default:
        return filteredRentals;
    }
  };

  // Transform the filtered data to add sequential id for DataTable compatibility
  const transformedData = getFilteredData().map((rental, index) => ({
    ...rental,
    id: index + 1,
  }));

  const columns: ColumnDef<Rental>[] = [
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
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label={t("rentals.selectAll")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("rentals.selectRow")}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "contractNumber",
      header: t("rentals.columns.contractNumber"),
      cell: ({ row }) => (
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {row.original.contractNumber}
        </Button>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: t("rentals.columns.status"),
      cell: ({ row }) => {
        const statusColors = {
          active: "default",
          completed: "secondary",
          pending: "destructive",
        } as const;
        return (
          <Badge variant={statusColors[row.original.status]}>
            {t(`rentals.statuses.${row.original.status}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "moveType",
      header: t("rentals.columns.propertyType"),
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.moveType.name}
        </Badge>
      ),
    },
    {
      accessorKey: "rentalAmount",
      header: t("rentals.columns.rentalAmount"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-medium">
          {/* <IconCurrencyDollar className="h-4 w-4 text-green-600" /> */}
          <SaCurrency size={16} color="var(--color-green-600)" />
          {row.original.rentalAmount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: t("rentals.columns.startDate"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          {new Date(row.original.startDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "endDate",
      header: t("rentals.columns.endDate"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          {new Date(row.original.endDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "restMonthsLeft",
      header: t("rentals.columns.monthsLeft"),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.restMonthsLeft}
        </div>
      ),
    },
    {
      accessorKey: "roommates",
      header: t("rentals.columns.roommates"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <IconUsers className="h-4 w-4 text-muted-foreground" />
          {row.original.roommates}
        </div>
      ),
    },
    {
      accessorKey: "rentalSource",
      header: t("rentals.columns.source"),
      cell: ({ row }) => row.original.rentalSource.name,
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
              <span className="sr-only">{t("rentals.openMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => console.log("View", row.original._id)}
            >
              <IconEye className="mr-2 h-4 w-4" />
              {t("rentals.actions.view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Edit", row.original._id)}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              {t("rentals.actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Delete", row.original._id)}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              {t("rentals.actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleRowClick = (rental: Rental) => {
    console.log("View rental:", rental);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-6 w-32 sm:h-8 sm:w-48" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 text-center">
                  <Skeleton className="mx-auto h-4 w-24" />
                  <Skeleton className="mx-auto h-6 w-32 sm:h-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-10 w-80" />
              </div>

              <div className="overflow-hidden rounded-lg border">
                <div className="bg-muted p-4">
                  <div className="flex space-x-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-20" />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 border-b p-4 last:border-b-0"
                    >
                      {Array.from({ length: 10 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-20" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

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

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-bold sm:text-2xl">
            {t("rentals.title")}
          </h2>
          <span className="text-lg text-muted-foreground">
            {t("rentals.button")}
          </span>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="py-6 text-center text-sm text-red-500 sm:py-8 sm:text-base">
              {t("rentals.errorLoading")}: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col items-start">
        <h2 className="text-xl font-bold sm:text-2xl">{t("rentals.title")}</h2>
        <span className="text-md text-muted-foreground">
          {t("rentals.button")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card border-2 border-green-600 py-0! dark:border-green-400">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("rentals.stats.totalIncome")}
              </p>
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-green-600 sm:gap-2 sm:text-2xl dark:text-green-400">
                {/* <IconCurrencyDollar className="h-4 w-4 sm:h-5 sm:w-5" /> */}
                <SaCurrency
                  size={18}
                  lightColor="var(--color-green-600)"
                  darkColor="var(--color-green-400)"
                />
                {totalRentalIncome.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card border-2 border-blue-600 py-0! dark:border-blue-400">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("rentals.stats.activeRentals")}
              </p>
              <p className="text-lg font-bold text-blue-600 sm:text-2xl dark:text-blue-400">
                {activeRentals}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card border-2 border-muted-foreground py-0! dark:border-muted-foreground">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("rentals.stats.averageRent")}
              </p>
              <p className="flex items-center justify-center gap-1 text-lg font-bold sm:gap-2 sm:text-2xl">
                <SaCurrency size={18} />{" "}
                {Math.round(averageRent).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-6">
          <DataTable
            data={transformedData}
            columns={columns}
            tabs={[
              { key: "all", label: t("rentals.tabs.all") },
              {
                key: "active",
                label: t("rentals.tabs.active"),
                badge: filteredRentals.filter((r) => r.status === "active")
                  .length,
              },
              {
                key: "completed",
                label: t("rentals.tabs.completed"),
                badge: filteredRentals.filter((r) => r.status === "completed")
                  .length,
              },
              {
                key: "pending",
                label: t("rentals.tabs.pending"),
                badge: filteredRentals.filter((r) => r.status === "pending")
                  .length,
              },
            ]}
            defaultTab="all"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchable={true}
            searchPlaceholder={t("rentals.searchPlaceholder")}
            onRowClick={handleRowClick}
            emptyMessage={t("rentals.emptyMessage")}
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
