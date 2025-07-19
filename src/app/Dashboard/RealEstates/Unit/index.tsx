import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApiQuery } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  // DollarSign,
  Edit,
  Users,
  Wrench,
  TrendingUp,
  Heart,
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { LocalizedLink } from "@/i18n/components/LocalizedLink";

// Import calendar components
import MonthView from "./Calendar/MonthView";
import WeekView from "./Calendar/WeekView";
import YearView from "./Calendar/YearView";

// Import tab components
import OverviewTab from "./Tabs/OverviewTab";
import RentalsTab from "./Tabs/RentalsTab";
import FinancialsTab from "./Tabs/FinancialsTab";
import MaintenanceTab from "./Tabs/MaintenanceTab";
// import DocumentsTab from "./Tabs/DocumentsTab";
import SaCurrency from "@/common/sa-currency";

// Enhanced Types with all schema fields
interface UnitLocation {
  address: string;
  city: string;
  country: string;
  geo: {
    latitude: number;
    longitude: number;
  };
}

interface UnitType {
  _id: string;
  type: string[];
  createdAt: string;
  updatedAt: string;
}

interface UnitGroup {
  _id: string;
  userID: string;
  name: string;
  description: string;
  unitGroupStatus: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface HistoryFixed {
  date: string;
  description: string;
  cost: number;
  contact?: string;
}

interface Unit {
  _id: string;
  uniteGroupID: string;
  userID: string;
  unitTypeID: string;
  number: string;
  description: string;
  notes: string;
  processingCost: number;
  location: UnitLocation;
  baseUnit: string;
  unitMedia: string[];
  favorite: boolean;
  unitStatus: "available" | "reserved" | "under_maintenance";
  historyFixed?: HistoryFixed;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  unitType?: UnitType;
  unitGroup?: UnitGroup;
}

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
  status: "active" | "completed" | "cancelled";
  securityDeposit: number;
  rentalAmount: number;
  isMonthly: boolean;
  monthsCount: number;
  roommates: number;
  notes?: string;
  periodicIncrease?: {
    increaseValue: number;
    periodicDuration: number;
    isPercentage: boolean;
  };
  participats: {
    owner: {
      userID: string;
      role: "owner";
    };
    tentant: {
      userID: string;
      role: "tentant";
    };
  };
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  restMonthsLeft?: number;
  // Populated fields
  rentalSource?: { name: string; description: string };
  moveType?: { name: string; description: string };
}

interface UnitMove {
  _id: string;
  unitID: string;
  moveTypeID: string;
  maintenanceID?: string;
  rentalID?: string;
  userID: string;
  moveDate: string;
  writeDate: string;
  debit: number;
  credit: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  moveType?: { name: string; description: string };
  rental?: Rental;
  maintenance?: MaintenanceRequest;
}

interface MaintenanceRequest {
  _id: string;
  unitID: string;
  reportedBy: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "closed";
  priority: "low" | "medium" | "high";
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  reportedByUser?: { name: string; email: string };
}

// Helper function to safely extract array from API response
function safeExtractArray<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
}

