import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

interface SortDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onApply: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function SortDialog({
    open,
    onOpenChange,
    sortBy,
    sortOrder,
    onApply,
}: SortDialogProps) {
    const [localSortBy, setLocalSortBy] = useState(sortBy);
    const [localSortOrder, setLocalSortOrder] = useState<'asc' | 'desc'>(sortOrder);

    const handleApply = () => {
        onApply(localSortBy, localSortOrder);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Sort Users</DialogTitle>
                    <DialogDescription>
                        Choose how to sort the user list
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sort By</label>
                        <Select value={localSortBy} onValueChange={setLocalSortBy}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt">Date Created</SelectItem>
                                <SelectItem value="updatedAt">Last Modified</SelectItem>
                                <SelectItem value="fullName">Name</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="role">Role</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Order</label>
                        <Select value={localSortOrder} onValueChange={(value: 'asc' | 'desc') => setLocalSortOrder(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascending</SelectItem>
                                <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleApply}>Apply Sort</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

