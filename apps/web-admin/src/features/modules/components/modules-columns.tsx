import { createColumnHelper } from '@tanstack/react-table';
import type { ModuleResponseDto } from '@workspace/dtos';
import { Button } from '@workspace/ui/components/button';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

const columnHelper = createColumnHelper<ModuleResponseDto>();

export type ModulesColumnsProps = {
    onView: (module: ModuleResponseDto) => void;
    onEdit: (module: ModuleResponseDto) => void;
    onDelete: (module: ModuleResponseDto) => void;
    page: number;
    limit: number;
};

export const getModulesColumns = ({ onView, onEdit, onDelete, page, limit }: ModulesColumnsProps) => [
    columnHelper.display({
        id: 'stt',
        header: () => <div className="text-center font-semibold">STT</div>,
        cell: ({ row }) => {
            const stt = (page - 1) * limit + row.index + 1;
            return <div className="text-center font-medium">{stt}</div>;
        },
        size: 60,
    }),
    columnHelper.accessor('title', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: (info) => <div className="font-medium ml-4">{info.getValue()}</div>,
    }),
    columnHelper.accessor('courseId', {
        header: 'Course',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('order', {
        header: 'Order',
        cell: (info) => <div className="ml-4">{info.getValue()}</div>,
    }),
    columnHelper.accessor('durationMinutes', {
        header: 'Duration',
        cell: (info) => <div className="ml-4">{info.getValue() ?? ''}</div>,
    }),
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
            const module = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(module.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(module)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(module)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(module)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }),
];
