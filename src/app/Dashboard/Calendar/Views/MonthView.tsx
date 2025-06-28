import type { Event, Task } from '@/types';
import { getMonthDays, filterEventsByDateRange, filterTasksByDateRange, formatDate, formatTime, isMultiDayEvent, isMultiDayTask } from '@/utils';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  tasks: Task[];
  onDayClick: (date: Date) => void;
}

interface MultiDayItem {
  id: string;
  title: string;
  color?: string;
  priority?: string;
  type: 'event' | 'task';
  startDate: Date;
  endDate: Date;
  startCol: number;
  endCol: number;
  row: number;
  rowLevel: number;
}

export default function MonthView({ currentDate, events, tasks, onDayClick }: MonthViewProps) {
  const monthDays = getMonthDays(currentDate);
  const { t, i18n } = useTranslation('calendar');

  // Get localized short weekday names using native Date API with Gregorian calendar
  const getLocalizedWeekDays = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(2000, 0, i + 2); // Sunday = 0, Monday = 1, etc.
      weekDays.push(date.toLocaleDateString(i18n.language, { 
        weekday: 'short',
        calendar: 'gregory'
      }));
    }
    return weekDays;
  };

  const weekDays = getLocalizedWeekDays();

  // Function to determine text color based on background color for better readability
  const getTextColor = (backgroundColor?: string): string => {
    if (!backgroundColor) return '#000000';
    
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance using relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black text for light backgrounds, white text for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Calculate multi-day items that span across days
  const getMultiDayItems = (): MultiDayItem[] => {
    const multiDayItems: MultiDayItem[] = [];
    
    // Process events
    events.forEach(event => {
      if (isMultiDayEvent(event)) {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        // Find start and end positions in the calendar grid
        const startIndex = monthDays.findIndex(day => 
          day.date.toDateString() === startDate.toDateString()
        );
        const endIndex = monthDays.findIndex(day => 
          day.date.toDateString() === endDate.toDateString()
        );
        
        if (startIndex !== -1 && endIndex !== -1) {
          const startRow = Math.floor(startIndex / 7);
          const endRow = Math.floor(endIndex / 7);
          
          // Handle multi-row spans by creating separate items for each row
          for (let row = startRow; row <= endRow; row++) {
            const rowStartCol = row === startRow ? startIndex % 7 : 0;
            const rowEndCol = row === endRow ? endIndex % 7 : 6;
            
            multiDayItems.push({
              id: `${event.id}-row-${row}`,
              title: event.title,
              color: event.color,
              type: 'event',
              startDate,
              endDate,
              startCol: rowStartCol,
              endCol: rowEndCol,
              row,
              rowLevel: 0 // Will be calculated later
            });
          }
        }
      }
    });
    
    // Process tasks
    tasks.forEach(task => {
      if (isMultiDayTask(task)) {
        const startDate = new Date(task.date);
        const endDate = new Date(task.endDate || task.date);
        
        const startIndex = monthDays.findIndex(day => 
          day.date.toDateString() === startDate.toDateString()
        );
        const endIndex = monthDays.findIndex(day => 
          day.date.toDateString() === endDate.toDateString()
        );
        
        if (startIndex !== -1 && endIndex !== -1) {
          const startRow = Math.floor(startIndex / 7);
          const endRow = Math.floor(endIndex / 7);
          
          for (let row = startRow; row <= endRow; row++) {
            const rowStartCol = row === startRow ? startIndex % 7 : 0;
            const rowEndCol = row === endRow ? endIndex % 7 : 6;
            
            multiDayItems.push({
              id: `${task.id}-row-${row}`,
              title: task.title,
              priority: task.priority,
              type: 'task',
              startDate,
              endDate,
              startCol: rowStartCol,
              endCol: rowEndCol,
              row,
              rowLevel: 0
            });
          }
        }
      }
    });
    
    // Calculate row levels to prevent overlapping
    const rowGroups = multiDayItems.reduce((acc, item) => {
      if (!acc[item.row]) acc[item.row] = [];
      acc[item.row].push(item);
      return acc;
    }, {} as Record<number, MultiDayItem[]>);
    
    Object.values(rowGroups).forEach(rowItems => {
      rowItems.sort((a, b) => a.startCol - b.startCol);
      rowItems.forEach((item, index) => {
        item.rowLevel = index;
      });
    });
    
    return multiDayItems;
  };

  // Get multi-day items that affect a specific day
  const getMultiDayItemsForDay = (dayIndex: number): MultiDayItem[] => {
    const row = Math.floor(dayIndex / 7);
    const col = dayIndex % 7;
    
    return multiDayItems.filter(item => 
      item.row === row && col >= item.startCol && col <= item.endCol
    );
  };

  const getDayEvents = (date: Date) => {
    const dateStr = formatDate(date);
    return filterEventsByDateRange(events, dateStr).filter(event => !isMultiDayEvent(event));
  };

  const getDayTasks = (date: Date) => {
    const dateStr = formatDate(date);
    return filterTasksByDateRange(tasks, dateStr).filter(task => !isMultiDayTask(task));
  };

  const renderSingleDayEvent = (event: Event) => {
    const textColor = getTextColor(event.color);
    
    return (
      <div
        key={event.id}
        className="text-xs p-1 truncate cursor-pointer hover:opacity-80 rounded-md mb-1 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ 
          backgroundColor: event.color,
          color: textColor
        }}
        title={`${event.title} - ${formatTime(event.startTime)}`}
        tabIndex={0}
        role="button"
        aria-label={`${t('event')}: ${event.title} ${t('at')} ${formatTime(event.startTime)}`}
      >
        <span className="font-medium">{formatTime(event.startTime)}</span> {event.title}
      </div>
    );
  };

  const renderSingleDayTask = (task: Task) => {
    const priorityColors = {
      high: { bg: '#fef2f2', border: '#dc2626', text: '#991b1b' },
      medium: { bg: '#fffbeb', border: '#d97706', text: '#92400e' },
      low: { bg: '#f0fdf4', border: '#16a34a', text: '#166534' }
    };

    const priorityStyle = task.priority ? priorityColors[task.priority] : { bg: '#f9fafb', border: '#6b7280', text: '#374151' };
    
    return (
      <div
        key={task.id}
        className={cn(
          "text-xs p-1 border-2 truncate cursor-pointer hover:bg-opacity-80 rounded-md mb-1 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500",
          task.completed && "line-through opacity-60"
        )}
        style={{
          backgroundColor: priorityStyle.bg,
          borderColor: priorityStyle.border,
          color: priorityStyle.text
        }}
        title={`${t('task')}: ${task.title} - ${formatTime(task.time)} (${t('priority')}: ${task.priority || t('normal')})`}
        tabIndex={0}
        role="button"
        aria-label={`${t('task')}: ${task.title} ${t('at')} ${formatTime(task.time)}, ${t('priority')} ${task.priority || t('normal')}${task.completed ? `, ${t('completed')}` : ''}`}
      >
        <span className="font-medium">{formatTime(task.time)}</span> {task.title}
      </div>
    );
  };

  const multiDayItems = getMultiDayItems();
  
  // Calculate the height needed for each row based on content
  const getRowHeights = () => {
    const rowHeights: number[] = [];
    const dateHeaderHeight = 32; // Fixed height for date header
    
    for (let row = 0; row < 6; row++) {
      let maxItemsInRow = 0;
      let maxMultiDayLevelsInRow = 0;
      
      // Check each day in this row
      for (let col = 0; col < 7; col++) {
        const dayIndex = row * 7 + col;
        if (dayIndex < monthDays.length) {
          const dayEvents = getDayEvents(monthDays[dayIndex].date);
          const dayTasks = getDayTasks(monthDays[dayIndex].date);
          const itemCount = dayEvents.length + dayTasks.length;
          maxItemsInRow = Math.max(maxItemsInRow, itemCount);
          
          // Get multi-day items that actually affect this specific day
          const dayMultiDayItems = getMultiDayItemsForDay(dayIndex);
          if (dayMultiDayItems.length > 0) {
            const maxLevelForThisDay = Math.max(...dayMultiDayItems.map(item => item.rowLevel)) + 1;
            maxMultiDayLevelsInRow = Math.max(maxMultiDayLevelsInRow, maxLevelForThisDay);
          }
        }
      }
      
      // Calculate height based on the maximum multi-day levels needed in any day of this row
      const multiDaySpace = maxMultiDayLevelsInRow * 28;
      const singleItemSpace = Math.max(maxItemsInRow * 22, 40);
      const padding = 16;
      
      rowHeights.push(Math.max(120, dateHeaderHeight + multiDaySpace + singleItemSpace + padding));
    }
    
    return rowHeights;
  };

  const rowHeights = getRowHeights();
  const totalHeight = rowHeights.reduce((sum, height) => sum + height, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Week headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day, dayIndex) => (
          <div key={`weekday-${dayIndex}`} className="p-3 text-sm font-medium text-muted-foreground text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 relative overflow-auto">
        {/* Multi-day items overlay */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {multiDayItems.map((item) => {
            // Calculate positions to match the px-2 padding of the content area
            const cellWidth = 100 / 7; // Each cell takes exactly 1/7 of the width
            const paddingPercent = 0.7; // Approximate equivalent of px-2 padding (8px)
            
            const rawWidth = ((item.endCol - item.startCol + 1) * cellWidth);
            const rawLeft = (item.startCol * cellWidth);
            
            // Apply padding to match single-day items
            const width = rawWidth - (paddingPercent * 2);
            const left = rawLeft + paddingPercent;
            
            // Calculate cumulative top position - add date header height (32px)
            const cumulativeHeight = rowHeights.slice(0, item.row).reduce((sum, h) => sum + h, 0);
            const topInRow = item.rowLevel * 28 + 32 + 4; // 32px for date header + 4px margin
            const top = cumulativeHeight + topInRow;
            
            const textColor = item.type === 'event' ? getTextColor(item.color) : undefined;
            
            return (
              <div
                key={item.id}
                className="absolute pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  left: `${left}%`,
                  top: `${top}px`,
                  width: `${width}%`,
                  height: '24px',
                  zIndex: 20
                }}
                tabIndex={0}
                role="button"
                aria-label={`${item.type === 'event' ? t('event') : t('task')}: ${item.title}`}
              >
                {item.type === 'event' ? (
                  <div
                    className="w-full h-full rounded-md px-2 py-1 text-xs font-medium truncate flex items-center transition-colors"
                    style={{ 
                      backgroundColor: item.color,
                      color: textColor
                    }}
                    title={`${t('event')}: ${item.title}`}
                  >
                    {item.title}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "w-full h-full rounded-md px-2 py-1 text-xs font-medium truncate flex items-center border-2 transition-colors",
                      item.priority === 'high' && "border-destructive bg-red-50 text-red-900",
                      item.priority === 'medium' && "border-yellow-500 bg-yellow-50 text-yellow-900",
                      item.priority === 'low' && "border-green-500 bg-green-50 text-green-900",
                      !item.priority && "border-gray-400 bg-gray-50 text-gray-900"
                    )}
                    title={`${t('task')}: ${item.title} (${t('priority')}: ${item.priority || t('normal')})`}
                  >
                    {item.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar days grid with dynamic heights */}
        <div className="grid grid-cols-7" style={{ height: `${totalHeight}px` }}>
          {monthDays.map((calendarDate, index) => {
            const dayEvents = getDayEvents(calendarDate.date);
            const dayTasks = getDayTasks(calendarDate.date);
            const rowIndex = Math.floor(index / 7);
            const rowHeight = rowHeights[rowIndex];
            
            // Calculate space needed for multi-day items that actually affect THIS specific day
            const dayMultiDayItems = getMultiDayItemsForDay(index);
            const multiDaySpace = dayMultiDayItems.length > 0 
              ? (Math.max(...dayMultiDayItems.map(item => item.rowLevel)) + 1) * 28 
              : 0;
            
            return (
              <div
                key={index}
                className={cn(
                  "border-r border-b flex flex-col focus-within:bg-blue-50 transition-colors cursor-pointer hover:bg-accent/50",
                  !calendarDate.isCurrentMonth && "bg-muted/20",
                  calendarDate.isToday && "bg-primary/5"
                )}
                style={{ height: `${rowHeight}px` }}
                role="gridcell"
                aria-label={`${calendarDate.date.toLocaleDateString()} - ${dayEvents.length + dayTasks.length} ${t('items', { count: dayEvents.length + dayTasks.length })}`}
                onClick={() => onDayClick(calendarDate.date)}
              >
                {/* Date number - always at the top */}
                <div className="flex justify-between items-start p-2 h-8 relative z-30">
                  <span
                    className={cn(
                      "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                      calendarDate.isToday && "bg-primary text-primary-foreground",
                      !calendarDate.isCurrentMonth && "text-muted-foreground"
                    )}
                    aria-label={`${t('day')} ${calendarDate.date.getDate()}`}
                  >
                    {calendarDate.date.getDate()}
                  </span>
                </div>

                {/* Content area with space for multi-day items that affect this day only */}
                <div 
                  className="flex-1 px-2 pb-2 overflow-hidden"
                  style={{ 
                    paddingTop: `${multiDaySpace + 4}px` // Space only for multi-day items that affect this day
                  }}
                  role="list"
                >
                  {/* Single-day events */}
                  {dayEvents.map(renderSingleDayEvent)}

                  {/* Single-day tasks */}
                  {dayTasks.map(renderSingleDayTask)}

                  {/* Show more indicator */}
                  {(dayEvents.length + dayTasks.length) > 8 && (
                    <div 
                      className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                      tabIndex={0}
                      role="button"
                      aria-label={`${t('showMore')} ${(dayEvents.length + dayTasks.length) - 8} ${t('items', { count: (dayEvents.length + dayTasks.length) - 8 })}`}
                    >
                      +{(dayEvents.length + dayTasks.length) - 8} {t('more')}
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