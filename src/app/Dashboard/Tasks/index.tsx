"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  PauseCircle,
  Archive,
  Flag,
  MessageSquare,
  Paperclip,
  Share2,
  Copy,
  Calendar as CalendarIcon,
  Star,
  StarOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Import the Select component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import the Skeleton component
import { Skeleton } from "@/components/ui/skeleton";

// Import the useApi hook
import { useApiQuery } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Data types
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

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed" | "overdue" | "todo";
  assignedTo: User | null;
  property: Property;
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

// Skeleton components for loading states
const TaskCardSkeleton = ({ isRTL }: { isRTL: boolean }) => (
  <div className="rounded-lg border border-border bg-card p-6">
    <div className="mb-4 flex items-start justify-between">
      <div className="flex-1">
        <div className={`mb-1 flex items-center gap-2`}>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className={`mb-3 h-4 w-full ${isRTL ? "ml-auto" : ""}`} />
        <Skeleton className={`mb-3 h-4 w-3/4 ${isRTL ? "ml-auto" : ""}`} />

        <div className={`mb-3 flex flex-wrap items-center gap-4`}>
          <div className={`flex items-center gap-1`}>
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className={`flex items-center gap-1`}>
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className={`mb-3 flex flex-wrap items-center gap-2`}>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        <div className={`flex items-center gap-2`}>
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  </div>
);

