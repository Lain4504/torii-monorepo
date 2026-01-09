'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    BookOpen,
    PlayCircle,
    Award,
    FileText,
    Clock,
    CreditCard,
    User,
    Settings,
    GraduationCap,
    TrendingUp,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Progress } from '@workspace/ui/components/progress'

// Nhóm học tập - ưu tiên cao nhất
const learningNav = [
    { name: 'Khóa học của tôi', href: '/dashboard/my-courses', icon: BookOpen, badge: null },
    { name: 'Trang chủ', href: '/dashboard', icon: Home },
]

// Nhóm tiến độ và thành tích
const progressNav = [
    { name: 'Chứng chỉ', href: '/dashboard/certificates', icon: Award },
    { name: 'Lịch sử học tập', href: '/dashboard/history', icon: Clock },
    { name: 'Ghi chú', href: '/dashboard/notes', icon: FileText },
    { name: 'Thống kê', href: '/dashboard/statistics', icon: TrendingUp },
]

// Nhóm tài khoản - ưu tiên thấp hơn
const accountNav = [
    { name: 'Hồ sơ', href: '/dashboard/profile', icon: User },
    { name: 'Thanh toán', href: '/dashboard/payment', icon: CreditCard },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]

// Quick links - tính năng bổ sung
const quickLinks = [
    { name: 'Luyện thi JLPT', href: '/jlpt-practice', icon: GraduationCap },
]

// Mock data - sẽ được thay thế bằng API call
const continueLearning = [
    {
        id: 1,
        slug: 'tieng-nhat-n5-co-ban',
        title: 'Tiếng Nhật N5 - Cơ bản',
        progress: 65,
        nextLesson: 'Bài 12: Ngữ pháp cơ bản',
        href: '/dashboard/learning/tieng-nhat-n5-co-ban',
    },
    {
        id: 2,
        slug: 'ngu-phap-n4',
        title: 'Ngữ pháp N4',
        progress: 30,
        nextLesson: 'Bài 8: Động từ thể te',
        href: '/dashboard/learning/ngu-phap-n4',
    },
]

interface NavItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number | null
}

interface NavGroupProps {
    title?: string
    items: NavItem[]
    pathname: string
    className?: string
}

function NavGroup({ title, items, pathname, className }: NavGroupProps) {
    return (
        <div className={cn('space-y-1', className)}>
            {title && (
                <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                    {title}
                </h3>
            )}
            {items.map((item) => {
                const Icon = item.icon
                const isActive =
                    pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                            isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                    >
                        <Icon
                            className={cn(
                                'w-5 h-5 shrink-0 transition-colors',
                                isActive
                                    ? 'text-primary-foreground'
                                    : 'text-muted-foreground group-hover:text-accent-foreground'
                            )}
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge !== undefined && item.badge !== null && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                )
            })}
        </div>
    )
}

function ContinueLearningSection() {
    if (continueLearning.length === 0) return null

    return (
        <div className="mb-6 px-4">
            <h3 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-3">
                Tiếp tục học tập
            </h3>
            <div className="space-y-3">
                {continueLearning.slice(0, 2).map((course) => (
                    <Link
                        key={course.id}
                        href={course.href}
                        className="group block p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors duration-200 cursor-pointer border border-border/50"
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {course.title}
                            </h4>
                            <PlayCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {course.nextLesson}
                        </p>
                        <div className="space-y-1.5">
                            <Progress value={course.progress} className="h-1.5" />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {course.progress}% hoàn thành
                                </span>
                                <span className="text-xs font-medium text-primary">Tiếp tục →</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur-sm overflow-y-auto hidden lg:block scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <div className="p-4 space-y-6">
                {/* Continue Learning Section - ưu tiên hiển thị đầu tiên */}
                <ContinueLearningSection />

                {/* Học tập - Navigation chính */}
                <NavGroup items={learningNav} pathname={pathname} />

                {/* Tiến độ & Thành tích */}
                <NavGroup
                    title="Tiến độ"
                    items={progressNav}
                    pathname={pathname}
                    className="pt-4 border-t border-border/50"
                />

                {/* Quick Links */}
                {quickLinks.length > 0 && (
                    <NavGroup
                        title="Tiện ích"
                        items={quickLinks}
                        pathname={pathname}
                        className="pt-4 border-t border-border/50"
                    />
                )}

                {/* Tài khoản - Đặt cuối cùng */}
                <NavGroup
                    title="Tài khoản"
                    items={accountNav}
                    pathname={pathname}
                    className="pt-4 border-t border-border/50"
                />
            </div>
        </aside>
    )
}

