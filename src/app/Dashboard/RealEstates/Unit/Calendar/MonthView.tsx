import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import SaCurrency from "@/common/sa-currency";

interface MonthViewProps {
  currentDate: Date;
  events: any[];
  tasks: any[];
  onDayClick: (date: Date) => void;
  onPriceClick?: (priceOverride: any) => void;
  selectedDate?: Date;
  maintenance?: any[];
  unitMoves?: any[];
}

// Calendar utility functions
const getMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);

  // Adjust to start from Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());
  // Adjust to end on Saturday
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.toDateString() === new Date().toDateString(),
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
};

const filterEventsByDateRange = (events: any[], dateStr: string) => {
  return events.filter((event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const targetDate = new Date(dateStr);

    return targetDate >= eventStart && targetDate <= eventEnd;
  });
};

const filterTasksByDateRange = (tasks: any[], dateStr: string) => {
  return tasks.filter((task) => task.date === dateStr);
};

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export default function MonthView({
  currentDate,
  events,
  tasks,
  onDayClick,
  onPriceClick,
  selectedDate,
  maintenance = [],
  unitMoves = [],
}: MonthViewProps) {
  const { t, i18n } = useTranslation("real-estates");
  const isRTL = i18n.language === "ar-SA" || i18n.dir() === "rtl";
  const monthDays = getMonthDays(currentDate);

  // Get localized short weekday names using native Date API with Gregorian calendar
  const getLocalizedWeekDays = () => {
    const weekDays = [];
    const startDay = isRTL ? 6 : 0; // Start from Saturday for RTL, Sunday for LTR
    for (let i = 0; i < 7; i++) {
      const dayIndex = (startDay + i) % 7;
      const date = new Date(2000, 0, dayIndex + 2);
      weekDays.push(
        date.toLocaleDateString(i18n.language, {
          weekday: "short",
          calendar: "gregory",
        }),
      );
    }
    return weekDays;
  };

  const weekDays = getLocalizedWeekDays();

  const getMaintenanceForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return maintenance.filter((item) => {
      const itemDate = formatDate(new Date(item.createdAt));
      return itemDate === dateStr;
    });
  };

  const getMovesForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return unitMoves.filter((move) => {
      const moveDate = formatDate(new Date(move.moveDate));
      return moveDate === dateStr;
    });
  };

  return (
    <div className={cn("flex h-full flex-col", isRTL && "rtl")}>
      {/* Week headers */}
      <div
        className={cn(
          "grid grid-cols-7 border-b border-border",
          isRTL && "grid-flow-col-reverse",
        )}
      >
        {weekDays.map((day, dayIndex) => (
          <div
            key={`weekday-${dayIndex}`}
            className="p-2 text-center text-xs font-medium text-muted-foreground sm:p-3 sm:text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        <div
          className={cn("grid grid-cols-7", isRTL && "grid-flow-col-reverse")}
        >
          {monthDays.map((calendarDate, index) => {
            const dayEvents = filterEventsByDateRange(
              events,
              formatDate(calendarDate.date),
            );
            const dayTasks = filterTasksByDateRange(
              tasks,
              formatDate(calendarDate.date),
            );
            const dayMaintenance = getMaintenanceForDate(calendarDate.date);
            const dayMoves = getMovesForDate(calendarDate.date);

            // Check if this day has any rental
            const hasRental = dayEvents.some(
              (event) => event.type === "rental",
            );
            const hasPriceOverride = dayTasks.some(
              (task) => task.type === "price-override",
            );
            const hasMaintenance = dayMaintenance.length > 0;
            const hasMoves = dayMoves.length > 0;

            return (
              <div
                key={index}
                className={cn(
                  "flex min-h-[120px] cursor-pointer flex-col border-r border-b border-border p-1 transition-colors sm:min-h-[140px] sm:p-2",
                  !calendarDate.isCurrentMonth &&
                    "bg-muted/20 text-muted-foreground",
                  calendarDate.isToday && "bg-primary/5",
                  selectedDate?.toDateString() ===
                    calendarDate.date.toDateString() &&
                    "border-2 border-primary bg-accent",
                  hasRental && "bg-blue-50 dark:bg-blue-950/30",
                  hasPriceOverride && "bg-yellow-50 dark:bg-yellow-950/30",
                  "hover:bg-accent/50",
                  isRTL && "border-r-0 border-l",
                )}
                role="button"
                tabIndex={0}
                aria-label={`${calendarDate.date.toLocaleDateString(i18n.language)}, ${hasRental ? t("calendar.legend.reserved") : t("calendar.available")}, ${hasPriceOverride ? t("calendar.legend.customPrice") : ""}`}
                onClick={() => onDayClick(calendarDate.date)}
              >
                {/* Date number and status indicators */}
                <div
                  className={cn(
                    "mb-1 flex items-start justify-between sm:mb-2",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium sm:h-6 sm:w-6 sm:text-sm",
                      calendarDate.isToday &&
                        "bg-primary text-primary-foreground",
                      !calendarDate.isCurrentMonth && "text-muted-foreground",
                    )}
                  >
                    {calendarDate.date.getDate()}
                  </span>

                  {/* Status indicators */}
                  <div className="flex flex-wrap gap-1">
                    {hasRental && (
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-blue-500 sm:h-2 sm:w-2"
                        title={t("calendar.legend.reserved")}
                      />
                    )}
                    {hasPriceOverride && (
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-yellow-500 sm:h-2 sm:w-2"
                        title={t("calendar.legend.customPrice")}
                      />
                    )}
                    {hasMaintenance && (
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-orange-500 sm:h-2 sm:w-2"
                        title={t("calendar.legend.maintenance")}
                      />
                    )}
                    {hasMoves && (
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-green-500 sm:h-2 sm:w-2"
                        title={t("calendar.legend.financial")}
                      />
                    )}
                  </div>
                </div>

                {/* Content area */}
                <div className="flex-1 space-y-1 overflow-hidden">
                  {/* Rental information */}
                  {dayEvents.slice(0, 1).map((event) => (
                    <div
                      key={event.id}
                      className="truncate rounded p-1 text-xs text-white"
                      style={{ backgroundColor: event.color }}
                      title={`${event.title} - ${event.description}`}
                    >
                      {event.type === "rental"
                        ? t("calendar.reserved")
                        : event.title}
                    </div>
                  ))}

                  {/* Price override information - clickable */}
                  {dayTasks.slice(0, 1).map((task) => (
                    <div
                      key={task.id}
                      className="truncate rounded border-2 border-yellow-500 bg-background p-1 text-xs text-yellow-700 transition-colors hover:bg-yellow-50 dark:text-yellow-300 dark:hover:bg-yellow-950/50"
                      title={`${task.title} - ${t("calendar.clickToEdit")}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPriceClick) {
                          onPriceClick(task.overrideData);
                        }
                      }}
                    >
                      <SaCurrency size={16} lightColor="var(--color-yellow-700)" darkColor="var(--color-yellow-300)"/>
                      {task.overrideData?.price}
                    </div>
                  ))}

                  {/* Maintenance requests */}
                  {dayMaintenance.slice(0, 1).map((item, idx) => (
                    <div
                      key={`maintenance-${idx}`}
                      className={cn(
                        "truncate rounded p-1 text-xs text-white",
                        item.priority === "high" && "bg-red-600",
                        item.priority === "medium" && "bg-orange-500",
                        item.priority === "low" && "bg-yellow-600",
                        !item.priority && "bg-orange-500",
                      )}
                      title={`${t("calendar.maintenance")}: ${item.title} - ${item.status}`}
                    >
                      🔧 {item.title}
                    </div>
                  ))}

                  {/* Unit moves (financial activity) */}
                  {dayMoves.slice(0, 1).map((move, idx) => (
                    <div
                      key={`move-${idx}`}
                      className={cn(
                        "truncate rounded p-1 text-xs text-white",
                        move.credit > 0 && "bg-green-600",
                        move.debit > 0 && "bg-red-600",
                      )}
                      title={`${move.description || t("calendar.transaction")}: ${
                        move.credit > 0 ? (
                          <>
                            +<SaCurrency size={16} /> {move.credit}
                          </>
                        ) : (
                          <>
                            -<SaCurrency size={16} /> {move.debit}
                          </>
                        )
                      }`}
                    >
                      💰{" "}
                      {move.credit > 0 ? (
                        <>
                          +<SaCurrency size={16} /> {move.credit}
                        </>
                      ) : (
                        <>
                          -<SaCurrency size={16} /> {move.debit}
                        </>
                      )}
                    </div>
                  ))}

                  {/* Status text for empty days */}
                  {!hasRental &&
                    !hasPriceOverride &&
                    !hasMaintenance &&
                    !hasMoves &&
                    calendarDate.isCurrentMonth && (
                      <div className="text-xs font-medium text-green-600 dark:text-green-400">
                        {t("calendar.available")}
                      </div>
                    )}

                  {/* Show more indicator */}
                  {dayEvents.length +
                    dayTasks.length +
                    dayMaintenance.length +
                    dayMoves.length >
                    4 && (
                    <div className="text-xs text-muted-foreground">
                      +
                      {dayEvents.length +
                        dayTasks.length +
                        dayMaintenance.length +
                        dayMoves.length -
                        4}{" "}
                      {t("calendar.more")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
