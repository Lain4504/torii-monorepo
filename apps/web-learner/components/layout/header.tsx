'use client'

import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
import { logout } from '@/store/slices/authSlice'
import { Button } from '@workspace/ui/components/button'

import {
    BookOpen,
    GraduationCap,
    Users,
    Calendar,
    Sparkles,
    User,
    LogOut,
    Settings,
    Moon,
    Sun,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { toast } from '@workspace/ui/components/sonner'

export function Header() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { theme, setTheme } = useTheme()

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await dispatch(logout()).unwrap()

            toast.success('Đăng xuất thành công', {
                description: 'Hẹn gặp lại bạn!',
            })

            setUserMenuOpen(false)
            setMobileMenuOpen(false)
            router.push('/')
            router.refresh()
        } catch (error: any) {
            console.error('Logout error:', error)
            toast.error('Đăng xuất thất bại', {
                description: error.message || 'Vui lòng thử lại',
            })
        } finally {
            setIsLoggingOut(false)
        }
    }

    const navigation = [
        { name: 'Khóa học', href: '/courses', icon: BookOpen },
        { name: 'Lớp trực tuyến', href: '/live-classes', icon: Users },
        { name: 'Luyện thi JLPT', href: '/jlpt-practice', icon: GraduationCap },
        { name: 'Flashcards', href: '/flashcards', icon: Sparkles },
    ]

    return (
        <div className="flex flex-col w-full">


            {/* Main Header */}
            <header className="sticky top-0 z-50 w-full border-b border-teal-100 dark:border-teal-900 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group">
                                {/* Torii Gate Icon */}
                                <div className="relative">
                                    <svg className="w-8 h-8 text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 10h18" strokeLinecap="round" />
                                        <path d="M5 10v8" strokeLinecap="round" />
                                        <path d="M19 10v8" strokeLinecap="round" />
                                        <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                        Torii Nihongo
                                    </span>
                                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                                        日本語センター
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex items-center gap-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                )}
                            </button>

                            {/* User Menu or Auth Buttons */}
                            {isAuthenticated ? (
                                <div className="relative hidden lg:block">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                                            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm font-medium text-slate-900 dark:text-white hidden xl:block">
                                            {user?.displayName}
                                        </span>
                                    </button>

                                    {/* User Dropdown */}
                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.displayName}</p>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user?.email}</p>
                                                </div>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span>Bảng điều khiển</span>
                                                </Link>
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>Cài đặt</span>
                                                </Link>
                                                <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                                                <button
                                                    onClick={handleLogout}
                                                    disabled={isLoggingOut}
                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden lg:flex items-center gap-3">
                                    <Button variant="ghost" asChild>
                                        <Link href="/login">Đăng nhập</Link>
                                    </Button>
                                    <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
                                        <Link href="/register">Đăng ký miễn phí</Link>
                                    </Button>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                ) : (
                                    <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                )
                            })}

                            {isAuthenticated ? (
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="font-medium">Bảng điều khiển</span>
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span className="font-medium">Cài đặt</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href="/login">Đăng nhập</Link>
                                    </Button>
                                    <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                                        <Link href="/register">Đăng ký miễn phí</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </div>
    )
}
