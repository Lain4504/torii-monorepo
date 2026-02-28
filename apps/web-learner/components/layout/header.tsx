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
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
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
        <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800" data-purpose="main-nav">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 group transition-all duration-300">
                        <div className="relative size-8 transition-transform duration-300 group-hover:scale-110">
                            <Image
                                src="/logo.png"
                                alt="Torii Nihongo Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-sm font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Torii</span>
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[oklch(0.55_0.15_15)] uppercase">Nihongo</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="hover:text-[oklch(0.55_0.15_15)] transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.15_15)]/50">
                                        <Avatar className="size-9">
                                            <AvatarFallback className="bg-[oklch(0.55_0.15_15)]/10 text-[oklch(0.55_0.15_15)] text-xs font-bold">
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
                                            <LayoutDashboard className="mr-3 size-4 text-[oklch(0.55_0.15_15)]" />
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
                                <Link href="/login" className="hidden md:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">Đăng nhập</Link>
                                <Link href="/register" className="hidden md:block px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm">Đăng ký</Link>
                            </>
                        )}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
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
                <div className="md:hidden border-t bg-background absolute w-full left-0 p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
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
                                <Button className="w-full bg-[oklch(0.55_0.15_15)] text-white hover:bg-[oklch(0.55_0.15_15)]/90" asChild>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Bắt đầu miễn phí</Link>
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-4 py-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-3">
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
