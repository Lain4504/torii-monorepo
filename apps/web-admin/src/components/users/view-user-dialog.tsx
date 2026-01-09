import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import type { UserResponseDTO } from '@workspace/schemas';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { format } from 'date-fns';

interface ViewUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResponseDTO | null;
}

export function ViewUserDialog({
    open,
    onOpenChange,
    user,
}: ViewUserDialogProps) {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
                <DialogHeader className="px-1">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">User Details</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                        View the complete profile of the user.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 px-1 pb-2">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                {user.displayName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight">{user.displayName}</h3>
                            <p className="text-muted-foreground font-medium">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground/70 font-bold">Role</Label>
                            <div>
                                <Badge variant="outline" className="capitalize border-none bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm rounded-lg">
                                    {user.role}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground/70 font-bold">Status</Label>
                            <div>
                                {(() => {
                                    let status = 'active';
                                    let badgeClass = 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';

                                    if (user.deletedAt) {
                                        status = 'deleted';
                                        badgeClass = 'bg-destructive/10 text-destructive hover:bg-destructive/20';
                                    } else if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
                                        status = 'banned';
                                        badgeClass = 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
                                    } else if (!user.verifiedAt) {
                                        status = 'inactive';
                                        badgeClass = 'bg-muted text-muted-foreground hover:bg-muted/80';
                                    }

                                    return (
                                        <Badge
                                            className={`capitalize border-none px-3 py-1 text-sm rounded-lg shadow-none ${badgeClass}`}
                                        >
                                            {status}
                                        </Badge>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-4">
                        <div className="space-y-1">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground/50 font-bold">Created At</Label>
                            <p className="font-medium text-foreground/80">{format(new Date(user.createdAt), 'PPpp')}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground/50 font-bold">Updated At</Label>
                            <p className="font-medium text-foreground/80">{format(new Date(user.updatedAt), 'PPpp')}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
