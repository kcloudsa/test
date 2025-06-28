import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText, Undo2 } from "lucide-react";
import { useApiQuery } from "@/hooks/useApi";
import type { ActivityHistoryItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface HistoryTabProps {
  userSubscription?: 'basic' | 'premium' | 'pro' | 'enterprise';
  onUndo?: (historyId: string) => void;
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
    case 'create': return 'bg-green-100 text-green-800';
    case 'update': return 'bg-blue-100 text-blue-800';
    case 'delete': return 'bg-red-100 text-red-800';
    case 'restore': return 'bg-yellow-100 text-yellow-800';
    case 'login': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function HistoryTab({ 
  userSubscription = 'pro',
  onUndo 
}: HistoryTabProps) {
  const { t } = useTranslation("settings");
  const { data: activityHistory, isLoading } = useApiQuery<ActivityHistoryItem[]>({
    queryKey: ['activity-history'],
    endpoint: '/data/history.json',
    useLocalJson: true,
    options: {
      staleTime: 15 * 60 * 1000, // 15 minutes for historical data
      gcTime: 60 * 60 * 1000, // 1 hour
      refetchOnMount: false, // Don't refetch if data exists
    }
  });

  const historyLimit = getSubscriptionLimit(userSubscription);
  
  // Ensure activityHistory is an array before filtering
  const historyArray = Array.isArray(activityHistory) ? activityHistory : [];
  
  const filteredHistory = historyArray.filter((activity) => {
    if (historyLimit === Infinity) return true;
    const activityDate = new Date(activity.timestamp);
    const currentDate = new Date();
    const daysDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= historyLimit;
  });

  const isNearLimit = filteredHistory && filteredHistory.length > (historyLimit * 0.8);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("History.title")}</CardTitle>
            <CardDescription>
              {t("History.description")}
              {historyLimit !== Infinity && (
                <span className={`ml-2 ${isNearLimit ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {t("History.items", { count: filteredHistory?.length || 0, limit: historyLimit })}
                </span>
              )}
            </CardDescription>
          </div>
          {historyLimit !== Infinity && (
            <Badge variant={isNearLimit ? "destructive" : "secondary"}>
              {t("History.plan", { plan: userSubscription })}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-3/4" />
                <div className="bg-muted/50 rounded-md p-3">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((activity: ActivityHistoryItem) => (
                <div
                  key={activity._id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionColor(activity.action)}>
                        {activity.action}
                      </Badge>
                      <span className="font-medium">{activity.table}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.action !== 'login' && activity.action !== 'delete' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUndo?.(activity._id)}
                          disabled={!activity.canUndo}
                        >
                          <Undo2 className="h-3 w-3 mr-1" />
                          {activity.canUndo ? t("History.undo") : t("History.view")}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{activity.performedBy?.name}</span>
                      {activity.performedBy?.role && (
                        <Badge variant="outline" className="text-xs">
                          {activity.performedBy.role}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {activity.reason && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        <strong>{t("History.reason")}</strong> {activity.reason}
                      </span>
                    </div>
                  )}

                  {activity.diff && Object.keys(activity.diff).length > 0 && (
                    <div className="bg-muted/50 rounded-md p-3">
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">{t("History.changes")}</h5>
                      <div className="space-y-1">
                        {Object.entries(activity.diff).map(([key, change]: [string, { from: string | number | boolean | null; to: string | number | boolean | null; }]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium">{key}:</span>
                            <span className="text-red-600 line-through ml-2">
                              {JSON.stringify(change.from)}
                            </span>
                            <span className="mx-1">→</span>
                            <span className="text-green-600">
                              {JSON.stringify(change.to)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))) : (
              <div className="text-center p-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("History.noHistory")}</p>
                <p className="text-sm mt-1">
                  {t("History.totalItems", { total: historyArray.length, filtered: filteredHistory.length, limit: historyLimit })}
                </p>
                {historyLimit !== Infinity && (
                  <p className="text-sm mt-1">
                    {t("History.limitedHistory", { limit: historyLimit, plan: userSubscription })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}