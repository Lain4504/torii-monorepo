import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import type { UserResponseDTO } from '@workspace/schemas';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { format } from 'date-fns';
import { User, Mail, Shield, Calendar, Clock } from 'lucide-react';

interface ViewUserSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResponseDTO | null;
}

export function ViewUserSheet({
    open,
    onOpenChange,
    user,
}: ViewUserSheetProps) {
    if (!user) return null;

    // Determine user status
    let status = 'active';
    let statusBadgeClass = 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400';

    if (user.deletedAt) {
        status = 'deleted';
        statusBadgeClass = 'bg-destructive/10 text-destructive hover:bg-destructive/20';
    } else if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
        status = 'banned';
        statusBadgeClass = 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
    } else if (!user.verifiedAt) {
        status = 'inactive';
        statusBadgeClass = 'bg-muted text-muted-foreground hover:bg-muted/80';
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[900px] sm:max-w-[900px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/40 shadow-2xl bg-background/95 backdrop-blur-md overflow-hidden">
                <SheetHeader className="px-6 py-6 border-b border-border/40 bg-muted/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-border/60 bg-background/50">
                            {user.id.substring(0, 8)}
                        </Badge>
                        <Badge className={`capitalize border-none px-3 py-1 text-sm rounded-lg shadow-none ${statusBadgeClass}`}>
                            {status}
                        </Badge>
                    </div>
                    <div className="space-y-1.5">
                        <SheetTitle className="text-2xl font-bold leading-tight tracking-tight text-foreground flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            User Details
                        </SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground/80">
                            View the complete profile of the user
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 h-full">
                    <div className="px-6 py-6 space-y-6">
                        {/* User Profile */}
                        <div className="flex items-center gap-6 p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/40 shadow-sm">
                            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
                                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                    {user.displayName?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-2xl font-bold tracking-tight text-foreground">{user.displayName}</h3>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Role & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/40 shadow-sm">
                                <div className="flex items-center gap-2.5 text-muted-foreground mb-3">
                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wide">Role</span>
                                </div>
                                <Badge variant="outline" className="capitalize border-none bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 text-sm rounded-lg font-semibold">
                                    {user.role}
                                </Badge>
                            </div>

                            <div className="p-5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/40 shadow-sm">
                                <div className="flex items-center gap-2.5 text-muted-foreground mb-3">
                                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wide">Status</span>
                                </div>
                                <Badge className={`capitalize border-none px-3 py-1.5 text-sm rounded-lg shadow-none font-semibold ${statusBadgeClass}`}>
                                    {status}
                                </Badge>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="space-y-4 p-5 rounded-xl bg-muted/20 border border-border/40">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Timeline
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Created At</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/30">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium text-foreground/90 text-sm">{format(new Date(user.createdAt), 'PPpp')}</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Updated At</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/30">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium text-foreground/90 text-sm">{format(new Date(user.updatedAt), 'PPpp')}</p>
                                    </div>
                                </div>

                                {user.verifiedAt && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Verified At</Label>
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            <p className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">{format(new Date(user.verifiedAt), 'PPpp')}</p>
                                        </div>
                                    </div>
                                )}

                                {user.lastLoginAt && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Last Sign In</Label>
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/30">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium text-foreground/90 text-sm">{format(new Date(user.lastLoginAt), 'PPpp')}</p>
                                        </div>
                                    </div>
                                )}

                                {user.bannedUntil && new Date(user.bannedUntil) > new Date() && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Banned Until</Label>
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                                            <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            <p className="font-medium text-orange-700 dark:text-orange-300 text-sm">{format(new Date(user.bannedUntil), 'PPpp')}</p>
                                        </div>
                                    </div>
                                )}

                                {user.deletedAt && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Deleted At</Label>
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                                            <Calendar className="h-4 w-4 text-destructive" />
                                            <p className="font-medium text-destructive text-sm">{format(new Date(user.deletedAt), 'PPpp')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
