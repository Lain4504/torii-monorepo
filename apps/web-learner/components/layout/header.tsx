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
    LogOut,
    Settings,
    Moon,
    Sun,
    Menu,
    X,
    ChevronDown,
    LayoutDashboard,
    Search,
    FileEdit,
    Newspaper
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
    const { setTheme } = useTheme()

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
        { nameKey: 'learner.header.post', href: '/post', icon: Newspaper },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-3xl supports-[backdrop-filter]:bg-background/40">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50 pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex h-24 items-center justify-between gap-6">
                    {/* Brand & Logo */}
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-4 group shrink-0">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 ease-out border border-white/10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Sparkles className="w-6 h-6 text-white relative z-10" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-black text-2xl tracking-tighter text-foreground leading-none">TORII</span>
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] opacity-80 pl-0.5">Nihongo Center</span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center p-1.5 rounded-2xl bg-muted/5 border border-white/5 backdrop-blur-md">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.nameKey}
                                        href={item.href}
                                        className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 hover:text-primary hover:bg-background/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex items-center gap-2 group"
                                    >
                                        <Icon className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                        {t(item.nameKey)}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-3">
                            {/* Language Switcher - Container */}
                            <div className="bg-muted/5 rounded-xl border border-white/5 p-1">
                                <LanguageSwitcher />
                            </div>

                            {/* Zen Theme Toggle */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative text-muted-foreground/60 hover:text-primary hover:bg-primary/5 rounded-xl h-11 w-11 transition-all group bg-muted/5 border border-white/5"
                                    >
                                        <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:rotate-45" />
                                        <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:-rotate-12" />
                                        <span className="sr-only">Toggle chromatic mode</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48 border-white/10 shadow-2xl bg-background/80 backdrop-blur-3xl p-3 rounded-[2rem] animate-in slide-in-from-top-2 duration-500"
                                >
                                    <div className="px-4 py-3 mb-2 border-b border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 italic">Chromatic Mode</p>
                                    </div>
                                    <div className="space-y-1">
                                        <DropdownMenuItem
                                            onClick={() => setTheme("light")}
                                            className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary transition-all flex items-center justify-between group/mode"
                                        >
                                            <span>Light Emission</span>
                                            <Sun className="size-3 opacity-20 group-hover/mode:opacity-100 transition-opacity" />
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setTheme("dark")}
                                            className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary transition-all flex items-center justify-between group/mode"
                                        >
                                            <span>Void Matrix</span>
                                            <Moon className="size-3 opacity-20 group-hover/mode:opacity-100 transition-opacity" />
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setTheme("system")}
                                            className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary transition-all flex items-center justify-between group/mode"
                                        >
                                            <span>System Logic</span>
                                            <div className="size-1 rounded-full bg-border group-hover/mode:bg-primary transition-colors" />
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="h-8 w-px bg-white/10 hidden sm:block mx-1" />

                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="rounded-2xl h-12 pl-2 pr-4 hover:bg-muted/10 transition-all cursor-pointer border border-transparent hover:border-white/5 bg-muted/5 group">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 rounded-xl border border-white/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-black uppercase">
                                                    {user?.displayName?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                                {/* {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} className="object-cover" />} */}
                                            </Avatar>
                                            <div className="flex flex-col items-start hidden md:flex">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80 group-hover:text-primary transition-colors">
                                                    {user?.displayName}
                                                </span>
                                                <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/40">Learner ID: {user?.id?.substring(0, 6)}</span>
                                            </div>
                                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-2 border-white/10 shadow-2xl bg-background/90 backdrop-blur-3xl animate-in slide-in-from-top-4 duration-300">
                                    <DropdownMenuLabel className="px-5 py-4 border-b border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic mb-1">Access Terminal</p>
                                        <p className="text-sm font-black text-foreground truncate">{user?.displayName}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground truncate opacity-50">{user?.email}</p>
                                    </DropdownMenuLabel>
                                    <div className="p-2 space-y-1">
                                        <Link href="/dashboard">
                                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer group">
                                                <LayoutDashboard className="w-4 h-4 mr-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                Main Dashboard
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/dashboard/settings">
                                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer group">
                                                <Settings className="w-4 h-4 mr-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                Configuration
                                            </DropdownMenuItem>
                                        </Link>
                                    </div>
                                    <DropdownMenuSeparator className="mx-2 bg-white/5" />
                                    <div className="p-2">
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-500/5 transition-colors cursor-pointer group"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                                            {isLoggingOut ? 'Disconnecting...' : 'Terminate Session'}
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" className="rounded-xl h-11 px-6 text-[10px] font-black uppercase tracking-widest hover:text-primary hover:bg-primary/5 transition-all cursor-pointer">
                                        {t('learner.header.login')}
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="rounded-xl h-11 px-8 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer">
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
                            className="lg:hidden rounded-xl w-12 h-12 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer border border-transparent hover:border-primary/10"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "lg:hidden fixed inset-x-0 top-24 bg-background/95 backdrop-blur-3xl border-b border-white/5 transition-all duration-500 ease-out origin-top overflow-hidden z-[49]",
                mobileMenuOpen ? "h-[calc(100vh-6rem)] opacity-100 scale-y-100" : "h-0 opacity-0 scale-y-0"
            )}>
                <div className="container mx-auto px-4 py-8 space-y-8">
                    <nav className="space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.nameKey}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-4 px-6 py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all duration-300 border border-transparent hover:border-primary/10"
                            >
                                <item.icon className="w-5 h-5 opacity-60" />
                                {t(item.nameKey)}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center justify-between px-2 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Visual Interface</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTheme(useTheme().theme === 'dark' ? 'light' : 'dark')}
                            className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest border-white/10"
                        >
                            Toggle Mode
                        </Button>
                    </div>

                    {!isAuthenticated && (
                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="outline" className="w-full rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest border-white/10 hover:bg-muted/10">
                                    {t('learner.header.login')}
                                </Button>
                            </Link>
                            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest bg-primary shadow-xl shadow-primary/20">
                                    {t('learner.header.registerFree')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}