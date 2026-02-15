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
    Sparkles,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

export function Header() {
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
            toast.success('Đăng xuất thành công')
            router.push('/')
            router.refresh()
        } catch (error: any) {
            toast.error('Đăng xuất thất bại')
        } finally {
            setIsLoggingOut(false)
        }
    }

    const navigation = [
        { name: 'Khóa học', href: '/courses', icon: BookOpen },
        { name: 'Lớp trực tuyến', href: '/live-classes', icon: Users },
        { name: 'Cộng đồng', href: '/post', icon: Newspaper },
        { name: 'Test', href: '/placement-test', icon: Award },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-6">
                    {/* Brand & Logo */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="font-sans font-bold text-xl tracking-tight text-foreground">
                                TORII <span className="text-primary font-normal">Nihongo</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex items-center gap-2"
                                    >
                                        <Icon className="w-4 h-4 text-muted-foreground" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {isAuthenticated && (
                            <div className="hidden sm:flex items-center px-3 py-1 bg-yellow-500/10 rounded-full text-yellow-600 dark:text-yellow-500 font-bold text-sm gap-2 border border-yellow-500/20 shadow-sm">
                                <Coins className="w-4 h-4" />
                                <span>{((user as any)?.balance || 0).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="hidden sm:flex items-center gap-2">
                            {/* Theme Toggle */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-md">
                                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                        <span className="sr-only">Toggle theme</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        Chế độ Sáng
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        Chế độ Tối
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        Theo Hệ thống
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative p-0 h-9 w-9 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                {user?.displayName?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                                    <div className="flex flex-col space-y-1 p-2">
                                        <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Tổng quan</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Cài đặt tài khoản</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="text-red-500 focus:text-red-500 cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-sm font-bold">
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="font-bold shadow-sm">
                                        Đăng ký miễn phí
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-md absolute w-full left-0 top-16 p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-4 duration-200">
                    <nav className="flex flex-col gap-2">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transaction-colors text-foreground/80"
                                >
                                    <Icon className="w-5 h-5 text-primary" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="flex flex-col gap-3 pt-4 border-t border-border/40">
                        {!isAuthenticated && (
                            <>
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full justify-start font-bold">
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full justify-start font-bold">
                                        Đăng ký miễn phí
                                    </Button>
                                </Link>
                            </>
                        )}
                        <div className="flex items-center justify-between px-2">
                            <span className="text-sm font-medium text-muted-foreground">Giao diện</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme(useTheme().theme === 'dark' ? 'light' : 'dark')}
                                className="h-8 w-8"
                            >
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
