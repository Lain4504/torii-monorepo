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

interface FilterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: {
        role?: string;
        status?: string;
    };
    onApply: (filters: { role?: string; status?: string }) => void;
    onReset: () => void;
}

export function FilterDialog({
    open,
    onOpenChange,
    filters,
    onApply,
    onReset,
}: FilterDialogProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleApply = () => {
        onApply(localFilters);
        onOpenChange(false);
    };

    const handleReset = () => {
        setLocalFilters({});
        onReset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Filter Users</DialogTitle>
                    <DialogDescription>
                        Filter users by role and status
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select
                            value={localFilters.role || ''}
                            onValueChange={(value) =>
                                setLocalFilters({ ...localFilters, role: value || undefined })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All roles</SelectItem>
                                <SelectItem value="learner">Learner</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="lecturer">Lecturer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={localFilters.status || ''}
                            onValueChange={(value) =>
                                setLocalFilters({ ...localFilters, status: value || undefined })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

