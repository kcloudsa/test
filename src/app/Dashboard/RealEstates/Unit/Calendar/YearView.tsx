import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface YearViewProps {
  currentDate: Date;
  events: any[];
  tasks: any[];
  onDayClick: (date: Date) => void;
  onMonthClick: (date: Date) => void;
  onPriceClick?: (priceOverride: any) => void;
  maintenance?: any[];
  unitMoves?: any[];
}

const getMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);
  
  startDate.setDate(startDate.getDate() - startDate.getDay());
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
  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const targetDate = new Date(dateStr);
    
    return targetDate >= eventStart && targetDate <= eventEnd;
  });
};

const filterTasksByDateRange = (tasks: any[], dateStr: string) => {
  return tasks.filter(task => task.date === dateStr);
};

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export default function YearView({ currentDate, events, tasks, onDayClick, onMonthClick, onPriceClick, maintenance = [], unitMoves = [] }: YearViewProps) {
  const { t, i18n } = useTranslation("real-estates");
  const year = currentDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  const getMaintenanceForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return maintenance.filter(item => {
      const itemDate = formatDate(new Date(item.createdAt));
      return itemDate === dateStr;
    });
  };

  const getMovesForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return unitMoves.filter(move => {
      const moveDate = formatDate(new Date(move.moveDate));
      return moveDate === dateStr;
    });
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {months.map((month, index) => {
          // Calculate month statistics
          const monthDays = getMonthDays(month);
          let reservedDays = 0;
          let customPriceDays = 0;
          let maintenanceDays = 0;
          let moveDays = 0;
          let totalRevenue = 0;

          monthDays.forEach(day => {
            if (day.isCurrentMonth) {
              const dayEvents = filterEventsByDateRange(events, formatDate(day.date));
              const dayTasks = filterTasksByDateRange(tasks, formatDate(day.date));
              const dayMaintenance = getMaintenanceForDate(day.date);
              const dayMoves = getMovesForDate(day.date);
              
              if (dayEvents.some(event => event.type === 'rental')) {
                reservedDays++;
                // Add rental revenue
                dayEvents.forEach(event => {
                  if (event.rentalData?.rentalAmount) {
                    totalRevenue += event.rentalData.rentalAmount / 30; // Daily rate approximation
                  }
                });
              }
              
              if (dayTasks.some(task => task.type === 'price-override')) {
                customPriceDays++;
              }

              if (dayMaintenance.length > 0) {
                maintenanceDays++;
              }

              if (dayMoves.length > 0) {
                moveDays++;
                // Add move revenue
                dayMoves.forEach(move => {
                  if (move.credit > 0) {
                    totalRevenue += move.credit;
                  }
                });
              }
            }
          });

          const occupancyRate = Math.round((reservedDays / monthDays.filter(d => d.isCurrentMonth).length) * 100);

          return (
            <div 
              key={index} 
              className="bg-card border border-border rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onMonthClick(month)}
            >
              <div className="text-center mb-2">
                <h3 className="font-medium text-sm text-foreground">
                  {month.toLocaleDateString(i18n.language, { month: 'long', calendar: 'gregory' })}
                </h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{t('calendar.yearView.reservedDays', { count: reservedDays })}</div>
                  <div>{t('calendar.yearView.customPrices', { count: customPriceDays })}</div>
                  {maintenanceDays > 0 && <div>{t('calendar.yearView.maintenanceDays', { count: maintenanceDays })}</div>}
                  {moveDays > 0 && <div>{t('calendar.yearView.transactionDays', { count: moveDays })}</div>}
                  <div className="font-medium text-green-600 dark:text-green-400">
                    {t('calendar.yearView.occupied', { rate: occupancyRate })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1" style={{ minHeight: '100px' }}>
                {getMonthDays(month).map((day, dayIndex) => {
                  const dayEvents = filterEventsByDateRange(events, formatDate(day.date));
                  const dayTasks = filterTasksByDateRange(tasks, formatDate(day.date));
                  const dayMaintenance = getMaintenanceForDate(day.date);
                  const dayMoves = getMovesForDate(day.date);
                  const hasRental = dayEvents.some(event => event.type === 'rental');
                  const hasPriceOverride = dayTasks.some(task => task.type === 'price-override');
                  const hasMaintenance = dayMaintenance.length > 0;
                  const hasMoves = dayMoves.length > 0;
                  const isToday = day.date.toDateString() === new Date().toDateString();

                  const getClickHandler = () => {
                    if (!day.isCurrentMonth) return undefined;
                    
                    if (hasPriceOverride && onPriceClick) {
                      const priceTask = dayTasks.find(task => task.type === 'price-override');
                      return (e: React.MouseEvent) => {
                        e.stopPropagation();
                        onPriceClick(priceTask?.overrideData);
                      };
                    }
                    
                    return (e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDayClick(day.date);
                    };
                  };

                  // Determine background color based on priority
                  let bgColor = "";
                  
                  if (isToday) {
                    bgColor = "bg-primary text-primary-foreground";
                  } else if (hasRental) {
                    bgColor = "bg-blue-500 text-white";
                  } else if (hasPriceOverride) {
                    bgColor = "bg-yellow-500 text-white";
                  } else if (hasMaintenance) {
                    const highPriorityMaintenance = dayMaintenance.some(m => m.priority === 'high');
                    bgColor = highPriorityMaintenance ? "bg-red-500 text-white" : "bg-orange-500 text-white";
                  } else if (hasMoves) {
                    const hasIncome = dayMoves.some(m => m.credit > 0);
                    bgColor = hasIncome ? "bg-green-500 text-white" : "bg-red-500 text-white";
                  }

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "w-full h-full text-xs flex items-center justify-center rounded cursor-pointer transition-colors font-medium",
                        !day.isCurrentMonth && "text-muted-foreground/40",
                        day.isCurrentMonth && !bgColor && "hover:bg-accent",
                        bgColor
                      )}
                      title={
                        hasRental && hasPriceOverride ? `${t('calendar.legend.reserved')} ${t('calendar.yearView.withCustomPrice')} - ${day.date.toLocaleDateString(i18n.language)}` :
                        hasRental ? `${t('calendar.legend.reserved')} - ${day.date.toLocaleDateString(i18n.language)}` :
                        hasPriceOverride ? `${t('calendar.legend.customPrice')} - ${day.date.toLocaleDateString(i18n.language)}` :
                        hasMaintenance ? `${t('calendar.legend.maintenance')} - ${day.date.toLocaleDateString(i18n.language)}` :
                        hasMoves ? `${t('calendar.legend.financial')} - ${day.date.toLocaleDateString(i18n.language)}` :
                        day.isCurrentMonth ? `${t('calendar.available')} - ${day.date.toLocaleDateString(i18n.language)}` : ''
                      }
                      onClick={getClickHandler()}
                    >
                      {day.date.getDate()}
                    </div>
                  );
                })}
              </div>

              {totalRevenue > 0 && (
                <div className="text-center mt-2 text-xs">
                  <div className="font-medium text-green-600 dark:text-green-400">
                    {t('calendar.yearView.revenue', { amount: Math.round(totalRevenue).toLocaleString() })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
