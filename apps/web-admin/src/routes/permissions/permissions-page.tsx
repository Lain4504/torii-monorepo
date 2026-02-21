import { useState, useEffect, useMemo } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Loader2, RotateCcw, Zap, Cpu, Lock } from 'lucide-react';
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
            <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
                <div className="relative overflow-x-auto">
                    <Table className="min-w-full border-collapse">
                        <TableHeader className="bg-muted/30">
                            {/* Permission Category Row */}
                            <TableRow className="hover:bg-transparent border-b border-border/50">
                                <TableHead className="sticky left-0 z-40 bg-muted/50 border-r border-border h-12 px-6">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                        Vai trò / Chức năng
                                    </span>
                                </TableHead>
                                {permissions && Object.entries(permissions.byCategory).map(([category, perms]) => (
                                    <TableHead
                                        key={category}
                                        colSpan={perms.length}
                                        className="text-center border-r border-border/50 bg-primary/[0.02] py-2 last:border-r-0"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Cpu className="size-3 text-primary/40" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-primary/70">
                                                {category}
                                            </span>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                            {/* Individual Permission Row */}
                            <TableRow className="hover:bg-transparent border-b border-border/50">
                                <TableHead className="sticky left-0 z-40 bg-muted/50 border-r border-border h-16">
                                    {/* Empty corner cell */}
                                </TableHead>
                                {permissions && permissions.all.map((perm) => (
                                    <TableHead
                                        key={perm.code}
                                        className={cn(
                                            "min-w-[150px] max-w-[200px] px-4 py-3 border-r border-border/10 text-center align-top",
                                            groupBoundaries.has(perm.code) && "border-r border-primary/20"
                                        )}
                                    >
                                        <div className="flex flex-col items-center gap-1.5 mt-1">
                                            <span className="text-[10px] font-bold leading-relaxed text-foreground/80 break-words w-full">
                                                {perm.description}
                                            </span>
                                            <span className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-tighter">
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
                                        className={cn(
                                            "transition-colors group",
                                            isLearner ? "bg-muted/10" : "hover:bg-muted/20"
                                        )}
                                    >
                                        <TableCell className={cn(
                                            "sticky left-0 z-30 bg-card border-r border-border min-w-[200px] px-6 py-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors",
                                            !isLearner && "group-hover:bg-muted/30"
                                        )}>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{role.name}</span>
                                                    {isLearner && <Lock className="size-3 text-muted-foreground/40" />}
                                                </div>
                                                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-wider">{role.code}</span>
                                            </div>
                                        </TableCell>
                                        {permissions?.all.map((perm) => (
                                            <TableCell
                                                key={perm.code}
                                                className={cn(
                                                    "text-center p-0 border-r border-border/10",
                                                    groupBoundaries.has(perm.code) && "border-r border-primary/20"
                                                )}
                                            >
                                                <label
                                                    className={cn(
                                                        "flex items-center justify-center w-full h-16 transition-colors",
                                                        !isLearner ? "cursor-pointer hover:bg-primary/[0.03]" : "cursor-default opacity-80"
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={matrix[role.code]?.has(perm.code)}
                                                        onCheckedChange={() => !isLearner && handleToggle(role.code, perm.code)}
                                                        className={cn(
                                                            "size-4.5 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm",
                                                            isLearner && "pointer-events-none opacity-100"
                                                        )}
                                                    />
                                                </label>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                <div className="px-6 py-3 bg-muted/10 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground/60 flex items-center gap-2">
                        <Lock className="size-3" />
                        Lưu ý: Các thay đổi chỉ có hiệu lực sau khi bạn nhấn "Lưu thay đổi". Di chuột để xem chi tiết từng quyền hạn.
                    </p>
                </div>
            </div>

            {/* Sticky Action Footer */}
            {hasChanges() && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-500 w-full max-w-md px-4">
                    <div className="bg-background border border-border shadow-2xl rounded-2xl p-2 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 ml-3">
                            <div className="size-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Có thay đổi chưa lưu</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                disabled={updateMutation.isPending}
                                className="h-9 rounded-xl px-4 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
                            >
                                <RotateCcw className="size-3.5 mr-2" />
                                <span className="font-bold uppercase tracking-widest">Hoàn tác</span>
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="h-9 rounded-xl px-6 bg-primary text-primary-foreground text-[11px] font-semibold shadow-md active:scale-95 transition-all"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="size-3.5 mr-2 fill-primary-foreground" />
                                        <span className="font-bold uppercase tracking-widest">Lưu thay đổi</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
