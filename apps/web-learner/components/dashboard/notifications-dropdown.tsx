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
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle, ItemDescription } from '@workspace/ui/components/item'
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
                return 'text-success bg-success/10';
            case 'warning':
                return 'text-warning bg-warning/10';
            case 'error':
                return 'text-destructive bg-destructive/10';
            default:
                return 'text-primary bg-primary/10';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                >
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                        <span className="absolute right-2 top-2 size-2 animate-pulse rounded-full bg-destructive ring-2 ring-background" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[90vw] sm:w-[380px] p-0"
            >
                {/* Header */}
                <div className="border-b px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold">Thông báo</h3>
                            <p className="text-xs text-muted-foreground">
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
                                <Check className="mr-1 size-3.5" />
                                {markAllAsReadMutation.isPending ? 'Đang xử lý...' : 'Đã đọc tất cả'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto sm:max-h-[420px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-3 py-12">
                            <Spinner className="h-6 w-6 text-muted-foreground/30" />
                            <p className="text-xs font-medium text-muted-foreground/50">Đang tải thông báo...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-border/5">
                            {notifications.map((notification) => (
                                <Item
                                    key={notification.id}
                                    variant={notification.read ? "default" : "muted"}
                                    className={cn(
                                        'cursor-pointer px-4 py-3',
                                        markAsReadMutation.isPending && 'cursor-wait opacity-50'
                                    )}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <ItemMedia>
                                        <div className={cn(
                                            'flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/10',
                                            getTypeColor(notification.type),
                                        )}>
                                            <Bell className="size-4" />
                                        </div>
                                    </ItemMedia>
                                    <ItemContent>
                                        <div className="flex items-start justify-between gap-2">
                                            <ItemTitle className={cn(
                                                'text-xs font-semibold',
                                                !notification.read ? 'text-foreground' : 'text-muted-foreground',
                                            )}>
                                                {notification.title}
                                            </ItemTitle>
                                            {!notification.read && (
                                                <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <ItemDescription className="line-clamp-2 text-xs">
                                            {notification.message}
                                        </ItemDescription>
                                        <div className="pt-0.5">
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                                                {notification.time}
                                            </span>
                                        </div>
                                    </ItemContent>
                                </Item>
                            ))}
                        </div>
                    ) : (
                        <Empty className="border-none py-12">
                            <EmptyMedia variant="icon" className="border border-border/10 bg-muted/30">
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
