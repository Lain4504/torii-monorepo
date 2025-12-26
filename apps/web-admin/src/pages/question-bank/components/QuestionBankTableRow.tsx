import { Badge } from '@workspace/ui/components/badge';
import {
    TableCell,
    TableRow,
} from '@workspace/ui/components/table';
import type { QuestionBankDto } from '@workspace/dtos';
import { QuestionBankActions } from './QuestionBankActions';

interface QuestionBankTableRowProps {
    question: QuestionBankDto;
    onEdit: (id: string) => void;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
    isUpdating?: boolean;
    isDeleting?: boolean;
}

export function QuestionBankTableRow({
    question,
    onEdit,
    onView,
    onDelete,
    isUpdating,
    isDeleting,
}: QuestionBankTableRowProps) {
    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return 'default';
            case 'true_false':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <TableRow>
            <TableCell>
                <div className="max-w-md">
                    <div className="truncate font-medium" title={question.questionText}>
                        {question.questionText}
                    </div>
                    {question.tags && question.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {question.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {question.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{question.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <Badge variant={getTypeBadgeVariant(question.questionType)}>
                    {question.questionType.replace('_', ' ')}
                </Badge>
            </TableCell>
            <TableCell>{question.jlptLevel || '-'}</TableCell>
            <TableCell>
                <QuestionBankActions
                    onEdit={() => onEdit(question.id)}
                    onView={() => onView(question.id)}
                    onDelete={() => onDelete(question.id)}
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
                />
            </TableCell>
        </TableRow>
    );
}



