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
    ChevronRight,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Progress } from '@workspace/ui/components/progress'
import { useMyCourses } from '../../apis/services/learning-progress-api'

// Nhóm học tập - ưu tiên cao nhất
const learningNav = [
    { name: 'Trang chủ', href: '/dashboard', icon: Home },
    { name: 'Khóa học của tôi', href: '/dashboard/my-courses', icon: BookOpen, badge: null },
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
    { name: 'Lịch sử thanh toán', href: '/dashboard/payment', icon: CreditCard },
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
        <div className={cn('space-y-1.5', className)}>
            {title && !isCollapsed && (
                <h3 className="px-5 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] animate-in fade-in duration-300">
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
                                'group flex items-center justify-center w-12 h-12 mx-auto rounded-2xl transition-all duration-300 cursor-pointer border',
                                isActive
                                    ? 'bg-primary/10 border-primary/20 text-primary shadow-sm shadow-primary/5'
                                    : 'border-transparent text-muted-foreground/70 hover:bg-muted/30 hover:text-foreground'
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
                            'group flex items-center gap-3.5 px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer border border-transparent',
                            isActive
                                ? 'bg-primary/5 text-primary border-primary/10 shadow-sm shadow-primary/5'
                                : 'text-muted-foreground/70 hover:bg-muted/30 hover:text-foreground'
                        )}
                    >
                        <div className={cn(
                            'flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300',
                            isActive ? 'bg-primary/10 text-primary scale-110' : 'bg-muted/10 group-hover:bg-muted/20'
                        )}>
                            <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="flex-1 whitespace-nowrap">{item.name}</span>
                        {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                        {item.badge !== undefined && item.badge !== null && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
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

    // Filter courses that are in progress (progress > 0 and < 100) or just take the first one that is active
    // The API returns courses ordered by lastAccessed desc.
    const activeCourse = courses?.find(c => c.progress < 100);

    if (isLoading || !activeCourse) return null

    return (
        <div className="mb-10 px-2">
            <h3 className="px-3 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">
                Đang học
            </h3>
            <div className="space-y-3">
                <Link
                    href={`/courses/${activeCourse.slug}/learn`}
                    className="group block p-5 rounded-[2rem] bg-background/40 hover:bg-background/60 backdrop-blur-3xl transition-all duration-300 cursor-pointer border border-border/10 hover:border-primary/20 shadow-sm hover:shadow-xl hover:shadow-primary/5"
                >
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h4 className="text-sm font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors italic">
                            {activeCourse.title}
                        </h4>
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                            <PlayCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            <span>Tiến độ</span>
                            <span>{activeCourse.progress}%</span>
                        </div>
                        <Progress value={activeCourse.progress} className="h-1 bg-primary/5" />
                    </div>
                </Link>
            </div>
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
            "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/40 bg-background/50 backdrop-blur-3xl overflow-y-auto hidden lg:block scrollbar-none transition-all duration-300",
            isCollapsed ? "w-20" : "w-72"
        )}>
            <div className={cn("space-y-10", isCollapsed ? "p-4" : "p-6")}>
                {/* Learning - Navigation chính */}
                <NavGroup items={learningNav} pathname={pathname} isCollapsed={isCollapsed} />

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
