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
    Sparkles,
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
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Brand + Nav */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 shrink-0">
                            <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
                                <Sparkles className="size-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">
                                Torii <span className="text-primary">Nihongo</span>
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-2">
                            {navigation.map((item) => (
                                <Button
                                    key={item.name}
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground"
                                >
                                    <Link href={item.href}>
                                        {item.name}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Balance */}
                        {isAuthenticated && (
                            <Link href="/dashboard/wallet" className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-muted text-xs font-bold border hover:bg-muted/80 transition-colors">
                                <Coins className="size-4 text-amber-500" />
                                {formatNumber((user as any)?.balance || 0)}
                            </Link>
                        )}

                        {/* Theme Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
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
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none">{user?.displayName}</p>
                                            <p className="text-xs text-muted-foreground truncate font-medium">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard">
                                                <LayoutDashboard className="mr-2 size-4" />
                                                <span>Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/settings">
                                                <Settings className="mr-2 size-4" />
                                                <span>Cài đặt tài khoản</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="text-destructive focus:text-destructive"
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
                                    <Link href="/register">Tham gia ngay</Link>
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
                            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
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
