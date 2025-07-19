"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  Download,
  FileText,
  FileSpreadsheet,
  BarChart3,
  Home,
  Users,
  Wrench,
  // DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useApiQuery } from "@/hooks/useApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import SaCurrency from "@/common/sa-currency";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

// Define types for API responses
interface Unit {
  _id: string;
  number: string;
  description: string;
  processingCost: number;
  unitStatus: "available" | "reserved" | "under_maintenance";
  location?: {
    address: string;
    city: string;
    country: string;
  };
  unitType?: {
    name: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface Rental {
  _id: string;
  unitID: string;
  contractNumber?: string;
  status: "active" | "completed" | "cancelled";
  startDate?: string;
  endDate?: string;
  rentalAmount?: number;
  securityDeposit?: number;
  createdAt: string;
  updatedAt: string;
}

interface UnitMove {
  _id: string;
  unitID: string;
  debit: number;
  credit: number;
  moveDate: string;
  description?: string;
  moveType?: {
    name: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceRequest {
  _id: string;
  unitID: string;
  title: string;
  description?: string;
  status: "open" | "in-progress" | "closed";
  priority?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

type ReportType = {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
};

const reportTypes: ReportType[] = [
  {
    id: "units",
    title: "reportTypes.units.title",
    description: "reportTypes.units.description",
    icon: <Home className="h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />,
    category: "Property",
  },
  {
    id: "rentals",
    title: "reportTypes.rentals.title",
    description: "reportTypes.rentals.description",
    icon: (
      <Users className="h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />
    ),
    category: "Property",
  },
  {
    id: "financial",
    title: "reportTypes.financial.title",
    description: "reportTypes.financial.description",
    icon: <SaCurrency color="var(--primary)" size={18} />,
    category: "Financial",
  },
  {
    id: "maintenance",
    title: "reportTypes.maintenance.title",
    description: "reportTypes.maintenance.description",
    icon: (
      <Wrench className="h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />
    ),
    category: "Operations",
  },
  // {
  //   id: "contacts",
  //   title: "reportTypes.contacts.title",
  //   description: "reportTypes.contacts.description",
  //   icon: <Users className="h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />,
  //   category: "General",
  // },
];

// Skeleton components using shadcn's Skeleton
const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-3 sm:p-4">
      <Skeleton className="mb-2 h-6 sm:h-7 lg:h-8" />
      <Skeleton className="h-3 w-20 sm:h-4" />
    </CardContent>
  </Card>
);

const ReportCardSkeleton = () => (
  <Card>
    <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
          <Skeleton className="h-4 w-24 sm:h-5" />
        </div>
      </div>
      <Skeleton className="mt-2 h-3 w-full sm:h-4" />
      <Skeleton className="h-3 w-3/4 sm:h-4" />
    </CardHeader>
  </Card>
);

const ErrorDisplay = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  const { t } = useTranslation("reports");

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("messages.errorLoadingData")}
        </h3>
        <p className="max-w-md text-sm text-gray-600">{message}</p>
      </div>
      <Button
        onClick={onRetry}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        {t("actions.retry")}
      </Button>
    </div>
  );
};

export default function Reports() {
  const { t } = useTranslation("reports");

  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMissingDataModal, setShowMissingDataModal] = useState(false);
  const [missingDataTypes, setMissingDataTypes] = useState<string[]>([]);

  // Fetch data using useApi hook with proper typing and error handling
  const {
    data: units,
    isLoading: unitsLoading,
    error: unitsError,
    refetch: refetchUnits,
  } = useApiQuery<Unit[]>({
    queryKey: ["units"],
    endpoint: "/data/units.json",
    useLocalJson: true,
  });

  const {
    data: rentals,
    isLoading: rentalsLoading,
    error: rentalsError,
    refetch: refetchRentals,
  } = useApiQuery<Rental[]>({
    queryKey: ["rentals"],
    endpoint: "/data/rentals.json",
    useLocalJson: true,
  });

