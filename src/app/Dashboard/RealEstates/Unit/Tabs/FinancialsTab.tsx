import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  IconTrendingUp,
  IconTrendingDown,
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
import SaCurrency from "@/common/sa-currency";

interface UnitMove {
  _id: string;
  moveDate: string;
  debit: number;
  credit: number;
  description?: string;
  id: number; // For DataTable compatibility
}

interface FinancialsTabProps {
  unitMoves: UnitMove[];
  movesLoading: boolean;
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

export default function FinancialsTab({
  unitMoves,
  movesLoading,
}: FinancialsTabProps) {
  const { t } = useTranslation("real-estates");
  const [activeTab, setActiveTab] = useState("all");

  const totalIncome = unitMoves.reduce(
    (sum, m) => sum + (m.credit > 0 ? m.credit : 0),
    0,
  );

  const totalExpenses = unitMoves.reduce(
    (sum, m) => sum + (m.debit > 0 ? m.debit : 0),
    0,
  );

  const netIncome = totalIncome - totalExpenses;

  // Filter data based on active tab
  const getFilteredData = () => {
    if (!unitMoves) return [];

    switch (activeTab) {
      case "income":
        return unitMoves.filter((move) => move.credit > 0);
      case "expenses":
        return unitMoves.filter((move) => move.debit > 0);
      case "all":
      default:
        return unitMoves;
    }
  };

  // Transform the filtered data to add sequential id for DataTable compatibility
  const transformedData = getFilteredData().map((move, index) => ({
    ...move,
    id: index + 1,
  }));

  const columns: ColumnDef<UnitMove>[] = [
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
            aria-label={t("financials.selectAll")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("financials.selectRow")}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: t("financials.columns.description"),
      cell: ({ row }) => (
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {row.original.description || t("financials.defaultTransaction")}
        </Button>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "moveDate",
      header: t("financials.columns.date"),
      cell: ({ row }) => new Date(row.original.moveDate).toLocaleDateString(),
    },
    {
      id: "type",
      header: t("financials.columns.type"),
      cell: ({ row }) => {
        const isIncome = row.original.credit > 0;
        return (
          <Badge
            variant={isIncome ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {isIncome ? (
              <IconTrendingUp className="h-3 w-3" />
            ) : (
              <IconTrendingDown className="h-3 w-3" />
            )}
            {isIncome ? t("financials.income") : t("financials.expense")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: t("financials.columns.amount"),
      cell: ({ row }) => {
        const isIncome = row.original.credit > 0;
        const amount = isIncome ? row.original.credit : row.original.debit;
        return (
          <div
            className={`flex items-center gap-1 font-medium ${
              isIncome
                ? "text-green-600 dark:text-green-400"
                : "text-destructive"
            }`}
          >
            {isIncome ? "+" : "-"}
            {isIncome ? (
              <SaCurrency
                size={16}
                lightColor="var(--color-green-600)"
                darkColor="var(--color-green-400)"
              />
            ) : (
              <SaCurrency size={16} color="var(--destructive)" />
            )}
            {amount.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "debit",
      header: t("financials.columns.debit"),
      cell: ({ row }) => (
        <div className="font-medium text-destructive">
          {row.original.debit > 0 ? (
            <div className="flex items-center gap-1">
              <SaCurrency size={16} color="var(--destructive)" />
              {row.original.debit.toLocaleString()}
            </div>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      accessorKey: "credit",
      header: t("financials.columns.credit"),
      cell: ({ row }) => (
        <div className="font-medium text-green-600 dark:text-green-400">
          {row.original.credit > 0 ? (
            <div className="flex items-center gap-1">
              <SaCurrency
                size={16}
                lightColor="var(--color-green-600)"
                darkColor="var(--color-green-400)"
              />
              {row.original.credit.toLocaleString()}
            </div>
          ) : (
            "-"
          )}
        </div>
      ),
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
              <span className="sr-only">{t("financials.openMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => console.log("View", row.original._id)}
            >
              <IconEye className="mr-2 h-4 w-4" />
              {t("financials.actions.view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Edit", row.original._id)}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              {t("financials.actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Delete", row.original._id)}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              {t("financials.actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleRowClick = (move: UnitMove) => {
    console.log("View transaction:", move);
  };

  if (movesLoading) {
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
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 border-b p-4 last:border-b-0"
                    >
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
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
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold sm:text-2xl">
          {t("financials.title")}
        </h2>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("financials.addTransaction")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card border-2 border-green-600 py-0! dark:border-green-400">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("financials.stats.totalIncome")}
              </p>
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-green-600 sm:gap-2 sm:text-2xl dark:text-green-400">
                <IconTrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <SaCurrency
                  size={16}
                  lightColor="var(--color-green-600)"
                  darkColor="var(--color-green-400)"
                />
                {totalIncome.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card border-2 border-destructive py-0! dark:border-destructive">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("financials.stats.totalExpenses")}
              </p>
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-destructive sm:gap-2 sm:text-2xl">
                <IconTrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                <SaCurrency size={16} color="var(--destructive)" />
                {totalExpenses.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card border-2 border-green-600 py-0! dark:border-green-400">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("financials.stats.netIncome")}
              </p>
              <p
                className={`flex items-center justify-center gap-1 text-lg font-bold sm:text-2xl ${
                  netIncome >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                }`}
              >
                {netIncome >= 0 ? (
                  <SaCurrency
                    size={16}
                    lightColor="var(--color-green-600)"
                    darkColor="var(--color-green-400)"
                  />
                ) : (
                  <SaCurrency size={16} color="var(--destructive)" />
                )}
                {netIncome.toLocaleString()}
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
              { key: "all", label: t("financials.tabs.all") },
              {
                key: "income",
                label: t("financials.tabs.income"),
                badge: unitMoves?.filter((m) => m.credit > 0).length || 0,
              },
              {
                key: "expenses",
                label: t("financials.tabs.expenses"),
                badge: unitMoves?.filter((m) => m.debit > 0).length || 0,
              },
            ]}
            defaultTab="all"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchable={true}
            searchPlaceholder={t("financials.searchPlaceholder")}
            onRowClick={handleRowClick}
            emptyMessage={t("financials.emptyMessage")}
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
