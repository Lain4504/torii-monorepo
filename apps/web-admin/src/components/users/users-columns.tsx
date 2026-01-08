import { createColumnHelper } from '@tanstack/react-table';
import type { UserResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, Eye, Check, Copy } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Can } from "@/lib/guard/can";
import { useCopyToClipboard } from "@workspace/ui/hooks/use-copy-to-clipboard";

const columnHelper = createColumnHelper<UserResponseDTO>();

export type UsersColumnsProps = {
    onView: (user: UserResponseDTO) => void;
    onEdit: (user: UserResponseDTO) => void;
    onDelete: (user: UserResponseDTO) => void;
    page: number;
    limit: number;
};

const ActionsCell = ({ user, onView, onEdit, onDelete }: { user: UserResponseDTO } & Omit<UsersColumnsProps, 'page' | 'limit'>) => {
    const [copy, isCopied] = useCopyToClipboard();
    const [copyEmail, isEmailCopied] = useCopyToClipboard();

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
                <DropdownMenuItem onClick={() => copy(user.id)}>
                    {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyEmail(user.email)}>
                    {isEmailCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                    Copy Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(user)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <Can permission="user.manage">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </Can>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const getUsersColumns = ({ onView, onEdit, onDelete, page, limit }: UsersColumnsProps) => [
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
    columnHelper.accessor('displayName', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Display Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: (info) => <div className="font-medium ml-4">{info.getValue()}</div>,
    }),
    columnHelper.accessor('email', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: (info) => <div className="ml-4">{info.getValue()}</div>,
    }),
    columnHelper.accessor('role', {
        header: 'Role',
        cell: (info) => {
            const role = info.getValue();
            return (
                <span className="capitalize">{role}</span>
            );
        },
    }),
    columnHelper.accessor(row => {
        if (row.deletedAt) return 'deleted';
        if (row.bannedUntil && new Date(row.bannedUntil) > new Date()) return 'banned';
        if (!row.verifiedAt) return 'inactive';
        return 'active';
    }, {
        id: 'status',
        header: 'Status',
        cell: (info) => {
            const status = info.getValue();
            return (
                <span
                    className={`px-2 py-1 rounded text-xs capitalize ${status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800' // Banned or Deleted
                        }`}
                >
                    {status}
                </span>
            );
        },
    }),
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => <ActionsCell user={row.original} onView={onView} onEdit={onEdit} onDelete={onDelete} />,
    }),
];
