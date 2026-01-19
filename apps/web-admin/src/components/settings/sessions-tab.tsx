import { Card } from '@workspace/ui/components/card';
import { Clock, Monitor, Smartphone, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export function SessionsTab() {
    // TODO: Implement sessions API when available
    const sessions = [
        {
            id: '1',
            device: 'Chrome on Windows',
            location: 'Ho Chi Minh City, Vietnam',
            ip: '123.456.789.0',
            lastActive: new Date(),
            isCurrent: true,
        },
    ];

    return (
        <div className="space-y-6">
            <Card className="border-border/20 bg-card/50 backdrop-blur-sm">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Clock className="size-5 text-primary" />
                                <h3 className="text-lg font-bold text-foreground">
                                    Active Sessions
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground/60">
                                Manage your active login sessions across devices
                            </p>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    Session Management
                                </p>
                                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                    You can sign out of any session if you notice suspicious activity. Your current session is marked below.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sessions List */}
                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="rounded-lg border border-border/20 bg-muted/20 p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                            {session.device.includes('Mobile') ? (
                                                <Smartphone className="size-5" />
                                            ) : (
                                                <Monitor className="size-5" />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {session.device}
                                                    </p>
                                                    {session.isCurrent && (
                                                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                                                    <MapPin className="size-3" />
                                                    {session.location}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
                                                <span>IP: {session.ip}</span>
                                                <span>•</span>
                                                <span>Active now</span>
                                            </div>
                                        </div>
                                    </div>
                                    {!session.isCurrent && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg text-xs"
                                        >
                                            Sign Out
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sign Out All Button */}
                    <div className="pt-2">
                        <Button
                            variant="outline"
                            className="w-full rounded-lg border-rose-500/20 text-rose-600 hover:bg-rose-500/5 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-400"
                        >
                            Sign Out of All Other Sessions
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
