"use client"

import { useParams, useRouter } from "next/navigation"
import { useAcademyEnrollmentCheck } from "@/lib/api/services/academy-enrollment-api"
import { LiveClassDashboard } from "@/components/courses/live-class-dashboard"
import { useEffect } from "react"
import { Spinner } from "@workspace/ui/components/spinner"

/**
 * LiveClass Dashboard Page (Integrated into Dashboard)
 * Redirects VOD students to /courses/[courseId]/learn
 * Renders Live Session dashboard for LIVE students
 */
export default function LiveClassDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    
    // Check permission
    const { data: enrollmentData, isLoading } = useAcademyEnrollmentCheck(courseId);

    useEffect(() => {
        if (!isLoading && enrollmentData) {
            const enrollment = enrollmentData.enrollment as any;
            
            // If NOT enrolled -> Redirect back
            if (!enrollmentData.isEnrolled) {
                router.replace('/dashboard/my-courses');
                return;
            }

            // If VOD enrollment -> Redirect to VOD learning page
            if (enrollment?.type?.toLowerCase() === 'vod') {
                router.replace(`/courses/${courseId}/learn`);
            }
        }
    }, [enrollmentData, isLoading, courseId, router]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Spinner className="size-8 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">Torii Loading...</p>
            </div>
        );
    }

    // If LIVE enrollment -> Render Dashboard
    const enrollment = enrollmentData?.enrollment as any;
    if (enrollmentData?.isEnrolled && enrollment?.type?.toLowerCase() === 'live') {
        return <LiveClassDashboard />;
    }

    // Default loading while redirect
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Spinner className="size-8 text-primary" />
        </div>
    );
}
