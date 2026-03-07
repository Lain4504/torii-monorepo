import { Metadata } from 'next';
import { StudySetReview } from '@/components/study/study-set-review';

export const metadata: Metadata = {
    title: 'Ôn tập thẻ | Torii Nihongo',
    description: 'Ôn tập bộ thẻ ghi nhớ',
};

export default function StudySetReviewPage({ params }: { params: { setId: string } }) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6 h-[calc(100vh-4rem)] flex flex-col">
            <StudySetReview setId={params.setId} />
        </div>
    );
}
