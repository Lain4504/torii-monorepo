import { createColumnHelper } from '@tanstack/react-table';
import { type QuestionBankResponseDTO, QuestionStatus } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { ArrowUpDown, MoreHorizontal, Pencil, Eye, Trash } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

const columnHelper = createColumnHelper<QuestionBankResponseDTO>();

export type QuestionBankColumnsProps = {
    onEdit: (question: QuestionBankResponseDTO) => void;
    onView: (question: QuestionBankResponseDTO) => void;
    onDelete: (question: QuestionBankResponseDTO) => void;
    page: number;
    limit: number;
};

export const getQuestionBankColumns = ({ onEdit, onView, onDelete, page, limit }: QuestionBankColumnsProps) => [
    // STT Column
    columnHelper.display({
        id: 'stt',
        header: () => <div className="text-center font-semibold">STT</div>,
        cell: ({ row }) => {
            const stt = (page - 1) * limit + row.index + 1;
            return <div className="text-center font-medium">{stt}</div>;
        },
        size: 60,
    }),
    columnHelper.accessor('questionText', {
        header: 'Content',
        cell: (info) => (
            <div className="max-w-[300px] truncate font-medium">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor('questionType', {
        header: 'Type',
        cell: (info) => <span className="capitalize">{info.getValue().replace(/_/g, ' ')}</span>,
    }),
    columnHelper.accessor('jlptLevel', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    JLPT
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: (info) => <div className="ml-4">{info.getValue()}</div>,
    }),
    columnHelper.accessor('difficulty', {
        header: 'Difficulty',
        cell: (info) => <span className="capitalize">{info.getValue()}</span>,
    }),
    columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const status = info.getValue();
            return (
                <span
                    className={`px-2 py-1 rounded text-xs capitalize ${status === QuestionStatus.ACTIVE
                        ? 'bg-green-100 text-green-800'
                        : status === QuestionStatus.REVIEW
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {status}
                </span>
            );
        },
    }),
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
            const question = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(question.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(question)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(question)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(question)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }),
];
