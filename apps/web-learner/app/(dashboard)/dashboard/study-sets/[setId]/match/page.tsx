import { Metadata } from 'next';
import { StudyModeMatch } from '@/components/study/study-mode-match';

export const metadata: Metadata = {
    title: 'Ghép cặp bộ thẻ | Torii Nihongo',
};

export default function StudySetMatchPage({ params }: { params: { setId: string } }) {
    return (
        <div className="flex-1 flex flex-col min-h-screen bg-background">
            <StudyModeMatch setId={params.setId} />
        </div>
    );
}
