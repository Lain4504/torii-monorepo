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
                    className="relative text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl h-10 w-10 transition-all group"
                >
                    <Bell className="size-5 transition-transform duration-300 group-hover:scale-110" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full ring-2 ring-background animate-pulse shadow-sm"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[90vw] sm:w-[400px] p-0 border-border/20 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-[1.5rem] overflow-hidden animate-in slide-in-from-top-2 duration-300"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">Notifications</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'All caught up'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-8 px-3 rounded-lg hover:bg-primary/5 hover:text-primary text-[10px] font-medium uppercase tracking-wide transition-all"
                            >
                                <Check className="h-3.5 w-3.5 mr-1.5" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[60vh] sm:max-h-[450px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-border/5">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "group px-6 py-4 transition-all duration-200 cursor-pointer relative hover:bg-muted/30",
                                        !notification.read ? "bg-primary/[0.03]" : ""
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex gap-4">
                                        {/* Type Indicator */}
                                        <div className={cn(
                                            "mt-0.5 size-9 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105",
                                            getTypeColor(notification.type)
                                        )}>
                                            <Bell className="size-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <h4 className={cn(
                                                    "text-sm font-medium transition-colors",
                                                    !notification.read ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 pt-1.5">
                                                <span className="text-[10px] font-medium text-muted-foreground/40">
                                                    {notification.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-muted/30 mx-auto flex items-center justify-center border border-border/10">
                                <Bell className="size-6 text-muted-foreground/30" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-foreground">No Notifications</h3>
                                <p className="text-xs text-muted-foreground/50">You don't have any new notifications.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/10 bg-muted/5">
                    <Link to="/notifications">
                        <Button
                            variant="ghost"
                            className="w-full h-10 rounded-xl bg-background border border-border/10 hover:border-primary/20 hover:text-primary text-xs font-medium transition-all shadow-sm"
                        >
                            View All Notifications
                            <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
