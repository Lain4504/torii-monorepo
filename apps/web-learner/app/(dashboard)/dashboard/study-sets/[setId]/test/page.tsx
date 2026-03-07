import { Metadata } from 'next';
import { StudyModeTest } from '@/components/study/study-mode-test';

export const metadata: Metadata = {
    title: 'Kiểm tra bộ thẻ | Torii Nihongo',
};

export default function StudySetTestPage({ params }: { params: { setId: string } }) {
    return (
        <div className="flex-1 flex flex-col min-h-screen bg-background">
            <StudyModeTest setId={params.setId} />
        </div>
    );
}
