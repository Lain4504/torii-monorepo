import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import type { UserResponseDto } from '@workspace/dtos';
import { EditUserRow } from './EditUserRow';
import { UserTableRow } from './UserTableRow';

interface UsersTableProps {
    users: UserResponseDto[];
    editingUser: UserResponseDto | null;
    onEdit: (user: UserResponseDto) => void;
    onDelete: (id: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onUpdateEditingUser: (user: UserResponseDto) => void;
    isUpdating: boolean;
}

export function UsersTable({
    users,
    editingUser,
    onEdit,
    onDelete,
    onSaveEdit,
    onCancelEdit,
    onUpdateEditingUser,
    isUpdating,
}: UsersTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>USER NAME</TableHead>
                        <TableHead>DESCRIPTION</TableHead>
                        <TableHead>ACTIVE USERS</TableHead>
                        <TableHead>LAST MODIFIED</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                No users found
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => {
                            const isEditing = editingUser?.id === user.id;

                            if (isEditing) {
                                return (
                                    <EditUserRow
                                        key={user.id}
                                        user={editingUser}
                                        onSave={onSaveEdit}
                                        onCancel={onCancelEdit}
                                        onUpdate={onUpdateEditingUser}
                                        isUpdating={isUpdating}
                                    />
                                );
                            }

                            return (
                                <UserTableRow
                                    key={user.id}
                                    user={user}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

