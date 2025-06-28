import type { Event, Task } from '@/types';
import { getWeekDays, filterEventsByDateRange, filterTasksByDateRange, formatDate, formatTime, isMultiDayEvent, isMultiDayTask, getEventPositionInDay } from '@/utils';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  tasks: Task[];
  onDayClick: (date: Date) => void;
}

export default function WeekView({ currentDate, events, tasks, onDayClick }: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();
  const { t, i18n } = useTranslation('calendar');

  // Get localized weekday names using native Date API with Gregorian calendar
  const getLocalizedWeekdayName = (date: Date) => {
    return date.toLocaleDateString(i18n.language, { 
      weekday: 'short',
      calendar: 'gregory'
    });
  };

  const getDayEvents = (date: Date) => {
    const dateStr = formatDate(date);
    return filterEventsByDateRange(events, dateStr);
  };

  const getDayTasks = (date: Date) => {
    const dateStr = formatDate(date);
    return filterTasksByDateRange(tasks, dateStr);
  };

  const getTimeSlotHeight = (startTime: string, endTime: string) => {
    const start = parseInt(startTime.split(':')[0]);
    const startMinutes = parseInt(startTime.split(':')[1]);
    const end = parseInt(endTime.split(':')[0]);
    const endMinutes = parseInt(endTime.split(':')[1]);
    
    const totalMinutes = (end - start) * 60 + (endMinutes - startMinutes);
    return (totalMinutes / 60) * 60; // 60px per hour
  };

  const getTimeSlotTop = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    const minutes = parseInt(time.split(':')[1]);
    return (hour * 60) + (minutes / 60) * 60;
  };

  const renderEvent = (event: Event, date: Date, eventIndex: number, dayIndex: number) => {
    const position = getEventPositionInDay(event, date);
    const isMultiDay = isMultiDayEvent(event);
    
    // For multi-day events, show as all-day events at the top
    if (isMultiDay) {
      return (
        <div
          key={`event-${dayIndex}-${eventIndex}`}
          className={cn(
            "absolute left-1 right-1 p-1 text-xs text-white cursor-pointer hover:opacity-80 z-10",
            position === 'start' && "rounded-l",
            position === 'end' && "rounded-r", 
            position === 'middle' && "rounded-none",
            position === 'single' && "rounded"
          )}
          style={{
            backgroundColor: event.color,
            top: `${eventIndex * 25}px`,
            height: '20px',
          }}
        >
          <div className="font-medium truncate">
            {event.title}
            {position === 'middle' && ` (${t('continues')})`}
          </div>
        </div>
      );
    }

    // Single day events show in time slots
    return (
      <div
        key={`event-${dayIndex}-${eventIndex}`}
        className="absolute left-1 right-1 rounded p-1 text-xs text-white cursor-pointer hover:opacity-80 z-10"
        style={{
          backgroundColor: event.color,
          top: `${getTimeSlotTop(event.startTime) + 30}px`, // Offset for all-day events
          height: `${getTimeSlotHeight(event.startTime, event.endTime)}px`,
        }}
      >
        <div className="font-medium truncate">{event.title}</div>
        <div className="opacity-90">
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </div>
      </div>
    );
  };

  const renderTask = (task: Task, date: Date, taskIndex: number, dayIndex: number) => {
    const isMultiDay = isMultiDayTask(task);
    const startDate = new Date(task.date);
    const endDate = new Date(task.endDate || task.date);
    const currentDate = new Date(date);
    
    let position: 'start' | 'middle' | 'end' | 'single' = 'single';
    if (isMultiDay) {
      if (currentDate.getTime() === startDate.getTime()) position = 'start';
      else if (currentDate.getTime() === endDate.getTime()) position = 'end';
      else position = 'middle';
    }

    return (
      <div
        key={`task-${dayIndex}-${taskIndex}`}
        className={cn(
          "absolute left-1 right-1 border p-1 text-xs bg-background cursor-pointer hover:bg-accent z-10",
          task.completed && "line-through opacity-60",
          task.priority === 'high' && "border-destructive",
          task.priority === 'medium' && "border-yellow-500",
          task.priority === 'low' && "border-green-500",
          position === 'start' && "rounded-l",
          position === 'end' && "rounded-r", 
          position === 'middle' && "rounded-none",
          position === 'single' && "rounded"
        )}
        style={{
          top: `${getTimeSlotTop(task.time) + 30}px`, // Offset for all-day events
          height: '30px',
          left: `${4 + (taskIndex % 2) * 2}px`,
        }}
        title={`${task.title} - ${formatTime(task.time)}`}
      >
        <div className="font-medium truncate">
          {task.title}
          {isMultiDay && position === 'middle' && ` (${t('continues')})`}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Horizontal scroll container */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-fit">
          {/* Header with days */}
          <div className="flex border-b sticky top-0 bg-background z-20">
            <div className="w-16 flex-shrink-0"></div>
            {weekDays.map((day, dayIndex) => {
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div 
                  key={`day-header-${dayIndex}`} 
                  className="min-w-52 p-4 text-center border-r md:flex-1 flex-shrink-0 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onDayClick(day)}
                >
                  <div className="text-sm text-muted-foreground">
                    {getLocalizedWeekdayName(day)}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-medium mt-1",
                      isToday && "text-primary"
                    )}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="relative">
            {/* Time labels */}
            <div className="flex">
              <div className="w-16 flex-shrink-0 sticky left-0 bg-background z-30">
                {hours.map((hour) => (
                  <div key={hour} className="h-[60px] flex items-start justify-end pr-2 text-xs text-muted-foreground" style={{ marginTop: '30px' }}>
                    {hour === 0 ? '' : `${hour}:00`}
                  </div>
                ))}
              </div>

              {/* Days columns */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getDayEvents(day);
                const dayTasks = getDayTasks(day);
                const isToday = day.toDateString() === today.toDateString();

                return (
                  <div 
                    key={`day-column-${dayIndex}`} 
                    className="flex-1 relative border-r cursor-pointer hover:bg-accent/20 transition-colors" 
                    style={{ paddingTop: '30px' }}
                    onClick={() => onDayClick(day)}
                  >
                    {/* Hour lines */}
                    {hours.map((hour) => (
                      <div
                        key={`hour-${dayIndex}-${hour}`}
                        className={cn(
                          "h-[60px] min-w-52 md:flex-1 flex-shrink-0 border-b border-border/50",
                          isToday && "bg-primary/5"
                        )}
                      />
                    ))}

                    {/* Events */}
                    {dayEvents.map((event, eventIndex) => renderEvent(event, day, eventIndex, dayIndex))}

                    {/* Tasks */}
                    {dayTasks.map((task, taskIndex) => renderTask(task, day, taskIndex, dayIndex))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}