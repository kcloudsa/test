import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import SaCurrency from "@/common/sa-currency";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";

interface Unit {
  _id: string;
  number: string;
  description: string;
  notes: string;
  processingCost: number;
  location: {
    address: string;
    city: string;
    country: string;
    geo: {
      latitude: number;
      longitude: number;
    };
  };
  baseUnit: string;
  unitMedia: string[];
  unitStatus: "available" | "reserved" | "under_maintenance";
}

interface Rental {
  _id: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  rentalAmount: number;
  status: "active" | "completed" | "cancelled";
  isMonthly: boolean;
  restMonthsLeft?: number;
}

interface UnitMove {
  _id: string;
  moveDate: string;
  debit: number;
  credit: number;
  description?: string;
}

interface Stats {
  openMaintenance: number;
}

interface OverviewTabProps {
  unit: Unit;
  unitMoves: UnitMove[];
  rentals: Rental[];
  stats: Stats;
  ImageGallery: React.ComponentType<{ images: string[]; unitNumber: string }>;
}

function getStatusColor(status: string) {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
    case "reserved":
      return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
    case "under_maintenance":
      return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
  }
}

function formatStatusText(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function OverviewTab({
  unit,
  unitMoves,
  rentals,
  stats,
  ImageGallery,
}: OverviewTabProps) {
  const { t } = useTranslation("real-estates");

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
      {/* Unit Details */}
      <div className="space-y-4 sm:space-y-6 lg:col-span-2">
        {/* Image Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              {t("overview.propertyImages")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0! sm:p-6">
            <ImageGallery
              images={unit.unitMedia || []}
              unitNumber={unit.number || t("overview.unknown")}
            />
          </CardContent>
        </Card>

        {/* Unit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              {t("overview.unitInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-3 pt-0! sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("overview.unitNumber")}
                </label>
                <p className="text-sm font-medium">
                  {unit.number || t("overview.notAvailable")}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("overview.processingCost")}
                </label>
                <p className="text-sm font-medium">
                  <SaCurrency size={14} />{" "}
                  {(unit.processingCost || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("overview.baseUnit")}
                </label>
                <p className="text-sm font-medium">
                  {unit.baseUnit || t("overview.notAvailable")}
                </p>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("overview.status")}
                </label>
                <div className="mt-1">
                  <Badge
                    className={`text-xs ${getStatusColor(unit.unitStatus)}`}
                  >
                    {t(`filters.statuses.${unit.unitStatus}`) ||
                      formatStatusText(unit.unitStatus)}
                  </Badge>
                </div>
              </div>
            </div>

            {unit.description && (
              <div>
                <label className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("overview.description")}
                </label>
                <p className="mt-1 text-sm">{unit.description}</p>
              </div>
            )}

            {unit.notes && (
              <div>
                <label className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("overview.notes")}
                </label>
                <p className="mt-1 text-sm">{unit.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              {t("overview.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0! sm:p-6">
            {unitMoves.length > 0 ? (
              <div className="space-y-3">
                {unitMoves.slice(0, 5).map((move) => (
                  <div
                    key={move._id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium sm:text-base">
                        {move.description || t("overview.financialTransaction")}
                      </p>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {new Date(move.moveDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-2 text-right">
                      {move.debit > 0 && (
                        <p className="text-sm font-medium text-destructive">
                          -<SaCurrency size={14} color="var(--destructive)" />{" "}
                          {move.debit.toLocaleString()}
                        </p>
                      )}
                      {move.credit > 0 && (
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          +
                          <SaCurrency
                            size={14}
                            lightColor="var(--color-green-600)"
                            darkColor="var(--color-green-400)"
                          />{" "}
                          {move.credit.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground sm:py-8">
                {t("overview.noRecentActivity")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 sm:space-y-6">
        {/* Location */}
        {unit.location && (
          <Card className="py-0! pt-4!">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                {t("overview.location")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3 pt-0! sm:p-6">
              <div>
                <p className="text-sm font-medium">
                  {unit.location.address || t("overview.notAvailable")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {unit.location.city || t("overview.notAvailable")},{" "}
                  {unit.location.country || t("overview.notAvailable")}
                </p>
              </div>

              {unit.location.geo && (
                <div className="text-xs text-muted-foreground">
                  <p>
                    {t("overview.coordinates.lat")}:{" "}
                    {unit.location.geo.latitude}
                  </p>
                  <p>
                    {t("overview.coordinates.lng")}:{" "}
                    {unit.location.geo.longitude}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Current Rental */}
        {rentals.filter((r) => r.status === "active").length > 0 && (
          <Card className="py-0! pt-4!">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                {t("overview.currentRental")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0! sm:p-6">
              {rentals
                .filter((r) => r.status === "active")
                .slice(0, 1)
                .map((rental) => (
                  <div key={rental._id} className="space-y-3">
                    <div>
                      <p className="text-sm font-medium sm:text-base">
                        {t("overview.contract")} {rental.contractNumber}
                      </p>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {new Date(rental.startDate).toLocaleDateString()} -{" "}
                        {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground sm:text-sm">
                        {t("overview.amount")}
                      </span>
                      <span className="text-sm font-medium">
                        <SaCurrency size={14} />{" "}
                        {rental.rentalAmount.toLocaleString()}
                      </span>
                    </div>

                    {rental.isMonthly && rental.restMonthsLeft && (
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground sm:text-sm">
                          {t("overview.monthsLeft")}
                        </span>
                        <span className="text-sm font-medium">
                          {rental.restMonthsLeft}
                        </span>
                      </div>
                    )}

                    <LocalizedLink to={`/dash/rentals/${rental._id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        {t("overview.viewContract")}
                      </Button>
                    </LocalizedLink>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Maintenance Status */}
        {stats.openMaintenance > 0 && (
          <Card className="py-0! pt-4!">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <AlertCircle className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
                {t("overview.maintenanceAlert")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0! sm:p-6">
              <div className="space-y-3">
                <p className="text-sm">
                  {t("overview.maintenanceMessage", {
                    count: stats.openMaintenance,
                  })}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  {t("overview.viewRequests")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
