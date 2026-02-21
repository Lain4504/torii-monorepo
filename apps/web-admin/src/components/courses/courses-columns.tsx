import { createColumnHelper } from '@tanstack/react-table';
import type { CourseResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';

import { ArrowUpDown, Pencil, Trash, Users, CheckCircle, XCircle, BookOpen, Clock, MoreVertical, Target, Layers, History, Video } from 'lucide-react';
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
    onEdit: (course: CourseResponseDTO) => void;
    onDelete: (course: CourseResponseDTO) => void;
    onModules: (course: CourseResponseDTO) => void;
    onManageInstructors: (course: CourseResponseDTO) => void;
    onPublish: (course: CourseResponseDTO) => void;
    onSubmitForReview: (course: CourseResponseDTO) => void;
    onUnpublish: (course: CourseResponseDTO) => void;
    onReject: (course: CourseResponseDTO) => void;
    onTitleClick: (course: CourseResponseDTO) => void;
    onViewAuditLog: (course: CourseResponseDTO) => void;
    onManageLiveSessions: (course: CourseResponseDTO) => void;
    can: (permission: string) => boolean;
    page: number;
    limit: number;
};

export const getCoursesColumns = ({ onEdit, onDelete, onModules, onManageInstructors, onPublish, onSubmitForReview, onUnpublish, onReject, onTitleClick, onViewAuditLog, onManageLiveSessions, can, page, limit }: CoursesColumnsProps) => [
    // STT Column
    columnHelper.display({
        id: 'stt',
        header: () => <div className="text-center">#</div>,
        cell: ({ row }) => {
            const stt = (page - 1) * limit + row.index + 1;
            return <div className="text-center font-bold text-muted-foreground/50 tabular-nums text-xs">{stt}</div>;
        },
        size: 50,
    }),
    columnHelper.accessor('title', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-9 px-4 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all group"
                >
                    Tên khóa học
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div
                className="flex items-center gap-3 group/title cursor-pointer max-w-[280px]"
                onClick={() => onTitleClick(info.row.original)}
            >
                <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover/title:bg-primary group-hover/title:text-white transition-all duration-300">
                    <BookOpen className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground text-sm group-hover/title:text-primary transition-colors truncate">{info.getValue()}</span>
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider truncate">ID: {info.row.original.id.slice(0, 8)}</span>
                </div>
            </div>
        ),
    }),
    columnHelper.accessor('jlptLevel', {
        header: () => <div className="px-1 text-center">Trình độ</div>,
        cell: (info) => {
            const level = info.getValue() || 'N/A';
            return (
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/30 border border-border/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Target className="size-3 opacity-50 text-primary" />
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
                    className="-ml-4 h-9 px-4 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                >
                    Học phí
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => {
            const formatted = formatCurrency(info.getValue());
            return (
                <div className="text-center font-semibold text-sm text-foreground tabular-nums tracking-tight">
                    {formatted}
                </div>
            );
        },
        size: 120,
    }),
    columnHelper.accessor('status', {
        header: () => <div className="px-1 text-center">Trạng thái</div>,
        cell: (info) => {
            const status = info.getValue() as string;
            const config = {
                published: { label: 'Đã xuất bản', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
                pending_review: { label: 'Chờ duyệt', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
                draft: { label: 'Bản nháp', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
                rejected: { label: 'Bị từ chối', class: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
                archived: { label: 'Đã lưu trữ', class: 'bg-slate-500/10 text-slate-600 border-slate-500/20' }
            };
            const current = config[status as keyof typeof config] || { label: status, class: 'bg-muted/30 text-muted-foreground border-border/40' };

            return (
                <div className="flex justify-center">
                    <div className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm", current.class)}>
                        <div className={cn("size-1.5 rounded-full mr-2", status === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-current opacity-50')} />
                        {current.label}
                    </div>
                </div>
            );
        },
        size: 130,
    }),
    columnHelper.accessor('totalLessons', {
        id: 'lessonsCount',
        header: () => <div className="px-1 text-center">Bài học</div>,
        cell: (info) => (
            <div className="flex flex-col items-center">
                <div className="font-bold text-sm text-foreground">{info.getValue() || 0}</div>
                <div className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-tight">Đã xuất bản</div>
            </div>
        ),
        size: 90,
    }),
    columnHelper.accessor('totalQuizzes', {
        id: 'quizzesCount',
        header: () => <div className="px-1 text-center">Quiz</div>,
        cell: (info) => (
            <div className="flex flex-col items-center">
                <div className="font-bold text-sm text-foreground">{info.getValue() || 0}</div>
                <div className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-tight">Đã xuất bản</div>
            </div>
        ),
        size: 90,
    }),
    columnHelper.accessor('totalStudents', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-9 px-4 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                >
                    Học viên
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex flex-col items-center">
                <div className="font-bold text-sm text-foreground">{info.getValue() || 0}</div>
                <div className="text-[9px] font-medium text-muted-foreground/60">đã đăng ký</div>
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
                    className="-ml-4 h-9 px-4 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                >
                    Cập nhật
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs tabular-nums font-medium">
                <Clock className="size-3 opacity-50" />
                {formatDateTime(info.getValue())}
            </div>
        ),
        size: 140,
    }),
    columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center">Thao tác</div>,
        cell: ({ row }) => {
            const course = row.original;

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
                            >
                                <span className="sr-only">Mở menu</span>
                                <MoreVertical className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-[200px] border-border/40 shadow-xl bg-background/95 backdrop-blur-xl rounded-xl p-1.5"
                        >


                            <DropdownMenuItem
                                onClick={() => onModules(course)}
                                className="rounded-lg px-3 py-2.5 text-xs font-medium focus:bg-primary/10 focus:text-primary cursor-pointer flex gap-2.5"
                            >
                                <Layers className="h-4 w-4 opacity-50" />
                                <span>Chương trình học</span>
                            </DropdownMenuItem>

                            {can('course.update') && (
                                <DropdownMenuItem
                                    onClick={() => onEdit(course)}
                                    className="rounded-lg px-3 py-2.5 text-xs font-medium focus:bg-primary/10 focus:text-primary cursor-pointer flex gap-2.5"
                                >
                                    <Pencil className="h-4 w-4 opacity-50" />
                                    <span>Chỉnh sửa thông tin</span>
                                </DropdownMenuItem>
                            )}

                            {can('course.update') && (
                                <DropdownMenuItem
                                    onClick={() => onManageInstructors(course)}
                                    className="rounded-lg px-3 py-2.5 text-xs font-medium focus:bg-primary/10 focus:text-primary cursor-pointer flex gap-2.5"
                                >
                                    <Users className="h-4 w-4 opacity-50" />
                                    <span>Quản lý giảng viên</span>
                                </DropdownMenuItem>
                            )}

                            {course.type === 'live' && can('course.update') && (
                                <DropdownMenuItem
                                    onClick={() => onManageLiveSessions(course)}
                                    className="rounded-lg px-3 py-2.5 text-xs font-medium focus:bg-primary/10 focus:text-primary cursor-pointer flex gap-2.5"
                                >
                                    <Video className="h-4 w-4 opacity-50" />
                                    <span>Lịch dạy Live</span>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                                onClick={() => onViewAuditLog(course)}
                                className="rounded-lg px-3 py-2.5 text-xs font-medium focus:bg-primary/10 focus:text-primary cursor-pointer flex gap-2.5"
                            >
                                <History className="h-4 w-4 opacity-50" />
                                <span>Lịch sử kiểm duyệt</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-border/40 m-1" />

                            {(course.status === 'draft' || course.status === 'rejected') && can('course.update') ? (
                                <DropdownMenuItem
                                    onClick={() => onSubmitForReview(course)}
                                    className="rounded-lg px-3 py-2.5 text-xs font-medium text-blue-600 focus:text-blue-700 focus:bg-blue-500/10 cursor-pointer flex gap-2.5"
                                >
                                    <Layers className="h-4 w-4 opacity-60" />
                                    <span>Gửi yêu cầu kiểm duyệt</span>
                                </DropdownMenuItem>
                            ) : (course.status as any) === 'pending_review' && can('course.publish') ? (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => onPublish(course)}
                                        className="rounded-lg px-3 py-2.5 text-xs font-medium text-emerald-600 focus:text-emerald-700 focus:bg-emerald-500/10 cursor-pointer flex gap-2.5"
                                    >
                                        <CheckCircle className="h-4 w-4 opacity-60" />
                                        <span>Phê duyệt & Xuất bản</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onReject(course)}
                                        className="rounded-lg px-3 py-2.5 text-xs font-medium text-rose-600 focus:text-rose-700 focus:bg-rose-500/10 cursor-pointer flex gap-2.5"
                                    >
                                        <XCircle className="h-4 w-4 opacity-60" />
                                        <span>Từ chối & Phản hồi</span>
                                    </DropdownMenuItem>
                                </>
                            ) : course.status === 'published' && can('course.publish') ? (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => onPublish(course)}
                                        className="rounded-lg px-3 py-2.5 text-xs font-medium text-emerald-600 focus:text-emerald-700 focus:bg-emerald-500/10 cursor-pointer flex gap-2.5"
                                    >
                                        <CheckCircle className="h-4 w-4 opacity-60" />
                                        <span>Xuất bản bản cập nhật</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onUnpublish(course)}
                                        className="rounded-lg px-3 py-2.5 text-xs font-medium text-amber-600 focus:text-amber-700 focus:bg-amber-500/10 cursor-pointer flex gap-2.5"
                                    >
                                        <XCircle className="h-4 w-4 opacity-60" />
                                        <span>Gỡ bỏ khóa học</span>
                                    </DropdownMenuItem>
                                </>
                            ) : null}

                            {can('user.manage') && ( // Assuming course deletion is restricted to high-level users
                                <>
                                    <DropdownMenuSeparator className="bg-border/40 m-1" />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(course)}
                                        className="rounded-lg px-3 py-2.5 text-xs font-medium text-rose-600 focus:text-rose-700 focus:bg-rose-500/10 cursor-pointer flex gap-2.5"
                                    >
                                        <Trash className="h-4 w-4 opacity-50" />
                                        <span>Xóa khóa học</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
        size: 80,
    }),
];
