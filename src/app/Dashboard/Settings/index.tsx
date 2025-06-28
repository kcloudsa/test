import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertTriangle,
  Users,
  Bell,
  Palette,
  Database,
  Building,
  Activity,
  Settings as SettingsIcon,
  Clock,
  Upload,
} from "lucide-react";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";

// Import tab components
import { AppearanceTab } from "./Tabs/AppearanceTab";
import { GeneralTab } from "./Tabs/GeneralTab";
import { NotificationsTab } from "./Tabs/NotificationsTab";
import { MembersTab } from "./Tabs/MembersTab";
import { DataTab } from "./Tabs/DataTab";
import { BrandingTab } from "./Tabs/BrandingTab";
import { HistoryTab } from "./Tabs/HistoryTab";
import { DangerTab } from "./Tabs/DangerTab";

import type {
  Timezone,
  Currency,
  Member,
  UserSettings,
  EditMemberForm,
  NewMemberForm,
} from "@/types";

export interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  csvSupported: boolean;
  xlsxSupported: boolean;
  estimatedSize: string;
  lastExported: string;
}

// Import JSON data directly
import timezonesData from "./timezones.json";
import currenciesData from "./currencies.json";

export default function Settings() {
  const { t } = useTranslation("settings");

  const [settings, setSettings] = useState<UserSettings>({
    currency: "USD",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    landingPage: "dashboard",
    language: "en-US",
    theme: "system",
    color: "default",
    fontSize: "medium",
    emailNotifications: true,
    inAppNotifications: true,
    smsNotifications: false,
    companyLogo: null,
    subdomain: "",
  });

  const [currencySearch, setCurrencySearch] = useState<string>("");
  const [timezoneSearch, setTimezoneSearch] = useState<string>("");
  const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("general");

  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState<string | null>(null);

  const tabs = [
    { id: "general", label: t("tabs.general"), icon: SettingsIcon },
    { id: "appearance", label: t("tabs.appearance"), icon: Palette },
    { id: "notifications", label: t("tabs.notifications"), icon: Bell },
    { id: "members", label: t("tabs.members"), icon: Users },
    { id: "data", label: t("tabs.data"), icon: Database },
    { id: "branding", label: t("tabs.branding"), icon: Building },
    { id: "history", label: t("tabs.history"), icon: Activity },
    { id: "danger", label: t("tabs.danger"), icon: AlertTriangle },
  ];

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = (): void => {
      try {
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
          const parsedSettings: Partial<UserSettings> =
            JSON.parse(savedSettings);
          setSettings((prevSettings) => ({
            ...prevSettings,
            ...parsedSettings,
          }));
        }
      } catch (error) {
        console.error(t("errors.loadingSettings"), error);
      } finally {
        setIsSettingsLoaded(true);
      }
    };

    loadSettings();
  }, [t]);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    if (isSettingsLoaded) {
      try {
        localStorage.setItem("userSettings", JSON.stringify(settings));
      } catch (error) {
        console.error(t("errors.savingSettings"), error);
      }
    }
  }, [settings, isSettingsLoaded, t]);

  // Helper functions
  const formatTimezoneLabel = (
    timezone: string,
  ): { region: string; city: string; label: string } => {
    const parts = timezone.split("/");
    if (parts.length === 1) {
      return { region: "", city: timezone, label: timezone };
    }

    const region = parts[0] || "";
    const city = (parts[parts.length - 1] || "").replace(/_/g, " ");
    return {
      region,
      city,
      label: `${region}/${city}`,
    };
  };

  const getCurrentTimeInTimezone = (timezone: string): string => {
    try {
      const now = new Date();
      const timeString = now.toLocaleString("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return timeString;
    } catch (error) {
      console.error(t("errors.timezoneTime"), error);
      return t("errors.invalidTime");
    }
  };

  const getTimezoneOffset = (timezone: string): string => {
    try {
      const now = new Date();
      const timeInZone = new Date(
        now.toLocaleString("en-US", { timeZone: timezone }),
      );
      const timeInUTC = new Date(
        now.toLocaleString("en-US", { timeZone: "UTC" }),
      );

      const offsetMinutes =
        (timeInZone.getTime() - timeInUTC.getTime()) / (1000 * 60);
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const offsetMins = Math.abs(offsetMinutes) % 60;

      const sign = offsetMinutes >= 0 ? "+" : "-";
      return `UTC${sign}${offsetHours.toString().padStart(2, "0")}:${offsetMins.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error(t("errors.timezoneOffset"), error);
      return "UTC+00:00";
    }
  };

  // API queries

  const { data: membersData, isLoading: membersLoading } = useApiQuery<
    Member[]
  >({
    queryKey: ["members"],
    endpoint: "/data/members.json",
    useLocalJson: true,
    options: {
      staleTime: 1000 * 60 * 30, // 30 minutes
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useApiMutation<unknown, UserSettings>({
    method: "put",
    endpoint: "/api/user/settings",
    options: {
      onSuccess: () => {
        console.log(t("actions.settingsSaved"));
      },
      onError: (error) => {
        console.error(t("actions.settingsSaveFailed"), error);
      },
    },
  });

  // Export mutation
  const exportDataMutation = useApiMutation<
    unknown,
    { type: string; format: string; dataType: string }
  >({
    method: "post",
    endpoint: "/api/export/data",
    options: {
      onSuccess: (_, variables) => {
        console.log(
          t("actions.exportSuccess", {
            dataType: variables.dataType,
            format: variables.format,
          }),
        );
      },
      onError: (error, variables) => {
        console.error(
          t("actions.exportFailed", {
            dataType: variables.dataType,
            format: variables.format,
          }),
          error,
        );
      },
    },
  });

  // Memoized data
  const timezones: Timezone[] = useMemo(() => {
    const data: Timezone[] = timezonesData.map((timezone: string) => {
      const formatInfo = formatTimezoneLabel(timezone);
      return {
        value: timezone,
        label: formatInfo.label,
        region: formatInfo.region,
        city: formatInfo.city,
        offset: getTimezoneOffset(timezone),
        currentTime: getCurrentTimeInTimezone(timezone),
      };
    });

    if (!timezoneSearch) return data;

    return data.filter(
      (timezone: Timezone) =>
        timezone.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
        timezone.value.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
        timezone.city.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
        timezone.region.toLowerCase().includes(timezoneSearch.toLowerCase()),
    );
  }, [timezoneSearch]);

  const currencies: Currency[] = useMemo(() => {
    if (!currencySearch) return currenciesData;

    return currenciesData.filter(
      (currency: Currency) =>
        currency.key.toLowerCase().includes(currencySearch.toLowerCase()) ||
        currency.value.toLowerCase().includes(currencySearch.toLowerCase()),
    );
  }, [currencySearch]);

  const exportOptions: ExportOption[] = [
    {
      id: "properties",
      name: t("exportOptions.properties.name"),
      description: t("exportOptions.properties.description"),
      icon: Building,
      csvSupported: true,
      xlsxSupported: true,
      estimatedSize: "~2.5MB",
      lastExported: "2024-06-20",
    },
    {
      id: "contacts",
      name: t("exportOptions.contacts.name"),
      description: t("exportOptions.contacts.description"),
      icon: Users,
      csvSupported: true,
      xlsxSupported: true,
      estimatedSize: "~1.2MB",
      lastExported: "2024-06-18",
    },
    {
      id: "rentals",
      name: t("exportOptions.rentals.name"),
      description: t("exportOptions.rentals.description"),
      icon: Database,
      csvSupported: true,
      xlsxSupported: true,
      estimatedSize: "~3.1MB",
      lastExported: "2024-06-15",
    },
    {
      id: "payments",
      name: t("exportOptions.payments.name"),
      description: t("exportOptions.payments.description"),
      icon: Activity,
      csvSupported: true,
      xlsxSupported: true,
      estimatedSize: "~4.8MB",
      lastExported: "2024-06-22",
    },
    {
      id: "maintenance",
      name: t("exportOptions.maintenance.name"),
      description: t("exportOptions.maintenance.description"),
      icon: SettingsIcon,
      csvSupported: true,
      xlsxSupported: true,
      estimatedSize: "~1.8MB",
      lastExported: "2024-06-19",
    },
    {
      id: "documents",
      name: t("exportOptions.documents.name"),
      description: t("exportOptions.documents.description"),
      icon: Upload,
      csvSupported: false,
      xlsxSupported: false,
      estimatedSize: "~25.4MB",
      lastExported: "2024-06-10",
    },
    {
      id: "reports",
      name: t("exportOptions.reports.name"),
      description: t("exportOptions.reports.description"),
      icon: Activity,
      csvSupported: true,
      xlsxSupported: true,
      estimatedSize: "~850KB",
      lastExported: "2024-06-21",
    },
    {
      id: "tasks",
      name: t("exportOptions.tasks.name"),
      description: t("exportOptions.tasks.description"),
      icon: Clock,
      csvSupported: true,
      xlsxSupported: true,
      estimatedSize: "~320KB",
      lastExported: "2024-06-20",
    },
  ];

  const handleSaveSettings = (): void => {
    saveSettingsMutation.mutate(settings);
  };

  const handleExport = (dataType: string, format: "csv" | "xlsx"): void => {
    exportDataMutation.mutate({
      type: "export",
      format,
      dataType,
    });
  };

  const handleCreateMember = async (member: Omit<NewMemberForm, 'confirmPassword' | 'status'>) => {
    setIsCreatingMember(true);
    try {
      console.log(t("actions.creating"), member);
      // Simulate API call - replace with actual implementation
      // Add member to membersData array temporarily
      // This would be replaced by proper API integration
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(t("actions.createMemberFailed"), error);
      throw error;
    } finally {
      setIsCreatingMember(false);
    }
  };
  const handleUpdateMember = async (member: EditMemberForm) => {
    setIsUpdatingMember(true);
    try {
      console.log(t("actions.updating"), member);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(t("actions.updateMemberFailed"), error);
      throw error;
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    setIsDeletingMember(memberId);
    try {
      console.log(t("actions.deleting"), memberId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(t("actions.deleteMemberFailed"), error);
      throw error;
    } finally {
      setIsDeletingMember(null);
    }
  };

  if (!isSettingsLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <GeneralTab
            settings={settings}
            setSettings={setSettings}
            timezones={timezones}
            currencies={currencies}
            currencySearch={currencySearch}
            setCurrencySearch={setCurrencySearch}
            timezoneSearch={timezoneSearch}
            setTimezoneSearch={setTimezoneSearch}
            handleSaveSettings={handleSaveSettings}
            saveSettingsMutation={saveSettingsMutation}
          />
        );
      case "appearance":
        return <AppearanceTab />;
      case "notifications":
        return (
          <NotificationsTab settings={settings} setSettings={setSettings} />
        );
      case "members":
        return (
          <MembersTab
            membersData={membersData}
            membersLoading={membersLoading}
            onCreateMember={handleCreateMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            isCreating={isCreatingMember}
            isUpdating={isUpdatingMember}
            isDeleting={isDeletingMember}
          />
        );
      case "data":
        return (
          <DataTab
            exportOptions={exportOptions}
            handleExport={handleExport}
            exportDataMutation={exportDataMutation}
          />
        );
      case "branding":
        return <BrandingTab settings={settings} setSettings={setSettings} />;
      case "history":
        return (
          <HistoryTab />
        );
      case "danger":
        return <DangerTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Navigation */}
      <div className="border-b">
        <nav className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-4 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">{renderTabContent()}</div>
    </div>
  );
}
