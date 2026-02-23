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
    TrendingUp,
    ChevronRight,
    BrainCircuit,
    Bot,
    FileQuestion,
    BarChart3,
    Wallet,
    Receipt,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Progress } from '@workspace/ui/components/progress'
import { useMyCourses } from '@/lib/api/services/learning-progress-api'
import { DailyCheckInCard } from './daily-check-in-card'
import { useState } from 'react'
import { CourseExpirationModal } from '@/components/courses/course-expiration-modal'


// Nhóm học tập - ưu tiên cao nhất
const learningNav = [
    { name: 'Trang chủ', href: '/dashboard', icon: Home },
    { name: 'Khóa học của tôi', href: '/dashboard/my-courses', icon: BookOpen, badge: null },
    { name: 'AI Sensei', href: '/ai-sensei/chat', icon: Bot, badge: null },
    { name: 'Assessment', href: '/assessment', icon: FileQuestion, badge: null },
    { name: 'Kho Thẻ Nhớ', href: '/dashboard/flashcards', icon: BrainCircuit, badge: null },
]

// Nhóm tiến độ và thành tích
const progressNav = [
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Analytics', href: '/ai-analytics', icon: TrendingUp },
    { name: 'Chứng chỉ', href: '/dashboard/certificates', icon: Award },
    { name: 'Lịch sử học tập', href: '/dashboard/history', icon: Clock },
    { name: 'Ghi chú', href: '/dashboard/notes', icon: FileText },
    // { name: 'Thống kê', href: '/dashboard/statistics', icon: TrendingUp }, // Replaced by Analytics
]

// Nhóm tài khoản - ưu tiên thấp hơn
const accountNav = [
    { name: 'Hồ sơ', href: '/dashboard/profile', icon: User },
    { name: 'Ví & Điểm thưởng', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Lịch sử thanh toán', href: '/dashboard/payment', icon: Receipt },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
]

// Mock data
const continueLearning = [
    {
        id: 1,
        slug: 'tieng-nhat-n5-co-ban',
        title: 'Tiếng Nhật N5 - Cơ bản',
        progress: 65,
        nextLesson: 'Bài 12: Ngữ pháp',
        href: '/courses/tieng-nhat-n5-co-ban/learn',
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
    isCollapsed?: boolean
}

function NavGroup({ title, items, pathname, className, isCollapsed }: NavGroupProps) {
    return (
        <div className={cn('space-y-1', className)}>
            {title && !isCollapsed && (
                <h3 className="px-4 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    {title}
                </h3>
            )}
            {/* Show Divider if collapsed and has title, to separate groups visually */}
            {title && isCollapsed && (
                <div className="h-px w-8 mx-auto bg-border/40 my-2" />
            )}

            {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'))

                if (isCollapsed) {
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'group flex items-center justify-center w-10 h-10 mx-auto rounded-md transition-colors cursor-pointer border',
                                isActive
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : 'border-transparent text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground'
                            )}
                            title={item.name}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                        </Link>
                    )
                }

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'group flex items-center gap-3 px-4 py-2 rounded-md transition-colors cursor-pointer border border-transparent',
                            isActive
                                ? 'bg-primary/5 text-primary border-primary/10'
                                : 'text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground'
                        )}
                    >
                        <div className={cn(
                            'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
                            isActive ? 'bg-primary/10 text-primary' : 'bg-muted/10 group-hover:bg-muted/20'
                        )}>
                            <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                        {item.badge !== undefined && item.badge !== null && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary/10 text-primary">
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
    const { data: courses, isLoading } = useMyCourses();
    const [showExpiredModal, setShowExpiredModal] = useState(false)

    // Get the most recently accessed course (first item since API sorts by lastAccessed desc)
    const activeCourse = courses?.[0];
    const isExpired = activeCourse?.expiresAt && new Date(activeCourse.expiresAt) < new Date();

    if (isLoading || !activeCourse) return null

    return (
        <div className="mb-10 px-2">
            <h3 className="px-2 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">
                Đang học
            </h3>
            <div className="space-y-3">
                <div
                    onClick={() => {
                        if (isExpired) {
                            setShowExpiredModal(true)
                        } else {
                            window.location.href = `/courses/${activeCourse.slug}/learn`
                        }
                    }}
                    className={cn(
                        "group block p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer border border-border/40 hover:border-primary/20",
                        isExpired && "border-destructive/20 bg-destructive/5"
                    )}
                >
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {activeCourse.title}
                        </h4>
                        <div className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                            isExpired ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                        )}>
                            <PlayCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase text-muted-foreground/60">
                            <span>{isExpired ? 'Hết hạn' : 'Tiến độ'}</span>
                            <span>{activeCourse.progress}%</span>
                        </div>
                        <Progress value={activeCourse.progress} className={cn("h-1", isExpired ? "bg-muted [&>div]:bg-muted-foreground" : "bg-primary/5")} />
                    </div>
                </div>
            </div>
            <CourseExpirationModal
                isOpen={showExpiredModal}
                onClose={() => setShowExpiredModal(false)}
                courseTitle={activeCourse.title}
                courseSlug={activeCourse.slug}
            />
        </div>
    )
}

interface DashboardSidebarProps {
    isCollapsed?: boolean
}

export function DashboardSidebar({ isCollapsed = false }: DashboardSidebarProps) {
    const pathname = usePathname()

    return (
        <aside className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-background/50 backdrop-blur-3xl overflow-y-auto hidden lg:block scrollbar-none transition-all duration-300",
            isCollapsed ? "w-20" : "w-72"
        )}>
            <div className={cn("space-y-8", isCollapsed ? "p-4" : "p-6")}>
                {/* Learning - Navigation chính */}
                <NavGroup items={learningNav} pathname={pathname} isCollapsed={isCollapsed} />

                {/* Daily Check-in Card - Only show when expanded */}
                {!isCollapsed && (
                    <div className="px-2">
                        <DailyCheckInCard />
                    </div>
                )}

                {/* Continue Learning Section - Hide when collapsed */}
                {!isCollapsed && <ContinueLearningSection />}

                {/* Tiến độ & Thành tích */}
                <NavGroup
                    title="Tiến độ học tập"
                    items={progressNav}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                />

                {/* Tài khoản - Đặt cuối cùng */}
                <NavGroup
                    title="Tài khoản"
                    items={accountNav}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                />
            </div>
        </aside>
    )
}
