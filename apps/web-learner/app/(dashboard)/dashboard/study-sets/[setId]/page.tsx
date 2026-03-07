import { Metadata } from 'next';
import { StudySetEditor } from '@/components/study/study-set-editor';

export const metadata: Metadata = {
    title: 'Chi tiết bộ thẻ | Torii Nihongo',
    description: 'Quản lý thẻ ghi nhớ trong bộ này',
};

export default function StudySetDetailPage({ params }: { params: { setId: string } }) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <StudySetEditor setId={params.setId} />
        </div>
    );
}