// Enhanced Image Gallery Component
const ImageGallery = ({
  images,
  unitNumber,
}: {
  images: string[];
  unitNumber: string;
}) => {
  const { t } = useTranslation("real-estates");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getPropertyImages = (unitNumber: string) => {
    const seed = unitNumber.replace(/\D/g, "");
    return Array.from(
      { length: 6 },
      (_, i) => `https://picsum.photos/800/600?random=${seed}${i + 1}`,
    );
  };

  const propertyImages =
    images && images.length > 0 ? images : getPropertyImages(unitNumber);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + propertyImages.length) % propertyImages.length,
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Image */}
      <div className="group relative">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={propertyImages[currentIndex]}
            alt={t("imageCarousel.altText", {
              unitNumber,
              imageNumber: currentIndex + 1,
            })}
            className="h-64 w-full cursor-pointer object-cover sm:h-80 lg:h-96"
            onClick={() => setIsFullscreen(true)}
          />

          {/* Navigation buttons */}
          {propertyImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70 sm:left-4 sm:p-2"
                aria-label={t("imageCarousel.previousImage")}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70 sm:right-4 sm:p-2"
                aria-label={t("imageCarousel.nextImage")}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute top-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white sm:top-4 sm:left-4 sm:px-3 sm:text-sm">
            {t("imageCarousel.counter", {
              current: currentIndex + 1,
              total: propertyImages.length,
            })}
          </div>

          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/70 sm:top-4 sm:right-4 sm:p-2"
            aria-label={t("unit.viewFullscreen")}
          >
            <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      {/* Thumbnail Grid */}
      {propertyImages.length > 1 && (
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 sm:gap-2">
          {propertyImages.slice(0, 6).map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square overflow-hidden rounded ${
                index === currentIndex ? "ring-1 ring-primary sm:ring-2" : ""
              }`}
            >
              <img
                src={image}
                alt={t("imageCarousel.thumbnailAlt", { number: index + 1 })}
                className="h-full w-full object-cover transition-opacity hover:opacity-80"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="relative max-h-full max-w-7xl p-4">
            <img
              src={propertyImages[currentIndex]}
              alt={`Unit ${unitNumber} - Full size`}
              className="max-h-full max-w-full object-contain"
            />

            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            >
              ✕
            </button>

            {propertyImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Add these interfaces near the top with your other interfaces
interface PriceOverride {
  id: string;
  date: Date;
  price: number;
  isWeekly: boolean;
  unitID: string;
  createdAt: string;
}

// Replace the RentalCalendar component completely
const RentalCalendar = ({
  rentals,
  unit,
  maintenance,
  unitMoves,
}: {
  rentals: Rental[];
  unit: Unit;
  maintenance: MaintenanceRequest[];
  unitMoves: UnitMove[];
}) => {
  const { t, i18n } = useTranslation("real-estates");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month" | "year">("week");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [isWeekly, setIsWeekly] = useState(false);
  const [priceOverrides, setPriceOverrides] = useState<PriceOverride[]>([]);
  const [editingPriceOverride, setEditingPriceOverride] =
    useState<PriceOverride | null>(null);

  // Transform rentals into calendar events
  const events = useMemo(() => {
    const calendarEvents: any[] = [];

    rentals.forEach((rental) => {
      calendarEvents.push({
        id: rental._id,
        title: `Contract ${rental.contractNumber}`,
        startDate: rental.startDate,
        endDate: rental.endDate,
        color:
          rental.status === "active"
            ? "#3b82f6"
            : rental.status === "completed"
              ? "#10b981"
              : "#6b7280",
        description: `Rental Amount: ${rental.rentalAmount.toLocaleString()}`,
        type: "rental",
        rentalData: rental,
      });
    });

    return calendarEvents;
  }, [rentals]);

  const tasks = useMemo(() => {
    const calendarTasks: any[] = [];

    // Add price overrides as tasks
    priceOverrides.forEach((override) => {
      calendarTasks.push({
        id: override.id,
        title: `Price Override: ${override.price}`,
        date: override.date.toISOString().split("T")[0],
        time: "12:00",
        category: "pricing",
        priority: "medium" as const,
        completed: false,
        type: "price-override",
        overrideData: override,
      });
    });

    return calendarTasks;
  }, [priceOverrides]);

  // Handle price setting
  const handleSetPrice = () => {
    if (!selectedDate || !newPrice) return;

    const price = parseFloat(newPrice);
    if (isNaN(price)) return;

    if (editingPriceOverride) {
      // Edit existing price override
      setPriceOverrides((prev) =>
        prev.map((override) =>
          override.id === editingPriceOverride.id
            ? { ...override, price, isWeekly }
            : override,
        ),
      );
    } else {
      // Create new price override
      if (isWeekly) {
        // Apply to the same weekday for the next 4 weeks
        const weeklyOverrides: PriceOverride[] = [];

        for (let week = 0; week < 4; week++) {
          const targetDate = new Date(selectedDate);
          targetDate.setDate(selectedDate.getDate() + week * 7); // Add weeks

          weeklyOverrides.push({
            id: `price-${Date.now()}-week-${week}`,
            date: new Date(targetDate),
            price,
            isWeekly: true,
            unitID: unit._id,
            createdAt: new Date().toISOString(),
          });
        }
        setPriceOverrides((prev) => [...prev, ...weeklyOverrides]);
      } else {
        // Single day override
        const newOverride: PriceOverride = {
          id: `price-${Date.now()}`,
          date: new Date(selectedDate),
          price,
          isWeekly: false,
          unitID: unit._id,
          createdAt: new Date().toISOString(),
        };
        setPriceOverrides((prev) => [...prev, newOverride]);
      }
    }

    setNewPrice("");
    setEditingPriceOverride(null);
    setShowPriceModal(false);
  };

  const handleDeletePrice = () => {
    if (editingPriceOverride) {
      setPriceOverrides((prev) =>
        prev.filter((override) => override.id !== editingPriceOverride.id),
      );
      setEditingPriceOverride(null);
      setShowPriceModal(false);
    }
  };

  // Navigation functions
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    switch (view) {
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "year":
        newDate.setFullYear(
          newDate.getFullYear() + (direction === "next" ? 1 : -1),
        );
        break;
    }

    setCurrentDate(newDate);
  };

  const onDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingPriceOverride(null);
    setNewPrice("");
    setIsWeekly(false);
    setShowPriceModal(true);
  };

  const onPriceClick = (priceOverride: PriceOverride) => {
    setSelectedDate(priceOverride.date);
    setEditingPriceOverride(priceOverride);
    setNewPrice(priceOverride.price.toString());
    setIsWeekly(priceOverride.isWeekly);
    setShowPriceModal(true);
  };

  const onMonthClick = (date: Date) => {
    setCurrentDate(date);
    setView("month");
  };

  const renderCalendarView = () => {
    switch (view) {
      case "week":
        return (
          <WeekView
            currentDate={currentDate}
            events={events}
            tasks={tasks}
            onDayClick={onDayClick}
            onPriceClick={onPriceClick}
            maintenance={maintenance}
            unitMoves={unitMoves}
          />
        );
      case "month":
        return (
          <MonthView
            currentDate={currentDate}
            events={events}
            tasks={tasks}
            onDayClick={onDayClick}
            onPriceClick={onPriceClick}
            selectedDate={selectedDate}
            maintenance={maintenance}
            unitMoves={unitMoves}
          />
        );
      case "year":
        return (
          <YearView
            currentDate={currentDate}
            events={events}
            tasks={tasks}
            onDayClick={onDayClick}
            onMonthClick={onMonthClick}
            onPriceClick={onPriceClick}
            maintenance={maintenance}
            unitMoves={unitMoves}
          />
        );
      default:
        return (
          <WeekView
            currentDate={currentDate}
            events={events}
            tasks={tasks}
            onDayClick={onDayClick}
            onPriceClick={onPriceClick}
            maintenance={maintenance}
            unitMoves={unitMoves}
          />
        );
    }
  };

  const getDateRangeText = () => {
    switch (view) {
      case "week":
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      case "month":
        return currentDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });
      case "year":
        return currentDate.getFullYear().toString();
      default:
        return "";
    }
  };

  // Check if selected date has existing rental
  const selectedDateHasRental = selectedDate
    ? events.some((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return selectedDate >= eventStart && selectedDate <= eventEnd;
      })
    : false;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div
        className={`flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center ${i18n.language === "ar-SA" ? "sm:flex-row-reverse" : ""}`}
      >
        <div
          className={`flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 ${i18n.language === "ar-SA" ? "sm:flex-row-reverse" : ""}`}
        >
          <h3 className="text-base font-medium sm:text-lg">
            {t("calendar.title")}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              {t("calendar.today")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div
            className={`flex w-full gap-1 rounded-md border border-border p-1 sm:w-auto ${i18n.language === "ar-SA" ? "flex-row-reverse" : ""}`}
          >
            {(["week", "month", "year"] as const).map((viewType) => (
              <Button
                key={viewType}
                variant={view === viewType ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(viewType)}
                className="flex-1 text-xs capitalize sm:flex-none sm:text-sm"
              >
                {t(`calendar.views.${viewType}`)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className={`grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-xs sm:flex sm:items-center sm:gap-6 sm:p-4 sm:text-sm ${i18n.language === "ar-SA" ? "flex-row-reverse" : ""}`}
      >
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500 sm:h-4 sm:w-4"></div>
          <span>{t("calendar.legend.reserved")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-yellow-500 sm:h-4 sm:w-4"></div>
          <span>{t("calendar.legend.customPrice")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-orange-500 sm:h-4 sm:w-4"></div>
          <span>{t("calendar.legend.maintenance")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500 sm:h-4 sm:w-4"></div>
          <span>{t("calendar.legend.financial")}</span>
        </div>
        <div className="col-span-2 text-xs text-muted-foreground sm:col-span-1">
          {t("calendar.instructions")}
        </div>
      </div>

      {/* Date Range */}
      <div
        className={`flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center ${i18n.language === "ar-SA" ? "sm:flex-row-reverse" : ""}`}
      >
        <h2 className="text-lg font-semibold sm:text-xl">
          {getDateRangeText()}
        </h2>
        <div className="text-xs text-muted-foreground sm:text-sm">
          {t("calendar.stats", {
            activeRentals: rentals.filter((r) => r.status === "active").length,
            customPrices: priceOverrides.length,
          })}
        </div>
      </div>

      {/* Calendar Content */}
      <Card className="py-0!">
        <CardContent className="p-0">
          <div className="h-fit">{renderCalendarView()}</div>
        </CardContent>
      </Card>

      {/* Enhanced Price Setting Modal */}
      <Dialog open={showPriceModal} onOpenChange={setShowPriceModal}>
        <DialogContent
          className={`max-w-md ${i18n.language === "ar-SA" ? "text-end" : ""}`}
        >
          <DialogHeader>
            <DialogTitle>
              {editingPriceOverride
                ? t("unit.editCustomPrice")
                : selectedDateHasRental
                  ? t("unit.setCustomPriceForReservedDate")
                  : t("unit.setCustomPrice")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDateHasRental && !editingPriceOverride && (
              <div className={`rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30`}>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t("unit.customPriceInfo")}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("unit.date")}
              </label>
              <Input
                value={selectedDate?.toLocaleDateString() || ""}
                disabled
              />
            </div>

            <div>
              <label className="text-end text-sm font-medium text-muted-foreground">
                {t("unit.pricePerNight")} (<SaCurrency size={16} />)
              </label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder={t("unit.enterPricePerNight")}
                min="0"
                step="0.01"
                autoFocus
              />
            </div>

            <div
              className={`flex items-center space-x-2 ${i18n.language === "ar-SA" ? "flex-row-reverse gap-2" : ""}`}
            >
              <input
                type="checkbox"
                id="weekly"
                checked={isWeekly}
                onChange={(e) => setIsWeekly(e.target.checked)}
                className="rounded border-input"
                disabled={!!editingPriceOverride} // Disable for editing existing prices
              />
              <label htmlFor="weekly" className="text-sm">
                {t("unit.applyToSameWeekday", { count: 4 })}
                {editingPriceOverride &&
                  ` (${t("unit.cannotChangeForExistingPrices")})`}
              </label>
            </div>

            {isWeekly && selectedDate && !editingPriceOverride && (
              <div className="rounded bg-muted p-2 text-sm text-muted-foreground">
                {t("unit.weeklyPriceInfo", {
                  date: selectedDate.toLocaleDateString(i18n.language, {
                    weekday: "long",
                  }),
                })}
              </div>
            )}

            {editingPriceOverride && (
              <div className="rounded bg-yellow-50 p-2 text-sm text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200">
                {t("unit.editingExistingPriceOverride", {
                  price: editingPriceOverride.price,
                })}
              </div>
            )}

            <div className="flex justify-between gap-2">
              <div>
                {editingPriceOverride && (
                  <Button
                    variant="destructive"
                    onClick={handleDeletePrice}
                    size="sm"
                  >
                    {t("unit.deletePrice")}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowPriceModal(false);
                    setEditingPriceOverride(null);
                    setNewPrice("");
                  }}
                >
                  {t("unit.cancel")}
                </Button>
                <Button onClick={handleSetPrice} disabled={!newPrice}>
                  {editingPriceOverride
                    ? t("unit.updatePrice")
                    : t("unit.setPrice")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add these helper functions after the interfaces
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

export default function Unit() {
  const { t, i18n } = useTranslation("real-estates");
  const { unitID } = useParams<{ unitID: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [unit, setUnit] = useState<Unit | null>(null);

  // Fetch all units from JSON file and find the specific unit
  const {
    data: allUnits,
    isLoading: unitLoading,
    error: unitError,
  } = useApiQuery<Unit[]>({
    queryKey: ["units"],
    endpoint: "/data/units.json",
    useLocalJson: true,
  });

  // Fetch rentals from JSON file and filter by unitID
  const { data: allRentals, isLoading: rentalsLoading } = useApiQuery<Rental[]>(
    {
      queryKey: ["rentals"],
      endpoint: "/data/rentals.json",
      useLocalJson: true,
    },
  );

  // Fetch unit moves from separate JSON file
  const { data: allUnitMoves, isLoading: movesLoading } = useApiQuery<
    UnitMove[]
  >({
    queryKey: ["unit-moves"],
    endpoint: "/data/unit-moves.json",
    useLocalJson: true,
  });

  // Fetch maintenance requests from separate JSON file
  const { data: allMaintenanceRequests, isLoading: maintenanceLoading } =
    useApiQuery<MaintenanceRequest[]>({
      queryKey: ["maintenance-requests"],
      endpoint: "/data/maintenance-requests.json",
      useLocalJson: true,
    });

  // Find the specific unit from all units
  const unitData = useMemo(() => {
    if (!allUnits || !unitID) return null;
    return allUnits.find((u) => u._id === unitID) || null;
  }, [allUnits, unitID]);

  // Filter data by unitID
  const rentals = useMemo(() => {
    if (!allRentals || !unitID) return [];
    return safeExtractArray<Rental>(allRentals).filter(
      (r) => r.unitID === unitID,
    );
  }, [allRentals, unitID]);

  const unitMoves = useMemo(() => {
    if (!allUnitMoves || !unitID) return [];
    return safeExtractArray<UnitMove>(allUnitMoves).filter(
      (m) => m.unitID === unitID,
    );
  }, [allUnitMoves, unitID]);

  const maintenanceRequests = useMemo(() => {
    if (!allMaintenanceRequests || !unitID) return [];
    return safeExtractArray<MaintenanceRequest>(allMaintenanceRequests).filter(
      (m) => m.unitID === unitID,
    );
  }, [allMaintenanceRequests, unitID]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRentals = rentals.length;
    const activeRentals = rentals.filter((r) => r.status === "active").length;
    const totalRevenue = unitMoves
      .filter((m) => m.credit > 0)
      .reduce((sum, m) => sum + m.credit, 0);
    const averageRent =
      rentals.length > 0
        ? rentals.reduce((sum, r) => sum + r.rentalAmount, 0) / rentals.length
        : 0;

    // Calculate occupancy rate (simplified)
    const occupancyRate =
      rentals.length > 0 ? (activeRentals / totalRentals) * 100 : 0;

    const openMaintenance = maintenanceRequests.filter(
      (m) => m.status === "open" || m.status === "in-progress",
    ).length;

    return {
      totalRentals,
      activeRentals,
      totalRevenue,
      averageRent,
      occupancyRate,
      openMaintenance,
    };
  }, [rentals, unitMoves, maintenanceRequests]);

  // Update unit state when data changes
  useEffect(() => {
    if (unitData) {
      setUnit(unitData);
    }
  }, [unitData]);

  const handleUpdateUnit = () => {
    if (!unit) return;
    console.log("Unit updated:", unit);
    setIsEditing(false);
    // Here you would typically make an API call to save the changes
  };

  // Loading state
  if (unitLoading || rentalsLoading || movesLoading || maintenanceLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Error or not found state
  if (unitError || !unit) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-2 text-lg font-medium text-destructive">
                {t("unit.errorLoadingUnitData")}
              </div>
              <p className="text-muted-foreground">
                {unitError
                  ? t("unit.failedToLoadUnitData")
                  : t("unit.unitNotFound")}
              </p>
              <Button
                onClick={() => navigate("/dash/real-estates")}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("unit.backToUnits")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 lg:w-auto">
          <LocalizedLink to="/dash/real-estates" className="hidden sm:block">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("unit.back")}
            </Button>
          </LocalizedLink>
          <div className="w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h1 className="text-2xl font-bold sm:text-3xl">
                {t("unit.title", { number: unit.number || t("unit.unknown") })}
              </h1>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getStatusColor(unit.unitStatus)}`}>
                  {t(`filters.statuses.${unit.unitStatus}`) ||
                    formatStatusText(unit.unitStatus)}
                </Badge>
                {unit.favorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-amber-500"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {unit.description || t("unit.noDescription")}
            </p>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <LocalizedLink to="/dash/real-estates" className="flex-1 sm:hidden">
            <Button variant="outline" size="sm" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("unit.back")}
            </Button>
          </LocalizedLink>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            {t("unit.export")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="mr-2 h-4 w-4" />
            {t("unit.edit")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:gap-6 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card py-0!">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("unit.stats.totalRentals")}
                </p>
                <p className="text-lg font-bold sm:text-2xl">
                  {stats.totalRentals}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t("unit.stats.activeCount", { count: stats.activeRentals })}
                </p>
              </div>
              <Users className="h-6 w-6 self-end text-blue-600 sm:h-8 sm:w-8 lg:self-auto dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card py-0!">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("unit.stats.totalRevenue")}
                </p>
                <p className="flex items-center gap-2 text-lg font-bold sm:text-2xl">
                  <SaCurrency size={16} />
                  {stats.totalRevenue.toLocaleString()}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                  {t("unit.stats.avgRent", {
                    amount: Math.round(stats.averageRent).toLocaleString(),
                  })}{" "}
                  <SaCurrency color="var(--muted-foreground)" size={12} />
                </p>
              </div>
              {/* <DollarSign className="h-6 w-6 self-end text-green-600 sm:h-8 sm:w-8 lg:self-auto dark:text-green-400" /> */}
              <SaCurrency color="var(--color-green-600)" size={28} />
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card py-0!">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("unit.stats.occupancyRate")}
                </p>
                <p className="text-lg font-bold sm:text-2xl">
                  {stats.occupancyRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t("unit.stats.currentPeriod")}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 self-end text-purple-600 sm:h-8 sm:w-8 lg:self-auto dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="@container/card py-0!">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {t("unit.stats.maintenance")}
                </p>
                <p className="text-lg font-bold sm:text-2xl">
                  {stats.openMaintenance}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t("unit.stats.openRequests")}
                </p>
              </div>
              <Wrench className="h-6 w-6 self-end text-orange-600 sm:h-8 sm:w-8 lg:self-auto dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4 sm:space-y-6 "
      >
        <TabsList
          className={`scrollbar-hide flex w-full justify-start overflow-x-auto! ${i18n.language === "ar-SA" ? "flex-row-reverse" : ""}`}
        >
          <TabsTrigger
            value="overview"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            {t("unit.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger
            value="rentals"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            {t("unit.tabs.rentals")}
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            {t("unit.tabs.calendar")}
          </TabsTrigger>
          <TabsTrigger
            value="financials"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            {t("unit.tabs.financials")}
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            {t("unit.tabs.maintenance")}
          </TabsTrigger>
          {/* <TabsTrigger
            value="documents"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            {t("unit.tabs.documents")}
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab
            unit={unit}
            unitMoves={unitMoves}
            rentals={rentals}
            stats={stats}
            ImageGallery={ImageGallery}
          />
        </TabsContent>

        <TabsContent value="rentals" className="space-y-6">
          <RentalsTab unitId={unitID} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <RentalCalendar
            rentals={rentals}
            unit={unit}
            maintenance={maintenanceRequests}
            unitMoves={unitMoves.map((move) => ({ ...move, id: move._id }))}
          />
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <FinancialsTab
            unitMoves={unitMoves.map((move, index) => ({
              ...move,
              id: index + 1,
            }))}
            movesLoading={movesLoading}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <MaintenanceTab
            maintenanceRequests={maintenanceRequests.map((req, index) => ({
              ...req,
              id: index + 1,
            }))}
            maintenanceLoading={maintenanceLoading}
          />
        </TabsContent>

        {/* <TabsContent value="documents" className="space-y-6">
          <DocumentsTab />
        </TabsContent> */}
      </Tabs>

      {/* Edit Unit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("unit.editDialog.title")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("unit.editDialog.unitNumber")}
              </label>
              <Input
                value={unit.number || ""}
                onChange={(e) =>
                  setUnit((prev) =>
                    prev ? { ...prev, number: e.target.value } : null,
                  )
                }
                placeholder={t("unit.editDialog.unitNumberPlaceholder")}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("unit.editDialog.description")}
              </label>
              <Textarea
                value={unit.description || ""}
                onChange={(e) =>
                  setUnit((prev) =>
                    prev ? { ...prev, description: e.target.value } : null,
                  )
                }
                placeholder={t("unit.editDialog.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("unit.editDialog.processingCost")}
              </label>
              <Input
                type="number"
                value={unit.processingCost || 0}
                onChange={(e) =>
                  setUnit((prev) =>
                    prev
                      ? {
                          ...prev,
                          processingCost: parseFloat(e.target.value) || 0,
                        }
                      : null,
                  )
                }
                placeholder={t("unit.editDialog.processingCostPlaceholder")}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("unit.editDialog.baseUnit")}
              </label>
              <Input
                value={unit.baseUnit || ""}
                onChange={(e) =>
                  setUnit((prev) =>
                    prev ? { ...prev, baseUnit: e.target.value } : null,
                  )
                }
                placeholder={t("unit.editDialog.baseUnitPlaceholder")}
              />
            </div>

            {/* Location Fields */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("unit.editDialog.address")}
              </label>
              <Input
                value={unit.location?.address || ""}
                onChange={(e) =>
                  setUnit((prev) =>
                    prev
                      ? {
                          ...prev,
                          location: {
                            ...prev.location,
                            address: e.target.value,
                            city: prev.location?.city || "",
                            country: prev.location?.country || "",
                            geo: prev.location?.geo || {
                              latitude: 0,
                              longitude: 0,
                            },
                          },
                        }
                      : null,
                  )
                }
                placeholder={t("unit.editDialog.addressPlaceholder")}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("unit.editDialog.city")}
              </label>
              <Input
                value={unit.location?.city || ""}
                onChange={(e) =>
                  setUnit((prev) =>
                    prev
                      ? {
                          ...prev,
                          location: {
                            ...prev.location,
                            city: e.target.value,
                            address: prev.location?.address || "",
                            country: prev.location?.country || "",
                            geo: prev.location?.geo || {
                              latitude: 0,
                              longitude: 0,
                            },
                          },
                        }
                      : null,
                  )
                }
                placeholder={t("unit.editDialog.cityPlaceholder")}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("unit.editDialog.country")}
              </label>
              <Input
                value={unit.location?.country || ""}
                onChange={(e) =>
                  setUnit((prev) =>
                    prev
                      ? {
                          ...prev,
                          location: {
                            ...prev.location,
                            country: e.target.value,
                            address: prev.location?.address || "",
                            city: prev.location?.city || "",
                            geo: prev.location?.geo || {
                              latitude: 0,
                              longitude: 0,
                            },
                          },
                        }
                      : null,
                  )
                }
                placeholder={t("unit.editDialog.countryPlaceholder")}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-end gap-2 sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="w-full sm:w-auto"
            >
              {t("unit.editDialog.cancel")}
            </Button>
            <Button
              onClick={handleUpdateUnit}
              disabled={
                !unit?.number ||
                !unit?.processingCost ||
                !unit?.baseUnit ||
                !unit?.location?.address ||
                !unit?.location?.city ||
                !unit?.location?.country
              }
              className="w-full sm:w-auto"
            >
              {t("unit.editDialog.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
