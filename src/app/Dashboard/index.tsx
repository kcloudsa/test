import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  IconCircleCheckFilled,
  IconLoader,
  IconGripVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useSortable } from "@dnd-kit/sortable";
import type { ColumnDef } from "@tanstack/react-table";
import { useApiQuery } from "@/hooks/useApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import SaCurrency from "@/common/sa-currency";
import { useTranslation } from "react-i18next";

interface RentalData {
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
      <span className="sr-only">
        {/* t: dragToReorder */}
        {useTranslation().t("dragToReorder")}
      </span>
    </Button>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("rentals");

  const {
    data: rentalsData,
    isLoading,
    error,
  } = useApiQuery<RentalData[]>({
    queryKey: ["rentals"],
    endpoint: "/data/rentals.json",
    useLocalJson: true,
  });

  // Filter data based on active tab
  const getFilteredData = () => {
    if (!rentalsData) return [];

    switch (activeTab) {
      case "rentals":
        return rentalsData.filter((rental) => rental.status === "active");
      case "completed":
        return rentalsData.filter((rental) => rental.status === "completed");
      case "pending":
        return rentalsData.filter((rental) => rental.status === "pending");
      case "all":
        return rentalsData; // Show all data for analytics
      default:
        return rentalsData;
    }
  };

  // Transform the filtered data to add sequential id for DataTable compatibility
  const transformedData = getFilteredData().map((rental, index) => ({
    ...rental,
    id: index + 1,
  }));

  const columns: ColumnDef<RentalData>[] = [
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
            aria-label={t("selectAll")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("selectRow")}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "contractNumber",
      header: t("contractNumber"),
      cell: ({ row }) => {
        return (
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground"
          >
            {row.original.contractNumber}
          </Button>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "moveType",
      header: t("propertyType"),
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {row.original.moveType.name}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("status.status"),
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.status === "active" ? (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
          ) : row.original.status === "completed" ? (
            <IconCircleCheckFilled className="fill-blue-500 dark:fill-blue-400" />
          ) : (
            <IconLoader />
          )}
          {t(`status.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "rentalAmount",
      header: () => <div className="w-full text-left">{t("rentalAmount")}</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <SaCurrency />
          {row.original.rentalAmount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "restMonthsLeft",
      header: () => <div className="w-full text-left">{t("monthsLeft")}</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.restMonthsLeft}</div>
      ),
    },
    {
      accessorKey: "rentalSource",
      header: t("rentalSource"),
      cell: ({ row }) => {
        return row.original.rentalSource.name;
      },
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
              <span className="sr-only">{t("openMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => console.log("Edit", row.original._id)}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("View", row.original._id)}
            >
              <IconEye className="mr-2 h-4 w-4" />
              {t("viewDetails")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Delete", row.original._id)}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <div className="px-4 lg:px-6">
          <div className="py-8 text-center">{t("loadingRentalsData")}</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <div className="px-4 lg:px-6">
          <div className="py-8 text-center text-red-500">
            {t("errorLoadingRentalsData", { message: error.message })}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6 ">
      <ChartAreaInteractive />
      </div>
      <DataTable
      data={transformedData}
      columns={columns}
      tabs={[
        { key: "rentals", label: t("activeRentals") },
        {
        key: "completed",
        label: t("completed"),
        badge:
          rentalsData?.filter((r) => r.status === "completed").length || 0,
        },
        {
        key: "pending",
        label: t("pending"),
        badge:
          rentalsData?.filter((r) => r.status === "pending").length || 0,
        },
        { key: "all", label: t("all") },
      ]}
      defaultTab="rentals"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showAddButton={true}
      addButtonText={t("addRental")}
      onAddClick={() => console.log("Add new rental")}
      draggable={true}
      paginated={true}
      showColumnCustomization={true}
      columnLabels={
        columns.reduce((acc, col) => {
          if ("accessorKey" in col && col.accessorKey) {
            let label: string | undefined;
            if (typeof col.header === "function") {
              // Try to extract label from function header by passing a mock context with only 'column', 'header', and 'table' as undefined
              // This avoids type errors and works for simple header functions
              let headerResult;
              try {
                headerResult = col.header({
                  column: undefined as any,
                  header: undefined as any,
                  table: undefined as any,
                });
              } catch {
                headerResult = "";
              }
              if (typeof headerResult === "string") {
                label = headerResult;
              } else if (
                headerResult &&
                typeof headerResult === "object" &&
                "props" in headerResult &&
                typeof headerResult.props.children === "string"
              ) {
                label = headerResult.props.children;
              } else {
                label = "";
              }
            } else if (typeof col.header === "string") {
              label = col.header;
            } else {
              label = "";
            }
            acc[col.accessorKey as string] = label ?? "";
          }
          return acc;
        }, {} as Record<string, string>)
      }
      />
    </main>
  );
}
