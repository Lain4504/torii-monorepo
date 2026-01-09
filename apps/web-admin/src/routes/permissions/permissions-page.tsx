import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Loader2, RotateCcw, Save, Database } from 'lucide-react';
import {
    useFetchPermissions, useReseedPermissions,
    useRolePermissions,
    useRoles,
    useUpdateRolePermissions
} from "@/api/services/permissions.ts";
import { Skeleton } from '@workspace/ui/components/skeleton';

export function PermissionsPage() {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

    const { data: roles, isLoading: rolesLoading } = useRoles();
    const { data: permissions, isLoading: permsLoading } = useFetchPermissions();
    const { data: rolePermissions, isLoading: rolePermsLoading } = useRolePermissions(selectedRole);
    const updateMutation = useUpdateRolePermissions();
    const reseedMutation = useReseedPermissions();

    // Auto-select first role
    useEffect(() => {
        if (roles && roles.length > 0 && !selectedRole) {
            setSelectedRole(roles[0].code);
        }
    }, [roles, selectedRole]);

    // Update selected permissions when role changes
    useEffect(() => {
        if (rolePermissions) {
            setSelectedPerms(new Set(rolePermissions));
        }
    }, [rolePermissions]);

    const handleSave = () => {
        if (!selectedRole) return;

        updateMutation.mutate({
            roleCode: selectedRole,
            permissions: Array.from(selectedPerms),
        });
    };

    const handleReset = () => {
        if (rolePermissions) {
            setSelectedPerms(new Set(rolePermissions));
        }
    };

    const handleTogglePermission = (permCode: string) => {
        const newSet = new Set(selectedPerms);
        if (newSet.has(permCode)) {
            newSet.delete(permCode);
        } else {
            newSet.add(permCode);
        }
        setSelectedPerms(newSet);
    };

    const hasChanges = rolePermissions
        ? rolePermissions.length !== selectedPerms.size ||
        !rolePermissions.every(p => selectedPerms.has(p))
        : false;

    if (rolesLoading || permsLoading) {
        return (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Skeleton className="h-9 w-64 bg-muted/50 rounded-lg" />
                        <Skeleton className="h-5 w-96 bg-muted/50 rounded-md" />
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-11 w-80 bg-muted/50 rounded-xl" />
                    <Skeleton className="h-11 w-44 bg-muted/50 rounded-xl" />
                </div>
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full bg-muted/50 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Permission Management</h1>
                    <p className="text-muted-foreground">
                        Configure role-based access control and system permissions.
                    </p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-end justify-between gap-6">
                <div className="flex-1 max-w-sm space-y-2">
                    <Label htmlFor="role-select" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                        Select Role
                    </Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger id="role-select" className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all">
                            <SelectValue placeholder="Select a role..." />
                        </SelectTrigger>
                        <SelectContent className="border-none shadow-2xl bg-popover/95 backdrop-blur-xl rounded-xl">
                            {roles?.map((role) => (
                                <SelectItem key={role.code} value={role.code} className="rounded-lg focus:bg-primary/5">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{role.name}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {role.description}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    variant="ghost"
                    onClick={() => reseedMutation.mutate()}
                    disabled={reseedMutation.isPending}
                    className="h-11 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary border-none px-6"
                >
                    {reseedMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Re-seeding...
                        </>
                    ) : (
                        <>
                            <Database className="mr-2 h-4 w-4" />
                            Re-seed from YAML
                        </>
                    )}
                </Button>
            </div>

            {/* Loading State for Role Permissions */}
            {rolePermsLoading && (
                <div className="space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl rounded-2xl p-8 space-y-6">
                            <Skeleton className="h-6 w-32 bg-muted/50" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <Skeleton key={j} className="h-12 w-full bg-muted/30 rounded-xl" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Permissions Grid */}
            {!rolePermsLoading && permissions && (
                <div className="space-y-8">
                    {Object.entries(permissions.byCategory).map(([category, perms]) => (
                        <div key={category} className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl rounded-2xl p-8">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-foreground/90">{category}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {perms.length} permission{perms.length !== 1 ? 's' : ''} available in this category
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                                {perms.map((perm) => (
                                    <div key={perm.code} className="flex items-start space-x-4 group">
                                        <Checkbox
                                            id={perm.code}
                                            checked={selectedPerms.has(perm.code)}
                                            onCheckedChange={() => handleTogglePermission(perm.code)}
                                            className="mt-1 border-2 border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <div className="flex-1 space-y-1.5">
                                            <Label
                                                htmlFor={perm.code}
                                                className="text-sm font-medium leading-tight cursor-pointer group-hover:text-primary transition-colors"
                                            >
                                                {perm.description}
                                            </Label>
                                            <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">
                                                {perm.code}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Updated Action Bar (Sticky Glass) */}
            {!rolePermsLoading && selectedRole && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
                    <div className="bg-background/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={handleSave}
                                disabled={!hasChanges || updateMutation.isPending}
                                className="h-11 rounded-xl px-12 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                disabled={!hasChanges || updateMutation.isPending}
                                className="h-11 rounded-xl px-8 hover:bg-primary/5"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </div>

                        {hasChanges ? (
                            <div className="pr-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-xs font-semibold text-primary">
                                    Unsaved Changes
                                </span>
                            </div>
                        ) : (
                            <div className="pr-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                <span className="text-xs font-medium text-muted-foreground">
                                    Permissions Synced
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
