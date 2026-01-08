import { createColumnHelper } from '@tanstack/react-table';
import type { CourseResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, Eye, Layers, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { toast } from '@workspace/ui/components/sonner';

const columnHelper = createColumnHelper<CourseResponseDTO>();

export type CoursesColumnsProps = {
    onView: (course: CourseResponseDTO) => void;
    onEdit: (course: CourseResponseDTO) => void;
    onDelete: (course: CourseResponseDTO) => void;
    onModules: (course: CourseResponseDTO) => void;
    onManageInstructors: (course: CourseResponseDTO) => void;
    onPublish: (course: CourseResponseDTO) => void;
    onUnpublish: (course: CourseResponseDTO) => void;
    onTitleClick: (course: CourseResponseDTO) => void;
    page: number;
    limit: number;
};

export const getCoursesColumns = ({ onView, onEdit, onDelete, onModules, onManageInstructors, onPublish, onUnpublish, onTitleClick, page, limit }: CoursesColumnsProps) => [
    // STT Column
    columnHelper.display({
        id: 'stt',
        header: () => <div className="text-center font-semibold text-xs">#</div>,
        cell: ({ row }) => {
            const stt = (page - 1) * limit + row.index + 1;
            return <div className="text-center font-medium text-xs text-muted-foreground">{stt}</div>;
        },
        size: 50,
    }),
    columnHelper.accessor('title', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold hover:bg-transparent hover:text-foreground"
                >
                    Title
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => (
            <div
                className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => onTitleClick(info.row.original)}
            >
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor('slug', {
        header: 'Slug',
        cell: (info) => <div className="text-xs text-muted-foreground max-w-[150px] truncate" title={info.getValue()}>{info.getValue()}</div>,
    }),
    columnHelper.accessor('jlptLevel', {
        header: 'Level',
        cell: (info) => (
            <Badge variant="outline" className="font-normal bg-background/50">
                {info.getValue() || 'N/A'}
            </Badge>
        ),
    }),
    columnHelper.accessor('price', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold hover:bg-transparent hover:text-foreground"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => {
            const price = parseFloat(info.getValue().toString());
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(price);
            return <div className="font-medium tabular-nums">{formatted}</div>;
        },
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const status = info.getValue();
            const variant = status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline';

            return (
                <Badge variant={variant} className="capitalize font-medium shadow-none">
                    {status}
                </Badge>
            );
        },
    }),
    columnHelper.accessor('totalStudents', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold hover:bg-transparent hover:text-foreground"
                >
                    Students
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => <div className="text-center">{info.getValue() || 0}</div>,
    }),
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
            const course = row.original;

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(course.id);
                                    toast.success('Course ID copied');
                                } catch {
                                    toast.error('Failed to copy ID');
                                }
                            }}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onView(course)}>
                                <Eye className="mr-2 h-3.5 w-3.5" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(course)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onModules(course)}>
                                <Layers className="mr-2 h-3.5 w-3.5" /> Curriculum
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onManageInstructors(course)}>
                                <UserIcon className="mr-2 h-3.5 w-3.5" /> Instructors
                            </DropdownMenuItem>
                            {course.status === 'draft' ? (
                                <DropdownMenuItem onClick={() => onPublish(course)} className="text-green-600 focus:text-green-700 focus:bg-green-50 dark:focus:bg-green-900/10">
                                    <CheckCircle className="mr-2 h-3.5 w-3.5" /> Publish
                                </DropdownMenuItem>
                            ) : course.status === 'published' ? (
                                <DropdownMenuItem onClick={() => onUnpublish(course)} className="text-orange-600 focus:text-orange-700 focus:bg-orange-50 dark:focus:bg-orange-900/10">
                                    <XCircle className="mr-2 h-3.5 w-3.5" /> Unpublish
                                </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(course)} className="text-destructive focus:text-destructive focus:bg-destructive/5">
                                <Trash className="mr-2 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    }),
];
