import { useState, useEffect, useMemo } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { RotateCcw, Zap } from 'lucide-react';
import {
    useFetchPermissions,
    useRoles,
    useUpdateRolePermissions
} from "@/lib/api/services/permissions.ts";
import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from '@workspace/ui/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { useQueries } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

import { PageHeader } from '@/components/common/page-header';
import { Spinner } from "@workspace/ui/components/spinner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";

export function PermissionsPage() {
    // Data fetching
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const { data: permissions, isLoading: permsLoading } = useFetchPermissions();

    // Fetch permissions for all roles
    const rolePermissionsQueries = useQueries({
        queries: (roles || []).map(role => ({
            queryKey: ['authorization', 'role-permissions', role.code],
            queryFn: async () => {
                const res = await apiClient.get(`/api/authorization/roles/${role.code}/permissions`);
                return {
                    roleCode: role.code,
                    permissions: res.data.data.permissions as string[]
                };
            },
            enabled: !!roles,
        }))
    });

    const isAnyRolePermsLoading = rolePermissionsQueries.some(q => q.isLoading);
    const updateMutation = useUpdateRolePermissions();

    // Helper to identify group boundaries
    const groupBoundaries = useMemo(() => {
        if (!permissions) return new Set<string>();
        const lastInGroups = new Set<string>();
        Object.values(permissions.byCategory).forEach(perms => {
            if (perms.length > 0) {
                lastInGroups.add(perms[perms.length - 1].code);
            }
        });
        return lastInGroups;
    }, [permissions]);

    // Local state for the matrix
    const [matrix, setMatrix] = useState<Record<string, Set<string>>>({});
    const [initialMatrix, setInitialMatrix] = useState<Record<string, Set<string>>>({});

    // Initialize matrix when data is loaded
    useEffect(() => {
        if (!isAnyRolePermsLoading && roles && rolePermissionsQueries.every(q => q.isSuccess)) {
            const newMatrix: Record<string, Set<string>> = {};
            rolePermissionsQueries.forEach(q => {
                if (q.data) {
                    newMatrix[q.data.roleCode] = new Set(q.data.permissions);
                }
            });
            setMatrix(newMatrix);
            setInitialMatrix(JSON.parse(JSON.stringify(newMatrix, (_, value) =>
                value instanceof Set ? Array.from(value) : value
            )));
        }
    }, [isAnyRolePermsLoading, roles, rolePermissionsQueries.map(q => q.isSuccess).join(',')]);

    const handleToggle = (roleCode: string, permCode: string) => {
        setMatrix(prev => {
            const newRoleSet = new Set(prev[roleCode] || []);
            if (newRoleSet.has(permCode)) {
                newRoleSet.delete(permCode);
            } else {
                newRoleSet.add(permCode);
            }
            return {
                ...prev,
                [roleCode]: newRoleSet
            };
        });
    };

    const hasChanges = () => {
        return Object.keys(matrix).some(roleCode => {
            const current = matrix[roleCode];
            const initialArr = (initialMatrix[roleCode] as any) || [];
            const initial = new Set(initialArr);

            if (current.size !== initial.size) return true;
            for (const p of current) {
                if (!initial.has(p)) return true;
            }
            return false;
        });
    };

    const handleSave = async () => {
        // Find which roles have changes
        const changedRoles = Object.keys(matrix).filter(roleCode => {
            const current = matrix[roleCode];
            const initialArr = (initialMatrix[roleCode] as any) || [];
            const initial = new Set(initialArr);
            if (current.size !== initial.size) return true;
            for (const p of current) {
                if (!initial.has(p)) return true;
            }
            return false;
        });

        for (const roleCode of changedRoles) {
            await updateMutation.mutateAsync({
                roleCode,
                permissions: Array.from(matrix[roleCode]),
            });
        }

        // After all updates, the query client will invalidate and we re-sync
        // In the mutation onSuccess, we already invalidate.
    };

    const handleReset = () => {
        const resetMatrix: Record<string, Set<string>> = {};
        Object.keys(initialMatrix).forEach(roleCode => {
            resetMatrix[roleCode] = new Set(initialMatrix[roleCode] as any);
        });
        setMatrix(resetMatrix);
    };

    if (rolesLoading || permsLoading || (roles && isAnyRolePermsLoading)) {
        // Approximate shape: 4 roles × 12 permissions in 3 categories
        const SKEL_ROLES = 4;
        const SKEL_PERMS = 12;
        const SKEL_CATS = 3;
        const permsPerCat = Math.floor(SKEL_PERMS / SKEL_CATS);

        return (
            <div className="flex flex-col gap-8">
                <PageHeader
                    title="Quản lý Quyền truy cập"
                    subtitle="Kiểm soát quyền truy cập chi tiết hệ thống"
                    stats={[{ label: "Tổng số vai trò", value: "—" }]}
                />

                <Card className="overflow-hidden">
                    <CardContent className="p-0">

                        <Table>
                            <TableHeader>
                                {/* Row 1: Category group headers */}
                                <TableRow>
                                    <TableHead className="sticky left-0 z-40 bg-muted/50 border-r w-[200px]">
                                        Vai trò / Quyền hạn
                                    </TableHead>
                                    {Array.from({ length: SKEL_CATS }).map((_, i) => (
                                        <TableHead
                                            key={i}
                                            colSpan={permsPerCat}
                                            className="text-center bg-muted/30 border-r"
                                        >
                                            <Skeleton className="h-3 w-20 mx-auto" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                                {/* Row 2: Individual permission name headers */}
                                <TableRow>
                                    <TableHead className="sticky left-0 z-40 bg-muted/50 border-r" />
                                    {Array.from({ length: SKEL_PERMS }).map((_, i) => (
                                        <TableHead
                                            key={i}
                                            className="min-w-[120px] text-center border-r align-top py-4"
                                        >
                                            <div className="flex flex-col gap-1.5 items-center">
                                                <Skeleton className="h-3 w-16" />
                                                <Skeleton className="h-2.5 w-10" />
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: SKEL_ROLES }).map((_, i) => (
                                    <TableRow key={i}>
                                        {/* Role name cell */}
                                        <TableCell className="sticky left-0 z-30 bg-card border-r">
                                            <div className="flex flex-col gap-1.5">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-2.5 w-16" />
                                            </div>
                                        </TableCell>
                                        {/* Checkbox cells */}
                                        {Array.from({ length: SKEL_PERMS }).map((_, j) => (
                                            <TableCell key={j} className="p-0 border-r">
                                                <div className="flex items-center justify-center p-4">
                                                    <Skeleton className="h-4 w-4 rounded-sm" />
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Quản lý Quyền truy cập"
                subtitle="Kiểm soát quyền truy cập chi tiết hệ thống"
                stats={[
                    { label: "Tổng số vai trò", value: roles?.length || 0 }
                ]}
            />


            {/* Matrix Table */}
            <Card className="overflow-hidden">
                <CardContent className="p-0">

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 z-40 bg-muted/50 border-r w-[200px]">
                                    Vai trò / Quyền hạn
                                </TableHead>
                                {permissions && Object.entries(permissions.byCategory).map(([category, perms]) => (
                                    <TableHead
                                        key={category}
                                        colSpan={perms.length}
                                        className="text-center bg-muted/30 border-r"
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                                            {category}
                                        </span>
                                    </TableHead>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableHead className="sticky left-0 z-40 bg-muted/50 border-r" />
                                {permissions && permissions.all.map((perm) => (
                                    <TableHead
                                        key={perm.code}
                                        className={cn(
                                            "min-w-[150px] text-center border-r align-top py-4",
                                            groupBoundaries.has(perm.code) && "border-r-muted-foreground/30"
                                        )}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-medium leading-tight text-foreground">
                                                {perm.description}
                                            </span>
                                            <span className="text-[10px] font-mono text-muted-foreground">
                                                {perm.code.split('.').pop()}
                                            </span>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles?.map((role) => {
                                const isLearner = role.code === 'learner';
                                return (
                                    <TableRow
                                        key={role.code}
                                        className={cn(isLearner && "bg-muted/30")}
                                    >
                                        <TableCell className={cn(
                                            "sticky left-0 z-30 bg-card border-r font-medium",
                                            isLearner && "bg-muted/30"
                                        )}>
                                            <div className="flex flex-col">
                                                <span>{role.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{role.code}</span>
                                            </div>
                                        </TableCell>
                                        {permissions?.all.map((perm) => (
                                            <TableCell
                                                key={perm.code}
                                                className={cn(
                                                    "p-0 border-r",
                                                    groupBoundaries.has(perm.code) && "border-r-muted-foreground/30"
                                                )}
                                            >
                                                <div className="flex items-center justify-center p-4">
                                                    <Checkbox
                                                        checked={matrix[role.code]?.has(perm.code)}
                                                        onCheckedChange={() => !isLearner && handleToggle(role.code, perm.code)}
                                                        disabled={isLearner}
                                                    />
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                </CardContent>
            </Card>

            {/* Sticky Action Footer */}
            {hasChanges() && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Card className="flex flex-row items-center justify-between p-2 shadow-2xl ring-1 ring-border border-none">
                        <div className="flex items-center gap-3 px-2">
                            <Badge variant="secondary" className="animate-pulse">
                                Có thay đổi
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground">Chưa lưu thay đổi</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                disabled={updateMutation.isPending}
                            >
                                <RotateCcw className="size-3.5 mr-2" />
                                Hoàn tác
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        disabled={updateMutation.isPending}
                                        size="sm"
                                    >
                                        {updateMutation.isPending ? (
                                            <Spinner className="size-3.5" />
                                        ) : (
                                            <>
                                                <Zap className="size-3.5 mr-2 fill-current" />
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận cập nhật quyền hạn?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Hành động này sẽ thay đổi quyền truy cập của các vai trò trong hệ thống. Một số người dùng có thể cần đăng nhập lại để áp dụng thay đổi.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSave}>
                                            Xác nhận lưu
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