const TasksSkeleton = ({ isRTL }: { isRTL: boolean }) => (
  <main
    className={`flex h-full flex-col bg-background ${isRTL ? "rtl" : "ltr"}`}
    dir={isRTL ? "rtl" : "ltr"}
  >
    {/* Header Skeleton */}
    <div className="border-b border-border bg-card px-6 py-4">
      <div
        className={`flex flex-col gap-4 xl:flex-row ${isRTL ? "xl:flex-row-reverse" : ""}`}
      >
        {/* Search Skeleton */}
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* Filters Skeleton */}
        <div className={`flex flex-wrap justify-center gap-2`}>
          <Skeleton className="h-10 w-[140px] rounded-lg" />
          <Skeleton className="h-10 w-[140px] rounded-lg" />
          <Skeleton className="h-10 w-[140px] rounded-lg" />
          <Skeleton className="h-10 w-[140px] rounded-lg" />
        </div>

        {/* Create Button Skeleton */}
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="px-6 py-4">
      <div
        className={`no-scrollbar flex w-full justify-start gap-4 overflow-x-auto p-1`}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`min-w-[200px] rounded-lg border bg-card p-4 xl:w-full ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className={`flex items-center justify-between`}>
              <div className="hidden space-y-2 xl:block">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Task Sections Skeleton */}
    <div className="flex-1 space-y-4 px-6 pb-6">
      {[...Array(3)].map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          {/* Section Header Skeleton */}
          <div className={`flex items-center justify-between px-6 py-4`}>
            <div className={`flex items-center gap-3`}>
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div
                className={`space-y-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-6 rounded" />
          </div>

          {/* Task Cards Skeleton */}
          <div className="space-y-4 px-6 pb-6">
            {[...Array(2)].map((_, cardIndex) => (
              <TaskCardSkeleton key={cardIndex} isRTL={isRTL} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </main>
);

export default function Tasks() {
  const { t, i18n } = useTranslation("tasks");
  const isRTL = i18n.language === "ar-SA" || i18n.language === "ar";

  // Fetch data from API
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useApiQuery<User[]>({
    queryKey: ["users"],
    endpoint: "/data/users.json",
    useLocalJson: true,
    options: {
      staleTime: 1000 * 60 * 30, // 30 minutes
    },
  });

  const {
    data: properties = [],
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useApiQuery<Property[]>({
    queryKey: ["properties"],
    endpoint: "/data/properties.json",
    useLocalJson: true,
    options: {
      staleTime: 1000 * 60 * 30, // 30 minutes
    },
  });

  const {
    data: tasksData = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = useApiQuery<Task[]>({
    queryKey: ["tasks"],
    endpoint: "/data/tasks.json",
    useLocalJson: true,
    options: {
      staleTime: 1000 * 60 * 30, // 30 minutes
    },
  });

  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeStatusCard, setActiveStatusCard] = useState<string | null>(null);

  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({
    overdue: false,
    pending: false,
    "in-progress": false,
    todo: false,
    completed: true, // Collapsed by default
  });

  // Initialize tasks and update statuses when data is loaded
  useEffect(() => {
    if (tasksData.length > 0) {
      // Update statuses based on due dates
      const today = new Date().toISOString().split("T")[0];
      const updatedTasks = tasksData.map((task) => {
        if (task.status === "completed" || task.status === "in-progress") {
          return task; // Don't change completed or in-progress tasks
        }
        if (task.dueDate < today) {
          return { ...task, status: "overdue" as const };
        } else if (task.dueDate === today) {
          return { ...task, status: "pending" as const };
        } else {
          return { ...task, status: "todo" as const };
        }
      });
      setTasks(updatedTasks);
    }
  }, [tasksData]);

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      activeStatusCard !== null ||
      statusFilter !== "all" ||
      priorityFilter !== "all" ||
      assigneeFilter !== "all" ||
      categoryFilter !== "all" ||
      searchTerm.trim() !== ""
    );
  };

  // Filter tasks based on search, filters, and active status card
  useEffect(() => {
    let filtered = tasks;

    // Apply active status card filter first
    if (activeStatusCard && activeStatusCard !== "all") {
      filtered = filtered.filter((task) => task.status === activeStatusCard);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.property.address
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all" && !activeStatusCard) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    if (assigneeFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.assignedTo?.id === assigneeFilter,
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((task) => task.category === categoryFilter);
    }

    setFilteredTasks(filtered);
  }, [
    tasks,
    searchTerm,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    categoryFilter,
    activeStatusCard,
  ]);

  const handleStatusCardClick = (status: string) => {
    if (activeStatusCard === status) {
      // If already active, deactivate it
      setActiveStatusCard(null);
      setStatusFilter("all");
    } else {
      // Activate this status filter
      setActiveStatusCard(status);
      setStatusFilter("all"); // Reset dropdown filter
    }
  };

  const toggleSection = (status: string) => {
    // Only allow toggling if no filters are active
    if (!hasActiveFilters()) {
      setCollapsedSections((prev) => ({
        ...prev,
        [status]: !prev[status],
      }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20";
      case "pending":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20";
      case "todo":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20";
      case "overdue":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      case "todo":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSectionTitle = (status: string) => {
    switch (status) {
      case "overdue":
        return t("overdueTasksTitle");
      case "pending":
        return t("dueTodayTitle");
      case "in-progress":
        return t("inProgressTitle");
      case "todo":
        return t("toDoFutureTitle");
      case "completed":
        return t("completedTasksTitle");
      default:
        return status;
    }
  };

  const getSectionColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "text-destructive";
      case "pending":
        return "text-orange-600 dark:text-orange-500";
      case "in-progress":
        return "text-blue-600 dark:text-blue-400";
      case "todo":
        return "text-purple-600 dark:text-purple-500";
      case "completed":
        return "text-green-600 dark:text-green-500";
      default:
        return "text-foreground";
    }
  };

  const handleTaskAction = (action: string, task: Task) => {
    switch (action) {
      case "view":
        // setSelectedTask(task);
        // setIsViewModalOpen(true);
        break;
      case "edit":
        // setSelectedTask(task);
        // setIsEditModalOpen(true);
        break;
      case "delete":
        if (confirm(t("modal.confirmDelete"))) {
          setTasks(tasks.filter((t) => t.id !== task.id));
        }
        break;
      case "complete":
        setTasks(
          tasks.map((t) =>
            t.id === task.id ? { ...t, status: "completed" as const } : t,
          ),
        );
        break;
      case "start":
        setTasks(
          tasks.map((t) =>
            t.id === task.id ? { ...t, status: "in-progress" as const } : t,
          ),
        );
        break;
      case "pause":
        setTasks(
          tasks.map((t) =>
            t.id === task.id ? { ...t, status: "pending" as const } : t,
          ),
        );
        break;
      case "archive":
        setTasks(
          tasks.map((t) => (t.id === task.id ? { ...t, isArchived: true } : t)),
        );
        break;
      case "star":
        setTasks(
          tasks.map((t) =>
            t.id === task.id ? { ...t, isStarred: !t.isStarred } : t,
          ),
        );
        break;
      case "setPriority":
        console.log("Set priority for task", task.id);
        break;
      case "reschedule":
        console.log("Reschedule task", task.id);
        break;
      case "reassign":
        console.log("Reassign task", task.id);
        break;
      case "addComment":
        console.log("Add comment to task", task.id);
        break;
      case "addAttachment":
        console.log("Add attachment to task", task.id);
        break;
      case "share":
        console.log("Share task", task.id);
        break;
      case "duplicate": {
        const newTask = {
          ...task,
          id: Date.now().toString(),
          title: `${task.title} (Copy)`,
          status: "todo" as const,
          createdAt: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // Tomorrow
        };
        setTasks([...tasks, newTask]);
        break;
      }
    }
    setOpenDropdown(null);
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className={`mb-1 flex items-center gap-2`}>
            <h3 className="font-semibold text-foreground">{task.title}</h3>
            {task.isStarred && (
              <Star className="h-4 w-4 fill-current text-yellow-500" />
            )}
          </div>
          <p
            className={`mb-3 text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
          >
            {task.description}
          </p>

          <div
            className={`mb-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground`}
          >
            <div className={`flex items-center gap-1`}>
              <MapPin className="h-4 w-4" />
              <span>{task.property.address}</span>
            </div>
            <div className={`flex items-center gap-1`}>
              <Calendar className="h-4 w-4" />
              <span>
                {t("due")}{" "}
                {new Date(task.dueDate).toLocaleDateString(
                  isRTL ? "ar-SA" : "en-US",
                )}
              </span>
            </div>
          </div>

          <div className={`mb-3 flex flex-wrap items-center gap-2`}>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}
            >
              {t(`priority.${task.priority}`)}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(task.status)}`}
            >
              {getStatusIcon(task.status)}
              {t(`status.${task.status}`)}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              {t(`category.${task.category}`)}
            </span>
          </div>

          {task.assignedTo && (
            <div className={`flex items-center gap-2`}>
              <User className="h-4 w-4 text-muted-foreground" />
              <span
                className={`text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("assignedTo")}{" "}
                <span className="font-medium text-foreground">
                  {task.assignedTo.name}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === task.id ? null : task.id);
            }}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {openDropdown === task.id && (
            <div
              className={`absolute ${isRTL ? "left-10" : "right-10"} -top-10 z-10 max-h-62 min-w-[180px] overflow-y-auto rounded-md border border-border bg-card shadow-2xl`}
            >
              {/* View & Edit */}
              <button
                onClick={() => handleTaskAction("view", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <Eye className="h-4 w-4" />
                {t("actions.viewDetails")}
              </button>
              <button
                onClick={() => handleTaskAction("edit", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <Edit className="h-4 w-4" />
                {t("actions.editTask")}
              </button>

              <hr className="my-1 border-border" />

              {/* Status Actions */}
              {task.status === "todo" || task.status === "pending" ? (
                <button
                  onClick={() => handleTaskAction("start", task)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                >
                  <PlayCircle className="h-4 w-4" />
                  {t("actions.startTask")}
                </button>
              ) : null}

              {task.status === "in-progress" && (
                <button
                  onClick={() => handleTaskAction("pause", task)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                >
                  <PauseCircle className="h-4 w-4" />
                  {t("actions.pauseTask")}
                </button>
              )}

              {task.status !== "completed" && (
                <button
                  onClick={() => handleTaskAction("complete", task)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                >
                  <CheckCircle className="h-4 w-4" />
                  {t("actions.markComplete")}
                </button>
              )}

              <hr className="my-1 border-border" />

              {/* Task Management */}
              <button
                onClick={() => handleTaskAction("star", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                {task.isStarred ? (
                  <>
                    <StarOff className="h-4 w-4" />
                    {t("actions.removeStar")}
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" />
                    {t("actions.addStar")}
                  </>
                )}
              </button>

              <button
                onClick={() => handleTaskAction("setPriority", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <Flag className="h-4 w-4" />
                {t("actions.setPriority")}
              </button>

              <button
                onClick={() => handleTaskAction("reschedule", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <CalendarIcon className="h-4 w-4" />
                {t("actions.reschedule")}
              </button>

              <button
                onClick={() => handleTaskAction("reassign", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <UserPlus className="h-4 w-4" />
                {t("actions.reassign")}
              </button>

              <hr className="my-1 border-border" />

              {/* Communication & Collaboration */}
              <button
                onClick={() => handleTaskAction("addComment", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <MessageSquare className="h-4 w-4" />
                {t("actions.addComment")}
              </button>

              <button
                onClick={() => handleTaskAction("addAttachment", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <Paperclip className="h-4 w-4" />
                {t("actions.addAttachment")}
              </button>

              <button
                onClick={() => handleTaskAction("share", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <Share2 className="h-4 w-4" />
                {t("actions.shareTask")}
              </button>

              <hr className="my-1 border-border" />

              {/* Additional Actions */}
              <button
                onClick={() => handleTaskAction("duplicate", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <Copy className="h-4 w-4" />
                {t("actions.duplicate")}
              </button>

              <button
                onClick={() => handleTaskAction("archive", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <Archive className="h-4 w-4" />
                {t("actions.archive")}
              </button>

              <hr className="my-1 border-border" />

              {/* Destructive Action */}
              <button
                onClick={() => handleTaskAction("delete", task)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <Trash2 className="h-4 w-4" />
                {t("actions.deleteTask")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CreateTaskModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${isCreateModalOpen ? "" : "hidden"}`}
    >
      <div className="mx-4 w-full max-w-md rounded-lg border border-border bg-card p-6">
        <h2
          className={`mb-4 text-lg font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("modal.createNewTask")}
        </h2>

        <form className="space-y-4">
          <div>
            <label
              className={`mb-1 block text-sm font-medium text-foreground ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("modal.title")}
            </label>
            <input
              type="text"
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none ${isRTL ? "text-right" : "text-left"}`}
              placeholder={t("modal.enterTaskTitle")}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <label
              className={`mb-1 block text-sm font-medium text-foreground ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("modal.description")}
            </label>
            <textarea
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none ${isRTL ? "text-right" : "text-left"}`}
              rows={3}
              placeholder={t("modal.enterTaskDescription")}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`mb-1 block text-sm font-medium text-foreground ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("modal.priority")}
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("modal.selectPriority")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    {t("priority.low").replace(" Priority", "")}
                  </SelectItem>
                  <SelectItem value="medium">
                    {t("priority.medium").replace(" Priority", "")}
                  </SelectItem>
                  <SelectItem value="high">
                    {t("priority.high").replace(" Priority", "")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                className={`mb-1 block text-sm font-medium text-foreground ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("modal.category")}
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("modal.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">
                    {t("category.maintenance")}
                  </SelectItem>
                  <SelectItem value="inspection">
                    {t("category.inspection")}
                  </SelectItem>
                  <SelectItem value="cleaning">
                    {t("category.cleaning")}
                  </SelectItem>
                  <SelectItem value="marketing">
                    {t("category.marketing")}
                  </SelectItem>
                  <SelectItem value="administrative">
                    {t("category.administrative")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label
              className={`mb-1 block text-sm font-medium text-foreground ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("modal.property")}
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("modal.selectProperty")} />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              className={`mb-1 block text-sm font-medium text-foreground ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("modal.assignTo")}
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("modal.selectUser")} />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              className={`mb-1 block text-sm font-medium text-foreground ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("modal.dueDate")}
            </label>
            <input
              type="date"
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none ${isRTL ? "text-right" : "text-left"}`}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          <div className={`flex gap-2 pt-4`}>
            <Button variant={"default"} type="submit" className="w-1/2">
              {t("createTask")}
            </Button>
            <Button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              variant={"secondary"}
              className="w-1/2"
            >
              {t("modal.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // Group tasks by status
  const groupedTasks = {
    overdue: filteredTasks.filter((task) => task.status === "overdue"),
    pending: filteredTasks.filter((task) => task.status === "pending"),
    "in-progress": filteredTasks.filter(
      (task) => task.status === "in-progress",
    ),
    todo: filteredTasks.filter((task) => task.status === "todo"),
    completed: filteredTasks.filter((task) => task.status === "completed"),
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // When filters are active, force all sections to be expanded
  const isFiltered = hasActiveFilters();

  // Show skeleton loading state
  if (usersLoading || propertiesLoading || tasksLoading) {
    return <TasksSkeleton isRTL={isRTL} />;
  }

  // Show error state
  if (usersError || propertiesError || tasksError) {
    return (
      <main className="flex h-full flex-col bg-background">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
            <p className="text-destructive">{t("errorLoadingTasks")}</p>
            <p className="mt-2 text-muted-foreground">{t("tryRefreshing")}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`flex h-full flex-col bg-background ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Filters and Search */}
      <div className="flex items-center justify-center px-6 py-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
        <Card className="@container/card rounded-xl w-full border p-3">
        <div
          className={`flex flex-col gap-4 xl:flex-row ${isRTL ? "xl:flex-row-reverse" : ""}`}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground`}
            />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? "pr-10 pl-4" : "pr-4 pl-10"} rounded-lg border border-input bg-background py-2 text-foreground focus:border-transparent focus:ring-2 focus:ring-ring focus:outline-none ${isRTL ? "text-right" : "text-left"}`}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          {/* Filters */}
          <div className={`flex flex-wrap justify-center gap-2`}>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setActiveStatusCard(null); // Reset active card when using dropdown
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="overdue">{t("overdue")}</SelectItem>
                <SelectItem value="pending">{t("dueToday")}</SelectItem>
                <SelectItem value="in-progress">{t("inProgress")}</SelectItem>
                <SelectItem value="todo">{t("toDo")}</SelectItem>
                <SelectItem value="completed">{t("completed")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("allPriority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allPriority")}</SelectItem>
                <SelectItem value="high">
                  {t("priority.high").replace(" Priority", "")}
                </SelectItem>
                <SelectItem value="medium">
                  {t("priority.medium").replace(" Priority", "")}
                </SelectItem>
                <SelectItem value="low">
                  {t("priority.low").replace(" Priority", "")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                <SelectItem value="maintenance">
                  {t("category.maintenance")}
                </SelectItem>
                <SelectItem value="inspection">
                  {t("category.inspection")}
                </SelectItem>
                <SelectItem value="cleaning">
                  {t("category.cleaning")}
                </SelectItem>
                <SelectItem value="marketing">
                  {t("category.marketing")}
                </SelectItem>
                <SelectItem value="administrative">
                  {t("category.administrative")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("allAssignees")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allAssignees")}</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Create Task Button */}
          <Button
            variant={"default"}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t("createTask")}
          </Button>
        </div>
        </Card>
      </div>

      {/* Task Stats - Clickable Cards */}
      <div className="px-6 py-4">
        <div
          className={`no-scrollbar flex w-full justify-start gap-4 overflow-x-auto p-1`}
        >
          <button
            onClick={() => handleStatusCardClick("overdue")}
            className={`rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md xl:w-full ${
              activeStatusCard === "overdue"
                ? "border-destructive ring-2 ring-destructive"
                : "border-border"
            } ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className={`flex items-center justify-between`}>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("overdue")}
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {tasks.filter((t) => t.status === "overdue").length}
                </p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </button>

          <button
            onClick={() => handleStatusCardClick("pending")}
            className={`rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md xl:w-full ${
              activeStatusCard === "pending"
                ? "border-orange-500 ring-2 ring-orange-500"
                : "border-border"
            } ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className={`flex items-center justify-between`}>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("dueToday")}
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                  {tasks.filter((t) => t.status === "pending").length}
                </p>
              </div>
              <div className="rounded-lg bg-orange-500/10 p-2">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              </div>
            </div>
          </button>

          <button
            onClick={() => handleStatusCardClick("in-progress")}
            className={`rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md xl:w-full ${
              activeStatusCard === "in-progress"
                ? "border-blue-500 ring-2 ring-blue-500"
                : "border-border"
            } ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className={`flex items-center justify-between`}>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("inProgress")}
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {tasks.filter((t) => t.status === "in-progress").length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </button>

          <button
            onClick={() => handleStatusCardClick("todo")}
            className={`rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md xl:w-full ${
              activeStatusCard === "todo"
                ? "border-purple-500 ring-2 ring-purple-500"
                : "border-border"
            } ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className={`flex items-center justify-between`}>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("toDo")}
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                  {tasks.filter((t) => t.status === "todo").length}
                </p>
              </div>
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
          </button>

          <button
            onClick={() => handleStatusCardClick("completed")}
            className={`rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md xl:w-full ${
              activeStatusCard === "completed"
                ? "border-green-500 ring-2 ring-green-500"
                : "border-border"
            } ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className={`flex items-center justify-between`}>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("completed")}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                  {tasks.filter((t) => t.status === "completed").length}
                </p>
              </div>
              <div className="rounded-lg bg-green-500/10 p-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </button>
        </div>

        {activeStatusCard && (
          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3">
            <p
              className={`text-sm text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("filteringBy")}{" "}
              <span className="font-medium text-foreground capitalize">
                {activeStatusCard === "todo" ? t("toDo") : t(activeStatusCard)}
              </span>
              <button
                onClick={() => setActiveStatusCard(null)}
                className={`text-xs text-primary hover:underline ${isRTL ? "mr-2" : "ml-2"}`}
              >
                {t("clearFilter")}
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Collapsible Task Sections */}
      <div className="flex-1 space-y-4 px-6 pb-6">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => {
          if (statusTasks.length === 0) return null;

          // When filtered, always show content (don't collapse)
          const isExpanded = isFiltered || !collapsedSections[status];

          return (
            <div
              key={status}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              <button
                onClick={() => toggleSection(status)}
                className={`flex w-full items-center justify-between px-6 py-4 transition-colors ${
                  isFiltered
                    ? "cursor-default bg-muted/30"
                    : "cursor-pointer hover:bg-muted/50"
                }`}
                disabled={isFiltered}
              >
                <div className={`flex items-center gap-3`}>
                  <div
                    className={`rounded-lg p-2 ${
                      status === "overdue"
                        ? "bg-destructive/10"
                        : status === "pending"
                          ? "bg-orange-500/10"
                          : status === "in-progress"
                            ? "bg-blue-500/10"
                            : status === "todo"
                              ? "bg-purple-500/10"
                              : "bg-green-500/10"
                    }`}
                  >
                    {getStatusIcon(status)}
                  </div>
                  <div
                    className={`text-left ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <h3 className={`font-semibold ${getSectionColor(status)}`}>
                      {getSectionTitle(status)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("taskCount", { count: statusTasks.length })}
                      {isFiltered && (
                        <span
                          className={`text-xs text-primary ${isRTL ? "mr-1" : "ml-1"}`}
                        >
                          {t("filtered")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {!isFiltered && (
                  <div className="rounded-md border border-border bg-background p-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </button>

              {isExpanded && (
                <div className="space-y-4 px-6 pb-6">
                  {statusTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center">
            <Filter className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {t("noTasksFound")}
            </h3>
            <p className="text-muted-foreground">{t("tryAdjustingFilters")}</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal />
    </main>
  );
}