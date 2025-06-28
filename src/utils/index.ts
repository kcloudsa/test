import type { CalendarDate, Event, Task } from '@/types';
import Cookies from 'js-cookie';

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTime = (time: string): string => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const getWeekDays = (date: Date): Date[] => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
};

export const getMonthDays = (date: Date): CalendarDate[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days: CalendarDate[] = [];
  const today = new Date();
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    days.push({
      date: currentDate,
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.toDateString() === today.toDateString(),
      events: [],
      tasks: [],
    });
  }
  
  return days;
};

export const getYearMonths = (year: number): Date[] => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    months.push(new Date(year, i, 1));
  }
  return months;
};

export const filterEventsByDate = (events: Event[], date: string): Event[] => {
  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const targetDate = new Date(date);
    
    return targetDate >= eventStart && targetDate <= eventEnd;
  });
};

export const filterTasksByDate = (tasks: Task[], date: string): Task[] => {
  return tasks.filter(task => task.date === date);
};

// You'll need to add these utility functions to handle multi-day items

export const isEventOnDate = (event: Event, dateStr: string): boolean => {
  const targetDate = new Date(dateStr);
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  return targetDate >= startDate && targetDate <= endDate;
};

export const isTaskOnDate = (task: Task, dateStr: string): boolean => {
  const targetDate = new Date(dateStr);
  const startDate = new Date(task.date);
  const endDate = new Date(task.endDate || task.date);
  
  return targetDate >= startDate && targetDate <= endDate;
};

export const filterEventsByDateRange = (events: Event[], dateStr: string): Event[] => {
  return events.filter(event => isEventOnDate(event, dateStr));
};

export const filterTasksByDateRange = (tasks: Task[], dateStr: string): Task[] => {
  return tasks.filter(task => isTaskOnDate(task, dateStr));
};

export const getEventDaysInRange = (event: Event, startDate: Date, endDate: Date): Date[] => {
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);
  const rangeStart = new Date(Math.max(eventStart.getTime(), startDate.getTime()));
  const rangeEnd = new Date(Math.min(eventEnd.getTime(), endDate.getTime()));
  
  const days: Date[] = [];
  const currentDate = new Date(rangeStart);
  
  while (currentDate <= rangeEnd) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

export const isMultiDayEvent = (event: Event): boolean => {
  return event.startDate !== event.endDate;
};

export const isMultiDayTask = (task: Task): boolean => {
  return !!task.endDate && task.date !== task.endDate;
};

export const getEventPositionInDay = (event: Event, currentDate: Date): 'start' | 'middle' | 'end' | 'single' => {
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);
  const current = new Date(currentDate);
  
  if (eventStart.getTime() === eventEnd.getTime()) return 'single';
  if (current.getTime() === eventStart.getTime()) return 'start';
  if (current.getTime() === eventEnd.getTime()) return 'end';
  return 'middle';
};

export const THEME_COOKIE_NAME = 'k-cloud-theme';
export const SUPPORTED_THEMES = ['light', 'dark', 'system'] as const;
export type SupportedTheme = typeof SUPPORTED_THEMES[number];
export type ResolvedTheme = 'light' | 'dark';

export const getThemeFromCookie = (): SupportedTheme | null => {
  const cookieTheme = Cookies.get(THEME_COOKIE_NAME);
  return cookieTheme && SUPPORTED_THEMES.includes(cookieTheme as SupportedTheme) 
    ? cookieTheme as SupportedTheme 
    : null;
};

export const setThemeCookie = (theme: SupportedTheme) => {
  Cookies.set(THEME_COOKIE_NAME, theme, {
    expires: 365, // 1 year
    path: '/',
    sameSite: 'lax'
  });
};

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const getDefaultTheme = (): SupportedTheme => {
  return getThemeFromCookie() || 'system';
};

export const resolveTheme = (theme: SupportedTheme): ResolvedTheme => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const applyTheme = (theme: ResolvedTheme) => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
};