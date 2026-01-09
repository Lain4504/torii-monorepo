import { createColumnHelper } from '@tanstack/react-table';
import type { CourseResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ArrowUpDown, MoreVertical, Pencil, Trash, Users, CheckCircle, XCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

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

export const getCoursesColumns = ({ onEdit, onDelete, onManageInstructors, onPublish, onUnpublish, onTitleClick, page, limit }: CoursesColumnsProps) => [
    // STT Column
    columnHelper.display({
        id: 'stt',
        header: () => <div className="text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">#</div>,
        cell: ({ row }) => {
            const stt = (page - 1) * limit + row.index + 1;
            return <div className="text-center font-medium text-xs text-muted-foreground tabular-nums">{stt}</div>;
        },
        size: 60,
    }),
    columnHelper.accessor('title', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
                >
                    Title
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => (
            <div
                className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors line-clamp-2"
                onClick={() => onTitleClick(info.row.original)}
                title={info.getValue()}
            >
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor('jlptLevel', {
        header: () => <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Level</div>,
        cell: (info) => (
            <Badge variant="outline" className="font-normal bg-background/50 rounded-md">
                {info.getValue() || 'N/A'}
            </Badge>
        ),
        size: 80,
    }),
    columnHelper.accessor('price', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
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
        size: 100,
    }),
    columnHelper.accessor('status', {
        header: () => <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Status</div>,
        cell: (info) => {
            const status = info.getValue();
            const variant = status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline';

            return (
                <Badge variant={variant} className="capitalize font-medium shadow-none rounded-md">
                    {status}
                </Badge>
            );
        },
        size: 100,
    }),
    columnHelper.accessor('totalStudents', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
                >
                    Students
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => <div className="text-center font-medium tabular-nums">{info.getValue() || 0}</div>,
        size: 100,
    }),
    columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Actions</div>,
        cell: ({ row }) => {
            const course = row.original;

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-lg hover:bg-muted/50 transition-colors data-[state=open]:bg-muted"
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-[200px] border-none shadow-xl bg-background/95 backdrop-blur-xl rounded-xl p-1"
                        >
                            <DropdownMenuItem
                                onClick={() => onEdit(course)}
                                className="rounded-lg cursor-pointer gap-2 focus:bg-primary/5"
                            >
                                <Pencil className="h-4 w-4" />
                                <span>Edit Course</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => onManageInstructors(course)}
                                className="rounded-lg cursor-pointer gap-2 focus:bg-primary/5"
                            >
                                <Users className="h-4 w-4" />
                                <span>Manage Instructors</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-border/50" />

                            {course.status === 'draft' ? (
                                <DropdownMenuItem
                                    onClick={() => onPublish(course)}
                                    className="rounded-lg cursor-pointer gap-2 text-green-600 focus:text-green-700 focus:bg-green-500/10"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Publish Course</span>
                                </DropdownMenuItem>
                            ) : course.status === 'published' ? (
                                <DropdownMenuItem
                                    onClick={() => onUnpublish(course)}
                                    className="rounded-lg cursor-pointer gap-2 text-orange-600 focus:text-orange-700 focus:bg-orange-500/10"
                                >
                                    <XCircle className="h-4 w-4" />
                                    <span>Unpublish Course</span>
                                </DropdownMenuItem>
                            ) : null}

                            <DropdownMenuSeparator className="bg-border/50" />

                            <DropdownMenuItem
                                onClick={() => onDelete(course)}
                                className="rounded-lg cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash className="h-4 w-4" />
                                <span>Delete Course</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
        size: 80,
    }),
];
