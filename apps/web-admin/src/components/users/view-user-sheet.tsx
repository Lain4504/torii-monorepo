import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import type { UserResponseDTO } from '@workspace/schemas';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { format } from 'date-fns';
import { Mail, Shield, Clock, Activity, Fingerprint, ScanEye, Terminal, AlertTriangle, Zap, Lock } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

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
    let statusBadgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    let StatusIcon = Zap;

    if (user.deletedAt) {
        status = 'deleted';
        statusBadgeClass = 'bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_10px_rgba(220,38,38,0.2)]';
        StatusIcon = AlertTriangle;
    } else if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
        status = 'suspended';
        statusBadgeClass = 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
        StatusIcon = Lock;
    } else if (!user.verifiedAt) {
        status = 'inactive';
        statusBadgeClass = 'bg-muted text-muted-foreground border-border/50';
        StatusIcon = Clock;
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[500px] sm:max-w-[500px] flex flex-col p-0 border-l border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl overflow-hidden">
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative flex items-center gap-4 z-10">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                            <ScanEye className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                Identity <span className="text-primary not-italic">Profile</span>
                            </SheetTitle>
                            <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                Comprehensive Entity Analytics
                            </SheetDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] bg-background/50 backdrop-blur border-border/20">
                            ID: {user.id.substring(0, 8)}
                        </Badge>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 h-full">
                    <div className="px-8 py-8 space-y-8">
                        {/* User Profile */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative flex items-center gap-6 p-6 rounded-3xl bg-background/40 backdrop-blur-md border border-white/5 shadow-inner">
                                <Avatar className="h-20 w-20 ring-2 ring-primary/20 shadow-xl rounded-2xl">
                                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black rounded-2xl">
                                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1.5 overflow-hidden">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground truncate">{user.displayName}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        <p className="font-medium text-xs truncate">{user.email}</p>
                                    </div>
                                    <Badge variant="secondary" className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary border-primary/10">
                                        Verified Identity
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Role & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 space-y-3 group hover:bg-muted/10 transition-colors">
                                <div className="flex items-center gap-2 text-muted-foreground/60 group-hover:text-primary/80 transition-colors">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Clearance</span>
                                </div>
                                <div className="pt-1">
                                    <Badge variant="outline" className="w-full justify-center py-1.5 capitalize border-border/20 bg-background/50 text-foreground font-bold text-xs tracking-wide shadow-sm">
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 space-y-3 group hover:bg-muted/10 transition-colors">
                                <div className="flex items-center gap-2 text-muted-foreground/60 group-hover:text-primary/80 transition-colors">
                                    <Activity className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
                                </div>
                                <div className="pt-1">
                                    <Badge className={cn("w-full justify-center py-1.5 capitalize border font-bold text-xs tracking-wide", statusBadgeClass)}>
                                        <StatusIcon className="w-3 h-3 mr-1.5" />
                                        {status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-border/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Temporal Data</span>
                                <div className="h-px flex-1 bg-border/20" />
                            </div>

                            <div className="grid gap-3">
                                {[
                                    { label: 'Initialization', value: user.createdAt, icon: Fingerprint, color: 'text-blue-500' },
                                    { label: 'Last Modification', value: user.updatedAt, icon: Terminal, color: 'text-violet-500' },
                                    user.verifiedAt && { label: 'Verification', value: user.verifiedAt, icon: Shield, color: 'text-emerald-500' },
                                    user.lastLoginAt && { label: 'Last Access', value: user.lastLoginAt, icon: Clock, color: 'text-amber-500' },
                                    user.bannedUntil && new Date(user.bannedUntil) > new Date() && { label: 'Suspension Lift', value: user.bannedUntil, icon: Lock, color: 'text-orange-500' },
                                    user.deletedAt && { label: 'Termination', value: user.deletedAt, icon: AlertTriangle, color: 'text-red-500' }
                                ]
                                    .filter(Boolean)
                                    .map((item: any, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/5 border border-border/5 hover:bg-muted/10 transition-colors group">
                                            <div className={cn("p-2 rounded-xl bg-background shadow-sm border border-border/10", item.color)}>
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 mb-0.5 group-hover:text-foreground/80 transition-colors">
                                                    {item.label}
                                                </p>
                                                <p className="text-xs font-bold font-mono text-foreground truncate">
                                                    {format(new Date(item.value), 'PPpp')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
