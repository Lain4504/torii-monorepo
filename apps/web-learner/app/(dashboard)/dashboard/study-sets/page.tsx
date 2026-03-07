import { Metadata } from 'next';
import { StudySetsList } from '@/components/study/study-sets-list';

export const metadata: Metadata = {
    title: 'Thẻ ghi nhớ | Torii Nihongo',
    description: 'Quản lý các bộ thẻ ghi nhớ của bạn',
};

export default function StudySetsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Thẻ ghi nhớ của tôi</h2>
            </div>
            <StudySetsList />
        </div>
    );
}