  const {
    data: unitMoves,
    isLoading: movesLoading,
    error: movesError,
    refetch: refetchMoves,
  } = useApiQuery<UnitMove[]>({
    queryKey: ["unit-moves"],
    endpoint: "/data/unit-moves.json",
    useLocalJson: true,
  });

  const {
    data: maintenanceRequests,
    isLoading: maintenanceLoading,
    error: maintenanceError,
    refetch: refetchMaintenance,
  } = useApiQuery<MaintenanceRequest[]>({
    queryKey: ["maintenance-requests"],
    endpoint: "/data/maintenance-requests.json",
    useLocalJson: true,
  });

  const isDataLoading =
    unitsLoading || rentalsLoading || movesLoading || maintenanceLoading;
  const hasError =
    unitsError || rentalsError || movesError || maintenanceError || error;

  const handleRetry = () => {
    setError(null);
    refetchUnits();
    refetchRentals();
    refetchMoves();
    refetchMaintenance();
  };

  // Set error messages based on API errors
  useEffect(() => {
    if (unitsError) {
      console.error("Error fetching units:", unitsError);
      setError(t("errors.unitsData"));
    } else if (rentalsError) {
      console.error("Error fetching rentals:", rentalsError);
      setError(t("errors.rentalsData"));
    } else if (movesError) {
      console.error("Error fetching unit moves:", movesError);
      setError(t("errors.financialData"));
    } else if (maintenanceError) {
      console.error("Error fetching maintenance requests:", maintenanceError);
      setError(t("errors.maintenanceData"));
    }
  }, [unitsError, rentalsError, movesError, maintenanceError, t]);

  // Calculate report statistics with proper null checks
  const reportStats = useMemo(() => {
    if (isDataLoading) return null;

    const activeRentals = Array.isArray(rentals)
      ? rentals.filter((rental) => rental.status === "active").length
      : 0;
    const totalUnits = Array.isArray(units) ? units.length : 0;
    const totalRevenue = Array.isArray(unitMoves)
      ? unitMoves.reduce((sum: number, move) => sum + (move.credit || 0), 0)
      : 0;
    const totalExpenses = Array.isArray(unitMoves)
      ? unitMoves.reduce((sum: number, move) => sum + (move.debit || 0), 0)
      : 0;
    const openMaintenanceRequests = Array.isArray(maintenanceRequests)
      ? maintenanceRequests.filter((req) => req.status === "open").length
      : 0;

    return {
      activeRentals,
      totalUnits,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      openMaintenanceRequests,
    };
  }, [units, rentals, unitMoves, maintenanceRequests, isDataLoading]);

