import { Breadcrumb } from '@workspace/ui/components/breadcrumb';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';

interface UsersPageHeaderProps {
    onCreateClick: () => void;
}

export function UsersPageHeader({ onCreateClick }: UsersPageHeaderProps) {
    return (
        <div className="space-y-4">
            <Breadcrumb
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Admin', href: '/' },
                    { label: 'Users' },
                ]}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user accounts and assign access permissions for Torii Nihongo staff and learners.
                    </p>
                </div>
                <Button
                    onClick={onCreateClick}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New User
                </Button>
            </div>
        </div>
    );
}

