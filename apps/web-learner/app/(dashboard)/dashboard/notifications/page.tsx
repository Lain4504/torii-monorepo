'use client'

import { useState, useMemo } from 'react'
import { Bell, Search, Check, Trash2, Sparkles, Clock, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Card } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '@/lib/api/services/notification-api'
import type { NotificationResponseDTO, NotificationType } from '@workspace/schemas'

interface Notification {
    id: string
    title: string
    message: string
    time: string
    date: string
    read: boolean
    type: 'info' | 'success' | 'warning' | 'error'
    category: 'course' | 'system' | 'account'
}

// UI Notification type
type UINotificationType = 'info' | 'success' | 'warning' | 'error';

// Map API notification type to UI type
function mapNotificationType(notificationType: NotificationType): UINotificationType {
    switch (notificationType) {
        case 'course':
        case 'achievement':
            return 'success'
        case 'system':
            return 'warning'
        case 'payment':
            return 'success'
        case 'live_class':
        case 'reminder':
            return 'info'
        default:
            return 'info'
    }
}

// Map notification type to category
function mapNotificationCategory(notificationType: NotificationType): 'course' | 'system' | 'account' {
    switch (notificationType) {
        case 'course':
        case 'achievement':
        case 'live_class':
        case 'reminder':
            return 'course'
        case 'system':
            return 'system'
        case 'payment':
            return 'account'
        default:
            return 'system'
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
        category: mapNotificationCategory(notification.notificationType),
    }
}

export default function NotificationsPage() {
    const [filter, setFilter] = useState<'all' | 'unread' | 'course' | 'system'>('all')
    const [search, setSearch] = useState('')
    const [page] = useState(1)

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
        // Debug: Log response structure
        if (notificationsData) {
            console.log('🔔 Notifications Page (Learner) - Response:', notificationsData);
        }

        // Handle response structure: PaginatedApiResponse = { data: NotificationResponseDTO[], total, page, limit, totalPages }
        if (!notificationsData?.data) return []
        return notificationsData.data.map(mapNotificationToUI)
    }, [notificationsData])

    // Filter notifications by search
    const filteredNotifications = useMemo(() => {
        return notifications.filter((n: Notification) => {
            const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                n.message.toLowerCase().includes(search.toLowerCase())
            if (filter === 'all') return matchesSearch
            if (filter === 'unread') return !n.read && matchesSearch
            if (filter === 'course') return n.category === 'course' && matchesSearch
            if (filter === 'system') return n.category === 'system' && matchesSearch
            return matchesSearch
        })
    }, [notifications, search, filter])

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

        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 pb-8 border-b border-border">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        Trung tâm thông báo
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                        Quản lý tất cả các cập nhật, nhắc nhở và thông tin quan trọng từ Torii Intelligence.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                    >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        {markAllAsReadMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
                    </Button>
                </div>
            </div>

            {/* Quick Actions & Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm thông báo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center justify-center p-3 rounded-xl border border-border bg-card shadow-sm">
                    <div className="text-center flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Chưa đọc</span>
                        <span className="text-xl font-bold text-primary">{unreadCount}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 px-4">
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'unread', label: 'Chưa đọc' },
                    { id: 'course', label: 'Khóa học' },
                    { id: 'system', label: 'Hệ thống' }
                ].map((btn) => (
                    <Button
                        key={btn.id}
                        variant={filter === btn.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(btn.id as any)}
                    >
                        {btn.label}
                    </Button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="px-4 pb-20">
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted/20 mx-auto flex items-center justify-center border border-border/10 relative">
                                <Bell className="w-8 h-8 text-muted-foreground/30 relative z-10 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-muted-foreground">Đang tải thông báo...</h3>
                            </div>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => {
                            const styles = getTypeStyles(notification.type)
                            const Icon = styles.icon
                            return (
                                <Card
                                    key={notification.id}
                                    className={cn(
                                        "group p-5 flex flex-col sm:flex-row gap-5 transition-all duration-300 relative border-border shadow-sm rounded-2xl hover:shadow-md",
                                        !notification.read ? "bg-card border-l-4 border-l-primary" : "bg-card/50 opacity-80"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 duration-300",
                                        styles.bg,
                                        styles.color
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className={cn(
                                                    "text-base font-bold tracking-tight transition-colors",
                                                    !notification.read ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold uppercase text-muted-foreground/70">
                                                        {notification.category}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/50">
                                                        <Clock className="w-3 h-3" />
                                                        {notification.date} • {notification.time}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!notification.read && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-1.5 text-xs"
                                                        onClick={() => markAsRead(notification.id)}
                                                        disabled={markAsReadMutation.isPending}
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        {markAsReadMutation.isPending ? 'Đang xử lý...' : 'Đã đọc'}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 text-xs text-destructive border-destructive/40 hover:text-destructive hover:bg-destructive/5"
                                                    onClick={() => deleteNotification(notification.id)}
                                                    disabled={deleteNotificationMutation.isPending}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    {deleteNotificationMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="max-w-3xl text-sm text-foreground/80 leading-relaxed">
                                            {notification.message}
                                        </p>
                                    </div>
                                </Card>
                            )
                        })
                    ) : (
                        <div className="py-20 text-center space-y-4 rounded-2xl border border-dashed border-border bg-muted/5">
                            <div className="w-16 h-16 rounded-full bg-muted/20 mx-auto flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-foreground">Không có thông báo mới</h3>
                                <p className="text-sm text-muted-foreground">Bạn đã cập nhật tất cả thông tin quan trọng.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
