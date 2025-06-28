import type { Event, Task } from '@/types';
import { getYearMonths, getMonthDays, filterEventsByDateRange, filterTasksByDateRange, formatDate } from '@/utils';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface YearViewProps {
  currentDate: Date;
  events: Event[];
  tasks: Task[];
  onDayClick: (date: Date) => void;
}

export default function YearView({ currentDate, events, tasks, onDayClick }: YearViewProps) {
  const year = currentDate.getFullYear();
  const months = getYearMonths(year);
  const today = new Date();
  const { t, i18n } = useTranslation('calendar');

  // Get localized month name using native Date API with Gregorian calendar
  const getLocalizedMonthName = (month: Date) => {
    return month.toLocaleDateString(i18n.language, { 
      month: 'long',
      calendar: 'gregory'
    });
  };

  // Get localized short weekday names using native Date API
  const getLocalizedWeekDays = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(2000, 0, i + 2); // Sunday = 0, Monday = 1, etc.
      weekDays.push(date.toLocaleDateString(i18n.language, { 
        weekday: 'narrow',
        calendar: 'gregory'
      }));
    }
    return weekDays;
  };

  const getMonthEvents = (month: Date) => {
    const monthDays = getMonthDays(month);
    let eventCount = 0;
    
    monthDays.forEach(day => {
      if (day.isCurrentMonth) {
        const dayEvents = filterEventsByDateRange(events, formatDate(day.date));
        const dayTasks = filterTasksByDateRange(tasks, formatDate(day.date));
        eventCount += dayEvents.length + dayTasks.length;
      }
    });
    
    return eventCount;
  };

  const renderMiniMonth = (month: Date) => {
    const monthDays = getMonthDays(month);
    const weekDays = getLocalizedWeekDays();
    const eventCount = getMonthEvents(month);

    return (
      <div key={month.toString()} className="bg-card rounded-lg border p-3">
        {/* Month header */}
        <div className="text-center mb-2">
          <h3 className="font-medium text-sm">
            {getLocalizedMonthName(month)}
          </h3>
          {eventCount > 0 && (
            <div className="text-xs text-muted-foreground">
              {eventCount} {t('items', { count: eventCount })}
            </div>
          )}
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day, dayIndex) => (
            <div key={`weekday-${dayIndex}`} className="text-xs text-muted-foreground text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1" style={{ minHeight: '144px' }}>
          {monthDays.map((calendarDate, index) => {
            const dayEvents = filterEventsByDateRange(events, formatDate(calendarDate.date));
            const dayTasks = filterTasksByDateRange(tasks, formatDate(calendarDate.date));
            const hasItems = dayEvents.length > 0 || dayTasks.length > 0;
            const isToday = calendarDate.date.toDateString() === today.toDateString();

            return (
              <div
                key={`day-${index}`}
                className={cn(
                  "w-full h-full text-xs flex items-center justify-center rounded cursor-pointer hover:bg-accent transition-colors",
                  !calendarDate.isCurrentMonth && "text-muted-foreground/40",
                  calendarDate.isCurrentMonth && "text-foreground",
                  isToday && "bg-primary text-primary-foreground font-medium",
                  hasItems && !isToday && calendarDate.isCurrentMonth && "bg-accent text-accent-foreground",
                  hasItems && calendarDate.isCurrentMonth && "font-medium"
                )}
                title={hasItems ? `${dayEvents.length + dayTasks.length} ${t('items', { count: dayEvents.length + dayTasks.length })}` : ''}
                onClick={() => calendarDate.isCurrentMonth && onDayClick(calendarDate.date)}
              >
                {calendarDate.date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map(renderMiniMonth)}
      </div>
    </div>
  );
}