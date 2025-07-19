import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApiQuery } from "@/hooks/useApi";
import type { Rental, RentalFilters } from "@/types/rental";
import { DEFAULT_FILTERS } from "@/types/rental";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  // DollarSign,
  Home,
  User,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";
import { RentalFiltersComponent } from "@/app/Dashboard/Rentals/components/RentalFilters";
import SaCurrency from "@/common/sa-currency";

type SortOption =
  | "contractNumber"
  | "currentPrice"
  | "startDate"
  | "restMonthsLeft"
  | "status";
type SortDirection = "asc" | "desc";

export default function Rentals() {
  const { t } = useTranslation("rentals");
  const [filters, setFilters] = useState<RentalFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>("startDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const {
    data: rentals,
    isLoading,
    error,
  } = useApiQuery<Rental[]>({
    queryKey: ["rentals"],
    endpoint: "/data/rentals.json",
    useLocalJson: true,
  });

  // Filter and sort rentals
  const filteredAndSortedRentals = useMemo(() => {
    if (!rentals) return [];

    // Apply filters
    let filtered = rentals.filter((rental) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          rental.contractNumber.toLowerCase().includes(searchLower) ||
          rental.notes?.toLowerCase().includes(searchLower) ||
          rental.rentalSource.name.toLowerCase().includes(searchLower) ||
          rental.moveType.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (
        filters.status.length > 0 &&
        !filters.status.includes(rental.status)
      ) {
        return false;
      }

      // Rental source filter
      if (
        filters.rentalSource.length > 0 &&
        !filters.rentalSource.includes(rental.rentalSource.name)
      ) {
        return false;
      }

      // Price range filter
      if (
        rental.currentPrice < filters.priceRange.min ||
        rental.currentPrice > filters.priceRange.max
      ) {
        return false;
      }

      // Months left filter
      if (
        rental.restMonthsLeft < filters.monthsLeft.min ||
        rental.restMonthsLeft > filters.monthsLeft.max
      ) {
        return false;
      }

      // Rental type filter
      if (
        filters.isMonthly !== null &&
        rental.isMonthly !== filters.isMonthly
      ) {
        return false;
      }

      // Roommates filter
      if (
        rental.roommates < filters.roommates.min ||
        rental.roommates > filters.roommates.max
      ) {
        return false;
      }

      // Start date range filter
      if (
        filters.startDateRange.from &&
        new Date(rental.startDate) < new Date(filters.startDateRange.from)
      ) {
        return false;
      }
      if (
        filters.startDateRange.to &&
        new Date(rental.startDate) > new Date(filters.startDateRange.to)
      ) {
        return false;
      }

      // End date range filter
      if (
        filters.endDateRange.from &&
        new Date(rental.endDate) < new Date(filters.endDateRange.from)
      ) {
        return false;
      }
      if (
        filters.endDateRange.to &&
        new Date(rental.endDate) > new Date(filters.endDateRange.to)
      ) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "contractNumber":
          aValue = a.contractNumber;
          bValue = b.contractNumber;
          break;
        case "currentPrice":
          aValue = a.currentPrice;
          bValue = b.currentPrice;
          break;
        case "startDate":
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case "restMonthsLeft":
          aValue = a.restMonthsLeft;
          bValue = b.restMonthsLeft;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [rentals, filters, sortBy, sortDirection]);

  const handleFiltersChange = (newFilters: RentalFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">{t("list.title")}</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">{t("list.title")}</h1>
        <Card className="p-6">
          <p className="text-red-500">
            {t("list.errorLoading", { message: error.message })}
          </p>
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
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4 p-4">
      {/* Filters Component */}
      <div className="flex items-center justify-center *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card mb-3 w-full rounded-xl border p-3">
          <RentalFiltersComponent
            rentals={rentals || []}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </Card>
      </div>

      {/* Sort Controls */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {t("list.resultsCount", {
              filtered: filteredAndSortedRentals.length,
              total: rentals?.length || 0,
            })}
          </Badge>
          <label htmlFor="sort-select" className="text-sm font-medium">
            {t("list.sortBy")}
          </label>
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contractNumber">
                {t("list.contractNumber")}
              </SelectItem>
              <SelectItem value="currentPrice">{t("list.price")}</SelectItem>
              <SelectItem value="startDate">{t("list.startDate")}</SelectItem>
              <SelectItem value="restMonthsLeft">
                {t("details.monthsLeft")}
              </SelectItem>
              <SelectItem value="status">{t("list.status")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortDirection}
            className="flex items-center gap-1"
          >
            {sortDirection === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
            {sortDirection === "asc"
              ? t("list.ascending")
              : t("list.descending")}
          </Button>
        </div>
      </div>

      {/* Rentals Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedRentals.map((rental) => (
          <Card
            key={rental._id}
            className="cursor-pointer transition-shadow hover:shadow-lg"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  {rental.contractNumber}
                </CardTitle>
                <Badge className={getStatusColor(rental.status)}>
                  {t(`status.${rental.status}`)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {rental.moveType.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
                  <SaCurrency size={16} />
                  <span>{rental.currentPrice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {t("list.monthsLeft", { count: rental.restMonthsLeft })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {t("list.unitPrefix")} {rental.unitID.slice(-3)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {rental.roommates === 1
                      ? t("details.roommate", { count: rental.roommates })
                      : t("details.roommates", { count: rental.roommates })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                </p>
                <p className="text-sm">{rental.rentalSource.name}</p>
              </div>

              <LocalizedLink to={`/dash/rentals/${rental._id}`}>
                <Button className="w-full" variant="outline">
                  {t("list.viewDetails")}
                </Button>
              </LocalizedLink>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedRentals.length === 0 &&
        rentals &&
        rentals.length > 0 && (
          <Card className="p-8 text-center">
            <Home className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {t("list.noMatchingRentals")}
            </h3>
            <p className="mb-4 text-muted-foreground">
              {t("list.noMatchingMessage")}
            </p>
            <Button onClick={handleResetFilters} variant="outline">
              {t("filters.resetButton")}
            </Button>
          </Card>
        )}

      {rentals?.length === 0 && (
        <Card className="p-8 text-center">
          <Home className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {t("list.noRentalsFound")}
          </h3>
          <p className="text-muted-foreground">{t("list.noRentalsMessage")}</p>
        </Card>
      )}
    </div>
  );
}
