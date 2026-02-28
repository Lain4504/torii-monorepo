'use client'

import { useAppSelector } from '@/hooks/hooks'
import { StreakWelcomeModal } from '@/components/dashboard/streak-welcome-modal'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { CourseExpirationModal } from '@/components/courses/course-expiration-modal'
import { useState } from 'react'
import ModernDashboard from '@/components/dashboard/modern-dashboard'
import { useMyCourses } from '@/lib/api/services/learning-progress-api'
import { useQuery } from '@tanstack/react-query'
import { learningProgressApi } from '@/lib/api/services/learning-progress-api'

export default function DashboardPage() {
    const { status: authStatus } = useAppSelector((state) => state.auth)
    const { isLoading: coursesLoading } = useMyCourses()
    const [expiredCourse, setExpiredCourse] = useState<{ title: string, slug: string } | null>(null)
    const { isLoading: statsLoading } = useQuery({
        queryKey: ['learning-stats'],
        queryFn: learningProgressApi.getStats
    })

    if (authStatus === 'loading' || coursesLoading || statsLoading) {
        return <PageLoading text="Đang tải dữ liệu dashboard..." />
    }

    return (
        <>
            <StreakWelcomeModal />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
                <ModernDashboard />
            </div>
            <CourseExpirationModal
                isOpen={!!expiredCourse}
                onClose={() => setExpiredCourse(null)}
                courseTitle={expiredCourse?.title || ''}
                courseSlug={expiredCourse?.slug || ''}
            />
        </>
    )
}
