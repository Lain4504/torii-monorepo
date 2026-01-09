'use client'

import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/hooks/hooks'
import { logout } from '@/store/slices/authSlice'
import { Button } from '@workspace/ui/components/button'
import { LanguageSwitcher } from '@workspace/ui/components/language-switcher'
import { useTranslation } from '@workspace/i18n'

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
    const { t } = useTranslation()
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

            toast.success(t('learner.messages.logoutSuccess'), {
                description: t('learner.messages.seeYouAgain'),
            })

            setUserMenuOpen(false)
            setMobileMenuOpen(false)
            router.push('/')
            router.refresh()
        } catch (error: any) {
            console.error('Logout error:', error)
            toast.error(t('learner.messages.logoutFailed'), {
                description: error.message || t('learner.messages.pleaseTryAgain'),
            })
        } finally {
            setIsLoggingOut(false)
        }
    }

    const navigation = [
        { nameKey: 'learner.header.courses', href: '/courses', icon: BookOpen },
        { nameKey: 'learner.header.liveClasses', href: '/live-classes', icon: Users },
        { nameKey: 'learner.header.jlptPractice', href: '/jlpt-practice', icon: GraduationCap },
        { nameKey: 'learner.header.flashcards', href: '/flashcards', icon: Sparkles },
    ]

    return (
        <div className="flex flex-col w-full">


            {/* Main Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group">
                                {/* Torii Gate Icon */}
                                <div className="relative">
                                    <svg className="w-8 h-8 text-primary group-hover:opacity-80 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 10h18" strokeLinecap="round" />
                                        <path d="M5 10v8" strokeLinecap="round" />
                                        <path d="M19 10v8" strokeLinecap="round" />
                                        <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg text-foreground group-hover:text-primary/80 transition-colors">
                                        Torii Nihongo
                                    </span>
                                    <span className="text-xs text-muted-foreground font-medium">
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
                                            key={item.nameKey}
                                            href={item.href}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{t(item.nameKey)}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher />

                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <Moon className="w-5 h-5 text-muted-foreground" />
                                )}
                            </button>

                            {/* User Menu or Auth Buttons */}
                            {isAuthenticated ? (
                                <div className="relative hidden lg:block">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                                            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm font-medium text-foreground hidden xl:block">
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
                                            <div className="absolute right-0 mt-2 w-56 bg-popover rounded-lg shadow-lg border py-2 z-50">
                                                <div className="px-4 py-3 border-b">
                                                    <p className="text-sm font-medium text-popover-foreground">{user?.displayName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                                </div>
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors cursor-pointer"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span>{t('learner.header.dashboard')}</span>
                                                </Link>
                                                <Link
                                                    href="/dashboard/settings"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors cursor-pointer"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>{t('navigation.settings')}</span>
                                                </Link>
                                                <div className="border-t my-2" />
                                                <button
                                                    onClick={handleLogout}
                                                    disabled={isLoggingOut}
                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>{isLoggingOut ? t('learner.header.loggingOut') : t('learner.header.logout')}</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden lg:flex items-center gap-3">
                                    <Button variant="ghost" asChild>
                                        <Link href="/login">{t('learner.header.login')}</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/register">{t('learner.header.registerFree')}</Link>
                                    </Button>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6 text-muted-foreground" />
                                ) : (
                                    <Menu className="w-6 h-6 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t bg-background">
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.nameKey}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{t(item.nameKey)}</span>
                                    </Link>
                                )
                            })}

                            {isAuthenticated ? (
                                <div className="pt-4 border-t space-y-2">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="font-medium">{t('learner.header.dashboard')}</span>
                                    </Link>
                                    <Link
                                        href="/dashboard/settings"
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span className="font-medium">{t('navigation.settings')}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">{isLoggingOut ? t('learner.header.loggingOut') : t('learner.header.logout')}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t space-y-2">
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href="/login">{t('learner.header.login')}</Link>
                                    </Button>
                                    <Button asChild className="w-full">
                                        <Link href="/register">{t('learner.header.registerFree')}</Link>
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
