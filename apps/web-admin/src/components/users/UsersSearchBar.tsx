import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';

interface UsersSearchBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;
}

export function UsersSearchBar({
    search,
    onSearchChange,
    onCreateClick,
}: UsersSearchBarProps) {
    return (
        <div className="flex gap-4 mb-6">
            <Input
                type="text"
                placeholder="Search users by email or name..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />
            <Button onClick={onCreateClick}>
                <Plus className="h-4 w-4" />
                Create User
            </Button>
        </div>
    );
}

