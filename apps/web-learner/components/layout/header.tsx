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
    Search,
    ChevronDown
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from '@workspace/ui/components/sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
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
    { name: 'Trang chủ', href: '/' },
    { name: 'Khóa học', href: '/courses' },
    { name: 'Lớp học Live', href: '/live-classes' },
    { name: 'Cộng đồng', href: '/blog' },
]

export function Header() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const pathname = usePathname()
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
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="relative size-8 sm:size-9">
                            <Image
                                src="/logo.png"
                                alt="Torii Nihongo Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col leading-[1.1]">
                            <span className="text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
                                Torii
                            </span>
                            <span className="text-[10px] font-bold tracking-[0.15em] text-primary uppercase">
                                Nihongo
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-bold transition-all rounded-full hover:bg-slate-50",
                                    pathname === item.href
                                        ? "text-primary bg-primary/5"
                                        : "text-slate-600 hover:text-primary"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-10 w-10 sm:h-11 sm:w-auto sm:px-2 rounded-xl gap-2 hover:bg-slate-50 border border-transparent hover:border-slate-100">
                                        <Avatar className="size-8">
                                            <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || 'Avatar'} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                                                {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChevronDown className="hidden sm:block size-4 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 p-2 rounded-2xl" align="end">
                                    <DropdownMenuLabel className="font-normal p-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold leading-none">{user?.displayName}</p>
                                            <p className="text-xs leading-none text-slate-500 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup className="p-1">
                                        <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer rounded-xl h-10">
                                            <LayoutDashboard className="mr-2 size-4 text-slate-400" />
                                            <span className="font-bold text-slate-700">Bảng điều khiển</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer rounded-xl h-10">
                                            <BookOpen className="mr-2 size-4 text-slate-400" />
                                            <span className="font-bold text-slate-700">Khoá học của tôi</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between rounded-xl h-10">
                                        <div className="flex items-center">
                                            {theme === 'dark' ? <Sun className="mr-2 size-4 text-slate-400" /> : <Moon className="mr-2 size-4 text-slate-400" />}
                                            <span className="font-bold text-slate-700">Chùm tối</span>
                                        </div>
                                        <Switch
                                            checked={theme === 'dark'}
                                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                        />
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="text-destructive focus:text-destructive cursor-pointer font-black rounded-xl h-10"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        {isLoggingOut ? 'Đang thoát...' : 'Thoát ra'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" className="hidden sm:flex text-sm font-black h-11 px-5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-primary transition-all" asChild>
                                    <Link href="/login">Vào học</Link>
                                </Button>
                                <Button className="h-11 px-6 font-black text-xs uppercase tracking-[0.1em] rounded-xl bg-primary hover:bg-red-700 shadow-lg shadow-red-200" asChild>
                                    <Link href="/register">Tham gia</Link>
                                </Button>
                            </div>
                        )}

                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col p-4 gap-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "px-4 py-3 rounded-md text-sm font-bold transition-all",
                                    pathname === item.href ? "bg-primary/5 text-primary" : "text-foreground/60 hover:bg-muted"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-sm font-bold">Giao diện tối</span>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>
                        {!isAuthenticated && (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Button variant="outline" className="h-12 w-full font-bold" asChild>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Vào học</Link>
                                </Button>
                                <Button className="h-12 w-full font-bold" asChild>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Tham gia</Link>
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}
