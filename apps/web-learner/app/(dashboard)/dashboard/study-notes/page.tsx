import { Metadata } from 'next';
import { StudyNotesList } from '@/components/study/study-notes-list';

export const metadata: Metadata = {
    title: 'Ghi chú học tập | Torii Nihongo',
    description: 'Quản lý các ghi chú học tập của bạn',
};

export default function StudyNotesPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Ghi chú học tập</h2>
            </div>
            <StudyNotesList />
        </div>
    );
}
