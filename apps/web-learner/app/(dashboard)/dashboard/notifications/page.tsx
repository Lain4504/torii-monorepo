'use client'

import { useMemo, useState } from 'react'
import { Bell, Check, Sparkles } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import {
    useNotifications,
    useUnreadNotificationsCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
} from '@/lib/api/services/notification-api'
import type { NotificationResponseDTO } from '@workspace/schemas'

interface Notification {
    id: string
    title: string
    message: string
    time: string
    date: string
    read: boolean
}

function mapNotificationToUI(notification: NotificationResponseDTO): Notification {
    const createdAt = new Date(notification.createdAt)
    return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        time: formatDistanceToNow(createdAt, { addSuffix: true }),
        date: format(createdAt, 'dd/MM/yyyy'),
        read: notification.isRead,
    }
}

export default function NotificationsPage() {
    const [page] = useState(1)

    const { data: notificationsData, isLoading } = useNotifications({
        limit: 50,
        page,
    })
    const { data: unreadCountData } = useUnreadNotificationsCount()
    const markAsReadMutation = useMarkNotificationAsRead()
    const markAllAsReadMutation = useMarkAllNotificationsAsRead()

    const notifications = useMemo(() => {
        if (!notificationsData?.data) return []
        return notificationsData.data.map(mapNotificationToUI)
    }, [notificationsData])

    const unreadCount = unreadCountData?.count ?? 0

    const handleItemClick = (n: Notification) => {
        if (!n.read) {
            markAsReadMutation.mutate(n.id)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 pb-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Thông báo</h1>
                    <p className="text-sm text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Không có thông báo chưa đọc'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                    className="shrink-0"
                >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    {markAllAsReadMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
                </Button>
            </div>

            <div className="space-y-2">
                {isLoading ? (
                    <div className="py-16 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3 animate-pulse" />
                        <p className="text-sm text-muted-foreground">Đang tải thông báo...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                        <Card
                            key={n.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleItemClick(n)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    handleItemClick(n)
                                }
                            }}
                            className={cn(
                                'p-4 rounded-xl border shadow-none transition-colors text-left w-full',
                                'hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                !n.read ? 'bg-muted/30 border-border' : 'bg-card border-border/60 opacity-90'
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h2
                                    className={cn(
                                        'text-sm font-medium',
                                        !n.read ? 'text-foreground' : 'text-muted-foreground'
                                    )}
                                >
                                    {n.title}
                                </h2>
                                {!n.read && (
                                    <span
                                        className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5"
                                        aria-hidden
                                    />
                                )}
                            </div>
                            {n.message ? (
                                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                                    {n.message}
                                </p>
                            ) : null}
                            <p className="mt-2 text-xs text-muted-foreground/70">
                                {n.date} · {n.time}
                            </p>
                        </Card>
                    ))
                ) : (
                    <div className="py-16 text-center rounded-xl border border-dashed border-border bg-muted/5">
                        <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-foreground">Chưa có thông báo</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Các cập nhật sẽ hiển thị tại đây.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
