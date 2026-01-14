import { createColumnHelper } from '@tanstack/react-table';
import type { UserResponseDTO } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';

import { ArrowUpDown, Pencil, Trash, UserCircle, Mail, Clock, ShieldIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Can } from "@/lib/guard/can";
import { formatDateTime } from "@/lib/format-utils";
import { cn } from "@workspace/ui/lib/utils";

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
        header: () => <div className="text-center">#</div>,
        cell: ({ row }) => {
            const stt = (page - 1) * limit + row.index + 1;
            return <div className="text-center font-black italic text-muted-foreground/30 tabular-nums text-[10px]">0{stt}</div>;
        },
        size: 60,
    }),
    columnHelper.accessor('displayName', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group"
                >
                    Full Name
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-all group-hover/row:scale-110">
                    <UserCircle className="size-4" />
                </div>
                <div className="font-serif font-bold italic text-foreground text-[14px]">{info.getValue()}</div>
            </div>
        ),
    }),
    columnHelper.accessor('email', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group"
                >
                    Email Address
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex items-center gap-2 text-muted-foreground/60 italic text-[11px] font-bold">
                <Mail className="size-3 opacity-20" />
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor('role', {
        header: () => <div className="px-1">User Role</div>,
        cell: (info) => {
            const role = info.getValue() as string;
            const colors = {
                admin: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                staff: 'bg-primary/10 text-primary border-primary/20',
                lecturer: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                learner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            };
            const colorClass = colors[role as keyof typeof colors] || 'bg-muted/10 text-muted-foreground border-border/20';

            return (
                <div className={cn("inline-flex items-center px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.2em] border", colorClass)}>
                    {role}
                </div>
            );
        },
        size: 100,
    }),
    columnHelper.accessor(row => {
        if (row.deletedAt) return 'DELETED';
        if (row.bannedUntil && new Date(row.bannedUntil) > new Date()) return 'BANNED';
        if (!row.verifiedAt) return 'UNVERIFIED';
        return 'ACTIVE';
    }, {
        id: 'status',
        header: () => <div className="px-1">Status</div>,
        cell: (info) => {
            const status = info.getValue() as string;
            let dotColor = 'bg-emerald-500 shadow-emerald-500/50';
            if (status !== 'ACTIVE') dotColor = 'bg-amber-500 shadow-amber-500/50';
            if (status === 'DELETED' || status === 'BANNED') dotColor = 'bg-rose-500 shadow-rose-500/50';

            return (
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-foreground group">
                    <div className={cn("size-1.5 rounded-full shadow-sm animate-pulse", dotColor)} />
                    {status}
                </div>
            );
        },
        size: 100,
    }),
    columnHelper.accessor('lastSignInAt', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group"
                >
                    Last Login
                    <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex items-center gap-2 text-muted-foreground/40 tabular-nums text-[10px] font-bold italic">
                <Clock className="size-3 opacity-40" />
                {info.getValue() ? formatDateTime(info.getValue()) : 'NEVER'}
            </div>
        ),
        size: 140,
    }),
    columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center">Manage</div>,
        cell: ({ row }) => {
            const user = row.original;

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all data-[state=open]:bg-primary/20"
                            >
                                <span className="sr-only">Open User Menu</span>
                                <ShieldIcon className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-[200px] border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-lg p-2"
                        >
                            <Can permission="user.manage">
                                <DropdownMenuItem
                                    onClick={() => onEdit(user)}
                                    className="rounded-md px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                                >
                                    <Pencil className="h-4 w-4 opacity-40" />
                                    <span>Edit Profile</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-border/20 mx-2" />

                                <DropdownMenuItem
                                    onClick={() => onDelete(user)}
                                    className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex gap-3"
                                >
                                    <Trash className="h-4 w-4 opacity-40" />
                                    <span>Delete Account</span>
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
