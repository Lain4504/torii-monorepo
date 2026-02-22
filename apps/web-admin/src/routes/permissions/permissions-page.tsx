import { useState, useEffect, useMemo } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Loader2, RotateCcw, Zap } from 'lucide-react';
import {
    useFetchPermissions,
    useRoles,
    useUpdateRolePermissions
} from "@/api/services/permissions.ts";
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
import { apiClient } from '@/api/api-client.ts';
import { Card } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

import { PageHeader } from '@/components/common/page-header';

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
        return (
            <div className="flex flex-col gap-8">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64 rounded-xl" />
                    <Skeleton className="h-5 w-96 rounded-lg" />
                </div>
                <div className="rounded-xl border bg-card p-6">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
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
            <div className="rounded-xl border bg-card overflow-hidden">
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
            </div>

            {/* Sticky Action Footer */}
            {hasChanges() && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Card className="flex flex-row items-center justify-between p-2 shadow-2xl ring-1 ring-border border-none">
                        <div className="flex items-center gap-3 px-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none animate-pulse">
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
                            <Button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                size="sm"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="size-3.5 mr-2 fill-current" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
