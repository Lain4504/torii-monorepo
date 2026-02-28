import { LiveClassDetailClient } from '@/components/marketing/live-class-detail-client';
import { courseApi } from '@/lib/api/services/course-api';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const course = await courseApi.getCourseBySlug(slug);
        if (!course) return { title: 'Lớp học trực tuyến | Torii Nihongo' };
        return {
            title: `${course.title} | Torii Nihongo`,
            description: course.shortDescription || course.description,
            openGraph: {
                title: course.title,
                description: course.shortDescription || course.description,
                images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
            },
        };
    } catch {
        return { title: 'Lớp học trực tuyến | Torii Nihongo' };
    }
}

export default async function LiveClassDetailPage({ params }: Props) {
    const { slug } = await params;
    return <LiveClassDetailClient slug={slug} />;
}
