import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import type { ModuleResponseDto } from '@workspace/dtos';

interface ViewModuleDialogProps {
    module: ModuleResponseDto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewModuleDialog({ module, open, onOpenChange }: ViewModuleDialogProps) {
    if (!module) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Module Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <div>
                        <div className="text-sm text-muted-foreground">ID</div>
                        <div className="font-medium">{module.id}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Title</div>
                        <div className="font-medium">{module.title}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Course ID</div>
                        <div className="font-medium">{module.courseId}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Order</div>
                        <div className="font-medium">{module.order}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Duration (minutes)</div>
                        <div className="font-medium">{module.durationMinutes ?? ''}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Description</div>
                        <div className="font-medium">{module.description ?? ''}</div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
