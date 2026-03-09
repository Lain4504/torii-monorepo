import { Metadata } from 'next';
import { StudySetEditor } from '@/components/study/study-set-editor';

export const metadata: Metadata = {
    title: 'Chi tiết bộ thẻ | Torii Nihongo',
    description: 'Quản lý thẻ ghi nhớ trong bộ này',
};

export default async function StudySetDetailPage({ params }: { params: Promise<{ setId: string }> }) {
    const { setId } = await params;
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <StudySetEditor setId={setId} />
        </div>
    );
}
