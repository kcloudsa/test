import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import SaCurrency from "@/common/sa-currency";

interface WeekViewProps {
  currentDate: Date;
  events: any[];
  tasks: any[];
  onDayClick: (date: Date) => void;
  onPriceClick?: (priceOverride: any) => void;
  maintenance?: any[];
  unitMoves?: any[];
}

// Calendar utility functions
const getWeekDays = (date: Date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(startOfWeek);
    weekDay.setDate(startOfWeek.getDate() + i);
    days.push(weekDay);
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

export default function WeekView({
  currentDate,
  events,
  tasks,
  onDayClick,
  onPriceClick,
  maintenance = [],
  unitMoves = [],
}: WeekViewProps) {
  const { t, i18n } = useTranslation("real-estates");
  const weekDays = getWeekDays(currentDate);
  const today = new Date();

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
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {/* Header with days */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day, dayIndex) => {
            const isToday = day.toDateString() === today.toDateString();
            const dayEvents = filterEventsByDateRange(events, formatDate(day));
            const dayTasks = filterTasksByDateRange(tasks, formatDate(day));
            const dayMaintenance = getMaintenanceForDate(day);
            const dayMoves = getMovesForDate(day);
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
                key={`day-header-${dayIndex}`}
                className="cursor-pointer border-r border-border p-3 text-center transition-colors hover:bg-accent/50 sm:p-4"
                onClick={() => onDayClick(day)}
              >
                <div className="text-xs text-muted-foreground sm:text-sm">
                  {day.toLocaleDateString(i18n.language, {
                    weekday: "short",
                    calendar: "gregory",
                  })}
                </div>
                <div
                  className={cn(
                    "mt-1 text-base font-medium sm:text-lg",
                    isToday && "text-primary",
                  )}
                >
                  {day.getDate()}
                </div>

                {/* Status indicators */}
                <div className="mt-2 flex flex-wrap justify-center gap-1">
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
            );
          })}
        </div>

        {/* Week content */}
        <div className="grid min-h-[300px] grid-cols-7 sm:min-h-[400px]">
          {weekDays.map((day, dayIndex) => {
            const dayEvents = filterEventsByDateRange(events, formatDate(day));
            const dayTasks = filterTasksByDateRange(tasks, formatDate(day));
            const dayMaintenance = getMaintenanceForDate(day);
            const dayMoves = getMovesForDate(day);
            const hasRental = dayEvents.some(
              (event) => event.type === "rental",
            );
            const hasPriceOverride = dayTasks.some(
              (task) => task.type === "price-override",
            );
            const hasMaintenance = dayMaintenance.length > 0;
            const hasMoves = dayMoves.length > 0;
            const isToday = day.toDateString() === today.toDateString();

            return (
              <div
                key={`day-column-${dayIndex}`}
                className={cn(
                  "cursor-pointer border-r border-border p-2 transition-colors hover:bg-accent/20 sm:p-4",
                  isToday && "bg-primary/5",
                  hasRental && "bg-blue-50 dark:bg-blue-950/30",
                  hasPriceOverride && "bg-yellow-50 dark:bg-yellow-950/30",
                )}
                onClick={() => onDayClick(day)}
              >
                {/* Day content */}
                <div className="space-y-1 sm:space-y-2">
                  {/* Rental information */}
                  {dayEvents.map((event, eventIndex) => (
                    <div
                      key={`event-${dayIndex}-${eventIndex}`}
                      className="rounded p-1 text-xs text-white sm:p-2"
                      style={{ backgroundColor: event.color }}
                    >
                      <div className="font-medium">
                        {event.type === "rental"
                          ? t("calendar.reserved")
                          : event.title}
                      </div>
                      <div className="text-xs opacity-90">
                        {event.description} <SaCurrency size={16} />
                      </div>
                    </div>
                  ))}

                  {/* Price overrides - clickable */}
                  {dayTasks.map((task, taskIndex) => (
                    <div
                      key={`task-${dayIndex}-${taskIndex}`}
                      className="rounded border-2 border-yellow-500 bg-background p-1 text-xs text-yellow-700 transition-colors hover:bg-yellow-50 sm:p-2 dark:text-yellow-300 dark:hover:bg-yellow-950/50"
                      title={t("calendar.clickToEdit")}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPriceClick) {
                          onPriceClick(task.overrideData);
                        }
                      }}
                    >
                      <div className="font-medium">
                        {t("calendar.legend.customPrice")}
                      </div>
                      <div>
                        <SaCurrency size={16} lightColor="var(--color-yellow-700)" darkColor="var(--color-yellow-300)"/> {task.overrideData?.price}
                      </div>
                    </div>
                  ))}

                  {/* Maintenance requests */}
                  {dayMaintenance.map((item, idx) => (
                    <div
                      key={`maintenance-${dayIndex}-${idx}`}
                      className={cn(
                        "rounded p-1 text-xs text-white sm:p-2",
                        item.priority === "high" && "bg-red-600",
                        item.priority === "medium" && "bg-orange-500",
                        item.priority === "low" && "bg-yellow-600",
                        !item.priority && "bg-orange-500",
                      )}
                    >
                      <div className="font-medium">
                        🔧 {t("calendar.maintenance")}
                      </div>
                      <div>{item.title}</div>
                      <div className="text-xs opacity-90">{item.status}</div>
                    </div>
                  ))}

                  {/* Unit moves */}
                  {dayMoves.map((move, idx) => (
                    <div
                      key={`move-${dayIndex}-${idx}`}
                      className={cn(
                        "rounded p-1 text-xs text-white sm:p-2",
                        move.credit > 0 && "bg-green-600",
                        move.debit > 0 && "bg-red-600",
                      )}
                    >
                      <div className="font-medium">
                        💰{" "}
                        {move.credit > 0
                          ? t("financials.income")
                          : t("financials.expense")}
                      </div>
                      <div>{move.description || t("calendar.transaction")}</div>
                      <div className="text-xs opacity-90">
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
                    </div>
                  ))}

                  {/* Empty state */}
                  {!hasRental &&
                    !hasPriceOverride &&
                    !hasMaintenance &&
                    !hasMoves && (
                      <div className="text-xs font-medium text-green-600 sm:text-sm dark:text-green-400">
                        {t("calendar.available")} -{" "}
                        {t("calendar.clickToSetPrice")}
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
