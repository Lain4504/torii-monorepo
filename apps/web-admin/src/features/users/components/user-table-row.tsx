import { TableCell, TableRow } from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { UserResponseDto } from '@workspace/dtos';

interface UserTableRowProps {
    user: UserResponseDto;
    onEdit: (user: UserResponseDto) => void;
    onDelete: (id: string) => void;
}

export function UserTableRow({
    user,
    onEdit,
    onDelete,
}: UserTableRowProps) {


    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getStatusDotColor = () => {
        switch (user.status) {
            case 'active':
                return 'bg-green-500';
            case 'inactive':
                return 'bg-gray-400';
            case 'suspended':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusDotColor()}`} />
                    <div>
                        <div className="font-medium">{user.fullName || user.email}</div>
                        {user.role === 'admin' && (
                            <div className="text-xs text-red-600">System Default</div>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
                {user.email || 'No email available'}
            </TableCell>
            <TableCell>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
                {formatDate(user.updatedAt)}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(user)}
                    >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(user.id)}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

