import { TableCell, TableRow } from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Check, X } from 'lucide-react';
import type { UserResponseDto } from '@workspace/dtos';

interface EditUserRowProps {
    user: UserResponseDto;
    onSave: () => void;
    onCancel: () => void;
    onUpdate: (user: UserResponseDto) => void;
    isUpdating: boolean;
}

export function EditUserRow({
    user,
    onSave,
    onCancel,
    onUpdate,
    isUpdating,
}: EditUserRowProps) {
    return (
        <TableRow>
            <TableCell>
                <Input
                    type="email"
                    value={user.email}
                    onChange={(e) => onUpdate({ ...user, email: e.target.value })}
                    className="w-full"
                />
            </TableCell>
            <TableCell>
                <Input
                    type="text"
                    value={user.fullName}
                    onChange={(e) => onUpdate({ ...user, fullName: e.target.value })}
                    className="w-full"
                />
            </TableCell>
            <TableCell>
                <Select
                    value={user.role}
                    onValueChange={(value) => onUpdate({ ...user, role: value })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="learner">Learner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell>
                <Select
                    value={user.status}
                    onValueChange={(value) => onUpdate({ ...user, status: value })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onSave}
                        disabled={isUpdating}
                    >
                        <Check className="h-4 w-4" />
                        {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                        disabled={isUpdating}
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

