import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Loader2, RotateCcw, Fingerprint, Zap, Cpu, Search, CheckCircle2 } from 'lucide-react';
import {
    useFetchPermissions,
    useRolePermissions,
    useRoles,
    useUpdateRolePermissions,
    type PermissionDefinition
} from "@/api/services/permissions.ts";
import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from '@workspace/ui/lib/utils';
import { Card } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';

export function PermissionsPage() {
    const { t } = useTranslation(['admin', 'common']);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const { data: roles, isLoading: rolesLoading } = useRoles();
    const { data: permissions, isLoading: permsLoading } = useFetchPermissions();
    const { data: rolePermissions, isLoading: rolePermsLoading } = useRolePermissions(selectedRole);
    const updateMutation = useUpdateRolePermissions();

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

    const handleSelectAllInCategory = (permCodes: string[]) => {
        const newSet = new Set(selectedPerms);
        const allSelected = permCodes.every(code => newSet.has(code));

        if (allSelected) {
            permCodes.forEach(code => newSet.delete(code));
        } else {
            permCodes.forEach(code => newSet.add(code));
        }
        setSelectedPerms(newSet);
    };

    const hasChanges = rolePermissions
        ? rolePermissions.length !== selectedPerms.size ||
        !rolePermissions.every(p => selectedPerms.has(p))
        : false;

    const filteredByCategory = permissions ? Object.fromEntries(
        Object.entries(permissions.byCategory).map(([category, perms]) => [
            category,
            perms.filter(p =>
                p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        ]).filter(([, perms]) => (perms as PermissionDefinition[]).length > 0)
    ) : {};

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
        <div className="space-y-10 animate-in fade-in duration-700 pb-40 px-0 sm:px-6 max-w-[1400px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('permissions.title', 'Permissions')}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t('permissions.description', 'Manage role-based access control and system permissions.')}
                    </p>
                </div>
            </div>

            {/* Main Action Bar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sticky top-24 z-40">
                <Card className="xl:col-span-4 rounded-3xl bg-background/60 backdrop-blur-2xl border-border/40 p-5 shadow-2xl shadow-black/5 flex flex-col justify-center">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">
                            {t('permissions.currentRole', 'Current Role')}
                        </Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="h-12 px-4 rounded-2xl border-border/30 bg-background/50 hover:bg-background/80 transition-all font-semibold">
                                <SelectValue placeholder={t('permissions.identifyRole', 'Identify Role')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/30 shadow-2xl p-2">
                                {roles?.map((role) => (
                                    <SelectItem key={role.code} value={role.code} className="rounded-xl px-4 py-3 cursor-pointer">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-sm">{role.name}</span>
                                            <span className="text-[10px] text-muted-foreground/50">{role.code}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                <Card className="xl:col-span-8 rounded-3xl bg-card border-border p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                    <div className="relative flex-1">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">
                                {t('permissions.searchLabel', 'Search Permissions')}
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('permissions.searchPlaceholder', 'Filter system access...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-11 h-12 rounded-2xl bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-background transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Permissions Content */}
            {rolePermsLoading ? (
                <div className="grid grid-cols-1 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full bg-muted/10 rounded-[2.5rem]" />
                    ))}
                </div>
            ) : filteredByCategory && (
                <div className="space-y-10">
                    {Object.entries(filteredByCategory).map(([category, perms]) => (
                        <div key={category} className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm shadow-primary/5">
                                        <Cpu className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-foreground capitalize">{category.toLowerCase()}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{(perms as PermissionDefinition[]).length} {t('permissions.modules', 'Modules')}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectAllInCategory((perms as PermissionDefinition[]).map(p => p.code))}
                                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10"
                                >
                                    {t('permissions.selectAll', 'Select All')}
                                </Button>
                            </div>

                            <Card className="rounded-xl bg-card border-border p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(perms as PermissionDefinition[]).map((perm) => (
                                        <div
                                            key={perm.code}
                                            onClick={() => handleTogglePermission(perm.code)}
                                            className={cn(
                                                "flex flex-col justify-between p-4 rounded-lg transition-all duration-200 cursor-pointer border",
                                                selectedPerms.has(perm.code)
                                                    ? "bg-primary/5 border-primary shadow-sm"
                                                    : "bg-background border-border hover:border-primary/50"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={cn(
                                                    "size-6 rounded flex items-center justify-center transition-all",
                                                    selectedPerms.has(perm.code) ? "text-primary" : "text-muted-foreground"
                                                )}>
                                                    {selectedPerms.has(perm.code) ? <CheckCircle2 className="size-4" /> : <Fingerprint className="size-4" />}
                                                </div>
                                                <Checkbox
                                                    checked={selectedPerms.has(perm.code)}
                                                    onCheckedChange={() => { }} // Managed by parent
                                                    className="size-4 rounded border-primary data-[state=checked]:bg-primary"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-sm font-semibold cursor-pointer">
                                                    {perm.description}
                                                </Label>
                                                <p className="text-xs font-mono text-muted-foreground">
                                                    {perm.code}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    ))}

                    {Object.keys(filteredByCategory).length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 rounded-[3rem] border border-dashed border-border/60 bg-muted/5">
                            <div className="size-16 rounded-3xl bg-muted/50 flex items-center justify-center">
                                <Search className="size-8 text-muted-foreground/30" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold">{t('permissions.noPermissions', 'No permissions found')}</h4>
                                <p className="text-sm text-muted-foreground">{t('permissions.adjustQuery', 'Adjust your search query to find specific permission nodes.')}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sticky Action Footer */}
            {!rolePermsLoading && selectedRole && (
                <div className="fixed bottom-6 left-4 right-4 sm:bottom-10 sm:left-6 sm:right-6 lg:left-[calc(var(--sidebar-width)+3rem)] lg:right-12 z-[50] animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-none">
                    <div className="max-w-xl mx-auto pointer-events-auto">
                        <div className="bg-background/90 backdrop-blur-3xl border border-white/20 shadow-2xl shadow-primary/10 rounded-[2.5rem] p-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 ml-3">
                                {hasChanges ? (
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="size-3 rounded-full bg-primary animate-ping absolute inset-0 opacity-40" />
                                            <div className="size-3 rounded-full bg-primary relative" />
                                        </div>
                                        <span className="text-[11px] font-bold text-primary uppercase tracking-widest italic">{t('permissions.unsavedChanges', 'Unsaved Changes')}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="size-2.5 rounded-full bg-muted-foreground/20" />
                                        <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">{t('permissions.synced', 'Configuration Synced')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    disabled={!hasChanges || updateMutation.isPending}
                                    className="h-12 rounded-2xl px-6 font-bold text-[10px] uppercase tracking-wider hover:bg-primary/5 hover:text-primary transition-all disabled:hidden"
                                >
                                    <RotateCcw className="size-3.5 mr-2 opacity-60" />
                                    {t('permissions.reset', 'Reset')}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={!hasChanges || updateMutation.isPending}
                                    className="h-12 rounded-2xl px-10 bg-primary shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all active:scale-95 disabled:opacity-50 font-bold text-[10px] uppercase tracking-widest text-primary-foreground group"
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <>
                                            <Zap className="size-3.5 mr-2 fill-primary-foreground" />
                                            {t('permissions.commitProtocol', 'Commit Protocol')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
