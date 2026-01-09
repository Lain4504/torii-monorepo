'use client'

import { useAppSelector } from '@/hooks/hooks'
import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@workspace/ui/components/sheet'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    BookOpen,
    Award,
    CreditCard,
    User,
    Settings,
    GraduationCap,
    FileText,
    Clock,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

const navigation = [
    { name: 'Khóa học của tôi', href: '/dashboard/my-courses', icon: BookOpen },
    { name: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chứng chỉ', href: '/dashboard/certificates', icon: Award },
    { name: 'Lịch sử học tập', href: '/dashboard/history', icon: Clock },
    { name: 'Hồ sơ', href: '/dashboard/profile', icon: User },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]

const quickLinks = [
    { name: 'Ghi chú', href: '/dashboard/notes', icon: FileText },
    { name: 'Luyện thi JLPT', href: '/jlpt-practice', icon: GraduationCap },
]

export function DashboardHeader() {
    const { user } = useAppSelector((state) => state.auth)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden cursor-pointer"
                                    aria-label="Toggle menu"
                                >
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0">
                                <nav className="p-4 space-y-1">
                                    {navigation.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={cn(
                                                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
                                                    isActive
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                )}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span>{item.name}</span>
                                            </Link>
                                        )
                                    })}
                                    <div className="pt-6 mt-6 border-t">
                                        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            Liên kết nhanh
                                        </p>
                                        {quickLinks.map((item) => {
                                            const Icon = item.icon
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 cursor-pointer"
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span>{item.name}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </nav>
                            </SheetContent>
                        </Sheet>
                        <Link href="/dashboard" className="hidden sm:block">
                            <h1 className="text-xl font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                                Trang chủ
                            </h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
                        <div className="relative flex-1 hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm khóa học, bài học..."
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="cursor-pointer" aria-label="Notifications">
                            <Bell className="w-5 h-5" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="cursor-pointer" aria-label="User menu">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                                        {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium text-foreground">{user?.displayName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}

