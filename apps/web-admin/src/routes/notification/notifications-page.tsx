import { useState, useMemo } from 'react'
import { Check, Trash2, Clock, Info, CheckCircle2, AlertTriangle, XCircle, BellOff } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { formatDateTime, formatRelativeTime, formatNumber } from '@/lib/format-utils.ts';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty'
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '@/lib/api/services/notifications.ts'
import type { NotificationResponseDTO, NotificationType } from '@workspace/schemas'
import { PageHeader } from '@/components/common/page-header.tsx'

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
    case 'live_class':
    case 'reminder':
    case 'comment_reply':
      return 'info'
    default:
      return 'info'
  }
}

function mapNotificationCategory(notificationType: NotificationType): 'system' | 'security' | 'finance' | 'identity' {
  switch (notificationType) {
    case 'system': return 'system'
    case 'payment':
    case 'order_success':
    case 'order_status_update': return 'finance'
    default: return 'system'
  }
}

function mapNotificationNode(notificationType: NotificationType): string {
  switch (notificationType) {
    case 'system': return 'System'
    case 'course': return 'Learning'
    case 'payment': return 'Finance'
    case 'live_class': return 'Meet'
    case 'achievement': return 'Gamification'
    case 'reminder': return 'Scheduler'
    default: return 'System'
  }
}

function mapNotificationToUI(notification: NotificationResponseDTO): Notification {
  const createdAt = new Date(notification.createdAt)
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time: formatRelativeTime(createdAt),
    date: formatDateTime(createdAt, 'dd/MM/yyyy'),
    read: notification.isRead,
    type: mapNotificationType(notification.notificationType),
    node: mapNotificationNode(notification.notificationType),
    category: mapNotificationCategory(notification.notificationType),
  }
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)

  const { data: notificationsData, isLoading } = useNotifications({
    limit: 50,
    page,
    isRead: filter === 'unread' ? false : undefined,
  })
  const { data: unreadCountData } = useUnreadNotificationsCount()
  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()
  const deleteNotificationMutation = useDeleteNotification()

  const notifications = useMemo(() => {
    if (!notificationsData?.data) return []
    return notificationsData.data.map(mapNotificationToUI)
  }, [notificationsData])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: Notification) => {
      if (filter === 'unread') return !n.read
      return true
    })
  }, [notifications, filter])

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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Thông báo Hệ thống"
        subtitle="Cập nhật tin tức và cảnh báo bảo mật Torii Academy"
        stats={[
          { label: "Chưa đọc", value: formatNumber(unreadCount) }
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
          >
            <Check className="size-4 mr-2" />
            {markAllAsReadMutation.isPending ? 'Đang xử lý...' : 'Đã đọc tất cả'}
          </Button>
        }
      />

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => { setFilter(v as 'all' | 'unread'); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="unread">
            Chưa đọc
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-6">
                <Skeleton className="size-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification: Notification) => {
              const styles = getTypeStyles(notification.type)
              const Icon = styles.icon
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "group p-6 flex flex-col sm:flex-row gap-4 transition-colors hover:bg-muted/30",
                    !notification.read && "bg-primary/[0.02]"
                  )}
                >
                  <div className={cn(
                    "size-10 rounded-xl shrink-0 flex items-center justify-center",
                    styles.bg,
                    styles.color
                  )}>
                    <Icon className="size-5" />
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <h3 className={cn(
                          "text-sm font-semibold truncate",
                          !notification.read ? "text-foreground" : "text-muted-foreground/80"
                        )}>
                          {notification.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/50">
                            {notification.node}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                            <Clock className="size-3" />
                            {notification.date} · {notification.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="size-3.5" />
                            Đã đọc
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          disabled={deleteNotificationMutation.isPending}
                        >
                          <Trash2 className="size-3.5" />
                          Xóa
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground/70 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty>
            <EmptyMedia>
              <BellOff className="size-6" />
            </EmptyMedia>
            <EmptyContent>
              <EmptyTitle>Không có thông báo</EmptyTitle>
              <EmptyDescription>Bạn đã xem hết tất cả thông tin quan trọng.</EmptyDescription>
            </EmptyContent>
          </Empty>
        )}
      </div>

      {/* Pagination */}
      {notificationsData && notificationsData.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Trang <span className="font-semibold text-foreground">{page}</span> / {notificationsData.totalPages}
          </p>
          <Pagination className="w-auto mx-0">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={cn(
                    "h-9 px-3 rounded-lg text-xs cursor-pointer",
                    page === 1 ? "opacity-40 pointer-events-none" : ""
                  )}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(notificationsData.totalPages, p + 1))}
                  className={cn(
                    "h-9 px-3 rounded-lg text-xs cursor-pointer",
                    page === notificationsData.totalPages ? "opacity-40 pointer-events-none" : ""
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
