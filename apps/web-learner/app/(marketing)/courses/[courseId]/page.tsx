import { Metadata } from 'next';
import { CourseDetailClient } from '@/components/marketing/course-detail-client';
import { courseApi } from '@/lib/api/services/course-api';

interface CourseDetailPageProps {
    params: Promise<{ courseId: string }>
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
    const { courseId: slug } = await params;
    try {
        const course = await courseApi.getCourseBySlug(slug);
        if (!course) return { title: 'Khóa học không tồn tại | Torii Nihongo' };

        return {
            title: `${course.title} | Torii Nihongo`,
            description: course.shortDescription || course.description,
            openGraph: {
                title: course.title,
                description: course.shortDescription || course.description,
                images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
            },
        };
    } catch (error) {
        return { title: 'Chi tiết khóa học | Torii Nihongo' };
    }
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
    const { courseId: slug } = await params;
    return <CourseDetailClient slug={slug} />;
}
