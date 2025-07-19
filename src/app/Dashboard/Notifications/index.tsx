import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Search, Filter, MoreHorizontal, AlertTriangle, MessageSquare, AlertCircle, Check, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApiQuery } from '@/hooks/useApi'

// Types
interface Notification {
  _id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date | string
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="h-4 w-4" />
    case 'alert':
      return <AlertCircle className="h-4 w-4" />
    case 'danger':
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'message':
      return 'default'
    case 'alert':
      return 'secondary'
    case 'danger':
      return 'destructive'
    default:
      return 'default'
  }
}

const NotificationSkeleton = () => (
  <Card className="@container/card py-0!">
    <CardContent className="p-4">
      <div className="flex items-start space-x-4">
        <Skeleton className="h-4 w-4 mt-1" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function Notifications() {
  const { t } = useTranslation('notifications')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [readFilter, setReadFilter] = useState('all')

  // Fetch notifications from JSON
  const { 
    data: notificationsData, 
    isLoading, 
    error, 
    refetch 
  } = useApiQuery<Notification[]>({
    queryKey: ['notifications'],
    endpoint: '/data/notifications.json',
    useLocalJson: true
  })

  const [notifications, setNotifications] = useState<Notification[]>([])

  // Update local state when data is fetched
  useMemo(() => {
    if (notificationsData) {
      const processedNotifications = notificationsData.map(notification => ({
        ...notification,
        createdAt: new Date(notification.createdAt)
      }))
      setNotifications(processedNotifications)
    }
  }, [notificationsData])

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = typeFilter === 'all' || notification.type === typeFilter
      const matchesRead = readFilter === 'all' || 
        (readFilter === 'read' && notification.read) ||
        (readFilter === 'unread' && !notification.read)

      return matchesSearch && matchesType && matchesRead
    })
  }, [notifications, searchTerm, typeFilter, readFilter])

  const unreadCount = notifications.filter(n => !n.read).length

  const toggleNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification._id === id 
          ? { ...notification, read: !notification.read }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification._id !== id))
  }

  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, id])
    } else {
      setSelectedNotifications(prev => prev.filter(nId => nId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(filteredNotifications.map(n => n._id))
    } else {
      setSelectedNotifications([])
    }
  }

  const markSelectedAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => 
        selectedNotifications.includes(notification._id)
          ? { ...notification, read: true }
          : notification
      )
    )
    setSelectedNotifications([])
  }

  const deleteSelected = () => {
    setNotifications(prev => 
      prev.filter(notification => !selectedNotifications.includes(notification._id))
    )
    setSelectedNotifications([])
  }

  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
    
    if (diffInSeconds < 60) return t('time.justNow')
    if (diffInSeconds < 3600) return t('time.minutesAgo', { count: Math.floor(diffInSeconds / 60) })
    if (diffInSeconds < 86400) return t('time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) })
    if (diffInSeconds < 604800) return t('time.daysAgo', { count: Math.floor(diffInSeconds / 86400) })
    return dateObj.toLocaleDateString()
  }

  if (error) {
    return (
      <div className="space-y-6 p-3">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{t('errors.failedToLoad')}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('header.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-3">
      {/* Header - Improved design without title */}
      <div className="flex items-center justify-between bg-gradient-to-r from-background to-muted/20 p-4 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="h-8 w-8 text-primary" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {isLoading 
                ? t('header.loadingNotifications')
                : t('header.totalNotifications', { count: notifications.length })
              }
            </p>
            {unreadCount > 0 && (
              <p className="text-xs text-destructive font-medium">
                {t('header.unread', { count: unreadCount })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedNotifications.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={markSelectedAsRead}>
                <Check className="h-4 w-4 mr-2" />
                {t('header.markAsRead')}
              </Button>
              <Button variant="outline" size="sm" onClick={deleteSelected}>
                {t('header.deleteSelected')}
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            {t('header.markAllAsRead')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>{t('filters.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter} disabled={isLoading}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                  <SelectItem value="message">{t('types.message')}</SelectItem>
                  <SelectItem value="alert">{t('types.alert')}</SelectItem>
                  <SelectItem value="danger">{t('types.danger')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={readFilter} onValueChange={setReadFilter} disabled={isLoading}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
                  <SelectItem value="read">{t('filters.read')}</SelectItem>
                  <SelectItem value="unread">{t('filters.unread')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {!isLoading && filteredNotifications.length > 0 && (
        <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
          <Checkbox
            checked={selectedNotifications.length === filteredNotifications.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedNotifications.length > 0 
              ? t('bulkActions.selected', { count: selectedNotifications.length })
              : t('bulkActions.selectAll')
            }
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <NotificationSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t('emptyState.noNotifications')}</h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== 'all' || readFilter !== 'all'
                    ? t('emptyState.tryAdjusting')
                    : t('emptyState.noNotificationsAtMoment')
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <div key={notification._id} className={!notification.read ? '*:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card' : ''}>
                <Card className={'@container/card py-0!'}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={selectedNotifications.includes(notification._id)}
                        onCheckedChange={(checked) => 
                          handleSelectNotification(notification._id, checked as boolean)
                        }
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(notification.type)}
                              <Badge variant={getTypeBadgeVariant(notification.type) as any}>
                                {t(`types.${notification.type}`)}
                              </Badge>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  onClick={() => toggleNotificationRead(notification._id)}
                                >
                                  {notification.read ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      {t('dropdown.markAsUnread')}
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      {t('dropdown.markAsRead')}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => deleteNotification(notification._id)}
                                  className="text-destructive"
                                >
                                  {t('dropdown.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}