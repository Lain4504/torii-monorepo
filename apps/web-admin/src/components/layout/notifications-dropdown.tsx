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
                    className="relative text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl h-9 w-9 transition-all group"
                >
                    <Bell className="size-4 sm:size-5 group-hover:rotate-12 transition-transform duration-500" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 size-2 bg-primary rounded-full ring-2 ring-background animate-pulse shadow-lg shadow-primary/40"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[90vw] sm:w-[400px] p-0 border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden animate-in slide-in-from-top-2 duration-500"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-border/10 bg-muted/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black uppercase italic tracking-wider text-foreground/80">Signal Array</h3>
                            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">
                                {unreadCount > 0 ? `${unreadCount} Active Pulses` : 'Matrix Synchronized'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-9 px-4 rounded-xl hover:bg-primary/10 hover:text-primary text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                                <Check className="h-3 w-3 mr-2" />
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
                                        "group px-8 py-6 transition-all duration-300 cursor-pointer relative",
                                        !notification.read && "bg-primary/[0.02]",
                                        "hover:bg-primary/[0.04]"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex gap-5">
                                        {/* Type Indicator */}
                                        <div className={cn(
                                            "mt-1 size-10 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                                            getTypeColor(notification.type)
                                        )}>
                                            <Bell className="size-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <h4 className={cn(
                                                    "text-[13px] font-black uppercase italic tracking-tight transition-colors",
                                                    !notification.read ? "text-foreground group-hover:text-primary" : "text-muted-foreground/60"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="size-1.5 rounded-full bg-primary mt-1.5 shadow-lg shadow-primary/40 animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-[11px] font-bold text-muted-foreground/60 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 pt-2">
                                                <div className="size-1 rounded-full bg-border" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
                                                    {notification.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center space-y-6">
                            <div className="w-20 h-20 rounded-[2rem] bg-muted/20 mx-auto flex items-center justify-center border border-border/10 relative">
                                <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                <Bell className="size-8 text-muted-foreground/20 relative z-10" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black uppercase italic tracking-tight text-foreground/40">Signal Void</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">No incoming data streams detected.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-border/10 bg-muted/5">
                    <Link to="/notifications">
                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-[1.25rem] bg-background border border-border/10 hover:border-primary/20 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        >
                            Explore Pulse History
                            <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
