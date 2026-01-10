import { createColumnHelper } from '@tanstack/react-table';
import type { CourseResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ArrowUpDown, MoreVertical, Pencil, Trash, Users, CheckCircle, XCircle, Layout, BookOpen, Clock, Zap, Target } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { formatCurrency, formatDateTime } from '@/lib/format-utils';
import { cn } from "@workspace/ui/lib/utils";

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
        header: () => <div className="text-center">#</div>,
        cell: ({ row }) => {
            const stt = (page - 1) * limit + row.index + 1;
            return <div className="text-center font-black italic text-muted-foreground/30 tabular-nums text-[10px]">0{stt}</div>;
        },
        size: 60,
    }),
    columnHelper.accessor('title', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group"
                >
                    Repository Title
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div
                className="flex items-center gap-3 group/title cursor-pointer"
                onClick={() => onTitleClick(info.row.original)}
            >
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover/title:bg-primary group-hover/title:text-white transition-all">
                    <BookOpen className="size-4" />
                </div>
                <div className="flex flex-col">
                    <span className="font-black italic uppercase tracking-tight text-foreground group-hover/title:text-primary transition-colors line-clamp-1">{info.getValue()}</span>
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">ID: {info.row.original.id.slice(0, 8)}</span>
                </div>
            </div>
        ),
    }),
    columnHelper.accessor('jlptLevel', {
        header: () => <div className="px-1 text-center">Matrix Level</div>,
        cell: (info) => {
            const level = info.getValue() || 'N/A';
            return (
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/20 border border-border/20 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        <Target className="size-3 opacity-40 text-primary" />
                        {level}
                    </div>
                </div>
            );
        },
        size: 100,
    }),
    columnHelper.accessor('price', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                >
                    Valuation
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => {
            const formatted = formatCurrency(info.getValue());
            return (
                <div className="text-center font-black italic text-[14px] text-foreground tabular-nums tracking-tight">
                    {formatted}
                </div>
            );
        },
        size: 120,
    }),
    columnHelper.accessor('status', {
        header: () => <div className="px-1">Operational Status</div>,
        cell: (info) => {
            const status = info.getValue() as string;
            const colors = {
                published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                archived: 'bg-muted/10 text-muted-foreground border-border/20'
            };
            const colorClass = colors[status as keyof typeof colors] || 'bg-muted/10 text-muted-foreground border-border/20';

            return (
                <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm", colorClass)}>
                    <div className={cn("size-1 rounded-full mr-2", status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-current')} />
                    {status}
                </div>
            );
        },
        size: 120,
    }),
    columnHelper.accessor('totalStudents', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                >
                    Enrollment
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex flex-col items-center">
                <div className="font-black italic text-lg leading-none">{info.getValue() || 0}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">Identifiers</div>
            </div>
        ),
        size: 100,
    }),
    columnHelper.accessor('updatedAt', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                >
                    Sync Cycle
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground/40 tabular-nums text-[10px] font-bold italic">
                <Clock className="size-3 opacity-40" />
                {formatDateTime(info.getValue())}
            </div>
        ),
        size: 140,
    }),
    columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center">Protocol</div>,
        cell: ({ row }) => {
            const course = row.original;

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-10 w-10 p-0 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all data-[state=open]:bg-primary/20"
                            >
                                <span className="sr-only">Open Control Portal</span>
                                <Zap className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-[220px] border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2"
                        >
                            <DropdownMenuItem
                                onClick={() => onEdit(course)}
                                className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                            >
                                <Pencil className="h-4 w-4 opacity-30" />
                                <span>Modify Structure</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => onManageInstructors(course)}
                                className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                            >
                                <Users className="h-4 w-4 opacity-30" />
                                <span>Assign Nodes</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-border/20 mx-2" />

                            {course.status === 'draft' ? (
                                <DropdownMenuItem
                                    onClick={() => onPublish(course)}
                                    className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-500 focus:text-emerald-600 focus:bg-emerald-500/10 cursor-pointer flex gap-3"
                                >
                                    <CheckCircle className="h-4 w-4 opacity-60" />
                                    <span>Initiate Sync</span>
                                </DropdownMenuItem>
                            ) : course.status === 'published' ? (
                                <DropdownMenuItem
                                    onClick={() => onUnpublish(course)}
                                    className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-500 focus:text-amber-600 focus:bg-amber-500/10 cursor-pointer flex gap-3"
                                >
                                    <XCircle className="h-4 w-4 opacity-60" />
                                    <span>Revoke Visibility</span>
                                </DropdownMenuItem>
                            ) : null}

                            <DropdownMenuSeparator className="bg-border/20 mx-2" />

                            <DropdownMenuItem
                                onClick={() => onDelete(course)}
                                className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex gap-3"
                            >
                                <Trash className="h-4 w-4 opacity-30" />
                                <span>Purge Asset</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
        size: 100,
    }),
];
