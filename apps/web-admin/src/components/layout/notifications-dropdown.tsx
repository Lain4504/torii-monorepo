import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { cn } from '@workspace/ui/lib/utils';
import { useState } from 'react';

// Mock notification data - replace with real data from API
interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'New Course Published',
        message: 'JLPT N3 Complete Course is now available',
        time: '5 minutes ago',
        read: false,
        type: 'success',
    },
    {
        id: '2',
        title: 'User Registration',
        message: '3 new users registered today',
        time: '1 hour ago',
        read: false,
        type: 'info',
    },
    {
        id: '3',
        title: 'System Update',
        message: 'Scheduled maintenance at 2:00 AM',
        time: '3 hours ago',
        read: true,
        type: 'warning',
    },
];

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getTypeColor = (type: Notification['type']) => {
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
                    className="relative text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-9 w-9"
                >
                    <Bell className="h-4 w-4 sm:size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 size-1.5 sm:size-2 bg-rose-500 rounded-full ring-2 ring-background"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[90vw] sm:w-96 p-0 border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-7 text-xs rounded-lg hover:bg-muted/50"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Mark all
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-border/30">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "group px-4 py-3 transition-all duration-200 cursor-pointer",
                                        !notification.read && "bg-primary/5",
                                        "hover:bg-muted/30"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        {/* Type Indicator */}
                                        <div className={cn(
                                            "mt-1 p-1.5 rounded-lg shrink-0",
                                            getTypeColor(notification.type)
                                        )}>
                                            <Bell className="h-3 w-3" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={cn(
                                                    "text-sm font-medium truncate",
                                                    !notification.read && "text-foreground",
                                                    notification.read && "text-muted-foreground"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <span className="text-xs text-muted-foreground/70 mt-1 inline-block">
                                                {notification.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-12 text-center">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border/40 bg-muted/20">
                    <Link to="/notifications">
                        <Button
                            variant="ghost"
                            className="w-full rounded-xl text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                            View all notifications
                            <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
