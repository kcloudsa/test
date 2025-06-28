//! Calendar and Task Management Types
export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  endDate?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  attendees: string[];
}

export type CalendarView = "day" | "week" | "month" | "year";

export interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
  tasks: Task[];
}

//! Theme and Color Types

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";
export type Color =
  | "default"
  | "red"
  | "rose"
  | "orange"
  | "green"
  | "blue"
  | "yellow"
  | "violet";
export type FontSize = "small" | "medium" | "large" | "extra-large";

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColor?: Color;
  defaultFontSize?: FontSize;
  storageKey?: string;
  colorStorageKey?: string;
  fontSizeStorageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export type ThemeProviderState = {
  theme: Theme;
  color: Color;
  fontSize: FontSize;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  setColor: (color: Color) => void;
  setFontSize: (fontSize: FontSize) => void;
};

export interface ColorOption {
  name: string;
  value: string;
}

export interface ThemeCustomizerProps {
  settings: {
    language: string;
    fontSize: string;
  };
}

//! login-form
export interface Country {
  name: string;
  code: string;
  dial: string;
  flag: string;
}

// API response types
export interface CountryApiResponse {
  name: {
    common: string;
  };
  cca2: string;
  idd: {
    root: string;
    suffixes: string[];
  };
  flag: string;
}

// Type definitions for API requests and responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  countryCode: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    userType?: string;
  };
  token?: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

//! Settings
export interface Timezone {
  value: string;
  label: string;
  offset: string;
  currentTime: string;
  region: string;
  city: string;
}

export interface Currency {
  emoji: string;
  key: string;
  symbol: string;
  value: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  status: string;
  permissions: string[];
  createdAt: string;
  lastActive: string;
}

export interface NewMemberForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  status: string;
  permissions: string[];
}

export interface EditMemberForm extends Omit<Member, 'id' | 'createdAt' | 'lastActive'> {
  id: string;
}

export interface ActivityHistoryItem {
  _id: string;
  table: string;
  documentId: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'login';
  timestamp: string;
  performedBy: {
    userId: string;
    name: string;
    role: "super" | "subadmin"
  };
  diff: {
    [key: string]: {
      from: string | number | boolean | null;
      to: string | number | boolean | null;
    };
  };
  reason: string;
  canUndo: boolean;
}

export interface UserSettings {
  currency: string;
  timezone: string;
  dateFormat: string;
  landingPage: string;
  language: string;
  theme: string;
  color: string;
  fontSize: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  companyLogo: string | null;
  subdomain: string;
  // Add missing branding properties
  customDomain?: string;
  companyName?: string;
  emailHeader?: string;
  emailFooter?: string;
  companyAddress?: string;
  legalInfo?: string;
  customCSS?: string;
}

//! Branding Types
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface BrandingTabProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  isOrganization?: boolean;
}

//! Export data types
export interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  csvSupported: boolean;
  xlsxSupported: boolean;
  estimatedSize: string;
  lastExported?: string;
}

// API Hook Types
export interface UseApiQueryOptions<T = unknown> {
  queryKey: (string | number)[];
  endpoint: string;
  useLocalJson?: boolean;
  options?: {
    staleTime?: number;
    enabled?: boolean;
    refetchInterval?: number;
    retry?: number | boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: unknown) => void;
  };
}

export interface UseApiMutationOptions<TData = unknown, TVariables = unknown> {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  endpoint: string;
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: unknown, variables: TVariables) => void;
    onMutate?: (variables: TVariables) => void;
    onSettled?: (data: TData | undefined, error: unknown | null, variables: TVariables) => void;
  };
}

export interface ApiMutationResult<TData = unknown, TVariables = unknown> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: unknown | null;
  data: TData | undefined;
  reset: () => void;
}

export interface ApiQueryResult<T = unknown> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown | null;
  refetch: () => void;
  isRefetching: boolean;
}

// Settings Tab Props
export interface GeneralTabProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  timezones: Timezone[];
  currencies: Currency[];
  currencySearch: string;
  setCurrencySearch: (search: string) => void;
  timezoneSearch: string;
  setTimezoneSearch: (search: string) => void;
  handleSaveSettings: () => void;
  saveSettingsMutation: ApiMutationResult<unknown, UserSettings>;
}

export interface NotificationsTabProps {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
}

export interface MembersTabProps {
  membersData: Member[] | undefined;
  membersLoading: boolean;
  onCreateMember: (member: NewMemberForm) => Promise<void>;
  onUpdateMember: (member: EditMemberForm) => Promise<void>;
  onDeleteMember: (memberId: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: string | null;
}

export interface DataTabProps {
  exportOptions: ExportOption[];
  handleExport: (dataType: string, format: 'csv' | 'xlsx') => void;
  exportDataMutation: ApiMutationResult<unknown, { type: string; format: string; dataType: string }>;
}

export interface HistoryTabProps {
  activityHistory: ActivityHistoryItem[] | undefined;
  historyLoading: boolean;
}