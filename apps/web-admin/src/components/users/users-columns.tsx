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
            return <div className="text-center font-medium text-muted-foreground/60 tabular-nums text-xs">{stt}</div>;
        },
        size: 50,
    }),
    columnHelper.accessor('displayName', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-3 h-8 px-3 text-xs font-semibold hover:bg-muted transition-all group rounded-md"
                >
                    Họ và tên
                    <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => {
            const user = info.row.original;
            const avatarUrl = user.avatarUrl;
            const displayName = info.getValue();

            return (
                <div className="flex items-center gap-3">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover border border-border"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <UserCircle className="size-4.5" />
                        </div>
                    )}
                    <div className="font-semibold text-foreground text-[14px]">{displayName}</div>
                </div>
            );
        },
    }),
    columnHelper.accessor('email', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-3 h-8 px-3 text-xs font-semibold hover:bg-muted transition-all group rounded-md"
                >
                    Email
                    <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                <Mail className="size-3 text-muted-foreground/40" />
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor('linkedMethods', {
        header: () => <div className="px-1 text-xs font-semibold">Phương thức đăng nhập</div>,
        cell: (info) => {
            const methods = info.getValue() || [];
            if (methods.length === 0) {
                return <span className="text-xs text-muted-foreground/40">Chưa liên kết</span>;
            }

            const methodLabels: Record<string, string> = {
                'password': 'Mật khẩu',
                'google': 'Google',
                'facebook': 'Facebook',
                'github': 'GitHub',
            };

            return (
                <div className="flex flex-wrap gap-1">
                    {methods.map((method, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                        >
                            {methodLabels[method] || method}
                        </span>
                    ))}
                </div>
            );
        },
        size: 180,
    }),
    columnHelper.accessor('role', {
        header: () => <div className="px-1 text-xs font-semibold">Vai trò</div>,
        cell: (info) => {
            const role = info.getValue() as string;
            const colors = {
                admin: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
                staff: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/5 dark:text-primary-foreground dark:border-primary/10',
                lecturer: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
                learner: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
            };
            const roleLabels = {
                admin: 'Quản trị viên',
                staff: 'Nhân viên',
                lecturer: 'Giảng viên',
                learner: 'Học viên'
            };
            const colorClass = colors[role as keyof typeof colors] || 'bg-muted text-muted-foreground border-border';
            const label = roleLabels[role as keyof typeof roleLabels] || role;

            return (
                <div className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", colorClass)}>
                    {label}
                </div>
            );
        },
        size: 130,
    }),
    columnHelper.accessor(row => {
        if (row.deletedAt) return 'DELETED';
        if (row.bannedUntil && new Date(row.bannedUntil) > new Date()) return 'BANNED';
        if (!row.verifiedAt) return 'UNVERIFIED';
        return 'ACTIVE';
    }, {
        id: 'status',
        header: () => <div className="px-1 text-xs font-semibold">Trạng thái</div>,
        cell: (info) => {
            const status = info.getValue() as string;
            let dotColor = 'bg-emerald-500';
            let label = 'Hoạt động';

            if (status !== 'ACTIVE') {
                dotColor = 'bg-amber-500';
                label = 'Chưa xác thực';
            }
            if (status === 'DELETED') {
                dotColor = 'bg-rose-500';
                label = 'Đã xóa';
            }
            if (status === 'BANNED') {
                dotColor = 'bg-slate-900 dark:bg-slate-100';
                label = 'Đã khóa';
            }

            return (
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
                    <div className={cn("size-1.5 rounded-full", dotColor)} />
                    {label}
                </div>
            );
        },
        size: 130,
    }),
    columnHelper.accessor('lastSignInAt', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-3 h-8 px-3 text-xs font-semibold hover:bg-muted transition-all group rounded-md"
                >
                    Đăng nhập lần cuối
                    <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="flex items-center gap-2 text-muted-foreground/60 tabular-nums text-[11px] font-medium">
                <Clock className="size-3 text-muted-foreground/30" />
                {info.getValue() ? formatDateTime(info.getValue()) : 'Chưa đăng nhập'}
            </div>
        ),
        size: 160,
    }),
    columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center text-xs font-semibold">Thao tác</div>,
        cell: ({ row }) => {
            const user = row.original;

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-md border-transparent hover:bg-muted transition-all"
                            >
                                <span className="sr-only">Menu thao tác</span>
                                <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-[180px] border border-border rounded-xl shadow-xl bg-background p-1"
                        >
                            <Can permission="user.manage">
                                <DropdownMenuItem
                                    onClick={() => onEdit(user)}
                                    className="rounded-lg px-3 py-2 text-sm focus:bg-primary focus:text-white cursor-pointer flex gap-2"
                                >
                                    <Pencil className="h-3.5 w-3.5 opacity-70" />
                                    <span>Chỉnh sửa thông tin</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-border mx-1 my-1" />

                                <DropdownMenuItem
                                    onClick={() => onDelete(user)}
                                    className="rounded-lg px-3 py-2 text-sm text-rose-600 focus:text-white focus:bg-rose-600 cursor-pointer flex gap-2"
                                >
                                    <Trash className="h-3.5 w-3.5 opacity-70" />
                                    <span>Xóa tài khoản</span>
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
