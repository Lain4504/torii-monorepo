import { useAppSelector } from '@/hooks/hooks';
import { Card } from '@workspace/ui/components/card';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ProfileTab() {
    const user = useAppSelector((state) => state.auth.user);

    if (!user) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground/60">No user data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-border/20 bg-card/50 backdrop-blur-sm">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <User className="size-5 text-primary" />
                                <h3 className="text-lg font-bold text-foreground">
                                    Profile Information
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground/60">
                                Your account details and information
                            </p>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-border/20 bg-muted/20 p-4 space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                <User className="size-4" />
                                <p className="text-xs font-medium">Display Name</p>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                {user.displayName || 'Not set'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-border/20 bg-muted/20 p-4 space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                <Mail className="size-4" />
                                <p className="text-xs font-medium">Email</p>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                {user.email}
                            </p>
                        </div>

                        <div className="rounded-lg border border-border/20 bg-muted/20 p-4 space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                <Shield className="size-4" />
                                <p className="text-xs font-medium">Role</p>
                            </div>
                            <p className="text-sm font-medium text-foreground capitalize">
                                {user.role}
                            </p>
                        </div>

                        {user.createdAt && (
                            <div className="rounded-lg border border-border/20 bg-muted/20 p-4 space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground/60">
                                    <Calendar className="size-4" />
                                    <p className="text-xs font-medium">Member Since</p>
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Email Verification Status */}
                    <div className={`rounded-lg border p-4 ${user.verifiedAt
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-amber-500/20 bg-amber-500/5'
                        }`}>
                        <div className="flex gap-3">
                            <Mail className={`size-5 shrink-0 mt-0.5 ${user.verifiedAt
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                                }`} />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    {user.verifiedAt ? 'Email Verified' : 'Email Not Verified'}
                                </p>
                                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                    {user.verifiedAt
                                        ? 'Your email address has been verified.'
                                        : 'Please verify your email address to access all features.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
