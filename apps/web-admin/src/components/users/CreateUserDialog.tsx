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
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (user: {
        email: string;
        fullName: string;
        password: string;
        phone?: string;
        role?: string;
        status?: string;
    }) => Promise<void>;
    isCreating: boolean;
}

export function CreateUserDialog({
    open,
    onOpenChange,
    onCreate,
    isCreating,
}: CreateUserDialogProps) {
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        phone: '',
        role: 'learner',
        status: 'active',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.fullName || !formData.password) {
            alert('Email, Full Name và Password là bắt buộc');
            return;
        }

        if (formData.password.length < 6) {
            alert('Password phải có ít nhất 6 ký tự');
            return;
        }

        try {
            await onCreate(formData);
            setFormData({
                email: '',
                fullName: '',
                password: '',
                phone: '',
                role: 'learner',
                status: 'active',
            });
            onOpenChange(false);
        } catch (error) {
            // Error handled by parent
        }
    };

    const handleCancel = () => {
        setFormData({
            email: '',
            fullName: '',
            password: '',
            phone: '',
            role: 'learner',
            status: 'active',
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Add a new user to the system. Email, Full Name and Password are required.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email *
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="fullName" className="text-sm font-medium">
                                Full Name *
                            </label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password *
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                Password phải có ít nhất 6 ký tự
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="phone" className="text-sm font-medium">
                                Phone
                            </label>
                            <Input
                                id="phone"
                                type="text"
                                placeholder="+84 123 456 789"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="role" className="text-sm font-medium">
                                Role
                            </label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="learner">Learner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="status" className="text-sm font-medium">
                                Status
                            </label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

