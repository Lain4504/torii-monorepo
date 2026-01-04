import { useState, useEffect } from 'react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
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
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
                <p className="text-muted-foreground mt-2">
                    Manage role permissions and access control
                </p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Role Selector */}
                    <div className="w-80">
                        <Label htmlFor="role-select" className="text-sm font-medium mb-2 block">
                            Select Role
                        </Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger id="role-select">
                                <SelectValue placeholder="Select a role..." />
                            </SelectTrigger>
                            <SelectContent>
                                {roles?.map((role) => (
                                    <SelectItem key={role.code} value={role.code}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{role.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {role.description}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Reseed Button */}
                <Button
                    variant="outline"
                    onClick={() => reseedMutation.mutate()}
                    disabled={reseedMutation.isPending}
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

            {/* Loading State */}
            {rolePermsLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* Permissions Grid */}
            {!rolePermsLoading && permissions && (
                <div className="space-y-6">
                    {Object.entries(permissions.byCategory).map(([category, perms]) => (
                        <Card key={category}>
                            <CardHeader>
                                <CardTitle className="text-lg">{category}</CardTitle>
                                <CardDescription>
                                    {perms.length} permission{perms.length !== 1 ? 's' : ''} available
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {perms.map((perm) => (
                                        <div key={perm.code} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={perm.code}
                                                checked={selectedPerms.has(perm.code)}
                                                onCheckedChange={() => handleTogglePermission(perm.code)}
                                            />
                                            <div className="flex-1">
                                                <Label
                                                    htmlFor={perm.code}
                                                    className="text-sm font-medium leading-none cursor-pointer"
                                                >
                                                    {perm.description}
                                                </Label>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    <code className="bg-muted px-1 py-0.5 rounded">{perm.code}</code>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            {!rolePermsLoading && selectedRole && (
                <div className="flex items-center gap-4 sticky bottom-6 bg-background p-4 border rounded-lg shadow-lg">
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || updateMutation.isPending}
                        className="min-w-32"
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
                        variant="outline"
                        onClick={handleReset}
                        disabled={!hasChanges || updateMutation.isPending}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>

                    {hasChanges && (
                        <span className="text-sm text-muted-foreground">
                            You have unsaved changes
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
