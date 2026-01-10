import { createColumnHelper } from '@tanstack/react-table';
import type { UserResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ArrowUpDown, MoreVertical, Pencil, Trash } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Can } from "@/lib/guard/can";
import { formatDateTime } from "@/lib/format-utils";

const columnHelper = createColumnHelper<UserResponseDTO>();

export type UsersColumnsProps = {
    onView: (user: UserResponseDTO) => void;
    onEdit: (user: UserResponseDTO) => void;
    onDelete: (user: UserResponseDTO) => void;
    page: number;
    limit: number;
};

export const getUsersColumns = ({ onEdit, onDelete, page, limit }: UsersColumnsProps) => [
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
    columnHelper.accessor('displayName', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
                >
                    Name
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => <div className="font-medium text-foreground">{info.getValue()}</div>,
    }),
    columnHelper.accessor('email', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
                >
                    Email
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => <div className="text-sm text-muted-foreground">{info.getValue()}</div>,
    }),
    columnHelper.accessor('role', {
        header: () => <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Role</div>,
        cell: (info) => {
            const role = info.getValue();
            const variant = role === 'admin' ? 'destructive' : role === 'staff' ? 'default' : 'secondary';
            return (
                <Badge variant={variant} className="capitalize font-medium shadow-none rounded-md">
                    {role}
                </Badge>
            );
        },
        size: 100,
    }),
    columnHelper.accessor(row => {
        if (row.deletedAt) return 'deleted';
        if (row.bannedUntil && new Date(row.bannedUntil) > new Date()) return 'banned';
        if (!row.verifiedAt) return 'inactive';
        return 'active';
    }, {
        id: 'status',
        header: () => <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Status</div>,
        cell: (info) => {
            const status = info.getValue();
            let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';

            if (status === 'active') variant = 'default';
            else if (status === 'inactive') variant = 'secondary';
            else variant = 'destructive';

            return (
                <Badge variant={variant} className="capitalize font-medium shadow-none rounded-md">
                    {status}
                </Badge>
            );
        },
        size: 100,
    }),
    columnHelper.accessor('lastLoginAt', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold uppercase tracking-wider hover:bg-transparent hover:text-foreground"
                >
                    Last Login
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => <div className="text-sm text-muted-foreground tabular-nums">{formatDateTime(info.getValue())}</div>,
        size: 140,
    }),
    columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Actions</div>,
        cell: ({ row }) => {
            const user = row.original;

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
                            className="w-[180px] border-none shadow-xl bg-background/95 backdrop-blur-xl rounded-xl p-1"
                        >
                            <Can permission="user.manage">
                                <DropdownMenuItem
                                    onClick={() => onEdit(user)}
                                    className="rounded-lg cursor-pointer gap-2 focus:bg-primary/5"
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span>Edit User</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-border/50" />

                                <DropdownMenuItem
                                    onClick={() => onDelete(user)}
                                    className="rounded-lg cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                    <Trash className="h-4 w-4" />
                                    <span>Delete User</span>
                                </DropdownMenuItem>
                            </Can>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
        size: 80,
    }),
];

