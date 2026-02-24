import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { SubmissionsTable } from './submissions-table';
import { useSubmissions } from '@/lib/api/services/submissions';
import type { AssignmentResponseDTO, SubmissionResponseDTO } from '@workspace/schemas';

interface SubmissionsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignment: AssignmentResponseDTO | null;
}

export function SubmissionsSheet({ open, onOpenChange, assignment }: SubmissionsSheetProps) {
    const { data: submissions, isLoading } = useSubmissions(assignment?.id || '');

    const handleGrade = (submission: SubmissionResponseDTO) => {
        // Implement grading logic or open another sheet
        console.log('Grade submission:', submission);
    };

    const handleView = (submission: SubmissionResponseDTO) => {
        // Implement view logic
        console.log('View submission:', submission);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[1000px] p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>Danh sách bài nộp</SheetTitle>
                    <SheetDescription>
                        Bài tập: {assignment?.title}
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-85px)]">
                    <div className="p-6">
                        <SubmissionsTable
                            data={submissions || []}
                            isLoading={isLoading}
                            onGrade={handleGrade}
                            onView={handleView}
                        />
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
