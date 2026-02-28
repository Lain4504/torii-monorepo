'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
import { logout } from '@/store/slices/authSlice'
import { Button } from '@workspace/ui/components/button'
import {
    BookOpen,
    Users,
    Newspaper,
    Award,
    LogOut,
    Moon,
    Sun,
    Menu,
    X,
    LayoutDashboard,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from '@workspace/ui/components/sonner'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Separator } from '@workspace/ui/components/separator'
import { Switch } from '@workspace/ui/components/switch'
import { cn } from "@workspace/ui/lib/utils"

const navigation = [
    { name: 'Trang chủ', href: '/', icon: LayoutDashboard },
    { name: 'Khóa học', href: '/courses', icon: BookOpen },
    { name: 'Lớp trực tuyến', href: '/live-classes', icon: Users },
    { name: 'Blog', href: '/blog', icon: Newspaper },
]

export function Header() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const pathname = usePathname()
    const isHome = pathname === '/'
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await dispatch(logout()).unwrap()
            toast.success('Đăng xuất thành công')
            router.push('/')
            router.refresh()
        } catch {
            toast.error('Đăng xuất thất bại')
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-500",
                isHome
                    ? scrolled
                        ? "bg-background/90 backdrop-blur-xl border-b border-primary/20 py-1"
                        : "bg-transparent py-2"
                    : scrolled
                        ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm py-1"
                        : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-2"
            )}
            data-purpose="main-nav"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    <Link href="/" className="flex items-center gap-3 group transition-all duration-300">
                        <div className="relative size-7 sm:size-8 transition-transform duration-300 group-hover:scale-110">
                            <Image
                                src="/logo.png"
                                alt="Torii Nihongo Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className={cn(
                                scrolled ? 'text-sm' : 'text-base',
                                "font-black tracking-tighter uppercase italic transition-all duration-500",
                                isHome && !scrolled ? "text-white" : "text-foreground"
                            )}>
                                Torii
                            </span>
                            <span className="text-[9px] font-bold tracking-[0.2em] text-primary uppercase">
                                Nihongo
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-10 text-sm font-medium">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "transition-all duration-300 relative group",
                                    isHome && !scrolled ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-primary",
                                    pathname === item.href && "text-primary font-bold"
                                )}
                            >
                                <span className="[font-family:var(--font-space)] tracking-wider uppercase text-[10px]">{item.name}</span>
                                <span className={cn(
                                    "absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full",
                                    isHome && !scrolled ? "bg-white" : "bg-primary",
                                    pathname === item.href && "w-full"
                                )}></span>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="rounded-full focus:outline-none ring-offset-background focus:ring-2 focus:ring-primary/50">
                                        <Avatar className={cn(
                                            "size-9 transition-all duration-300",
                                            isHome && !scrolled ? "ring-2 ring-white/30" : "ring-1 ring-slate-200 dark:ring-slate-800"
                                        )}>
                                            <AvatarFallback className={cn(
                                                "text-xs font-bold",
                                                isHome && !scrolled ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
                                            )}>
                                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 p-2 shadow-2xl border-primary/10" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal px-2 pb-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none">{user?.displayName || 'Người dùng'}</p>
                                            <p className="text-xs leading-none text-muted-foreground font-medium">
                                                {user?.email || 'Học viên'}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="mx-2 mb-2" />
                                    <DropdownMenuGroup className="space-y-1">
                                        <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard')}>
                                            <LayoutDashboard className="mr-3 size-4 text-primary" />
                                            <span>Dashboard</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="mx-2 my-2" />
                                    <DropdownMenuGroup className="space-y-1">
                                        <DropdownMenuItem className="py-2 font-medium flex items-center justify-between" onSelect={(e) => e.preventDefault()}>
                                            <div className="flex items-center">
                                                {theme === 'dark' ? <Sun className="mr-3 size-4 text-muted-foreground" /> : <Moon className="mr-3 size-4 text-muted-foreground" />}
                                                <span>Giao diện tối</span>
                                            </div>
                                            <Switch
                                                checked={theme === 'dark'}
                                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                            />
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="mx-2 my-2" />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="cursor-pointer text-destructive focus:text-destructive py-2 font-medium"
                                    >
                                        <LogOut className="mr-3 size-4" />
                                        {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className={cn(
                                        "hidden md:block text-[10px] font-bold uppercase tracking-widest [font-family:var(--font-space)] transition-colors",
                                        isHome && !scrolled ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-primary"
                                    )}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className={cn(
                                        "hidden md:block px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest [font-family:var(--font-space)] rounded-sm transition-all shadow-xl",
                                        "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95"
                                    )}
                                >
                                    Join Journey
                                </Link>
                            </>
                        )}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "shrink-0 transition-colors",
                                    isHome && !scrolled ? "text-white" : "text-foreground"
                                )}
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className={cn(
                    "md:hidden border-t absolute w-full left-0 p-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 border-border bg-background",
                    isHome && "border-primary/20"
                )}>
                    <nav className="flex flex-col gap-2 mb-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-sm text-xs font-bold uppercase tracking-[0.2em] [font-family:var(--font-space)] transition-all",
                                    "text-foreground/80 hover:bg-primary/10 hover:text-primary",
                                    pathname === item.href && "bg-primary/10 text-primary"
                                )}
                            >
                                <item.icon className="size-4 opacity-50" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <Separator className={cn("mb-8", isHome ? "bg-primary/10" : "bg-border")} />

                    <div className="space-y-6">
                        {!isAuthenticated && (
                            <div className="grid gap-4">
                                <Button variant="outline" className={cn(
                                    "w-full rounded-sm font-bold uppercase tracking-widest text-xs py-5",
                                    isHome && "border-primary/20 text-primary hover:bg-primary/5"
                                )} asChild>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                                </Button>
                                <Button className="w-full rounded-sm font-bold uppercase tracking-widest text-xs py-5 shadow-xl bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Begin Journey</Link>
                                </Button>
                            </div>
                        )}
                        <div className={cn(
                            "flex items-center justify-between px-6 py-4 rounded-sm transition-colors",
                            isHome ? "bg-primary/5" : "bg-muted/50"
                        )}>
                            <div className="flex items-center gap-4">
                                {theme === 'dark' ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
                                <span className="text-sm font-medium">Giao diện tối</span>
                            </div>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
