import { createColumnHelper } from '@tanstack/react-table';
import type { CourseResponseDto } from '@workspace/dtos';
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

const columnHelper = createColumnHelper<CourseResponseDto>();

export type CoursesColumnsProps = {
    onView: (course: CourseResponseDto) => void;
    onEdit: (course: CourseResponseDto) => void;
    onDelete: (course: CourseResponseDto) => void;
    page: number;
    limit: number;
};

export const getCoursesColumns = ({ onView, onEdit, onDelete, page, limit }: CoursesColumnsProps) => [
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
    columnHelper.accessor('slug', {
        header: 'Slug',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('jlptLevel', {
        header: 'JLPT Level',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('price', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: (info) => {
            const price = parseFloat(info.getValue().toString());
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(price);
            return <div className="ml-4">{formatted}</div>;
        },
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const status = info.getValue();
            return (
                <span
                    className={`px-2 py-1 rounded text-xs ${status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {status}
                </span>
            );
        },
    }),
    columnHelper.accessor('totalStudents', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Students
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: (info) => <div className="ml-8">{info.getValue()}</div>,
    }),
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
            const course = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(course.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(course)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(course)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(course)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }),
];
