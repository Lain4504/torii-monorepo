import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import type { UserResponseDto } from '@workspace/dtos';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';

interface ViewUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResponseDto | null;
}

export function ViewUserDialog({
    open,
    onOpenChange,
    user,
}: ViewUserDialogProps) {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription>
                        View the complete profile of the user.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatarUrl || ''} alt={user.fullName} />
                            <AvatarFallback>{user.fullName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-bold">{user.fullName}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <div>
                                <Badge variant="outline" className="capitalize">
                                    {user.role}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div>
                                <Badge
                                    variant={
                                        user.status === 'active'
                                            ? 'default'
                                            : user.status === 'inactive'
                                                ? 'secondary'
                                                : 'destructive'
                                    }
                                    className="capitalize"
                                >
                                    {user.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <p className="text-sm">{user.phone || '-'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-1">
                            <Label className="text-xs">Created At</Label>
                            <p>{new Date(user.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Updated At</Label>
                            <p>{new Date(user.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
