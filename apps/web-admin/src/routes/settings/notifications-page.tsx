'use client'

import { useState, useMemo } from 'react'
import { Bell, Check, Trash2, Clock, Info, CheckCircle2, AlertTriangle, XCircle, MoreVertical, BellOff } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '@/api/services/notifications'
import type { NotificationResponseDTO, NotificationType } from '@workspace/schemas'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  date: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
  node: string
  category: 'system' | 'security' | 'finance' | 'identity'
}

// Map API notification type to UI type
function mapNotificationType(notificationType: NotificationType): 'info' | 'success' | 'warning' | 'error' {
  switch (notificationType) {
    case 'course':
    case 'achievement':
    case 'order_success':
      return 'success'
    case 'system':
      return 'warning'
    case 'payment':
    case 'order_status_update':
      return 'info'
    case 'live_class':
    case 'reminder':
    case 'comment_reply':
      return 'info'
    default:
      return 'info'
  }
}

// Map notification type to category
function mapNotificationCategory(notificationType: NotificationType): 'system' | 'security' | 'finance' | 'identity' {
  switch (notificationType) {
    case 'system':
      return 'system'
    case 'payment':
    case 'order_success':
    case 'order_status_update':
      return 'finance'
    case 'course':
    case 'achievement':
    case 'reminder':
    case 'live_class':
    case 'comment_reply':
      return 'system'
    default:
      return 'system'
  }
}

// Map notification type to node name
function mapNotificationNode(notificationType: NotificationType): string {
  switch (notificationType) {
    case 'system':
      return 'System'
    case 'course':
      return 'Learning'
    case 'payment':
      return 'Finance'
    case 'live_class':
      return 'Meet'
    case 'achievement':
      return 'Gamification'
    case 'reminder':
      return 'Scheduler'
    default:
      return 'System'
  }
}

// Convert API notification to UI format
function mapNotificationToUI(notification: NotificationResponseDTO): Notification {
  const createdAt = new Date(notification.createdAt)
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time: formatDistanceToNow(createdAt, { addSuffix: true }),
    date: format(createdAt, 'dd/MM/yyyy'),
    read: notification.isRead,
    type: mapNotificationType(notification.notificationType),
    node: mapNotificationNode(notification.notificationType),
    category: mapNotificationCategory(notification.notificationType),
  }
}

import { PageHeader } from '@/components/common/page-header';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)

  // Fetch notifications with pagination
  const { data: notificationsData, isLoading } = useNotifications({
    limit: 50,
    page,
    isRead: filter === 'unread' ? false : undefined,
  })
  const { data: unreadCountData } = useUnreadNotificationsCount()
  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()
  const deleteNotificationMutation = useDeleteNotification()

  // Map API notifications to UI format
  const notifications = useMemo(() => {
    // Handle response structure: PaginatedApiResponse = { data: NotificationResponseDTO[], total, page, limit, totalPages }
    if (!notificationsData?.data) return []
    return notificationsData.data.map(mapNotificationToUI)
  }, [notificationsData])

  // Filter notifications by search
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: Notification) => {
      if (filter === 'all') return true
      if (filter === 'unread') return !n.read
      return true
    })
  }, [notifications, filter])

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id)
  }

  const unreadCount = unreadCountData?.count || 0

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
      case 'warning': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' }
      case 'error': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
      default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' }
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Thông báo Hệ thống"
        subtitle="Cập nhật tin tức và cảnh báo bảo mật Torii Academy"
        stats={[
          { label: "Chưa đọc", value: unreadCount.toLocaleString() }
        ]}
        actions={
          <Button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
          >
            <Check className="size-4 mr-2" />
            {markAllAsReadMutation.isPending ? 'Đang xử lý...' : 'Đã đọc tất cả'}
          </Button>
        }
      />


      {/* Filters (Tabs Style) */}
      <Tabs value={filter} onValueChange={(v) => { setFilter(v as any); setPage(1); }} className="w-full">
        <TabsList className="flex h-auto w-full max-w-3xl gap-1 bg-muted/20 p-1 rounded-xl border border-border/50 backdrop-blur-sm overflow-x-auto no-scrollbar justify-start">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'unread', label: 'Chưa đọc' }
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase italic tracking-wider transition-all duration-200",
                "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border-border/50",
                "hover:text-primary/70"
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      <div className="">
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="divide-y divide-border/40">
            {isLoading ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-muted/20 mx-auto flex items-center justify-center border border-border/10">
                  <Bell className="size-5 text-muted-foreground/30 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-sans font-bold italic uppercase tracking-widest text-muted-foreground/60">Đang tải thông báo...</p>
                </div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification: Notification) => {
                const styles = getTypeStyles(notification.type)
                const Icon = styles.icon
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "group p-6 flex flex-col sm:flex-row gap-5 transition-all duration-200 relative hover:bg-muted/30",
                      !notification.read && "bg-primary/[0.02]"
                    )}
                  >
                    <div className={cn(
                      "size-10 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 border border-transparent",
                      styles.bg,
                      styles.color
                    )}>
                      <Icon className="size-5" />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className={cn(
                            "text-base font-semibold transition-colors",
                            !notification.read ? "text-foreground" : "text-muted-foreground/80"
                          )}>
                            {notification.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground border border-border/50">
                              {notification.node}
                            </span>
                            <span className="text-border text-[10px]">|</span>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/60">
                              <Clock className="size-3 opacity-70" />
                              {notification.date} • {notification.time}
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg min-w-[160px] p-1">
                            {!notification.read && (
                              <DropdownMenuItem
                                onClick={() => markAsRead(notification.id)}
                                disabled={markAsReadMutation.isPending}
                                className="rounded-lg text-xs font-medium cursor-pointer px-3 py-2 disabled:opacity-50"
                              >
                                <Check className="size-3.5 mr-2 opacity-50" />
                                {markAsReadMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu đã đọc'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteNotification(notification.id)}
                              disabled={deleteNotificationMutation.isPending}
                              className="rounded-lg text-xs font-medium cursor-pointer px-3 py-2 text-rose-500 focus:text-rose-600 focus:bg-rose-50 disabled:opacity-50"
                            >
                              <Trash2 className="size-3.5 mr-2 opacity-50" />
                              {deleteNotificationMutation.isPending ? 'Đang xóa...' : 'Xóa thông báo'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="max-w-3xl text-sm text-muted-foreground/70 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-muted/20 mx-auto flex items-center justify-center border border-border/10">
                  <BellOff className="size-8 text-muted-foreground/20" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-sans font-bold italic uppercase tracking-tight text-foreground">Không có thông báo</h3>
                  <p className="text-sm text-muted-foreground/60">Bạn đã xem hết tất cả thông tin quan trọng.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Section */}
        {notificationsData && notificationsData.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/10">
            <div className="text-xs font-medium text-muted-foreground ml-2">
              Trang <span className="text-foreground">{page}</span> / {notificationsData.totalPages}
            </div>

            <Pagination className="w-auto mx-0">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={cn(
                      "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all cursor-pointer",
                      page === 1 ? "opacity-30 cursor-not-allowed pointer-events-none" : "hover:bg-muted"
                    )}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(notificationsData.totalPages, p + 1))}
                    className={cn(
                      "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all cursor-pointer",
                      page === notificationsData.totalPages ? "opacity-30 cursor-not-allowed pointer-events-none" : "hover:bg-muted"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
