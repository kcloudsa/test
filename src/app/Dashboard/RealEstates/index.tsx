import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";
import { useApiQuery } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  // DollarSign,
  Eye,
  Filter,
  Search,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Unit, Rental } from "@/types/schema/Unit";
import SaCurrency from "@/common/sa-currency";

const UNIT_TAGS = ["Apartment", "Villa", "Studio", "Office", "Commercial"];
const UNITS_PER_PAGE = 8;

// Enhanced image carousel component
const ImageCarousel = ({
  images,
  unitNumber,
}: {
  images: string[];
  unitNumber: string;
}) => {
  const { t } = useTranslation("real-estates");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate realistic property images based on unit type
  const getPropertyImages = (unitNumber: string) => {
    const seed = unitNumber.replace(/\D/g, ""); // Extract numbers for consistency
    return [
      `https://picsum.photos/400/300?random=${seed}1`,
      `https://picsum.photos/400/300?random=${seed}2`,
      `https://picsum.photos/400/300?random=${seed}3`,
      `https://picsum.photos/400/300?random=${seed}4`,
    ];
  };

  const propertyImages =
    images.length > 0 ? images : getPropertyImages(unitNumber);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + propertyImages.length) % propertyImages.length,
    );
  };

  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={propertyImages[currentIndex]}
          alt={t("imageCarousel.altText", {
            unitNumber,
            imageNumber: currentIndex + 1,
          })}
          className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />

        {/* Navigation buttons - visible on hover for desktop */}
        {propertyImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-2 hidden -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70 md:block"
              aria-label={t("imageCarousel.previousImage")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70 md:block"
              aria-label={t("imageCarousel.nextImage")}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Mobile swipe indicators */}
        {propertyImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {propertyImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={t("imageCarousel.goToImage", {
                  imageNumber: index + 1,
                })}
              />
            ))}
          </div>
        )}

        {/* Touch/swipe area for mobile */}
        <div
          className="absolute inset-0 md:hidden"
          onTouchStart={(e) => {
            const touch = e.touches[0];
            e.currentTarget.setAttribute(
              "data-start-x",
              touch.clientX.toString(),
            );
          }}
          onTouchEnd={(e) => {
            const startX = parseFloat(
              e.currentTarget.getAttribute("data-start-x") || "0",
            );
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
              // Minimum swipe distance
              if (diff > 0) {
                nextImage();
              } else {
                prevImage();
              }
            }
          }}
        />
      </div>

      {/* Image counter */}
      {propertyImages.length > 1 && (
        <div className="absolute top-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {t("imageCarousel.counter", {
            current: currentIndex + 1,
            total: propertyImages.length,
          })}
        </div>
      )}
    </div>
  );
};

// Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const { t } = useTranslation("real-estates");
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Number of page buttons to show

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-full sm:w-auto"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("pagination.previous")}
      </Button>

      <div className="flex items-center gap-1 overflow-x-auto">
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="min-w-[2.5rem]"
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-full sm:w-auto"
      >
        {t("pagination.next")}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function RealStates() {
  const { t, i18n } = useTranslation("real-estates");
  const isRTL = i18n.language === "ar-SA" || i18n.dir() === "rtl";

  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states - separate from applied filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tagFilters, setTagFilters] = useState<string[]>([]);

  // Applied filter states (used for actual filtering)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>("all");
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");
  const [appliedTagFilters, setAppliedTagFilters] = useState<string[]>([]);

  // Get current page from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Fetch units data
  const {
    data: units = [],
    isLoading: unitsLoading,
    error: unitsError,
  } = useApiQuery<Unit[]>({
    queryKey: ["units"],
    endpoint: "/data/units.json",
    useLocalJson: true,
  });

  // Fetch rentals data
  const { data: rentals = [] } = useApiQuery<Rental[]>({
    queryKey: ["rentals"],
    endpoint: "/data/rentals.json",
    useLocalJson: true,
  });

  // Filtering logic - Fixed to work with actual data structure
  const filteredUnits = useMemo(() => {
    const filtered = units.filter((unit) => {
      // Search filter - check unit number and description
      const unitNumber = unit?.number?.toLowerCase() || "";
      const unitDescription = unit?.description?.toLowerCase() || "";
      const searchTerm = appliedSearch.toLowerCase();

      const matchesSearch =
        !appliedSearch ||
        unitNumber.includes(searchTerm) ||
        unitDescription.includes(searchTerm) ||
        unit?.location?.city?.toLowerCase().includes(searchTerm) ||
        unit?.location?.address?.toLowerCase().includes(searchTerm);

      // Status filter
      const matchesStatus =
        appliedStatusFilter === "all" ||
        unit?.unitStatus === appliedStatusFilter;

      // Price filters - Fixed: ensure proper number comparison
      const unitPrice = Number(unit?.processingCost) || 0;
      const minPriceNum = appliedMinPrice ? Number(appliedMinPrice) : 0;
      const maxPriceNum = appliedMaxPrice ? Number(appliedMaxPrice) : Infinity;

      const matchesMinPrice = !appliedMinPrice || unitPrice >= minPriceNum;
      const matchesMaxPrice = !appliedMaxPrice || unitPrice <= maxPriceNum;

      // Tag filters - Fixed: check unit type name AND tags array
      const matchesTags =
        appliedTagFilters.length === 0 ||
        appliedTagFilters.some((tag) => {
          const unitTypeName = unit?.unitType?.name || "";
          const unitTags = unit?.unitType?.tags || [];

          // Check if the tag matches the unit type name or any of the unit tags
          return unitTypeName === tag || unitTags.includes(tag);
        });

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesTags
      );
    });

    return filtered;
  }, [
    units,
    appliedSearch,
    appliedStatusFilter,
    appliedMinPrice,
    appliedMaxPrice,
    appliedTagFilters,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUnits.length / UNITS_PER_PAGE);
  const startIndex = (currentPage - 1) * UNITS_PER_PAGE;
  const endIndex = startIndex + UNITS_PER_PAGE;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

  // Auto-redirect to page 1 if current page exceeds available pages
  // This fixes the bug where you're on page 2 but filters only show 1 page of results
  useEffect(() => {
    if (
      filteredUnits.length > 0 &&
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setSearchParams({ page: "1" });
    }
  }, [filteredUnits.length, totalPages, currentPage, setSearchParams]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalUnits = units.length;
    const availableUnits = units.filter(
      (unit) => unit.unitStatus === "available",
    ).length;
    const activeRentals = rentals.filter(
      (rental) => rental.status === "active",
    ).length;
    const totalRevenue = rentals
      .filter((rental) => rental.status === "active")
      .reduce((sum, rental) => {
        const unit = units.find((u) => u._id === rental.unitId);
        return sum + (unit?.processingCost || 0);
      }, 0);

    return { totalUnits, availableUnits, activeRentals, totalRevenue };
  }, [units, rentals]);

  // Handlers
  const handleTagChange = (tag: string, checked: boolean) => {
    setTagFilters((prev) =>
      checked ? [...prev, tag] : prev.filter((t) => t !== tag),
    );
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  // Apply filters handler
  const handleApplyFilters = () => {
    setAppliedSearch(search);
    setAppliedStatusFilter(statusFilter);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setAppliedTagFilters([...tagFilters]);

    // Reset to first page when applying new filters
    setSearchParams({ page: "1" });
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setTagFilters([]);

    setAppliedSearch("");
    setAppliedStatusFilter("all");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setAppliedTagFilters([]);

    setSearchParams({ page: "1" });
  };

  // Check if filters have been modified
  const hasUnappliedChanges =
    search !== appliedSearch ||
    statusFilter !== appliedStatusFilter ||
    minPrice !== appliedMinPrice ||
    maxPrice !== appliedMaxPrice ||
    JSON.stringify(tagFilters.sort()) !==
      JSON.stringify(appliedTagFilters.sort());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "reserved":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "under_maintenance":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (unitsError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-2 text-lg font-medium text-destructive">
                Error loading units data
              </div>
              <p className="text-muted-foreground">Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-4 p-3 sm:space-y-6 sm:p-4 lg:p-6", isRTL && "rtl")}
    >
      {/* Stats Cards */}
      <div className="grid gap-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card py-0!">
          <CardContent className="flex items-center p-4 sm:p-6">
            <Building2 className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
            <div className={cn("ml-3 sm:ml-4", isRTL && "mr-3 ml-0 sm:mr-4")}>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("stats.totalUnits")}
              </p>
              <p className="text-xl font-bold sm:text-2xl">
                {stats.totalUnits}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="@container/card py-0!">
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 sm:h-8 sm:w-8">
              <div className="h-3 w-3 rounded bg-emerald-600 sm:h-4 sm:w-4"></div>
            </div>
            <div className={cn("ml-3 sm:ml-4", isRTL && "mr-3 ml-0 sm:mr-4")}>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("stats.available")}
              </p>
              <p className="text-xl font-bold sm:text-2xl">
                {stats.availableUnits}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="@container/card py-0!">
          <CardContent className="flex items-center p-4 sm:p-6">
            <Users className="h-6 w-6 text-violet-600 sm:h-8 sm:w-8" />
            <div className={cn("ml-3 sm:ml-4", isRTL && "mr-3 ml-0 sm:mr-4")}>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("stats.activeRentals")}
              </p>
              <p className="text-xl font-bold sm:text-2xl">
                {stats.activeRentals}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="@container/card py-0!">
          <CardContent className="flex items-center p-4 sm:p-6">
            {/* <DollarSign className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" /> */}
            <SaCurrency color="oklch(62.7% 0.194 149.214)" size={30} />
            <div className={cn("ml-3 sm:ml-4", isRTL && "mr-3 ml-0 sm:mr-4")}>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t("stats.monthlyRevenue")}
              </p>
              <p className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
                <SaCurrency /> {stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Search */}
          <div className="relative">
            <Search
              className={cn(
                "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                isRTL ? "right-3" : "left-3",
              )}
            />
            <Input
              placeholder={t("filters.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(isRTL ? "pr-10" : "pl-10")}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          {/* Filters */}
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("filters.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
                <SelectItem value="available">
                  {t("filters.statuses.available")}
                </SelectItem>
                <SelectItem value="reserved">
                  {t("filters.statuses.reserved")}
                </SelectItem>
                <SelectItem value="under_maintenance">
                  {t("filters.statuses.underMaintenance")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder={t("filters.minPrice")}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min={0}
              step="100"
            />

            <Input
              type="number"
              placeholder={t("filters.maxPrice")}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min={0}
              step="100"
            />
          </div>

          {/* Tags */}
          <div>
            <p className="mb-3 text-sm font-medium">
              {t("filters.propertyTypes")}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              {UNIT_TAGS.map((tag) => (
                <label
                  key={tag}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <Checkbox
                    checked={tagFilters.includes(tag)}
                    onCheckedChange={(checked) =>
                      handleTagChange(tag, Boolean(checked))
                    }
                    id={`tag-${tag}`}
                  />
                  <span className="text-sm font-medium">
                    {t(`filters.tags.${tag.toLowerCase()}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply/Clear Filters */}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
            <Button
              onClick={handleApplyFilters}
              className="flex-1"
              disabled={!hasUnappliedChanges}
            >
              <Filter className="mr-2 h-4 w-4" />
              {t("filters.applyFilters")}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("filters.clearAll")}
            </Button>
          </div>

          {/* Active Filters Display */}
          {(appliedSearch ||
            appliedStatusFilter !== "all" ||
            appliedMinPrice ||
            appliedMaxPrice ||
            appliedTagFilters.length > 0) && (
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <span className="text-sm font-medium text-muted-foreground">
                {t("filters.activeFilters")}:
              </span>
              {appliedSearch && (
                <Badge variant="secondary">
                  {t("filters.activeSearch", { search: appliedSearch })}
                </Badge>
              )}
              {appliedStatusFilter !== "all" && (
                <Badge variant="secondary">
                  {t("filters.activeStatus", {
                    status: t(`filters.statuses.${appliedStatusFilter}`),
                  })}
                </Badge>
              )}
              {appliedMinPrice && (
                <Badge variant="secondary">
                  {t("filters.activeMinPrice", {
                    price: Number(appliedMinPrice).toLocaleString(),
                  })}
                </Badge>
              )}
              {appliedMaxPrice && (
                <Badge variant="secondary">
                  {t("filters.activeMaxPrice", {
                    price: Number(appliedMaxPrice).toLocaleString(),
                  })}
                </Badge>
              )}
              {appliedTagFilters.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {t(`filters.tags.${tag.toLowerCase()}`)}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Units Grid */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              {t("units.title")}
            </h2>
            <span className="text-muted-foreground">{t("units.button")}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {t("units.count", {
                filtered: filteredUnits.length,
                total: units.length,
              })}
            </Badge>
            {totalPages > 0 && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                {t("units.pageInfo", {
                  current: Math.min(currentPage, totalPages),
                  total: totalPages,
                })}
              </Badge>
            )}
          </div>
        </div>

        {unitsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedUnits.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <Building2 className="mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
                    <h3 className="mb-2 text-base font-medium sm:text-lg">
                      {t("units.noUnitsFound")}
                    </h3>
                    <p className="text-center text-sm text-muted-foreground">
                      {t("units.adjustFilters")}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                paginatedUnits.map((unit) => (
                  <Card
                    key={unit._id}
                    className="group overflow-hidden py-0! transition-all duration-200 hover:shadow-lg"
                  >
                    <CardHeader className="p-0">
                      <div className="relative">
                        <ImageCarousel
                          images={unit.unitMedia || []}
                          unitNumber={unit.number || "N/A"}
                        />
                        <Badge
                          className={`absolute top-3 right-3 text-xs ${getStatusColor(unit.unitStatus)}`}
                        >
                          {t(`filters.statuses.${unit.unitStatus}`) ||
                            t("units.unknownStatus")}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex h-full flex-col p-3 sm:p-4">
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <div>
                          <h3 className="text-base font-bold sm:text-lg">
                            {t("units.unitNumber", {
                              number: unit.number || "N/A",
                            })}
                          </h3>
                          <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                            {unit.description || t("units.noDescription")}
                          </p>
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground sm:text-sm">
                          <MapPin className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                          <span>
                            {unit.location?.city || t("units.unknown")},{" "}
                            {unit.location?.country || t("units.unknown")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-base font-bold sm:text-lg">
                            {/* <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" /> */}
                            <SaCurrency size={16} />
                            {(unit.processingCost || 0).toLocaleString()}
                          </div>
                          {unit.unitType?.tags && (
                            <div className="flex gap-1">
                              {unit.unitType.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* This section will always be at the bottom */}
                      <div className="mt-auto pt-2 sm:pt-3">
                        <Separator />

                        <LocalizedLink
                          to={`/dash/real-estates/${unit._id}`}
                          className="mt-2 block sm:mt-3"
                        >
                          <Button className="w-full text-sm group-hover:bg-primary/90">
                            <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            {t("units.viewDetails")}
                          </Button>
                        </LocalizedLink>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center sm:mt-8">
                <Pagination
                  currentPage={Math.min(currentPage, totalPages)}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
