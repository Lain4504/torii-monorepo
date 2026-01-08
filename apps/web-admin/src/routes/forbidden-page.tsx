import { Button } from '@workspace/ui/components/button';

export default function ForbiddenPage() {
    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-muted/10 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[80px]" />
                <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[80px]" />
            </div>

            <div className="relative z-10 text-center p-8 max-w-md w-full">
                <div className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl p-10 flex flex-col items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                        <span className="text-4xl font-bold text-destructive">403</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
                        <p className="text-muted-foreground">
                            You don't have permission to access this resource.
                        </p>
                    </div>

                    <Button
                        asChild
                        className="rounded-xl mt-2 w-full shadow-lg shadow-primary/20"
                    >
                        <a href="/">
                            Return to Dashboard
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
