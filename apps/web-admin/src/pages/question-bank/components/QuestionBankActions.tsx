import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';
import { MoreHorizontal, Edit, Eye, Trash2 } from 'lucide-react';

interface QuestionBankActionsProps {
    onEdit: () => void;
    onView: () => void;
    onDelete: () => void;
    isUpdating?: boolean;
    isDeleting?: boolean;
}

export function QuestionBankActions({
    onEdit,
    onView,
    onDelete,
    isUpdating,
    isDeleting,
}: QuestionBankActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit} disabled={isUpdating}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Question
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Question
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}



