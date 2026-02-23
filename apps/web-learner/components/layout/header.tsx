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
                        <Link href="/" className="flex items-center gap-3 shrink-0 group">
                            <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="size-5 text-primary-foreground" />
                            </div>
                            <span className="font-black text-lg tracking-tighter">
                                Torii <span className="text-primary">Nihongo</span>
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-1">
                            {navigation.map((item) => (
                                <Button
                                    key={item.name}
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 font-bold px-4 rounded-full transition-all"
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
                            <Link href="/dashboard/wallet" className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                                <Coins className="size-4" />
                                {formatNumber((user as any)?.balance || 0)}
                            </Link>
                        )}

                        {/* Theme Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full">
                                    <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                                <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => setTheme('light')}>Chế độ Sáng</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => setTheme('dark')}>Chế độ Tối</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => setTheme('system')}>Theo Hệ thống</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Menu / Auth Buttons */}
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-primary/10 ring-offset-background hover:ring-primary/20 transition-all">
                                        <Avatar className="size-8">
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-3 shadow-2xl border-border/50">
                                    <DropdownMenuLabel className="font-normal px-2 pb-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-black leading-none">{user?.displayName}</p>
                                            <p className="text-xs text-muted-foreground truncate font-medium">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="mx-2 mb-2" />
                                    <DropdownMenuGroup className="space-y-1">
                                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
                                            <Link href="/dashboard">
                                                <LayoutDashboard className="mr-3 size-4 text-primary" />
                                                <span className="font-bold">Tổng quan Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
                                            <Link href="/dashboard/settings">
                                                <Settings className="mr-3 size-4 text-muted-foreground" />
                                                <span className="font-bold">Cài đặt tài khoản</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="mx-2 my-2" />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="text-destructive focus:text-destructive cursor-pointer rounded-xl py-2.5 font-bold"
                                    >
                                        <LogOut className="mr-3 size-4" />
                                        {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild className="rounded-full font-bold px-5">
                                    <Link href="/login">Đăng nhập</Link>
                                </Button>
                                <Button size="sm" asChild className="rounded-full font-black px-6 shadow-lg shadow-primary/20">
                                    <Link href="/register">Tham gia ngay</Link>
                                </Button>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-full"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t bg-background/95 backdrop-blur-xl absolute w-full left-0 p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    <nav className="flex flex-col gap-2 mb-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                            >
                                <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                    <item.icon className="size-4" />
                                </div>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <Separator className="mb-6 opacity-50" />

                    <div className="space-y-4">
                        {!isAuthenticated && (
                            <div className="grid gap-3">
                                <Button variant="outline" className="w-full h-12 rounded-2xl font-bold" asChild>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                                </Button>
                                <Button className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/20" asChild>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Bắt đầu miễn phí</Link>
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-4 h-12 rounded-2xl bg-muted/30">
                            <span className="text-sm font-bold text-muted-foreground">Chế độ giao diện</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full hover:bg-transparent"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
                                <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
