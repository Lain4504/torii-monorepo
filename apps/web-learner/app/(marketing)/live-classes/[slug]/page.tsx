import { LiveClassDetailClient } from '@/components/marketing/live-class-detail-client';
import { courseRunApi } from '@/lib/api/services/course-run-api';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const run = await courseRunApi.getCourseRunBySlug(slug);
        const course = run?.courseMaster;
        if (!course) return { title: 'Lớp học trực tuyến | Torii Nihongo' };
        return {
            title: `${course.title} | Torii Nihongo`,
            description: (course as any).shortDescription || course.description,
            openGraph: {
                title: course.title,
                description: (course as any).shortDescription || course.description,
                images: (course as any).thumbnailUrl ? [(course as any).thumbnailUrl] : [],
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
