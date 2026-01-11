import { createColumnHelper } from '@tanstack/react-table';
import type { PostResponseDTO } from '@workspace/schemas';
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
import { Badge } from '@workspace/ui/components/badge';
import { Can } from "@/lib/guard/can";

const columnHelper = createColumnHelper<PostResponseDTO>();

export type PostColumnsProps = {
    onView: (post: PostResponseDTO) => void;
    onEdit: (post: PostResponseDTO) => void;
    onDelete: (post: PostResponseDTO) => void;
    page: number;
    limit: number;
};

export const getPostColumns = ({ onView, onEdit, onDelete, page, limit }: PostColumnsProps) => [
    // STT Column
    columnHelper.display({
        id: 'stt',
        header: () => <div className="text-center font-semibold">STT</div>,
        cell: ({ row }) => {
            const index = row.index;
            const stt = (page - 1) * limit + index + 1;
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
        cell: (info) => <div className="font-medium ml-4 max-w-md truncate">{info.getValue()}</div>,
    }),
    columnHelper.accessor('author', {
        header: 'Author',
        cell: (info) => {
            const author = info.getValue();
            return <div className="ml-4">{author?.displayName || 'Unknown'}</div>;
        },
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const status = info.getValue();
            const variant = status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline';
            return (
                <Badge variant={variant} className="capitalize">
                    {status}
                </Badge>
            );
        },
    }),
    columnHelper.accessor('viewCount', {
        header: 'Views',
        cell: (info) => <div className="text-center">{info.getValue() || 0}</div>,
    }),
    columnHelper.accessor('commentCount', {
        header: 'Comments',
        cell: (info) => <div className="text-center">{info.getValue() || 0}</div>,
    }),
    columnHelper.accessor('publishedAt', {
        header: 'Published',
        cell: (info) => {
            const date = info.getValue();
            return date ? new Date(date).toLocaleDateString() : '-';
        },
    }),
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
            const post = row.original;

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(post)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <Can permission="post.manage">
                            <DropdownMenuItem onClick={() => onEdit(post)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(post)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </Can>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }),
];



