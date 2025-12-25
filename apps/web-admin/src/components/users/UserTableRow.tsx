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
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>{user.fullName}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(user.status)}`}>
                    {user.status}
                </span>
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

