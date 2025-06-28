import type { Event, Task } from '@/types';
import { filterEventsByDateRange, filterTasksByDateRange, formatDate, formatTime, isMultiDayEvent, isMultiDayTask, getEventPositionInDay } from '@/utils';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface DayViewProps {
  currentDate: Date;
  events: Event[];
  tasks: Task[];
  onDayClick: (date: Date) => void;
}

export default function DayView({ currentDate, events, tasks }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();
  const { t, i18n } = useTranslation('calendar');

  const dayEvents = filterEventsByDateRange(events, formatDate(currentDate));
  const dayTasks = filterTasksByDateRange(tasks, formatDate(currentDate));

  // Get localized weekday name using native Date API with Gregorian calendar
  const getLocalizedWeekdayName = (date: Date) => {
    return date.toLocaleDateString(i18n.language, { 
      weekday: 'long',
      calendar: 'gregory'
    });
  };

  const getTimeSlotHeight = (startTime: string, endTime: string) => {
    const start = parseInt(startTime.split(':')[0]);
    const startMinutes = parseInt(startTime.split(':')[1]);
    const end = parseInt(endTime.split(':')[0]);
    const endMinutes = parseInt(endTime.split(':')[1]);
    
    const totalMinutes = (end - start) * 60 + (endMinutes - startMinutes);
    return (totalMinutes / 60) * 80; // 80px per hour for more space
  };

  const getTimeSlotTop = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    const minutes = parseInt(time.split(':')[1]);
    return (hour * 80) + (minutes / 60) * 80;
  };

  const renderEvent = (event: Event) => {
    const position = getEventPositionInDay(event, currentDate);
    const isMultiDay = isMultiDayEvent(event);
    
    let titleSuffix = '';
    if (isMultiDay) {
      switch (position) {
        case 'start':
          titleSuffix = ` (${t('starts')})`;
          break;
        case 'middle':
          titleSuffix = ` (${t('continues')})`;
          break;
        case 'end':
          titleSuffix = ` (${t('ends')})`;
          break;
      }
    }

    return (
      <div
        key={event.id}
        className="absolute left-2 right-2 rounded-lg p-3 text-sm text-white cursor-pointer hover:opacity-90 shadow-sm z-10"
        style={{
          backgroundColor: event.color,
          top: `${getTimeSlotTop(event.startTime)}px`,
          height: `${getTimeSlotHeight(event.startTime, event.endTime)}px`,
        }}
      >
        <div className="font-semibold mb-1">{event.title}{titleSuffix}</div>
        <div className="opacity-90 text-xs">
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </div>
        {event.description && (
          <div className="opacity-80 text-xs mt-1 line-clamp-2">
            {event.description}
          </div>
        )}
        {isMultiDay && (
          <div className="opacity-80 text-xs mt-1">
            {new Date(event.startDate).toLocaleDateString(i18n.language, { calendar: 'gregory' })} - {new Date(event.endDate).toLocaleDateString(i18n.language, { calendar: 'gregory' })}
          </div>
        )}
      </div>
    );
  };

  const renderTask = (task: Task) => {
    const isMultiDay = isMultiDayTask(task);
    const startDate = new Date(task.date);
    const endDate = new Date(task.endDate || task.date);
    const current = new Date(currentDate);
    
    let titleSuffix = '';
    if (isMultiDay) {
      if (current.getTime() === startDate.getTime()) titleSuffix = ` (${t('starts')})`;
      else if (current.getTime() === endDate.getTime()) titleSuffix = ` (${t('ends')})`;
      else titleSuffix = ` (${t('continues')})`;
    }

    return (
      <div
        key={task.id}
        className={cn(
          "absolute left-2 right-2 rounded-lg border-2 p-2 text-sm bg-background cursor-pointer hover:bg-accent shadow-sm z-10",
          task.completed && "line-through opacity-60",
          task.priority === 'high' && "border-destructive",
          task.priority === 'medium' && "border-yellow-500",
          task.priority === 'low' && "border-green-500"
        )}
        style={{
          top: `${getTimeSlotTop(task.time)}px`,
          height: '60px',
        }}
      >
        <div className="font-medium">{task.title}{titleSuffix}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatTime(task.time)} • {task.category}
        </div>
        {isMultiDay && (
          <div className="text-xs text-muted-foreground">
            {startDate.toLocaleDateString(i18n.language, { calendar: 'gregory' })} - {endDate.toLocaleDateString(i18n.language, { calendar: 'gregory' })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex border-b">
        <div className="w-20 flex-shrink-0"></div>
        <div className="flex-1 p-4 text-center">
          <div className="text-sm text-muted-foreground">
            {getLocalizedWeekdayName(currentDate)}
          </div>
          <div className={cn("text-2xl font-medium", isToday && "text-primary")}>
            {currentDate.getDate()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Time labels */}
          <div className="w-20 flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="h-[80px] flex items-start justify-end pr-3 text-sm text-muted-foreground">
                {hour === 0 ? '' : `${hour}:00`}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="flex-1 relative border-r">
            {/* Hour lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className={cn(
                  "h-[80px] border-b border-border/50",
                  isToday && "bg-primary/5"
                )}
              />
            ))}

            {/* Current time indicator */}
            {isToday && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                style={{
                  top: `${getTimeSlotTop(new Date().toTimeString().slice(0, 5))}px`,
                }}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 -mt-1"></div>
              </div>
            )}

            {/* Events */}
            {dayEvents.map(renderEvent)}

            {/* Tasks */}
            {dayTasks.map(renderTask)}
          </div>
        </div>
      </div>
    </div>
  );
}