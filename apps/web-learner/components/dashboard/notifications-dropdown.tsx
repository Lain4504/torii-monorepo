'use client'

import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { Bell, Check } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { cn } from '@workspace/ui/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Spinner } from '@workspace/ui/components/spinner'
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/lib/api/services/notification-api'
import type { NotificationResponseDTO, NotificationType } from '@workspace/schemas'

type UINotificationType = 'info' | 'success' | 'warning' | 'error';

function mapNotificationType(notificationType: NotificationType): UINotificationType {
    switch (notificationType) {
        case 'course':
        case 'achievement':
            return 'success';
        case 'system':
        case 'live_class':
        case 'reminder':
            return 'info';
        case 'payment':
            return 'success';
        default:
            return 'info';
    }
}

interface UINotification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: UINotificationType;
}

function mapNotificationToUI(notification: NotificationResponseDTO): UINotification {
    return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        time: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
        read: notification.isRead,
        type: mapNotificationType(notification.notificationType),
    };
}

export function NotificationsDropdown() {
    const { data: notificationsData, isLoading } = useNotifications({ limit: 10, page: 1 });
    const { data: unreadCountData } = useUnreadNotificationsCount();
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();

    const notifications = notificationsData?.data?.map(mapNotificationToUI) || [];
    const unreadCount = unreadCountData?.count || 0;

    const markAsRead = (id: string) => {
        markAsReadMutation.mutate(id);
    };

    const markAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const getTypeColor = (type: UINotificationType) => {
        switch (type) {
            case 'success':
                return 'text-green-500 bg-green-500/10';
            case 'warning':
                return 'text-amber-500 bg-amber-500/10';
            case 'error':
                return 'text-rose-500 bg-rose-500/10';
            default:
                return 'text-blue-500 bg-blue-500/10';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/30 transition-all data-[state=open]:bg-muted/30 group"
                >
                    <Bell className="size-4 transition-transform duration-300 group-hover:scale-110" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full ring-2 ring-background animate-pulse shadow-sm" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[90vw] sm:w-[380px] p-0 rounded-lg border-border/40"
            >
                {/* Header */}
                <div className="px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold">Thông báo</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {unreadCount > 0 ? `Bạn có ${unreadCount} tin nhắn chưa đọc` : 'Bạn đã xem hết thông báo'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                disabled={markAllAsReadMutation.isPending}
                                className="h-7 px-2 text-xs"
                            >
                                <Check className="size-3.5 mr-1" />
                                {markAllAsReadMutation.isPending ? 'Đang xử lý...' : 'Đã đọc tất cả'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                            <Spinner className="w-6 h-6 text-muted-foreground/30" />
                            <p className="text-xs text-muted-foreground/50 font-medium">Đang tải thông báo...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-border/5">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "group px-5 py-4 transition-all duration-200 cursor-pointer relative hover:bg-muted/30",
                                        !notification.read ? "bg-primary/[0.03]" : "",
                                        markAsReadMutation.isPending ? "opacity-50 cursor-wait" : ""
                                    )}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "mt-0.5 size-9 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 border border-border/10 shadow-sm",
                                            getTypeColor(notification.type)
                                        )}>
                                            <Bell className="size-4" />
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={cn(
                                                    "text-[13px] font-semibold transition-colors line-clamp-1",
                                                    !notification.read ? "text-foreground" : "text-muted-foreground/80"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[12px] text-muted-foreground/70 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 pt-1">
                                                <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">
                                                    {notification.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty className="py-12 border-none">
                            <EmptyMedia variant="icon" className="bg-muted/30 border border-border/10">
                                <Bell className="size-5 text-muted-foreground/30" />
                            </EmptyMedia>
                            <EmptyContent>
                                <EmptyTitle className="text-xs">Không có thông báo mới</EmptyTitle>
                                <EmptyDescription className="text-[10px]">Bạn đã cập nhật tất cả thông tin.</EmptyDescription>
                            </EmptyContent>
                        </Empty>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t">
                    <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="w-full text-xs"
                    >
                        <Link href="/dashboard/notifications">
                            Xem tất cả thông báo
                        </Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
