import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Filter,
  X,
  Search,
  DollarSign,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Building,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Rental, RentalFilters } from "@/types/rental";

interface RentalFiltersProps {
  rentals: Rental[];
  filters: RentalFilters;
  onFiltersChange: (filters: RentalFilters) => void;
  onReset: () => void;
}

export function RentalFiltersComponent({
  rentals,
  filters,
  onFiltersChange,
  onReset,
}: RentalFiltersProps) {
  const { t } = useTranslation("rentals");
  const [isOpen, setIsOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<RentalFilters>(filters);

  // Extract unique values from rentals data
  const uniqueStatuses = Array.from(new Set(rentals.map((r) => r.status)));
  const uniqueSources = Array.from(
    new Set(rentals.map((r) => r.rentalSource.name)),
  );

  const maxPrice = Math.max(...rentals.map((r) => r.currentPrice), 10000);
  const maxMonthsLeft = Math.max(...rentals.map((r) => r.restMonthsLeft), 24);
  const maxRoommates = Math.max(...rentals.map((r) => r.roommates), 10);

  const updateTempFilters = (newFilters: Partial<RentalFilters>) => {
    setTempFilters({ ...tempFilters, ...newFilters });
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const resetTempFilters = () => {
    setTempFilters(filters);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = tempFilters.status.includes(status)
      ? tempFilters.status.filter((s) => s !== status)
      : [...tempFilters.status, status];
    updateTempFilters({ status: newStatuses });
  };

  const toggleSource = (source: string) => {
    const newSources = tempFilters.rentalSource.includes(source)
      ? tempFilters.rentalSource.filter((s) => s !== source)
      : [...tempFilters.rentalSource, source];
    updateTempFilters({ rentalSource: newSources });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.rentalSource.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < maxPrice)
      count++;
    if (filters.monthsLeft.min > 0 || filters.monthsLeft.max < maxMonthsLeft)
      count++;
    if (filters.isMonthly !== null) count++;
    if (filters.roommates.min > 0 || filters.roommates.max < maxRoommates)
      count++;
    if (filters.startDateRange.from || filters.startDateRange.to) count++;
    if (filters.endDateRange.from || filters.endDateRange.to) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder={t("filters.searchPlaceholder")}
          value={filters.searchTerm}
          onChange={(e) =>
            onFiltersChange({ ...filters, searchTerm: e.target.value })
          }
          className="pl-10"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setTempFilters(filters);
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {t("filters.filtersButton")}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("filters.resetButton")}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {t("filters.activeFilters.status")}: {t(`status.${status}`)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newStatuses = filters.status.filter(
                    (s) => s !== status,
                  );
                  onFiltersChange({ ...filters, status: newStatuses });
                }}
              />
            </Badge>
          ))}
          {filters.rentalSource.map((source) => (
            <Badge
              key={source}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {t("filters.activeFilters.source")}: {source}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newSources = filters.rentalSource.filter(
                    (s) => s !== source,
                  );
                  onFiltersChange({ ...filters, rentalSource: newSources });
                }}
              />
            </Badge>
          ))}
          {filters.isMonthly !== null && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t("filters.activeFilters.type")}: {filters.isMonthly ? t("filters.monthly") : t("filters.fixedTerm")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, isMonthly: null })}
              />
            </Badge>
          )}
          {filters.searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t("filters.activeFilters.search")}: {filters.searchTerm}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, searchTerm: "" })}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t("filters.filterOptions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Status Filter */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {t("filters.status")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueStatuses.map((status) => (
                    <Button
                      key={status}
                      variant={
                        tempFilters.status.includes(status)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleStatus(status)}
                      className="capitalize"
                    >
                      {t(`status.${status}`)}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Rental Source Filter */}
              <div className="space-y-3">
                <Label>{t("filters.rentalSource")}</Label>
                <div className="space-y-2">
                  {uniqueSources.map((source) => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox
                        id={`source-${source}`}
                        checked={tempFilters.rentalSource.includes(source)}
                        onCheckedChange={() => toggleSource(source)}
                      />
                      <Label htmlFor={`source-${source}`} className="text-sm">
                        {source}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Range Filter */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t("filters.priceRange")}
                </Label>
                <div className="space-y-4 px-2">
                  <Slider
                    value={[
                      tempFilters.priceRange.min,
                      tempFilters.priceRange.max,
                    ]}
                    onValueChange={([min, max]) =>
                      updateTempFilters({ priceRange: { min, max } })
                    }
                    max={maxPrice}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(tempFilters.priceRange.min)}</span>
                    <span>{formatCurrency(tempFilters.priceRange.max)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-price" className="text-xs">
                        {t("filters.minPrice")}
                      </Label>
                      <Input
                        id="min-price"
                        type="number"
                        value={tempFilters.priceRange.min}
                        onChange={(e) =>
                          updateTempFilters({
                            priceRange: {
                              ...tempFilters.priceRange,
                              min: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-price" className="text-xs">
                        {t("filters.maxPrice")}
                      </Label>
                      <Input
                        id="max-price"
                        type="number"
                        value={tempFilters.priceRange.max}
                        onChange={(e) =>
                          updateTempFilters({
                            priceRange: {
                              ...tempFilters.priceRange,
                              max: Number(e.target.value) || maxPrice,
                            },
                          })
                        }
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Months Left Filter */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t("filters.monthsRemaining")}
                </Label>
                <div className="space-y-4 px-2">
                  <Slider
                    value={[
                      tempFilters.monthsLeft.min,
                      tempFilters.monthsLeft.max,
                    ]}
                    onValueChange={([min, max]) =>
                      updateTempFilters({ monthsLeft: { min, max } })
                    }
                    max={maxMonthsLeft}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{tempFilters.monthsLeft.min} {t("details.months")}</span>
                    <span>{tempFilters.monthsLeft.max} {t("details.months")}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Roommates Filter */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("filters.roommates")}
                </Label>
                <div className="space-y-4 px-2">
                  <Slider
                    value={[
                      tempFilters.roommates.min,
                      tempFilters.roommates.max,
                    ]}
                    onValueChange={([min, max]) =>
                      updateTempFilters({ roommates: { min, max } })
                    }
                    max={maxRoommates}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{tempFilters.roommates.min}</span>
                    <span>{tempFilters.roommates.max}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Rental Type Filter */}
              <div className="space-y-3">
                <Label>{t("filters.rentalType")}</Label>
                <Select
                  value={
                    tempFilters.isMonthly === null
                      ? "all"
                      : tempFilters.isMonthly.toString()
                  }
                  onValueChange={(value) =>
                    updateTempFilters({
                      isMonthly: value === "all" ? null : value === "true",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("filters.rentalType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                    <SelectItem value="true">{t("filters.monthly")}</SelectItem>
                    <SelectItem value="false">{t("filters.fixedTerm")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Date Range Filters */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Start Date Range */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {t("filters.startDateRange")}
                  </Label>
                  <div className="space-y-2">
                    <Popover
                      open={startDateOpen}
                      onOpenChange={setStartDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !tempFilters.startDateRange.from &&
                              "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilters.startDateRange.from
                            ? format(
                                new Date(tempFilters.startDateRange.from),
                                "PPP",
                              )
                            : t("filters.fromDate")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            tempFilters.startDateRange.from
                              ? new Date(tempFilters.startDateRange.from)
                              : undefined
                          }
                          onSelect={(date) => {
                            updateTempFilters({
                              startDateRange: {
                                ...tempFilters.startDateRange,
                                from: date ? date.toISOString() : "",
                              },
                            });
                            setStartDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !tempFilters.startDateRange.to &&
                              "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilters.startDateRange.to
                            ? format(
                                new Date(tempFilters.startDateRange.to),
                                "PPP",
                              )
                            : t("filters.toDate")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            tempFilters.startDateRange.to
                              ? new Date(tempFilters.startDateRange.to)
                              : undefined
                          }
                          onSelect={(date) => {
                            updateTempFilters({
                              startDateRange: {
                                ...tempFilters.startDateRange,
                                to: date ? date.toISOString() : "",
                              },
                            });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* End Date Range */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {t("filters.endDateRange")}
                  </Label>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !tempFilters.endDateRange.from &&
                              "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilters.endDateRange.from
                            ? format(
                                new Date(tempFilters.endDateRange.from),
                                "PPP",
                              )
                            : t("filters.fromDate")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            tempFilters.endDateRange.from
                              ? new Date(tempFilters.endDateRange.from)
                              : undefined
                          }
                          onSelect={(date) => {
                            updateTempFilters({
                              endDateRange: {
                                ...tempFilters.endDateRange,
                                from: date ? date.toISOString() : "",
                              },
                            });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !tempFilters.endDateRange.to &&
                              "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tempFilters.endDateRange.to
                            ? format(
                                new Date(tempFilters.endDateRange.to),
                                "PPP",
                              )
                            : t("filters.toDate")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            tempFilters.endDateRange.to
                              ? new Date(tempFilters.endDateRange.to)
                              : undefined
                          }
                          onSelect={(date) => {
                            updateTempFilters({
                              endDateRange: {
                                ...tempFilters.endDateRange,
                                to: date ? date.toISOString() : "",
                              },
                            });
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={resetTempFilters}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("filters.resetFilters")}
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsOpen(false)}>
                    {t("filters.cancel")}
                  </Button>
                  <Button
                    onClick={applyFilters}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {t("filters.applyFilters")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