  const toggleReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId],
    );
  };

  const handleGenerateReport = async () => {
    if (selectedReports.length === 0) {
      setError(t("messages.selectAtLeastOne"));
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Validate that we have the required data
      const missingData = [];
      if (selectedReports.includes("units") && !Array.isArray(units))
        missingData.push("Units");
      if (selectedReports.includes("rentals") && !Array.isArray(rentals))
        missingData.push("Rentals");
      if (selectedReports.includes("financial") && !Array.isArray(unitMoves))
        missingData.push("Financial");
      if (
        selectedReports.includes("maintenance") &&
        !Array.isArray(maintenanceRequests)
      )
        missingData.push("Maintenance");

      if (missingData.length > 0) {
        setMissingDataTypes(missingData);
        setShowMissingDataModal(true);
        return;
      }

      // Prepare report data based on selected types
      const reportData: any = {};

      if (selectedReports.includes("units") && Array.isArray(units)) {
        reportData.units = units;
      }
      if (selectedReports.includes("rentals") && Array.isArray(rentals)) {
        reportData.rentals = rentals;
      }
      if (selectedReports.includes("financial") && Array.isArray(unitMoves)) {
        reportData.financial = unitMoves;
      }
      if (
        selectedReports.includes("maintenance") &&
        Array.isArray(maintenanceRequests)
      ) {
        reportData.maintenance = maintenanceRequests;
      }

      // Filter data by date range if specified
      let filteredData = { ...reportData };
      if (dateRange.from) {
        if (filteredData.financial && Array.isArray(filteredData.financial)) {
          filteredData.financial = filteredData.financial.filter(
            (move: UnitMove) => {
              try {
                const moveDate = new Date(move.moveDate);
                const fromDate = dateRange.from!;
                const toDate = dateRange.to || new Date();
                return moveDate >= fromDate && moveDate <= toDate;
              } catch (e) {
                console.warn("Invalid date in unit move:", move.moveDate);
                return true;
              }
            },
          );
        }
        if (
          filteredData.maintenance &&
          Array.isArray(filteredData.maintenance)
        ) {
          filteredData.maintenance = filteredData.maintenance.filter(
            (req: MaintenanceRequest) => {
              try {
                const createdDate = new Date(req.createdAt);
                const fromDate = dateRange.from!;
                const toDate = dateRange.to || new Date();
                return createdDate >= fromDate && createdDate <= toDate;
              } catch (e) {
                console.warn(
                  "Invalid date in maintenance request:",
                  req.createdAt,
                );
                return true;
              }
            },
          );
        }
      }

      const reportTitle = t("reportTitle", {
        date: format(new Date(), "yyyy-MM-dd"),
      });

      if (exportFormat === "pdf") {
        await generatePDFReport(filteredData, reportTitle, reportStats);
      } else {
        await generateExcelReport(filteredData, reportTitle, reportStats);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("messages.unknownError");
      setError(t("errors.reportGeneration", { error: errorMessage }));
    } finally {
      setIsGenerating(false);
    }
  };

  // Missing Data Modal Component
  const MissingDataModal = () => {
    if (!showMissingDataModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                {t("messages.missingDataTitle")}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMissingDataModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("messages.missingDataDescription")}
            </p>
            <div className="space-y-2">
              {missingDataTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-2 rounded-lg bg-orange-50 p-2"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-orange-500" />
                  <span className="text-sm font-medium text-orange-800">
                    {type} {t("messages.missingDataSuffix")}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleRetry}
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("actions.retryLoading")}
              </Button>
              <Button
                onClick={() => setShowMissingDataModal(false)}
                className="flex-1"
              >
                {t("actions.continueAnyway")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const generatePDFReport = async (data: any, title: string, stats: any) => {
    try {
      const doc = new jsPDF();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.text(title, 20, yPosition);
      yPosition += 20;

      // Summary Statistics
      if (stats) {
        doc.setFontSize(16);
        doc.text(t("reportSections.summaryStatistics"), 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        const summaryData = [
          [t("stats.totalUnits"), stats.totalUnits.toString()],
          [t("stats.activeRentals"), stats.activeRentals.toString()],
          [t("stats.totalRevenue"), `$${stats.totalRevenue.toLocaleString()}`],
          [
            t("stats.totalExpenses"),
            `$${stats.totalExpenses.toLocaleString()}`,
          ],
          [t("stats.netIncome"), `$${stats.netIncome.toLocaleString()}`],
          [t("stats.openRequests"), stats.openMaintenanceRequests.toString()],
        ];

        autoTable(doc, {
          head: [[t("tableHeaders.metric"), t("tableHeaders.value")]],
          body: summaryData,
          startY: yPosition,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // Units Report
      if (
        data.units &&
        selectedReports.includes("units") &&
        Array.isArray(data.units)
      ) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.text(t("reportSections.unitsReport"), 20, yPosition);
        yPosition += 10;

        const unitsData = data.units.map((unit: Unit) => [
          unit.number || t("notAvailable"),
          unit.description || t("notAvailable"),
          unit.unitStatus || t("notAvailable"),
          `$${(unit.processingCost || 0).toLocaleString()}`,
        ]);

        autoTable(doc, {
          head: [
            [
              t("tableHeaders.unitNumber"),
              t("tableHeaders.description"),
              t("tableHeaders.status"),
              t("tableHeaders.processingCost"),
            ],
          ],
          body: unitsData,
          startY: yPosition,
          theme: "striped",
          headStyles: { fillColor: [52, 152, 219] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Rentals Report
      if (
        data.rentals &&
        selectedReports.includes("rentals") &&
        Array.isArray(data.rentals)
      ) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.text(t("reportSections.rentalsReport"), 20, yPosition);
        yPosition += 10;

        const rentalsData = data.rentals.map((rental: Rental) => {
          try {
            return [
              rental.contractNumber || t("notAvailable"),
              rental.unitID || t("notAvailable"),
              rental.status || t("notAvailable"),
              rental.startDate
                ? format(new Date(rental.startDate), "yyyy-MM-dd")
                : t("notAvailable"),
              rental.endDate
                ? format(new Date(rental.endDate), "yyyy-MM-dd")
                : t("notAvailable"),
              `$${(rental.rentalAmount || 0).toLocaleString()}`,
            ];
          } catch (e) {
            return [
              rental.contractNumber || t("notAvailable"),
              rental.unitID || t("notAvailable"),
              rental.status || t("notAvailable"),
              t("invalidDate"),
              t("invalidDate"),
              `$${(rental.rentalAmount || 0).toLocaleString()}`,
            ];
          }
        });

        autoTable(doc, {
          head: [
            [
              t("tableHeaders.contractNumber"),
              t("tableHeaders.unitId"),
              t("tableHeaders.status"),
              t("tableHeaders.startDate"),
              t("tableHeaders.endDate"),
              t("tableHeaders.rentalAmount"),
            ],
          ],
          body: rentalsData,
          startY: yPosition,
          theme: "striped",
          headStyles: { fillColor: [142, 68, 173] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Financial Report
      if (
        data.financial &&
        selectedReports.includes("financial") &&
        Array.isArray(data.financial)
      ) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.text(t("reportSections.financialMovements"), 20, yPosition);
        yPosition += 10;

        const financialData = data.financial
          .slice(0, 20)
          .map((move: UnitMove) => {
            try {
              return [
                move.moveDate
                  ? format(new Date(move.moveDate), "yyyy-MM-dd")
                  : t("notAvailable"),
                move.description || t("notAvailable"),
                move.debit ? `-$${move.debit.toLocaleString()}` : "",
                move.credit ? `$${move.credit.toLocaleString()}` : "",
              ];
            } catch (e) {
              return [
                t("invalidDate"),
                move.description || t("notAvailable"),
                move.debit ? `-$${move.debit.toLocaleString()}` : "",
                move.credit ? `$${move.credit.toLocaleString()}` : "",
              ];
            }
          });

        autoTable(doc, {
          head: [
            [
              t("tableHeaders.date"),
              t("tableHeaders.description"),
              t("tableHeaders.debit"),
              t("tableHeaders.credit"),
            ],
          ],
          body: financialData,
          startY: yPosition,
          theme: "striped",
          headStyles: { fillColor: [46, 204, 113] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Maintenance Report
      if (
        data.maintenance &&
        selectedReports.includes("maintenance") &&
        Array.isArray(data.maintenance)
      ) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.text(t("reportSections.maintenanceRequests"), 20, yPosition);
        yPosition += 10;

        const maintenanceData = data.maintenance
          .slice(0, 15)
          .map((req: MaintenanceRequest) => {
            try {
              return [
                req.title || t("notAvailable"),
                req.status || t("notAvailable"),
                req.priority || t("notAvailable"),
                req.createdAt
                  ? format(new Date(req.createdAt), "yyyy-MM-dd")
                  : t("notAvailable"),
              ];
            } catch (e) {
              return [
                req.title || t("notAvailable"),
                req.status || t("notAvailable"),
                req.priority || t("notAvailable"),
                t("invalidDate"),
              ];
            }
          });

        autoTable(doc, {
          head: [
            [
              t("tableHeaders.title"),
              t("tableHeaders.status"),
              t("tableHeaders.priority"),
              t("tableHeaders.createdDate"),
            ],
          ],
          body: maintenanceData,
          startY: yPosition,
          theme: "striped",
          headStyles: { fillColor: [231, 76, 60] },
        });
      }

      // Save PDF
      doc.save(`${title}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      throw new Error(t("errors.pdfGeneration"));
    }
  };

  const generateExcelReport = async (data: any, title: string, stats: any) => {
    try {
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      if (stats) {
        const summaryData = [
          [t("summarySheetTitle")],
          [t("generatedDate"), format(new Date(), "yyyy-MM-dd HH:mm:ss")],
          [""],
          [t("tableHeaders.metric"), t("tableHeaders.value")],
          [t("stats.totalUnits"), stats.totalUnits],
          [t("stats.activeRentals"), stats.activeRentals],
          [t("stats.totalRevenue"), stats.totalRevenue],
          [t("stats.totalExpenses"), stats.totalExpenses],
          [t("stats.netIncome"), stats.netIncome],
          [t("stats.openRequests"), stats.openMaintenanceRequests],
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
      }

      // Units Sheet
      if (
        data.units &&
        selectedReports.includes("units") &&
        Array.isArray(data.units)
      ) {
        const unitsData = [
          [
            t("tableHeaders.unitNumber"),
            t("tableHeaders.description"),
            t("tableHeaders.status"),
            t("tableHeaders.processingCost"),
            t("tableHeaders.location"),
            t("tableHeaders.unitType"),
          ],
          ...data.units.map((unit: Unit) => [
            unit.number || "",
            unit.description || "",
            unit.unitStatus || "",
            unit.processingCost || 0,
            unit.location?.address || "",
            unit.unitType?.name || "",
          ]),
        ];

        const unitsSheet = XLSX.utils.aoa_to_sheet(unitsData);
        XLSX.utils.book_append_sheet(workbook, unitsSheet, "Units");
      }

      // Rentals Sheet
      if (
        data.rentals &&
        selectedReports.includes("rentals") &&
        Array.isArray(data.rentals)
      ) {
        const rentalsData = [
          [
            t("tableHeaders.contractNumber"),
            t("tableHeaders.unitId"),
            t("tableHeaders.status"),
            t("tableHeaders.startDate"),
            t("tableHeaders.endDate"),
            t("tableHeaders.rentalAmount"),
            t("tableHeaders.securityDeposit"),
          ],
          ...data.rentals.map((rental: Rental) => {
            try {
              return [
                rental.contractNumber || "",
                rental.unitID || "",
                rental.status || "",
                rental.startDate
                  ? format(new Date(rental.startDate), "yyyy-MM-dd")
                  : "",
                rental.endDate
                  ? format(new Date(rental.endDate), "yyyy-MM-dd")
                  : "",
                rental.rentalAmount || 0,
                rental.securityDeposit || 0,
              ];
            } catch (e) {
              return [
                rental.contractNumber || "",
                rental.unitID || "",
                rental.status || "",
                t("invalidDate"),
                t("invalidDate"),
                rental.rentalAmount || 0,
                rental.securityDeposit || 0,
              ];
            }
          }),
        ];

        const rentalsSheet = XLSX.utils.aoa_to_sheet(rentalsData);
        XLSX.utils.book_append_sheet(workbook, rentalsSheet, "Rentals");
      }

      // Financial Sheet
      if (
        data.financial &&
        selectedReports.includes("financial") &&
        Array.isArray(data.financial)
      ) {
        const financialData = [
          [
            t("tableHeaders.date"),
            t("tableHeaders.unitId"),
            t("tableHeaders.description"),
            t("tableHeaders.debit"),
            t("tableHeaders.credit"),
            t("tableHeaders.moveType"),
          ],
          ...data.financial.map((move: UnitMove) => {
            try {
              return [
                move.moveDate
                  ? format(new Date(move.moveDate), "yyyy-MM-dd")
                  : "",
                move.unitID || "",
                move.description || "",
                move.debit || 0,
                move.credit || 0,
                move.moveType?.name || "",
              ];
            } catch (e) {
              return [
                t("invalidDate"),
                move.unitID || "",
                move.description || "",
                move.debit || 0,
                move.credit || 0,
                move.moveType?.name || "",
              ];
            }
          }),
        ];

        const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
        XLSX.utils.book_append_sheet(workbook, financialSheet, "Financial");
      }

      // Maintenance Sheet
      if (
        data.maintenance &&
        selectedReports.includes("maintenance") &&
        Array.isArray(data.maintenance)
      ) {
        const maintenanceData = [
          [
            t("tableHeaders.title"),
            t("tableHeaders.unitId"),
            t("tableHeaders.status"),
            t("tableHeaders.priority"),
            t("tableHeaders.createdDate"),
            t("tableHeaders.resolvedDate"),
            t("tableHeaders.description"),
          ],
          ...data.maintenance.map((req: MaintenanceRequest) => {
            try {
              return [
                req.title || "",
                req.unitID || "",
                req.status || "",
                req.priority || "",
                req.createdAt
                  ? format(new Date(req.createdAt), "yyyy-MM-dd")
                  : "",
                req.resolvedAt
                  ? format(new Date(req.resolvedAt), "yyyy-MM-dd")
                  : "",
                req.description || "",
              ];
            } catch (e) {
              return [
                req.title || "",
                req.unitID || "",
                req.status || "",
                req.priority || "",
                t("invalidDate"),
                t("invalidDate"),
                req.description || "",
              ];
            }
          }),
        ];

        const maintenanceSheet = XLSX.utils.aoa_to_sheet(maintenanceData);
        XLSX.utils.book_append_sheet(workbook, maintenanceSheet, "Maintenance");
      }

      // Save Excel file
      XLSX.writeFile(workbook, `${title}.xlsx`);
    } catch (error) {
      console.error("Excel generation error:", error);
      throw new Error(t("errors.excelGeneration"));
    }
  };

  const categories = [...new Set(reportTypes.map((report) => report.category))];

  // Show error state
  if (hasError && !isDataLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <ErrorDisplay
          message={error || t("messages.connectionError")}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 lg:space-y-8 lg:p-6">
      {/* Missing Data Modal */}
      <MissingDataModal />

      {/* Error Banner */}
      {error && (
        <Card className="border-red-200 bg-red-50 py-2! dark:border-red-800/50 dark:bg-red-950/50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="h-6 w-6 p-0 text-red-800 hover:text-red-900 dark:text-red-200 dark:hover:text-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Banner for Generated Reports */}
      {!isGenerating && !error && selectedReports.length > 0 && (
        <Card className="border-green-200 bg-green-50 py-2! dark:border-green-800/50 dark:bg-green-950/50">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500 dark:bg-green-600">
              <div className="h-2 w-2 rounded-full bg-white dark:bg-green-100"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-800 dark:text-green-200">
                {t("messages.readyToGenerate", {
                  reports: selectedReports
                    .map((id) =>
                      t(reportTypes.find((r) => r.id === id)?.title || ""),
                    )
                    .join(", "),
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Loading State */}
      {isDataLoading && (
        <Card className="border-blue-200 bg-blue-50 py-2! dark:border-blue-800/50 dark:bg-blue-950/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Skeleton className="h-5 w-5 flex-shrink-0" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      )}

      {/* Data Overview Cards */}
      <div className="grid grid-cols-2 gap-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3 sm:gap-3 lg:grid-cols-6 lg:gap-4 dark:*:data-[slot=card]:bg-card">
        {isDataLoading ? (
          // Show skeleton loading for stats
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : reportStats ? (
          // Show actual stats
          <>
            <Card className="@container/card py-2!">
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg font-bold sm:text-xl lg:text-2xl">
                  {reportStats.totalUnits}
                </div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {t("stats.totalUnits")}
                </p>
              </CardContent>
            </Card>
            <Card className="@container/card py-2!">
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg font-bold sm:text-xl lg:text-2xl">
                  {reportStats.activeRentals}
                </div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {t("stats.activeRentals")}
                </p>
              </CardContent>
            </Card>
            <Card className="@container/card py-2!">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 text-lg font-bold sm:text-xl lg:text-2xl">
                  <SaCurrency size={18} />{" "}
                  {reportStats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {t("stats.totalRevenue")}
                </p>
              </CardContent>
            </Card>
            <Card className="@container/card py-2!">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 text-lg font-bold sm:text-xl lg:text-2xl">
                  <SaCurrency size={18} />{" "}
                  {reportStats.totalExpenses.toLocaleString()}
                </div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {t("stats.totalExpenses")}
                </p>
              </CardContent>
            </Card>
            <Card className="@container/card py-2!">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 text-lg font-bold text-green-600 sm:text-xl lg:text-2xl">
                  <SaCurrency color="var(--color-green-600)" size={18} />{" "}
                  {reportStats.netIncome.toLocaleString()}
                </div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {t("stats.netIncome")}
                </p>
              </CardContent>
            </Card>
            <Card className="@container/card py-2!">
              <CardContent className="p-3 sm:p-4">
                <div className="text-lg font-bold sm:text-xl lg:text-2xl">
                  {reportStats.openMaintenanceRequests}
                </div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {t("stats.openRequests")}
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        {/* Report Selection */}
        <div className="space-y-4 sm:space-y-6 xl:col-span-2">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold sm:mb-3 sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                {t(`categories.${category.toLowerCase()}`)}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {isDataLoading
                  ? // Show skeleton loading for report cards
                    Array.from({
                      length: reportTypes.filter((r) => r.category === category)
                        .length,
                    }).map((_, i) => <ReportCardSkeleton key={i} />)
                  : reportTypes
                      .filter((report) => report.category === category)
                      .map((report) => {
                        const isSelected = selectedReports.includes(report.id);

                        return (
                          <Card
                            key={report.id}
                            className={cn(
                              "cursor-pointer py-2! transition-all hover:shadow-md",
                              isSelected &&
                                "bg-primary/5 py-2! ring-2 ring-primary",
                              isDataLoading &&
                                "pointer-events-none py-2! opacity-50",
                            )}
                            onClick={() =>
                              !isDataLoading && toggleReport(report.id)
                            }
                          >
                            <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {report.icon}
                                  <CardTitle className="text-sm leading-tight sm:text-base">
                                    {t(report.title)}
                                  </CardTitle>
                                </div>
                                {isSelected && (
                                  <Badge
                                    variant="default"
                                    className="flex-shrink-0 text-[10px] sm:text-xs"
                                  >
                                    {t("actions.selected")}
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-xs leading-relaxed sm:text-sm">
                                {t(report.description)}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        );
                      })}
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Panel */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="py-2!">
            <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">
                {t("configuration.title")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("configuration.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-3 pt-0 sm:space-y-6 sm:p-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">
                  {t("configuration.dateRange")}
                </Label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isDataLoading}
                        className={cn(
                          "h-8 w-full justify-start text-left text-xs font-normal sm:h-10 sm:text-sm",
                          !dateRange.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="truncate">
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "MMM dd")} -{" "}
                                {format(dateRange.to, "MMM dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            t("configuration.pickDateRange")
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        autoFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={(range) =>
                          setDateRange(
                            range || { from: undefined, to: undefined },
                          )
                        }
                        numberOfMonths={1}
                        required={false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              {/* Export Format */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">
                  {t("configuration.exportFormat")}
                </Label>
                <Select
                  value={exportFormat}
                  onValueChange={(value: "pdf" | "excel") =>
                    setExportFormat(value)
                  }
                  disabled={isDataLoading}
                >
                  <SelectTrigger className="h-8 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">
                          {t("configuration.pdfDocument")}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">
                          {t("configuration.excelSpreadsheet")}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Selected Reports Summary */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">
                  {t("configuration.selectedReports")} ({selectedReports.length}
                  )
                </Label>
                {selectedReports.length > 0 ? (
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {selectedReports.map((reportId) => {
                      const report = reportTypes.find((r) => r.id === reportId);
                      return (
                        <Badge
                          key={reportId}
                          variant="secondary"
                          className="text-[10px] sm:text-xs"
                        >
                          {t(report?.title || "")}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {t("configuration.noReportsSelected")}
                  </p>
                )}
              </div>

              <Separator />

              {/* Generate Button */}
              <Button
                onClick={handleGenerateReport}
                disabled={
                  selectedReports.length === 0 || isGenerating || isDataLoading
                }
                className="h-10 w-full text-sm sm:h-12 sm:text-base"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("actions.generating")}
                  </>
                ) : isDataLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("actions.loadingData")}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t("actions.generateReport")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
