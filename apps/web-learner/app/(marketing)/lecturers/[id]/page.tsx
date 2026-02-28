import { LecturerDetailClient } from "@/components/marketing/lecturer-detail-client";
import { lecturerApi } from "@/lib/api/services/lecturer-api";
import type { Metadata } from 'next';

interface LecturerPageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: LecturerPageProps): Promise<Metadata> {
    const { id } = await params;
    try {
        const lecturer = await lecturerApi.getProfile(id);
        const meta = (lecturer.userMetadata as any) || {};
        const title = meta.title || "Giảng viên tại Torii Nihongo";

        return {
            title: `${lecturer.displayName} - ${title} | Torii Nihongo`,
            description: meta.bioIntro || `Thông tin chi tiết về giảng viên ${lecturer.displayName} tại Torii Nihongo.`,
            openGraph: {
                title: `${lecturer.displayName} | Torii Nihongo`,
                description: meta.bioIntro || `Thông tin chi tiết về giảng viên ${lecturer.displayName} tại Torii Nihongo.`,
                images: lecturer.avatarUrl ? [lecturer.avatarUrl] : [],
            },
        };
    } catch {
        return {
            title: "Thông tin giảng viên | Torii Nihongo",
            description: "Chi tiết về giảng viên tại Torii Nihongo.",
        };
    }
}

export default async function LecturerProfilePage({ params }: LecturerPageProps) {
    const { id } = await params;

    return <LecturerDetailClient id={id} />;
}
