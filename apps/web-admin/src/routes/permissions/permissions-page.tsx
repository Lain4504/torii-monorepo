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
import { Loader2, RotateCcw, Database, ShieldCheck, Fingerprint, Activity, Zap, Cpu } from 'lucide-react';
import {
    useFetchPermissions, useReseedPermissions,
    useRolePermissions,
    useRoles,
    useUpdateRolePermissions
} from "@/api/services/permissions.ts";
import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from '@workspace/ui/lib/utils';
import { Card } from '@workspace/ui/components/card';

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
            <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-6">
                <div className="space-y-4">
                    <Skeleton className="h-14 w-96 bg-muted/20 rounded-2xl" />
                    <Skeleton className="h-6 w-[32rem] bg-muted/20 rounded-xl" />
                </div>
                <div className="flex items-center justify-between gap-8 p-10 rounded-[3rem] border border-border/20 bg-background/40">
                    <Skeleton className="h-14 w-full max-w-sm bg-muted/20 rounded-2xl" />
                    <Skeleton className="h-14 w-48 bg-muted/20 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 gap-10">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-80 w-full bg-muted/20 rounded-[3rem]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-40 px-6 max-w-[1400px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative">
                <div className="space-y-4 max-w-2xl text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-medium tracking-wide">
                        <ShieldCheck className="size-3.5" />
                        Access Management
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.1]">
                        Role <span className="text-primary italic">Permissions</span>
                    </h1>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg border-l-2 border-primary/20 pl-4 mt-4">
                        Configure granular authorization protocols and system-wide <br />
                        permission nodes for the <span className="text-foreground font-medium">Torii Platform</span>.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3 px-8 py-6 rounded-[2.5rem] bg-background/40 border border-border/20 backdrop-blur-xl hidden sm:flex shadow-sm">
                    <div className="flex items-center gap-3">
                        <Activity className="size-4 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-medium uppercase tracking-widest text-emerald-500">System Online</span>
                    </div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/40 text-right">Last Sync: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Role & System Actions */}
            <Card className="rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-white/20 p-8 flex flex-col lg:flex-row items-end justify-between gap-8 shadow-xl shadow-black/5">
                <div className="w-full max-w-md space-y-3">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2 ml-1">
                        <Fingerprint className="size-3.5" />
                        Select Role
                    </label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="h-14 px-6 rounded-xl border-border/20 bg-background/50 hover:bg-background/80 focus:ring-primary/20 transition-all text-sm font-medium">
                            <SelectValue placeholder="Select a role..." />
                        </SelectTrigger>
                        <SelectContent className="border-border/20 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl p-2">
                            {roles?.map((role) => (
                                <SelectItem key={role.code} value={role.code} className="rounded-xl px-4 py-3 focus:bg-primary/5 focus:text-primary cursor-pointer group">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium group-hover:translate-x-1 transition-transform origin-left">{role.name}</span>
                                        <span className="text-[10px] text-muted-foreground/60">
                                            {role.description}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Button
                        variant="ghost"
                        onClick={() => reseedMutation.mutate()}
                        disabled={reseedMutation.isPending}
                        className="h-14 rounded-xl bg-muted/20 hover:bg-primary/5 text-primary border border-border/10 px-6 flex-1 sm:flex-none text-xs font-medium uppercase tracking-wide"
                    >
                        {reseedMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Reseeding...
                            </>
                        ) : (
                            <>
                                <Database className="mr-2 h-4 w-4 opacity-40" />
                                Reseed Defaults
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* Permissions Matrix */}
            {rolePermsLoading ? (
                <div className="space-y-10">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="p-10 rounded-[3rem] border border-border/20 bg-background/40 space-y-10">
                            <Skeleton className="h-8 w-48 bg-muted/20 rounded-xl" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <Skeleton key={j} className="h-16 w-full bg-muted/20 rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : permissions && (
                <div className="space-y-12">
                    {Object.entries(permissions.byCategory).map(([category, perms]) => (
                        <div key={category} className="group/category">
                            <div className="flex items-center gap-4 mb-6 px-4">
                                <div className="p-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10 group-hover/category:bg-primary group-hover/category:text-white transition-all duration-500">
                                    <Cpu className="size-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xl font-medium tracking-tight text-foreground/80 group-hover/category:text-primary transition-colors capitalize">{category.toLowerCase()}</h3>
                                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
                                        {perms.length} Permission{perms.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            <Card className="rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-white/20 p-8 lg:p-10 hover:border-primary/20 transition-all duration-700 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                                    {perms.map((perm) => (
                                        <div
                                            key={perm.code}
                                            className={cn(
                                                "flex items-start gap-4 group/node p-4 rounded-2xl hover:bg-primary/[0.03] transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10",
                                                selectedPerms.has(perm.code) ? "bg-primary/[0.02]" : ""
                                            )}
                                            onClick={() => handleTogglePermission(perm.code)}
                                        >
                                            <div className="pt-0.5">
                                                <Checkbox
                                                    id={perm.code}
                                                    checked={selectedPerms.has(perm.code)}
                                                    onCheckedChange={() => { }} // Controlled by parent div click
                                                    className="size-4.5 rounded-md border-2 border-border/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Label
                                                    htmlFor={perm.code}
                                                    className="text-sm font-medium leading-tight text-foreground/70 group-hover/node:text-primary transition-colors cursor-pointer"
                                                >
                                                    {perm.description}
                                                </Label>
                                                <p className="text-[10px] font-mono text-muted-foreground/30 tracking-tight group-hover/node:text-primary/40 transition-colors">
                                                    {perm.code}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            {/* Portal Action Console (Sticky) */}
            {!rolePermsLoading && selectedRole && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
                    <div className="bg-background/80 backdrop-blur-3xl border border-white/20 shadow-2xl shadow-black/10 rounded-[2rem] p-3 flex items-center justify-between gap-4 group/console">
                        <div className="absolute inset-0 bg-primary/[0.02] rounded-[2rem] pointer-events-none group-hover/console:bg-primary/[0.05] transition-colors" />

                        <div className="flex items-center gap-3 ml-2 relative">
                            <Button
                                onClick={handleSave}
                                disabled={!hasChanges || updateMutation.isPending}
                                className="h-12 rounded-xl px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="mr-2 h-4 w-4 fill-white" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Save Changes</span>
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                disabled={!hasChanges || updateMutation.isPending}
                                className="h-12 rounded-xl px-6 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
                            >
                                <RotateCcw className="mr-2 h-4 w-4 opacity-40" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Reset</span>
                            </Button>
                        </div>

                        <div className="pr-6 relative">
                            {hasChanges ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-medium text-primary">Unsaved Changes</span>
                                        <span className="text-[9px] text-muted-foreground/40 text-right">Commit Required</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-medium text-muted-foreground/40">Synced</span>
                                        <span className="text-[9px] text-muted-foreground/20 text-right">No Changes</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
