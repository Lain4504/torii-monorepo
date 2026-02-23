'use client'

import Link from 'next/link'
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
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Separator } from '@workspace/ui/components/separator'

const navigation = [
    { name: 'Khóa học', href: '/courses', icon: BookOpen },
    { name: 'Lớp trực tuyến', href: '/live-classes', icon: Users },
    { name: 'Cộng đồng', href: '/post', icon: Newspaper },
    { name: 'Test', href: '/placement-test', icon: Award },
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
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4">
                <div className="flex h-14 items-center justify-between gap-4">
                    {/* Brand + Nav */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2.5 shrink-0">
                            <div className="size-7 rounded-md bg-primary flex items-center justify-center">
                                <svg className="size-4 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M3 10h18" strokeLinecap="round" />
                                    <path d="M5 10v8" strokeLinecap="round" />
                                    <path d="M19 10v8" strokeLinecap="round" />
                                    <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="font-bold text-base tracking-tight">
                                Torii <span className="text-primary">Nihongo</span>
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-0.5">
                            {navigation.map((item) => (
                                <Button
                                    key={item.name}
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <Link href={item.href}>
                                        {item.name}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Balance */}
                        {isAuthenticated && (
                            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                                <Coins className="size-3.5" />
                                {formatNumber((user as any)?.balance || 0)}
                            </div>
                        )}

                        {/* Theme Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hidden sm:flex">
                                    <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTheme('light')}>Chế độ Sáng</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('dark')}>Chế độ Tối</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('system')}>Theo Hệ thống</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Menu / Auth Buttons */}
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Avatar className="size-8">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex flex-col space-y-1 p-2">
                                        <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 size-4" /> Tổng quan
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings" className="cursor-pointer">
                                            <Settings className="mr-2 size-4" /> Cài đặt tài khoản
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Đăng nhập</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/register">Đăng ký</Link>
                                </Button>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t bg-background absolute w-full left-0 p-4 shadow-md">
                    <nav className="flex flex-col gap-1 mb-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                            >
                                <item.icon className="size-4 text-primary" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <Separator className="mb-4" />

                    <div className="space-y-2">
                        {!isAuthenticated && (
                            <div className="grid gap-2">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                                </Button>
                                <Button className="w-full" asChild>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Đăng ký miễn phí</Link>
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-sm text-muted-foreground">Giao diện</span>
                            <Button
                                variant="ghost"
                                size="icon"
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
