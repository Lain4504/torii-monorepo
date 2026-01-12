'use client'

import { Bell, Check, ExternalLink, Info, CheckCircle2, AlertTriangle, XCircle, Sparkles, Clock } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { cn } from '@workspace/ui/lib/utils'
import { useState } from 'react'
import Link from 'next/link'

interface Notification {
    id: string
    title: string
    message: string
    time: string
    read: boolean
    type: 'info' | 'success' | 'warning' | 'error'
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'Bắt đầu khóa học mới',
        message: 'Khóa học JLPT N3 đột phá đã sẵn sàng cho bạn.',
        time: '5 phút trước',
        read: false,
        type: 'success',
    },
    {
        id: '2',
        title: 'Nhắc nhở học tập',
        message: 'Bạn có 3 bài chưa hoàn thành trong ngày hôm nay.',
        time: '1 giờ trước',
        read: false,
        type: 'info',
    },
    {
        id: '3',
        title: 'Bảo trì hệ thống',
        message: 'Hệ thống sẽ bảo trì vào lúc 2:00 AM đêm nay.',
        time: '3 giờ trước',
        read: true,
        type: 'warning',
    },
]

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const getTypeStyles = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
            case 'warning':
                return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' }
            case 'error':
                return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
            default:
                return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' }
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl h-10 w-10 transition-all group cursor-pointer"
                >
                    <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse shadow-lg shadow-primary/40" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[90vw] sm:w-[420px] p-0 border-border/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-background/90 backdrop-blur-2xl rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500"
            >
                {/* Header */}
                <div className="px-8 py-7 border-b border-border/50 bg-primary/[0.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <h3 className="font-serif font-bold italic tracking-tight text-foreground/90 uppercase text-[11px]">Thông báo mới</h3>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Tất cả đã được đồng bộ'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-8 px-3 rounded-lg hover:bg-primary/10 hover:text-primary text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                            >
                                <Check className="w-3 h-3 mr-1.5" />
                                Đọc tất cả
                            </Button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[60vh] sm:max-h-[480px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-border/40">
                            {notifications.map((notification) => {
                                const styles = getTypeStyles(notification.type)
                                const Icon = styles.icon
                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "group px-8 py-6 transition-all duration-300 cursor-pointer relative",
                                            !notification.read && "bg-primary/[0.03]",
                                            "hover:bg-primary/[0.05]"
                                        )}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-5">
                                            <div className={cn(
                                                "mt-1 w-12 h-12 rounded-[1.25rem] shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm",
                                                styles.bg,
                                                styles.color
                                            )}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h4 className={cn(
                                                        "text-[13px] font-bold tracking-tight transition-colors leading-snug",
                                                        !notification.read ? "text-foreground" : "text-muted-foreground/60"
                                                    )}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-lg shadow-primary/40 animate-pulse" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 pt-1.5">
                                                    <Clock className="w-3 h-3 text-muted-foreground/30" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">
                                                        {notification.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-28 text-center space-y-6">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-muted/20 mx-auto flex items-center justify-center border border-border/10 relative">
                                <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                                <Bell className="w-8 h-8 text-muted-foreground/20 relative z-10" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-serif font-bold italic text-foreground/40">Không có thông báo</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/20 italic">Chúng tôi sẽ báo cho bạn khi có tin mới.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-border/50 bg-primary/[0.02]">
                    <Link href="/dashboard/notifications">
                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-xl bg-background/50 border border-border/40 hover:border-primary/20 hover:text-primary text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm group/btn cursor-pointer"
                        >
                            Xem tất cả thông báo
                            <ExternalLink className="ml-2 w-3.5 h-3.5 opacity-40 group-hover/btn:opacity-100 transition-opacity" />
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
