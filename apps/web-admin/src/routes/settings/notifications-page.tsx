'use client'

import { useState } from 'react'
import { Bell, Search, Check, Trash2, Clock, Info, CheckCircle2, AlertTriangle, XCircle, MoreVertical, BellOff } from 'lucide-react'
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
  node: string
  category: 'system' | 'security' | 'finance' | 'identity'
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Registry Sync Success',
    message: 'Master branch successfully merged into course-registry. All nodes updated across the cluster.',
    time: '5 mins ago',
    date: '12/01/2026',
    read: false,
    type: 'success',
    node: 'System',
    category: 'system'
  },
  {
    id: '2',
    title: 'New Identity Registered',
    message: '3 users have been successfully verified and added to the learner database.',
    time: '1 hour ago',
    date: '12/01/2026',
    read: false,
    type: 'info',
    node: 'User Gate',
    category: 'identity'
  },
  {
    id: '3',
    title: 'Scheduled Maintenance',
    message: 'System optimization scheduled for 02:00 UTC. Expected duration: 15 mins.',
    time: '3 hours ago',
    date: '12/01/2026',
    read: true,
    type: 'warning',
    node: 'Infrastructure',
    category: 'system'
  },
  {
    id: '4',
    title: 'Transaction Authorized',
    message: 'Premium subscription confirmed for User #X72.',
    time: '1 day ago',
    date: '11/01/2026',
    read: true,
    type: 'success',
    node: 'Finance',
    category: 'finance'
  },
  {
    id: '5',
    title: 'Security Alert',
    message: 'Multiple invalid login attempts detected. Firewall engaged.',
    time: '2 days ago',
    date: '10/01/2026',
    read: true,
    type: 'error',
    node: 'Security',
    category: 'security'
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'security'>('all')
  const [search, setSearch] = useState('')

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
    if (filter === 'all') return matchesSearch
    if (filter === 'unread') return !n.read && matchesSearch
    if (filter === 'system') return n.category === 'system' && matchesSearch
    if (filter === 'security') return n.category === 'security' && matchesSearch
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-medium tracking-wide">
            <Bell className="w-3.5 h-3.5" />
            System Updates
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.1]">
            Notification <span className="text-primary italic">Center</span>
          </h1>
          <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg border-l-2 border-primary/20 pl-4 mt-4">
            Stay updated with important alerts, system messages, and community updates for <span className="text-foreground font-medium">Torii Academy</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
            className="rounded-xl h-10 px-4 text-xs font-medium border-border/40 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Quick Actions & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
        <Card className="md:col-span-3 rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 p-2 flex items-center shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
            <Input
              placeholder="Search notifications..."
              className="pl-14 h-14 border-transparent bg-transparent focus-visible:ring-0 text-sm font-medium placeholder:text-muted-foreground/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>
        <div className="flex items-center p-2 rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-sm">
          <div className="flex-1 flex justify-center gap-2">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Unread</p>
              <h3 className="text-2xl font-serif font-medium text-primary">{unreadCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 px-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'system', label: 'System' },
          { id: 'security', label: 'Security' }
        ].map((btn) => (
          <Button
            key={btn.id}
            variant="ghost"
            onClick={() => setFilter(btn.id as any)}
            className={cn(
              "rounded-full h-9 px-6 text-[11px] font-medium transition-all cursor-pointer",
              filter === btn.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="px-4 pb-20">
        <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-white/20 shadow-xl shadow-black/5 overflow-hidden">
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
                            "text-lg font-medium tracking-tight transition-colors",
                            !notification.read ? "text-foreground" : "text-muted-foreground/60"
                          )}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted/30 text-[10px] font-medium text-primary border border-primary/20">
                              {notification.node}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted/30 text-[10px] font-medium text-muted-foreground/60 border border-border/40">
                              {notification.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/40">
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
                                className="rounded-xl text-xs font-medium cursor-pointer px-4 py-2.5 focus:bg-primary/5 focus:text-primary"
                              >
                                <Check className="w-3.5 h-3.5 mr-2 opacity-50" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteNotification(notification.id)}
                              className="rounded-xl text-xs font-medium cursor-pointer px-4 py-2.5 text-destructive focus:bg-destructive/5 focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2 opacity-50" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="max-w-3xl text-sm font-medium text-muted-foreground/70 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-32 text-center space-y-6">
                <div className="w-24 h-24 rounded-[3rem] bg-muted/20 mx-auto flex items-center justify-center border border-white/10 relative">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                  <BellOff className="w-10 h-10 text-muted-foreground/20 relative z-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-medium text-foreground/40 text-center">No Notifications</h3>
                  <p className="text-xs font-medium text-muted-foreground/30">You're all caught up!</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
