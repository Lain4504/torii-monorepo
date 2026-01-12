'use client'

import { useAppSelector } from '@/hooks/hooks'
import { Bell, Search, Menu, ChevronDown, User, Settings, LogOut, Sparkles } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@workspace/ui/components/sheet'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    BookOpen,
    Award,
    CreditCard,
    GraduationCap,
    FileText,
    Clock,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { NotificationsDropdown } from './notifications-dropdown'

const navigation = [
    { name: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Khóa học của tôi', href: '/dashboard/my-courses', icon: BookOpen },
    { name: 'Chứng chỉ', href: '/dashboard/certificates', icon: Award },
    { name: 'Lịch sử học tập', href: '/dashboard/history', icon: Clock },
    { name: 'Hồ sơ', href: '/dashboard/profile', icon: User },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]

interface DashboardHeaderProps {
    isCollapsed?: boolean
    toggleSidebar?: () => void
}

export function DashboardHeader({ isCollapsed, toggleSidebar }: DashboardHeaderProps) {
    const { user } = useAppSelector((state) => state.auth)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Left: Mobile Menu & Brand */}
                    <div className="flex items-center gap-4">
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden rounded-xl hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
                                    aria-label="Toggle menu"
                                >
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0 border-r border-border/40 bg-background/95 backdrop-blur-xl">
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-serif font-bold text-lg tracking-tight italic">Torii <span className="text-primary not-italic">Learner</span></span>
                                    </div>
                                    <nav className="space-y-1">
                                        {navigation.map((item) => {
                                            const Icon = item.icon
                                            const isActive = pathname === item.href
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={cn(
                                                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer uppercase tracking-widest text-[10px]',
                                                        isActive
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span>{item.name}</span>
                                                </Link>
                                            )
                                        })}
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Desktop Sidebar Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="hidden lg:flex rounded-xl text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all"
                        >
                            <Menu className={cn("w-5 h-5 transition-transform", isCollapsed ? "rotate-90" : "")} />
                        </Button>

                        <Link href="/dashboard" className="hidden sm:flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                <Sparkles className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                            </div>
                            <span className="font-serif font-bold text-lg tracking-tight hidden md:block italic">Torii</span>
                        </Link>
                    </div>

                    {/* Center: Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Tìm kiếm bài học, kanji..."
                                className="pl-10 h-10 w-full bg-muted/40 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl transition-all text-sm font-medium placeholder:text-muted-foreground/40 shadow-none ring-0 focus-visible:ring-0"
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="rounded-2xl h-10 pl-1 pr-2 hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-border/40">
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="w-8 h-8 rounded-xl border border-border/40">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                                                {user?.displayName?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-[11px] font-bold text-foreground leading-none truncate max-w-[100px] uppercase tracking-wider">
                                                {user?.displayName || 'User'}
                                            </p>
                                        </div>
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-border/40 shadow-xl shadow-primary/5 animate-in slide-in-from-top-2 duration-200">
                                <DropdownMenuLabel className="px-4 py-3">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-sm font-bold text-foreground truncate">{user?.displayName}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-tighter">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border/40 mx-2" />
                                <div className="p-1">
                                    <Link href="/dashboard/profile">
                                        <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer focus:bg-primary/5 focus:text-primary">
                                            <User className="w-4 h-4 mr-3 opacity-70" />
                                            Hồ sơ cá nhân
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/dashboard/settings">
                                        <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer focus:bg-primary/5 focus:text-primary">
                                            <Settings className="w-4 h-4 mr-3 opacity-70" />
                                            Cài đặt tài khoản
                                        </DropdownMenuItem>
                                    </Link>
                                </div>
                                <DropdownMenuSeparator className="bg-border/40 mx-2" />
                                <div className="p-1">
                                    <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive/5 transition-colors cursor-pointer focus:bg-destructive/5 focus:text-destructive">
                                        <LogOut className="w-4 h-4 mr-3 opacity-70" />
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}
