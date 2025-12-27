import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { QuestionBankDto } from '@workspace/dtos';
import { QuestionBankTableRow } from './question-bank-table-row';

interface QuestionBankTableProps {
    questions: QuestionBankDto[];
    isLoading?: boolean;
    onEdit: (id: string) => void;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
    isUpdating?: boolean;
    isDeleting?: boolean;
}

export function QuestionBankTable({
    questions,
    isLoading,
    onEdit,
    onView,
    onDelete,
    isUpdating,
    isDeleting,
}: QuestionBankTableProps) {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>JLPT Level</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <TableRow key={idx}>
                                <TableCell>
                                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>JLPT Level</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                No questions found
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>JLPT Level</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {questions.map((question) => (
                        <QuestionBankTableRow
                            key={question.id}
                            question={question}
                            onEdit={onEdit}
                            onView={onView}
                            onDelete={onDelete}
                            isUpdating={isUpdating}
                            isDeleting={isDeleting}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}



