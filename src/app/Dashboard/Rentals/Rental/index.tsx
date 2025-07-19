import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useApiQuery } from "@/hooks/useApi";
import type {
  Rental,
  MaintenanceRequest,
  UnitMove,
  Unit,
} from "@/types/rental";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  // DollarSign,
  Home,
  Settings,
  TrendingUp,
  MapPin,
  Download,
  Printer,
  ChevronDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  Sheet,
} from "lucide-react";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportToJSON,
  exportToCSV,
  exportToPDF,
  exportToExcel,
} from "@/utils/exportUtils";
import SaCurrency from "@/common/sa-currency";

export default function Rental() {
  const { t } = useTranslation("rentals");
  const { rentalID } = useParams<{ rentalID: string }>();
  const navigate = useNavigate();

  const { data: rentals, isLoading: rentalsLoading } = useApiQuery<Rental[]>({
    queryKey: ["rentals"],
    endpoint: "/data/rentals.json",
    useLocalJson: true,
  });

  const { data: units, isLoading: unitsLoading } = useApiQuery<Unit[]>({
    queryKey: ["units"],
    endpoint: "/data/units.json",
    useLocalJson: true,
  });

  const { data: maintenanceRequests, isLoading: maintenanceLoading } =
    useApiQuery<MaintenanceRequest[]>({
      queryKey: ["maintenance-requests"],
      endpoint: "/data/maintenance-requests.json",
      useLocalJson: true,
    });

  const { data: unitMoves, isLoading: movesLoading } = useApiQuery<UnitMove[]>({
    queryKey: ["unit-moves"],
    endpoint: "/data/unit-moves.json",
    useLocalJson: true,
  });

  const isLoading =
    rentalsLoading || unitsLoading || maintenanceLoading || movesLoading;

  const rental = rentals?.find((r) => r._id === rentalID);
  const unit = units?.find((u) => u._id === rental?.unitID);
  const relatedMaintenance = maintenanceRequests?.filter(
    (m) => m.unitID === rental?.unitID,
  );
  const relatedMoves = unitMoves?.filter((m) => m.rentalID === rental?._id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <Home className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {t("details.notFound")}
          </h3>
          <p className="mb-4 text-muted-foreground">
            {t("details.notFoundMessage")}
          </p>
          <Button onClick={() => navigate("/dashboard/rentals")}>
            {t("details.backToRentals")}
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrint = () => {
    // Use the browser's native print function for the current page
    window.print();
  };

  const handleExportJSON = () => {
    if (!rental) return;

    const exportData = {
      rentalDetails: {
        contractNumber: rental.contractNumber,
        status: rental.status,
        moveType: rental.moveType.name,
        startDate: rental.startDate,
        endDate: rental.endDate,
        currentPrice: rental.currentPrice,
        startPrice: rental.startPrice,
        securityDeposit: rental.securityDeposit,
        monthsCount: rental.monthsCount,
        restMonthsLeft: rental.restMonthsLeft,
        roommates: rental.roommates,
        isMonthly: rental.isMonthly,
        notes: rental.notes,
        rentalSource: rental.rentalSource,
        periodicIncrease: rental.periodicIncrease,
      },
      unitDetails: unit
        ? {
            number: unit.number,
            description: unit.description,
            unitType: unit.unitType.name,
            unitStatus: unit.unitStatus,
            location: unit.location,
            processingCost: unit.processingCost,
          }
        : null,
      financialSummary: {
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netIncome: totalIncome - totalExpenses,
      },
      financialMovements:
        relatedMoves?.map((move) => ({
          date: move.moveDate,
          description: move.description,
          moveType: move.moveType.name,
          credit: move.credit,
          debit: move.debit,
        })) || [],
      maintenanceRequests:
        relatedMaintenance?.map((request) => ({
          title: request.title,
          description: request.description,
          status: request.status,
          priority: request.priority,
          createdAt: request.createdAt,
          resolvedAt: request.resolvedAt,
          reportedBy: request.reportedByUser.name,
        })) || [],
      exportDate: new Date().toISOString(),
    };

    exportToJSON(
      exportData,
      `rental-${rental.contractNumber}-${new Date().toISOString().split("T")[0]}`,
    );
  };

  const handleExportCSV = () => {
    if (!rental || !relatedMoves || !relatedMaintenance) return;

    exportToCSV(
      rental,
      relatedMoves,
      relatedMaintenance,
      `rental-${rental.contractNumber}-${new Date().toISOString().split("T")[0]}`,
    );
  };

  const handleExportPDF = () => {
    if (!rental || !relatedMoves || !relatedMaintenance) return;

    // This will download the PDF file
    exportToPDF(rental, unit, relatedMoves, relatedMaintenance);
  };

  const handleExportExcel = () => {
    if (!rental || !relatedMoves || !relatedMaintenance) return;

    exportToExcel(
      rental,
      unit,
      relatedMoves,
      relatedMaintenance,
      `rental-${rental.contractNumber}-${new Date().toISOString().split("T")[0]}`,
    );
  };

  const totalIncome =
    relatedMoves?.reduce((sum, move) => sum + move.credit, 0) || 0;
  const totalExpenses =
    relatedMoves?.reduce((sum, move) => sum + move.debit, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LocalizedLink to="/dash/rentals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              {t("details.backToRentals")}
            </Button>
          </LocalizedLink>
          <div>
            <h1 className="text-3xl font-bold">{rental.contractNumber}</h1>
            <p className="text-muted-foreground">{rental.moveType.name}</p>
          </div>
          <Badge className={getStatusColor(rental.status)}>
            {t(`status.${rental.status}`)}
          </Badge>
        </div>

        {/* Export and Print Buttons */}
        <div className="flex items-center gap-2 print:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("details.export")}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleExportJSON}
                className="flex items-center gap-2"
              >
                <FileJson className="h-4 w-4" />
                {t("details.exportAsJSON")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportCSV}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {t("details.exportAsCSV")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportExcel}
                className="flex items-center gap-2"
              >
                <Sheet className="h-4 w-4" />
                {t("details.exportAsExcel")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportPDF}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {t("details.exportAsPDF")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            {t("details.print")}
          </Button>
        </div>
      </div>

      <div className="print:block">
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("details.monthlyRent")}
              </CardTitle>
              {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
              <SaCurrency size={16} color="var(--muted-foreground)" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <SaCurrency size={24} /> {rental.currentPrice}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("details.startedAt")}{" "}
                <SaCurrency size={12} color="var(--muted-foreground)" />{" "}
                {rental.startPrice}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("details.monthsLeft")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rental.restMonthsLeft}</div>
              <p className="text-xs text-muted-foreground">
                {t("details.totalMonths", { count: rental.monthsCount })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("details.securityDeposit")}
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <SaCurrency size={24} /> {rental.securityDeposit}
              </div>
              <p className="text-xs text-muted-foreground">
                {rental.roommates === 1
                  ? t("details.roommate", { count: rental.roommates })
                  : t("details.roommates", { count: rental.roommates })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t("details.overview")}</TabsTrigger>
            <TabsTrigger value="unit">{t("details.unitDetails")}</TabsTrigger>
            <TabsTrigger value="finances">{t("details.finances")}</TabsTrigger>
            <TabsTrigger value="maintenance">
              {t("details.maintenance")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t("details.rentalPeriod")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">
                      {t("details.startDate")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(rental.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t("details.endDate")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(rental.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t("details.duration")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {rental.monthsCount} {t("details.months")} (
                      {rental.isMonthly
                        ? t("filters.monthly")
                        : t("details.fixed")}
                      )
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t("details.priceInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">
                      {t("details.currentPrice")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <SaCurrency size={14} color="var(--muted-foreground)" />{" "}
                      {rental.currentPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {t("details.startingPrice")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <SaCurrency size={14} color="var(--muted-foreground)" />{" "}
                      {rental.startPrice}
                    </p>
                  </div>
                  {rental.periodicIncrease && (
                    <div>
                      <p className="text-sm font-medium">
                        {t("details.periodicIncrease")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("details.periodicIncreaseValue", {
                          value: rental.periodicIncrease.increaseValue,
                          unit: rental.periodicIncrease.isPercentage
                            ? "%"
                            : " USD",
                          duration: rental.periodicIncrease.periodicDuration,
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("details.additionalInformation")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">
                    {t("filters.rentalSource")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {rental.rentalSource.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rental.rentalSource.description}
                  </p>
                </div>
                {rental.notes && (
                  <div>
                    <p className="text-sm font-medium">{t("details.notes")}</p>
                    <p className="text-sm text-muted-foreground">
                      {rental.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unit" className="space-y-6">
            {unit ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      {t("details.unitInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">
                        {t("details.unitNumber")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {unit.number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t("details.description")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {unit.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("details.type")}</p>
                      <p className="text-sm text-muted-foreground">
                        {unit.unitType.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t("details.unitStatus")}
                      </p>
                      <Badge variant="outline">{unit.unitStatus}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t("details.location")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">
                        {t("details.address")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {unit.location.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("details.city")}</p>
                      <p className="text-sm text-muted-foreground">
                        {unit.location.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t("details.country")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {unit.location.country}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {unit.unitMedia.length > 0 && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>{t("details.unitMedia")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {unit.unitMedia.map((mediaUrl, index) => (
                          <img
                            key={index}
                            src={mediaUrl}
                            alt={t("details.unitImageAlt", {
                              number: unit.number,
                              index: index + 1,
                            })}
                            className="h-32 w-full rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {t("details.unitNotAvailable")}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="finances" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">
                    {t("details.totalIncome")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    <SaCurrency size={24} color="var(--color-green-600)" />{" "}
                    {totalIncome}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">
                    {t("details.totalExpenses")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    <SaCurrency size={24} color="var(--color-red-600)" />{" "}
                    {totalExpenses}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("details.financialMovements")}</CardTitle>
              </CardHeader>
              <CardContent>
                {relatedMoves && relatedMoves.length > 0 ? (
                  <div className="space-y-4">
                    {relatedMoves.map((move) => (
                      <div
                        key={move._id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{move.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(move.moveDate)} • {move.moveType.name}
                          </p>
                        </div>
                        <div className="text-right">
                          {move.credit > 0 && (
                            <p className="font-medium text-green-600">
                              +
                              <SaCurrency
                                size={16}
                                color="var(--color-green-600)"
                              />
                              {move.credit}
                            </p>
                          )}
                          {move.debit > 0 && (
                            <p className="font-medium text-red-600">
                              -
                              <SaCurrency
                                size={16}
                                color="var(--color-red-600)"
                              />
                              {move.debit}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    {t("details.noFinancialMovements")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("details.maintenanceRequests")}</CardTitle>
              </CardHeader>
              <CardContent>
                {relatedMaintenance && relatedMaintenance.length > 0 ? (
                  <div className="space-y-4">
                    {relatedMaintenance.map((request) => (
                      <div key={request._id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="font-medium">{request.title}</h4>
                          <div className="flex gap-2">
                            <Badge
                              variant={
                                request.priority === "high"
                                  ? "destructive"
                                  : request.priority === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {t(`priority.${request.priority}`)}
                            </Badge>
                            <Badge
                              variant={
                                request.status === "closed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {t(`status.${request.status}`)}
                            </Badge>
                          </div>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {request.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {t("details.reportedBy", {
                              name: request.reportedByUser.name,
                            })}
                          </span>
                          <span>{formatDate(request.createdAt)}</span>
                        </div>
                        {request.resolvedAt && (
                          <p className="mt-1 text-xs text-green-600">
                            {t("details.resolvedOn", {
                              date: formatDate(request.resolvedAt),
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    {t("details.noMaintenanceRequests")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
