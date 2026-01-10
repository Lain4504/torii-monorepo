'use client'

import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
import { logout } from '@/store/slices/authSlice'
import { Button } from '@workspace/ui/components/button'
import { LanguageSwitcher } from '@workspace/ui/components/language-switcher'
import { useTranslation } from '@workspace/i18n'
import {
    BookOpen,
    GraduationCap,
    Users,
    Sparkles,
    User,
    LogOut,
    Settings,
    Moon,
    Sun,
    Menu,
    X,
    ChevronDown,
    LayoutDashboard
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { toast } from '@workspace/ui/components/sonner'
import { cn } from '@workspace/ui/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

export function Header() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { theme, setTheme } = useTheme()

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await dispatch(logout()).unwrap()
            toast.success(t('learner.messages.logoutSuccess'))
            router.push('/')
            router.refresh()
        } catch (error: any) {
            toast.error(t('learner.messages.logoutFailed'))
        } finally {
            setIsLoggingOut(false)
        }
    }

    const navigation = [
        { nameKey: 'learner.header.courses', href: '/courses', icon: BookOpen },
        { nameKey: 'learner.header.liveClasses', href: '/live-classes', icon: Users },
        { nameKey: 'learner.header.jlptPractice', href: '/jlpt-practice', icon: GraduationCap },
        { nameKey: 'learner.header.flashcards', href: '/flashcards', icon: Sparkles },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between gap-4">
                    {/* Brand & Logo */}
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xl tracking-tighter text-foreground">TORII</span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] -mt-1 opacity-70">Nihongo Center</span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.nameKey}
                                        href={item.href}
                                        className="px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <Icon className="w-3.5 h-3.5 opacity-50" />
                                        {t(item.nameKey)}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <LanguageSwitcher />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="rounded-xl w-10 h-10 hover:bg-muted/50 transition-all cursor-pointer"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
                            </Button>
                        </div>

                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="rounded-2xl h-11 pl-1.5 pr-3 hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-border/40">
                                        <div className="flex items-center gap-2.5">
                                            <Avatar className="w-8 h-8 rounded-xl border border-border/40">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                                                    {user?.displayName?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="hidden md:block text-[11px] font-bold uppercase tracking-wider text-foreground">
                                                {user?.displayName}
                                            </span>
                                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-border/40 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                                    <DropdownMenuLabel className="px-4 py-3">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Tài khoản cá nhân</p>
                                        <p className="text-sm font-bold text-foreground truncate">{user?.displayName}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="mx-2" />
                                    <div className="p-1">
                                        <Link href="/dashboard">
                                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                                <LayoutDashboard className="w-4 h-4 mr-3 opacity-60" />
                                                Bảng điều khiển
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/dashboard/settings">
                                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                                <Settings className="w-4 h-4 mr-3 opacity-60" />
                                                Cài đặt
                                            </DropdownMenuItem>
                                        </Link>
                                    </div>
                                    <DropdownMenuSeparator className="mx-2" />
                                    <div className="p-1">
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 opacity-60" />
                                            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" className="rounded-xl h-11 px-6 text-[11px] font-bold uppercase tracking-widest hover:text-primary transition-all cursor-pointer">
                                        {t('learner.header.login')}
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="rounded-xl h-11 px-6 text-[11px] font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all cursor-pointer active:scale-95">
                                        {t('learner.header.registerFree')}
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden rounded-xl w-10 h-10 hover:bg-muted/50 cursor-pointer"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "lg:hidden fixed inset-x-0 top-20 bg-background/95 backdrop-blur-2xl border-b border-border/40 transition-all duration-300 origin-top overflow-hidden",
                mobileMenuOpen ? "h-[calc(100vh-5rem)] opacity-100 scale-y-100" : "h-0 opacity-0 scale-y-0"
            )}>
                <div className="container mx-auto px-4 py-8 space-y-6">
                    <nav className="space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.nameKey}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all duration-300"
                            >
                                <item.icon className="w-5 h-5 opacity-60" />
                                {t(item.nameKey)}
                            </Link>
                        ))}
                    </nav>

                    {!isAuthenticated && (
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/40">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="outline" className="w-full rounded-2xl h-12 text-[11px] font-bold uppercase tracking-widest">
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full rounded-2xl h-12 text-[11px] font-bold uppercase tracking-widest bg-primary">
                                    Đăng ký
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
