"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { CalendarView, Event, Task } from "@/types";
import YearView from "./Views/YearView";
import MonthView from "./Views/MonthView";
import WeekView from "./Views/WeekView";
import DayView from "./Views/DayView";
import { useApiQuery } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";

// Define the data structure interfaces
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Property {
  id: string;
  address: string;
  type: string;
}

// Define the raw task data structure from JSON
interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "overdue" | "todo";
  assignedTo: string; // ID reference
  property: string; // ID reference
  dueDate: string;
  createdAt: string;
  category:
    | "maintenance"
    | "inspection"
    | "cleaning"
    | "marketing"
    | "administrative";
  isStarred?: boolean;
  isArchived?: boolean;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [events, setEvents] = useState<Event[]>([]);
  const { t, i18n } = useTranslation("calendar");

  const strings = {
    Calendar: t("title"),
    day: t("views.day"),
    week: t("views.week"),
    month: t("views.month"),
    year: t("views.year"),
    today: t("today"),
    add: t("add"),
  };

  // Load task data from JSON
  const { data: tasksData = [] } = useApiQuery<TaskData[]>({
    queryKey: ["tasks"],
    endpoint: "/data/tasks.json",
    useLocalJson: true,
    options: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnMount: false,
    },
  });

  // Load users data
  const { data: usersData = [] } = useApiQuery<User[]>({
    queryKey: ["users"],
    endpoint: "/data/users.json",
    useLocalJson: true,
    options: {
      staleTime: 30 * 60 * 1000, // 30 minutes
    },
  });

  // Load properties data
  const { data: propertiesData = [] } = useApiQuery<Property[]>({
    queryKey: ["properties"],
    endpoint: "/data/properties.json",
    useLocalJson: true,
    options: {
      staleTime: 30 * 60 * 1000, // 30 minutes
    },
  }); // Transform tasks to match the expected Task interface for calendar views
  const transformedTasks: Task[] = tasksData.map((taskData) => ({
    id: taskData.id,
    title: taskData.title,
    description: taskData.description,
    date: taskData.dueDate, // Map dueDate to date
    time: "09:00", // Default time since the task data doesn't have specific times
    endTime: undefined,
    completed: taskData.status === "completed", // Map status to completed boolean
    priority: taskData.priority,
    category: taskData.category,
    endDate: undefined, // Tasks don't have end dates in the current structure
    // Additional properties for reference in views
    assignedTo: usersData.find((user) => user.id === taskData.assignedTo),
    property: propertiesData.find(
      (property) => property.id === taskData.property,
    ),
    status: taskData.status,
    isStarred: taskData.isStarred,
    isArchived: taskData.isArchived,
  }));

  useEffect(() => {
    setEvents([] as Event[]);
    // Remove setTasks since it's now handled by useApiQuery
  }, []);

  // Handle day click navigation
  const handleDayClick = (date: Date) => {
    setCurrentDate(new Date(date));
    setView("day");
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeText = () => {
    const locale = i18n.language;

    switch (view) {
      case "day":
        return currentDate.toLocaleDateString(locale, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          calendar: "gregory",
        });
      case "week": {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString(locale, { month: "short", day: "numeric", calendar: "gregory" })} - ${weekEnd.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric", calendar: "gregory" })}`;
      }
      case "month":
        return currentDate.toLocaleDateString(locale, {
          year: "numeric",
          month: "long",
          calendar: "gregory",
        });
      case "year":
        return currentDate.getFullYear().toString();
      default:
        return "";
    }
  };
  const renderCalendarView = () => {
    const props = {
      currentDate,
      events,
      tasks: transformedTasks,
      onDayClick: handleDayClick,
    };

    switch (view) {
      case "year":
        return <YearView {...props} />;
      case "month":
        return <MonthView {...props} />;
      case "week":
        return <WeekView {...props} />;
      case "day":
        return <DayView {...props} />;
      default:
        return <MonthView {...props} />;
    }
  };

  const ViewSelector = () => (
    <div className="flex overflow-hidden rounded-lg border bg-background">
      {(["day", "week", "month", "year"] as CalendarView[]).map(
        (viewOption) => (
          <Button
            key={viewOption}
            variant={view === viewOption ? "default" : "ghost"}
            size="sm"
            onClick={() => setView(viewOption)}
            className={cn(
              "flex-1 rounded-none px-2 py-1.5 text-xs transition-all duration-200 sm:px-3 sm:text-sm",
              view === viewOption
                ? "shadow-md hover:bg-primary/90"
                : "hover:bg-accent/80",
            )}
          >
            <span className="hidden sm:inline">
              {strings[viewOption as keyof typeof strings]}
            </span>
            <span className="sm:hidden">
              {strings[viewOption as keyof typeof strings]
                .charAt(0)
                .toUpperCase()}
            </span>
          </Button>
        ),
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col" dir="ltr">
      {/* Date and controls row */}
      <div className="flex items-center justify-center px-6 py-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
        <Card className="@container/card rounded-xl w-full border p-3">
          <div className="mb-3 flex justify-between text-center">
            <div className="w-20"></div>
            <div className="mb-1 text-base font-semibold">
              {getDateRangeText()}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("prev")}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("next")}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="px-3 text-xs"
            >
              {strings.today}
            </Button>

            <div className="flex-1">
              <ViewSelector />
            </div>

            <Button size="sm" className="gap-1 px-3 text-xs">
              <Plus className="h-3 w-3" />
              <span className="xs:inline hidden">{strings.add}</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Calendar Content */}
      <div className="animate-fade-in flex-1 overflow-hidden overflow-x-auto overflow-y-auto md:h-[90%] ">
        {renderCalendarView()}
      </div>
    </div>
  );
}
