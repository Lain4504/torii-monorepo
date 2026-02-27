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
    Settings,
    Moon,
    Sun,
    Menu,
    X,
    LayoutDashboard,
    Coins,
    BadgeCheck,
    Bell,
    Heart,
    Search,
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { toast } from '@workspace/ui/components/sonner'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { formatNumber } from '@/utils/format-utils'
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
import { cn } from "@workspace/ui/lib/utils"

const navigation = [
    { name: 'Khóa học', href: '/courses', icon: BookOpen },
    { name: 'Lớp trực tuyến', href: '/live-classes', icon: Users },
    { name: 'Cộng đồng', href: '/blog', icon: Newspaper },
    { name: 'Kiểm tra', href: '/assessment', icon: Award },
]

export function Header() {
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
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800">

            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden lg:flex items-center justify-between gap-4 px-6 py-4 max-w-[1280px] mx-auto">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2.5 shrink-0">
                        <Image src="/logo.png" alt="Torii Nihongo" width={32} height={32} className="rounded-lg" />
                        <span className="text-xl font-bold tracking-tight text-primary">Torii Nihongo</span>
                    </Link>
                    <nav className="flex items-center gap-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.name === 'Kiểm tra' && !isAuthenticated ? '/placement-test' : item.href}
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right: Search + Balance + Auth */}
                <div className="flex items-center gap-4">
                    <div className="relative w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="Tìm kiếm..."
                            type="text"
                        />
                    </div>

                    {isAuthenticated && (
                        <Link href="/dashboard/wallet" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Coins className="size-4 text-amber-500" />
                            {formatNumber((user as any)?.balance || 0)}
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50">
                                    <Avatar className="size-9">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 p-2 shadow-md" align="end" forceMount>
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
                                        <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/profile')}>
                                            <BadgeCheck className="mr-3 size-4 text-primary" />
                                            <span>Hồ sơ cá nhân</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/notifications')}>
                                            <Bell className="mr-3 size-4 text-muted-foreground" />
                                            <span>Thông báo</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/wishlist')}>
                                            <Heart className="mr-3 size-4 text-muted-foreground" />
                                            <span>Khóa học yêu thích</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/settings')}>
                                            <Settings className="mr-3 size-4 text-muted-foreground" />
                                            <span>Cài đặt tài khoản</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="mx-2 my-2" />
                                    <DropdownMenuGroup className="space-y-1">
                                        <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                            {theme === 'dark' ? <Sun className="mr-3 size-4 text-muted-foreground" /> : <Moon className="mr-3 size-4 text-muted-foreground" />}
                                            <span>Đổi giao diện ({theme === 'dark' ? 'Sáng' : 'Tối'})</span>
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
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                Đăng nhập
                            </Link>
                            <Link href="/register" className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
                                Tham gia ngay
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ── MOBILE LAYOUT ── */}
            <div className="lg:hidden container mx-auto px-4">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Hamburger (Left) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>

                    {/* Brand - centered */}
                    <Link href="/" className={cn(
                        "flex items-center gap-2.5 shrink-0",
                        "absolute left-1/2 -translate-x-1/2"
                    )}>
                        <Image src="/logo.png" alt="Torii Nihongo" width={36} height={36} className="rounded-lg" />
                        <span className="font-bold text-lg tracking-tight">
                            Torii <span className="text-primary">Nihongo</span>
                        </span>
                    </Link>

                    {/* Right: Avatar or Auth */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Avatar className="size-8">
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 p-2 shadow-md" align="end" forceMount>
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
                                        <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/profile')}>
                                            <BadgeCheck className="mr-3 size-4 text-primary" />
                                            <span>Hồ sơ cá nhân</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => router.push('/dashboard/settings')}>
                                            <Settings className="mr-3 size-4 text-muted-foreground" />
                                            <span>Cài đặt tài khoản</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="mx-2 my-2" />
                                    <DropdownMenuGroup className="space-y-1">
                                        <DropdownMenuItem className="cursor-pointer py-2 font-medium" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                            {theme === 'dark' ? <Sun className="mr-3 size-4 text-muted-foreground" /> : <Moon className="mr-3 size-4 text-muted-foreground" />}
                                            <span>Đổi giao diện ({theme === 'dark' ? 'Sáng' : 'Tối'})</span>
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
                            <Button size="sm" asChild className="text-xs">
                                <Link href="/login">Đăng nhập</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t bg-background absolute w-full left-0 p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
                    <nav className="flex flex-col gap-1 mb-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium hover:bg-muted transition-colors"
                            >
                                <item.icon className="size-5 text-muted-foreground" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <Separator className="mb-6" />

                    <div className="space-y-4">
                        {!isAuthenticated && (
                            <div className="grid gap-3">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                                </Button>
                                <Button className="w-full" asChild>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Bắt đầu miễn phí</Link>
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-4 py-3 rounded-md bg-muted/50">
                            <span className="text-sm font-medium">Chế độ giao diện</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
