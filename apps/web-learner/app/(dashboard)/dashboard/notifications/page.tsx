'use client'

import { useState } from 'react'
import { Bell, Search, Filter, Check, Trash2, Sparkles, Clock, Info, CheckCircle2, AlertTriangle, XCircle, MoreVertical } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Card } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

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

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'Bắt đầu khóa học mới',
        message: 'Khóa học JLPT N3 đột phá đã sẵn sàng cho bạn. Hãy bắt đầu hành trình chinh phục tiếng Nhật ngay hôm nay!',
        time: '5 phút trước',
        date: '12/01/2026',
        read: false,
        type: 'success',
        category: 'course'
    },
    {
        id: '2',
        title: 'Nhắc nhở học tập',
        message: 'Bạn có 3 bài chưa hoàn thành trong ngày hôm nay. Đừng để kiến thức bị gián đoạn nhé!',
        time: '1 giờ trước',
        date: '12/01/2026',
        read: false,
        type: 'info',
        category: 'course'
    },
    {
        id: '3',
        title: 'Bảo trì hệ thống',
        message: 'Hệ thống sẽ bảo trì vào lúc 2:00 AM đêm nay để nâng cấp hiệu năng. Mong bạn thông cảm cho sự bất tiện này.',
        time: '3 giờ trước',
        date: '12/01/2026',
        read: true,
        type: 'warning',
        category: 'system'
    },
    {
        id: '4',
        title: 'Thanh toán thành công',
        message: 'Giao dịch nâng cấp tài khoản Premium đã được xác nhận. Chào mừng bạn đến với cộng đồng học viên ưu tú!',
        time: '1 ngày trước',
        date: '11/01/2026',
        read: true,
        type: 'success',
        category: 'account'
    },
    {
        id: '5',
        title: 'Cảnh báo bảo mật',
        message: 'Phát hiện đăng nhập lạ từ thiết bị mới tại Hà Nội. Nếu không phải bạn, hãy đổi mật khẩu ngay lập tức.',
        time: '2 ngày trước',
        date: '10/01/2026',
        read: true,
        type: 'error',
        category: 'account'
    }
]

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
    const [filter, setFilter] = useState<'all' | 'unread' | 'course' | 'system'>('all')
    const [search, setSearch] = useState('')

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.message.toLowerCase().includes(search.toLowerCase())
        if (filter === 'all') return matchesSearch
        if (filter === 'unread') return !n.read && matchesSearch
        if (filter === 'course') return n.category === 'course' && matchesSearch
        if (filter === 'system') return n.category === 'system' && matchesSearch
        return matchesSearch
    })

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const unreadCount = notifications.filter(n => !n.read).length

    const getTypeStyles = (type: Notification['type']) => {
        switch (type) {
            case 'success': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
            case 'warning': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' }
            case 'error': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
            default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' }
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <Bell className="w-3 h-3" />
                        Trung tâm thông báo
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground italic leading-[0.85]">
                        Notification <br />
                        <span className="text-primary not-italic text-3xl md:text-5xl">Hub & History</span>
                    </h1>
                    <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] italic border-l-2 border-primary/20 pl-6">
                        Quản lý tất cả các cập nhật, nhắc nhở và thông tin quan trọng từ <span className="text-foreground">Torii Intelligence</span>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                        className="rounded-xl h-10 px-4 text-[10px] font-bold uppercase tracking-widest border-border/40 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
                    >
                        <Check className="w-3.5 h-3.5 mr-2" />
                        Đánh dấu tất cả đã đọc
                    </Button>
                </div>
            </div>

            {/* Quick Actions & Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
                <Card className="md:col-span-3 rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 p-2 flex items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                        <Input
                            placeholder="Tìm kiếm thông báo..."
                            className="pl-14 h-14 border-transparent bg-transparent focus-visible:ring-0 text-sm font-medium placeholder:text-muted-foreground/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </Card>
                <div className="flex items-center p-2 rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-border/20">
                    <div className="flex-1 flex justify-center gap-2">
                        <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Chưa đọc</p>
                            <h3 className="text-2xl font-serif font-bold italic text-primary">{unreadCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 px-6">
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'unread', label: 'Chưa đọc' },
                    { id: 'course', label: 'Khóa học' },
                    { id: 'system', label: 'Hệ thống' }
                ].map((btn) => (
                    <Button
                        key={btn.id}
                        variant="ghost"
                        onClick={() => setFilter(btn.id as any)}
                        className={cn(
                            "rounded-full h-9 px-6 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                            filter === btn.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        )}
                    >
                        {btn.label}
                    </Button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="px-4 pb-20">
                <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-2xl shadow-primary/5 overflow-hidden">
                    <div className="divide-y divide-border/10">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => {
                                const styles = getTypeStyles(notification.type)
                                const Icon = styles.icon
                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "group p-8 flex flex-col sm:flex-row gap-6 transition-all duration-300 relative",
                                            !notification.read && "bg-primary/[0.02]",
                                            "hover:bg-primary/[0.04]"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-14 h-14 rounded-[1.5rem] shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                                            styles.bg,
                                            styles.color
                                        )}>
                                            <Icon className="w-6 h-6" />
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h3 className={cn(
                                                        "text-lg font-bold tracking-tight transition-colors",
                                                        !notification.read ? "text-foreground" : "text-muted-foreground/60"
                                                    )}>
                                                        {notification.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted/30 text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 border border-border/40">
                                                            {notification.category}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/20 italic">
                                                            <Clock className="w-3 h-3" />
                                                            {notification.date} • {notification.time}
                                                        </div>
                                                    </div>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                            <MoreVertical className="w-4 h-4 text-muted-foreground/40" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-2xl border-border/40 min-w-[160px] p-1.5">
                                                        {!notification.read && (
                                                            <DropdownMenuItem
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer px-4 py-2.5 focus:bg-primary/5 focus:text-primary"
                                                            >
                                                                <Check className="w-3.5 h-3.5 mr-2 opacity-50" />
                                                                Đã đọc
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer px-4 py-2.5 text-destructive focus:bg-destructive/5 focus:text-destructive"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-2 opacity-50" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <p className="max-w-3xl text-[13px] font-medium text-muted-foreground/60 leading-relaxed italic">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="py-32 text-center space-y-6">
                                <div className="w-24 h-24 rounded-[3rem] bg-muted/20 mx-auto flex items-center justify-center border border-border/10 relative">
                                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                                    <Sparkles className="w-10 h-10 text-muted-foreground/20 relative z-10" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-serif font-bold italic text-foreground/40 text-center">Matrix Clear</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">No notification streams matched your current filter.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
