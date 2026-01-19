import { createColumnHelper } from '@tanstack/react-table';
import type { PostResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { ArrowUpDown, Pencil, Trash, FileText, Clock, Zap, Eye as EyeIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { formatDateTime } from '@/lib/format-utils';
import { cn } from "@workspace/ui/lib/utils";
import { Can } from "@/lib/guard/can";

const columnHelper = createColumnHelper<PostResponseDTO>();

export type PostColumnsProps = {
    onView: (post: PostResponseDTO) => void;
    onEdit: (post: PostResponseDTO) => void;
    onDelete: (post: PostResponseDTO) => void;
    page: number;
    limit: number;
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        published: 'Đã đăng',
        draft: 'Bản nháp',
        archived: 'Đã lưu trữ',
    };
    return labels[status] || status;
};

export const getPostColumns = ({ onView, onEdit, onDelete, page, limit }: PostColumnsProps) => [
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
                    Tiêu đề
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex items-center gap-3 group/title">
                <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover/title:bg-primary group-hover/title:text-white transition-all">
                    <FileText className="size-4" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-foreground text-lg group-hover/title:text-primary transition-colors line-clamp-1">{info.getValue()}</span>
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5">ID: {info.row.original.id.slice(0, 8)}</span>
                </div>
            </div>
        ),
    }),
    columnHelper.accessor('author', {
        header: () => <div className="px-1 text-[9px] font-black uppercase tracking-[0.2em]">Tác giả</div>,
        cell: (info) => {
            const author = info.getValue();
            return (
                <div className="text-[11px] font-bold text-foreground/80 lowercase">
                    {author?.displayName || 'Không xác định'}
                </div>
            );
        },
        size: 120,
    }),
    columnHelper.accessor('status', {
        header: () => <div className="px-1 text-[9px] font-black uppercase tracking-[0.2em]">Trạng thái</div>,
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
                    {getStatusLabel(status)}
                </div>
            );
        },
        size: 120,
    }),
    columnHelper.accessor('viewCount', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                >
                    Lượt xem
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex flex-col items-center">
                <div className="font-bold text-xl leading-none text-primary">{info.getValue() || 0}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1.5 uppercase">Lượt xem</div>
            </div>
        ),
        size: 100,
    }),
    columnHelper.accessor('commentCount', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                >
                    Bình luận
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex flex-col items-center">
                <div className="font-bold text-xl leading-none text-amber-500">{info.getValue() || 0}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1.5 uppercase">Bình luận</div>
            </div>
        ),
        size: 100,
    }),
    columnHelper.accessor('publishedAt', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                >
                    Ngày đăng
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => {
            const date = info.getValue();
            return (
                <div className="flex items-center justify-center gap-2 text-muted-foreground/40 tabular-nums text-[10px] font-bold italic">
                    <Clock className="size-3 opacity-40" />
                    {date ? formatDateTime(date) : '-'}
                </div>
            );
        },
        size: 140,
    }),
    columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center text-[9px] font-black uppercase tracking-[0.2em]">Quản lý</div>,
        cell: ({ row }) => {
            const post = row.original;

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all data-[state=open]:bg-primary/20"
                            >
                                <span className="sr-only">Menu Thao tác</span>
                                <Zap className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-[220px] border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-lg p-2"
                        >
                            <DropdownMenuItem
                                onClick={() => onView(post)}
                                className="rounded-md px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                            >
                                <EyeIcon className="h-4 w-4 opacity-30" />
                                <span>Xem Chi tiết</span>
                            </DropdownMenuItem>

                            <Can permission="post.manage">
                                <DropdownMenuItem
                                    onClick={() => onEdit(post)}
                                    className="rounded-md px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                                >
                                    <Pencil className="h-4 w-4 opacity-30" />
                                    <span>Chỉnh sửa Nội dung</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-border/20 mx-2" />

                                <DropdownMenuItem
                                    onClick={() => onDelete(post)}
                                    className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex gap-3"
                                >
                                    <Trash className="h-4 w-4 opacity-30" />
                                    <span>Xóa bài viết</span>
                                </DropdownMenuItem>
                            </Can>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
        size: 100,
    }),
];



