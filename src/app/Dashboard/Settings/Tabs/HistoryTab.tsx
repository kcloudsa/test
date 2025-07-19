import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Progress } from "@/components/ui/progress"; // Temporarily commented out
import { 
  Clock, User, FileText, Undo2, Database, AlertCircle, 
  Search, Download, TrendingUp, BarChart3,
  PieChart, Activity, Users, RefreshCw, Bell, 
  FileDown, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { useApiQuery } from "@/hooks/useApi";
import type { ActivityHistoryItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";

interface HistoryTabProps {
  userSubscription?: 'basic' | 'premium' | 'pro' | 'enterprise';
  onUndo?: (historyId: string) => void;
}

interface StatisticsData {
  todayActivities: number;
  weekActivities: number;
  monthActivities: number;
  totalActivities: number;
  activeUsers: number;
  mostActiveUser: string;
  popularModule: string;
  averageDaily: number;
  peakHour: string;
  trends: {
    weekChange: number;
    monthChange: number;
  };
}

interface FilterState {
  search: string;
  dateRange: string;
  actionType: string;
  moduleType: string;
  userFilter: string;
  showUndoable: boolean;
  showWithReason: boolean;
}

const getSubscriptionLimit = (subscription: string) => {
  switch (subscription) {
    case 'basic': return 7;
    case 'premium': return 15;
    case 'pro': return 30;
    case 'enterprise': return Infinity;
    default: return 7;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'create': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400';
    case 'update': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
    case 'delete': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400';
    case 'restore': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'login': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400';
    default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'super':
    case 'admin': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400';
    case 'subadmin':
    case 'manager': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
    case 'property_manager': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400';
    case 'accountant': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'maintenance': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
    case 'tenant': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
    default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatisticsCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }: StatisticsCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="relative overflow-hidden py-2!">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trendValue && (
              <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Temporary Progress component replacement
const TempProgress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

export function HistoryTab({ 
  userSubscription = 'pro',
  onUndo 
}: HistoryTabProps) {
  const { t } = useTranslation("settings");
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: 'all',
    actionType: 'all',
    moduleType: 'all',
    userFilter: 'all',
    showUndoable: false,
    showWithReason: false
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: activityHistory, isLoading, refetch } = useApiQuery<ActivityHistoryItem[]>({
    queryKey: ['activity-history'],
    endpoint: '/data/history.json',
    useLocalJson: true,
    options: {
      staleTime: autoRefresh ? 30000 : 15 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      refetchOnMount: false,
      refetchInterval: autoRefresh ? 30000 : false,
    }
  });

  const historyLimit = getSubscriptionLimit(userSubscription);
  const historyArray = Array.isArray(activityHistory) ? activityHistory : [];

  // Calculate statistics
  const statistics = useMemo((): StatisticsData => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

    const todayActivities = historyArray.filter(a => new Date(a.timestamp) >= today).length;
    const weekActivities = historyArray.filter(a => new Date(a.timestamp) >= weekAgo).length;
    const monthActivities = historyArray.filter(a => new Date(a.timestamp) >= monthAgo).length;
    const lastWeekActivities = historyArray.filter(a => {
      const date = new Date(a.timestamp);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;
    const lastMonthActivities = historyArray.filter(a => {
      const date = new Date(a.timestamp);
      return date >= twoMonthsAgo && date < monthAgo;
    }).length;

    const userCounts = historyArray.reduce((acc, activity) => {
      const userName = activity.performedBy?.name || 'Unknown';
      acc[userName] = (acc[userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const moduleCounts = historyArray.reduce((acc, activity) => {
      acc[activity.table] = (acc[activity.table] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveUser = Object.entries(userCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    const popularModule = Object.entries(moduleCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    const weekChange = lastWeekActivities > 0 ? ((weekActivities - lastWeekActivities) / lastWeekActivities) * 100 : 0;
    const monthChange = lastMonthActivities > 0 ? ((monthActivities - lastMonthActivities) / lastMonthActivities) * 100 : 0;

    return {
      todayActivities,
      weekActivities,
      monthActivities,
      totalActivities: historyArray.length,
      activeUsers: Object.keys(userCounts).length,
      mostActiveUser,
      popularModule,
      averageDaily: monthActivities / 30,
      peakHour: '10:00 AM',
      trends: {
        weekChange,
        monthChange
      }
    };
  }, [historyArray]);

  // Filter activities
  const filteredHistory = useMemo(() => {
    let filtered = historyArray;

    // Apply subscription limit
    if (historyLimit !== Infinity) {
      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.timestamp);
        const currentDate = new Date();
        const daysDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= historyLimit;
      });
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.performedBy?.name?.toLowerCase().includes(searchLower) ||
        activity.action.toLowerCase().includes(searchLower) ||
        activity.table.toLowerCase().includes(searchLower) ||
        activity.reason?.toLowerCase().includes(searchLower) ||
        activity.documentId.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          break;
        case 'thisWeek':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'lastWeek':
          startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(activity => new Date(activity.timestamp) >= startDate);
    }

    // Apply other filters
    if (filters.actionType !== 'all') {
      filtered = filtered.filter(activity => activity.action === filters.actionType);
    }
    
    if (filters.moduleType !== 'all') {
      filtered = filtered.filter(activity => activity.table === filters.moduleType);
    }
    
    if (filters.showUndoable) {
      filtered = filtered.filter(activity => activity.canUndo);
    }
    
    if (filters.showWithReason) {
      filtered = filtered.filter(activity => activity.reason);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [historyArray, filters, historyLimit]);

  const isNearLimit = filteredHistory && filteredHistory.length > (historyLimit * 0.8);

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}`);
    // TODO: Implement actual export functionality
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dateRange: 'all',
      actionType: 'all',
      moduleType: 'all',
      userFilter: 'all',
      showUndoable: false,
      showWithReason: false
    });
  };

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{t("History.title")}</h2>
          <p className="text-muted-foreground">{t("History.description")}</p>
          {historyLimit !== Infinity && (
            <div className={`text-sm ${isNearLimit ? 'text-orange-600' : 'text-muted-foreground'}`}>
              {t("History.items", { count: filteredHistory?.length || 0, limit: historyLimit })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {historyLimit !== Infinity && (
            <Badge variant={isNearLimit ? "destructive" : "secondary"} className="font-medium">
              {t(`History.subscription.${userSubscription}`)}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("History.quickActions.refresh")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title={t("History.statistics.todayActivities")}
          value={statistics.todayActivities}
          icon={Activity}
          trend={statistics.trends.weekChange > 0 ? 'up' : statistics.trends.weekChange < 0 ? 'down' : 'neutral'}
          trendValue={statistics.trends.weekChange > 0 ? t("History.statistics.increase", { percent: Math.abs(statistics.trends.weekChange).toFixed(1) }) : statistics.trends.weekChange < 0 ? t("History.statistics.decrease", { percent: Math.abs(statistics.trends.weekChange).toFixed(1) }) : t("History.statistics.noChange")}
        />
        <StatisticsCard
          title={t("History.statistics.weekActivities")}
          value={statistics.weekActivities}
          subtitle={t("History.statistics.comparedToLastWeek")}
          icon={TrendingUp}
        />
        <StatisticsCard
          title={t("History.statistics.activeUsers")}
          value={statistics.activeUsers}
          subtitle={`${t("History.statistics.mostActiveUser")}: ${statistics.mostActiveUser}`}
          icon={Users}
        />
        <StatisticsCard
          title={t("History.statistics.popularModule")}
          value={t(`History.tables.${statistics.popularModule}`, { defaultValue: statistics.popularModule })}
          subtitle={`${t("History.statistics.averageDaily")}: ${statistics.averageDaily.toFixed(1)}`}
          icon={Database}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t("History.statistics.title")}</TabsTrigger>
          <TabsTrigger value="activities">{t("History.title")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("History.insights.title")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("History.quickActions.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                  {t("History.quickActions.autoRefresh")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("History.export.csv")}
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t("History.charts.activityOverTime")}
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  {t("History.quickActions.alert")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("History.charts.actionDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <PieChart className="h-12 w-12 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">{t("History.charts.noDataAvailable")}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("History.charts.hourlyDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <BarChart3 className="h-12 w-12 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">{t("History.charts.noDataAvailable")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("History.filters.title")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t("History.filters.clear")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label htmlFor="search">{t("History.filters.search")}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder={t("History.filters.searchPlaceholder")}
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{t("History.filters.dateRange")}</Label>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("History.filters.allActions")}</SelectItem>
                        <SelectItem value="today">{t("History.filters.today")}</SelectItem>
                        <SelectItem value="thisWeek">{t("History.filters.thisWeek")}</SelectItem>
                        <SelectItem value="thisMonth">{t("History.filters.thisMonth")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("History.filters.actionType")}</Label>
                    <Select value={filters.actionType} onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("History.filters.allActions")}</SelectItem>
                        <SelectItem value="create">{t("History.actions.create")}</SelectItem>
                        <SelectItem value="update">{t("History.actions.update")}</SelectItem>
                        <SelectItem value="delete">{t("History.actions.delete")}</SelectItem>
                        <SelectItem value="login">{t("History.actions.login")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("History.filters.moduleType")}</Label>
                    <Select value={filters.moduleType} onValueChange={(value) => setFilters(prev => ({ ...prev, moduleType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("History.filters.allModules")}</SelectItem>
                        <SelectItem value="rentals">{t("History.tables.rentals")}</SelectItem>
                        <SelectItem value="properties">{t("History.tables.properties")}</SelectItem>
                        <SelectItem value="tenants">{t("History.tables.tenants")}</SelectItem>
                        <SelectItem value="payments">{t("History.tables.payments")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("History.filters.userFilter")}</Label>
                    <Select value={filters.userFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, userFilter: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("History.filters.allUsers")}</SelectItem>
                        <SelectItem value="current">{t("History.filters.currentUser")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Toggle Filters */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="undoable"
                      checked={filters.showUndoable}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showUndoable: checked }))}
                    />
                    <Label htmlFor="undoable">{t("History.filters.showUndoable")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="withReason"
                      checked={filters.showWithReason}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showWithReason: checked }))}
                    />
                    <Label htmlFor="withReason">{t("History.filters.showWithReason")}</Label>
                  </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-muted-foreground">
                  {t("History.filters.results", { count: filteredHistory.length })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity List */}
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{t("History.title")}</CardTitle>
                  <CardDescription>
                    {t("History.description")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    {t("History.export.excel")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-6">
                  <div className="text-sm text-muted-foreground mb-4">
                    {t("History.loadingHistory")}
                  </div>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index} className="border-l-4 border-l-muted">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 p-6">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((activity: ActivityHistoryItem) => (
                        <Card
                          key={activity._id}
                          className={`border-l-4 transition-all hover:shadow-md ${
                            activity.action === 'create' ? 'border-l-green-400' :
                            activity.action === 'update' ? 'border-l-blue-400' :
                            activity.action === 'delete' ? 'border-l-red-400' :
                            activity.action === 'restore' ? 'border-l-yellow-400' :
                            'border-l-purple-400'
                          }`}
                        >
                          <CardContent className="p-4 space-y-4">
                            {/* Header Section */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="outline" 
                                  className={`font-medium ${getActionColor(activity.action)}`}
                                >
                                  {t(`History.actions.${activity.action}`)}
                                </Badge>
                                <div className="flex items-center gap-2 text-sm">
                                  <Database className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {t(`History.tables.${activity.table}`, { defaultValue: activity.table })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {activity.action !== 'login' && activity.action !== 'delete' && (
                                  <Button
                                    variant={activity.canUndo ? "outline" : "ghost"}
                                    size="sm"
                                    onClick={() => onUndo?.(activity._id)}
                                    disabled={!activity.canUndo}
                                    className="h-8"
                                  >
                                    <Undo2 className="h-3 w-3 mr-1" />
                                    {activity.canUndo ? t("History.undo") : t("History.view")}
                                  </Button>
                                )}
                              </div>
                            </div>

                            <Separator />

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{t("History.performedBy")}:</span>
                                <span className="font-medium">{activity.performedBy?.name}</span>
                                {activity.performedBy?.role && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getRoleColor(activity.performedBy.role)}`}
                                  >
                                    {t(`History.roles.${activity.performedBy.role}`, { 
                                      defaultValue: activity.performedBy.role 
                                    })}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{t("History.timestamp")}:</span>
                                <span className="font-medium">
                                  {new Date(activity.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Reason Section */}
                            {activity.reason && (
                              <div className="flex items-start gap-2 text-sm bg-muted/30 rounded-md p-3">
                                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                  <span className="font-medium text-muted-foreground">
                                    {t("History.reason")}
                                  </span>
                                  <p className="mt-1">{activity.reason}</p>
                                </div>
                              </div>
                            )}

                            {/* Changes Section */}
                            {activity.diff && Object.keys(activity.diff).length > 0 && (
                              <div className="bg-muted/30 rounded-md p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                  <h5 className="text-sm font-medium text-muted-foreground">
                                    {t("History.changes")}
                                  </h5>
                                </div>
                                <div className="space-y-2">
                                  {Object.entries(activity.diff).map(([key, change]: [string, { from: any; to: any; }]) => (
                                    <div key={key} className="text-xs bg-background rounded p-2">
                                      <div className="font-medium text-muted-foreground mb-1">{key}:</div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-red-600 line-through bg-red-50 px-2 py-1 rounded">
                                          {JSON.stringify(change.from)}
                                        </span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                                          {JSON.stringify(change.to)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))) : (
                      <Card className="border-dashed">
                        <CardContent className="text-center py-12">
                          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">{t("History.noHistory")}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {t("History.noHistoryDescription")}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              {t("History.totalItems", { 
                                total: historyArray.length, 
                                filtered: filteredHistory.length, 
                                limit: historyLimit 
                              })}
                            </p>
                            {historyLimit !== Infinity && (
                              <p>
                                {t("History.limitedHistory", { 
                                  limit: historyLimit, 
                                  plan: t(`History.subscription.${userSubscription}`)
                                })}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("History.insights.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("History.insights.mostActiveDay")}</span>
                    <span className="font-medium">Monday</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("History.insights.peakActivityTime")}</span>
                    <span className="font-medium">10:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("History.insights.topModule")}</span>
                    <span className="font-medium">{t(`History.tables.${statistics.popularModule}`)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("History.insights.userEngagement")}</span>
                    <div className="flex items-center gap-2">
                      <TempProgress value={85} className="w-16 h-2" />
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("History.export.title")}</CardTitle>
                <CardDescription>{t("History.export.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('csv')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    {t("History.export.csv")}
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('excel')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    {t("History.export.excel")}
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('pdf')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    {t("History.export.pdf")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}