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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <ShieldCheck className="size-3" />
                        Access Logic Controller
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-foreground uppercase italic leading-[0.85]">
                        Access <br />
                        <span className="text-primary not-italic text-3xl sm:text-5xl tracking-[0.1em]">MATRIX CONTROL</span>
                    </h1>
                    <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] italic border-l-2 border-primary/20 pl-6 mt-6">
                        Configure granular authorization protocols and system-wide <br />
                        permission nodes for the <span className="text-foreground">Lain Identity Matrix</span>.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3 px-8 py-6 rounded-[2.5rem] bg-background/40 border border-border/20 backdrop-blur-xl hidden sm:flex">
                    <div className="flex items-center gap-3">
                        <Activity className="size-4 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Security Core Online</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 text-right">Last Sync: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Role & System Actions */}
            <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 p-10 flex flex-col lg:flex-row items-end justify-between gap-10">
                <div className="w-full max-w-md space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 italic flex items-center gap-2 ml-1">
                        <Fingerprint className="size-3.5" />
                        SELECT SUBJECT IDENTITY ROLE
                    </label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="h-16 px-6 rounded-2xl border-border/10 bg-muted/20 hover:bg-muted/30 focus:ring-primary/20 transition-all text-sm font-black uppercase tracking-widest">
                            <SelectValue placeholder="Identification Required..." />
                        </SelectTrigger>
                        <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[2rem] p-2">
                            {roles?.map((role) => (
                                <SelectItem key={role.code} value={role.code} className="rounded-xl px-4 py-4 focus:bg-primary/5 focus:text-primary cursor-pointer group">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-black uppercase tracking-widest group-hover:scale-105 transition-transform origin-left italic">{role.name}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
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
                        className="h-16 rounded-2xl bg-muted/20 hover:bg-primary/5 text-primary border border-border/10 px-8 flex-1 sm:flex-none"
                    >
                        {reseedMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest">RE-SEEDING MATRIX...</span>
                            </>
                        ) : (
                            <>
                                <Database className="mr-2 h-4 w-4 opacity-40" />
                                <span className="text-[10px] font-black uppercase tracking-widest">RE-SEED FROM YAML</span>
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
                            <div className="flex items-center gap-6 mb-8 px-4">
                                <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 group-hover/category:bg-primary group-hover/category:text-white transition-all duration-500">
                                    <Cpu className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black uppercase italic tracking-tight text-foreground/80 group-hover/category:text-primary transition-colors">{category}</h3>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">
                                        Detected Protocol Nodes: 0{perms.length} Unit{perms.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 p-10 lg:p-12 hover:border-primary/20 transition-all duration-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
                                    {perms.map((perm) => (
                                        <div
                                            key={perm.code}
                                            className={cn(
                                                "flex items-start gap-5 group/node p-4 rounded-2xl hover:bg-primary/[0.03] transition-all duration-500 cursor-pointer border border-transparent hover:border-primary/10",
                                                selectedPerms.has(perm.code) ? "bg-primary/[0.02]" : ""
                                            )}
                                            onClick={() => handleTogglePermission(perm.code)}
                                        >
                                            <div className="pt-0.5">
                                                <Checkbox
                                                    id={perm.code}
                                                    checked={selectedPerms.has(perm.code)}
                                                    onCheckedChange={() => { }} // Controlled by parent div click
                                                    className="size-5 rounded-md border-2 border-border/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Label
                                                    htmlFor={perm.code}
                                                    className="text-[13px] font-bold leading-tight text-foreground/70 group-hover/node:text-primary transition-colors cursor-pointer"
                                                >
                                                    {perm.description.toUpperCase()}
                                                </Label>
                                                <p className="text-[9px] font-black font-mono text-muted-foreground/30 tracking-[0.1em] group-hover/node:text-primary/40 transition-colors uppercase italic underline decoration-primary/10 underline-offset-4">
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
                    <div className="bg-background/80 backdrop-blur-3xl border border-border/20 shadow-[0_32px_128px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-4 flex items-center justify-between gap-4 group/console">
                        <div className="absolute inset-0 bg-primary/[0.02] rounded-[2.5rem] pointer-events-none group-hover/console:bg-primary/[0.05] transition-colors" />

                        <div className="flex items-center gap-3 ml-2 relative">
                            <Button
                                onClick={handleSave}
                                disabled={!hasChanges || updateMutation.isPending}
                                className="h-14 rounded-2xl px-12 bg-primary shadow-xl shadow-primary/20 hover:scale-[1.05] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:translate-y-0"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">AUTHORIZING...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="mr-2 h-4 w-4 fill-white" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">COMMIT CHANGES</span>
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                disabled={!hasChanges || updateMutation.isPending}
                                className="h-14 rounded-2xl px-8 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20"
                            >
                                <RotateCcw className="mr-2 h-4 w-4 opacity-40" />
                                <span className="text-[10px] font-black uppercase tracking-widest">RESET LOGIC</span>
                            </Button>
                        </div>

                        <div className="pr-6 relative">
                            {hasChanges ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Unsaved Delta</span>
                                        <span className="text-[8px] font-bold text-muted-foreground/40 text-right">Commit Required</span>
                                    </div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Synced State</span>
                                        <span className="text-[8px] font-bold text-muted-foreground/20 text-right">No Delta Detected</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-border" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
