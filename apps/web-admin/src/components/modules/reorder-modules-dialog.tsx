import { useEffect, useState } from 'react';
import {
    DndContext,
    PointerSensor,
    closestCenter,
    type DragEndEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import { useReorderModules } from "@/lib/api/services/modules";
import type { ModuleResponseDTO } from '@workspace/schemas';
import { Spinner } from "@workspace/ui/components/spinner";
import { GripVertical } from 'lucide-react';

interface ReorderModulesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    modules: ModuleResponseDTO[];
}

function SortableModuleItem({ module, index }: { module: ModuleResponseDTO; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: module.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/40 ${isDragging ? 'opacity-80' : ''}`}
        >
            <button
                type="button"
                className="text-muted-foreground cursor-grab active:cursor-grabbing"
                aria-label={`Kéo để đổi vị trí học phần ${module.title}`}
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
            <span className="flex-1 px-2 truncate">{module.title}</span>
        </div>
    );
}

export function ReorderModulesDialog({
    open,
    onOpenChange,
    courseId,
    modules,
}: ReorderModulesDialogProps) {
    const reorderModules = useReorderModules();
    const [showConfirm, setShowConfirm] = useState(false);
    const [orderedModules, setOrderedModules] = useState<ModuleResponseDTO[]>(modules);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
    );

    useEffect(() => {
        if (open) {
            setOrderedModules(modules);
            setShowConfirm(false);
        }
    }, [open, modules]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setOrderedModules((currentModules) => {
            const oldIndex = currentModules.findIndex((module) => module.id === active.id);
            const newIndex = currentModules.findIndex((module) => module.id === over.id);

            if (oldIndex === -1 || newIndex === -1) {
                return currentModules;
            }

            return arrayMove(currentModules, oldIndex, newIndex);
        });
    };

    const handleContinue = () => {
        if (!orderedModules.length) {
            onOpenChange(false);
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        try {
            const moduleOrders = orderedModules.map((m, index) => ({
                id: m.id,
                orderIndex: index + 1,
            }));

            await reorderModules.mutateAsync({ courseId, moduleOrders });
            setShowConfirm(false);
            onOpenChange(false);
        } catch {
            // toast is handled globally if needed
        }
    };

    return (
        <>
            <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Sắp xếp lại thứ tự học phần</DialogTitle>
                        <DialogDescription>
                            Xác nhận lưu lại thứ tự hiện tại của các học phần trong khung chương trình.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3 space-y-2 max-h-[260px] overflow-y-auto text-sm">
                        {orderedModules.length > 0 && (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={orderedModules.map((m) => m.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {orderedModules.map((m, index) => (
                                            <SortableModuleItem key={m.id} module={m} index={index} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                        {orderedModules.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">
                                Chưa có học phần nào để sắp xếp.
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy bỏ
                        </Button>
                        <Button onClick={handleContinue} disabled={!orderedModules.length}>
                            Tiếp tục
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận lưu thứ tự mới?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ cập nhật thứ tự các học phần theo danh sách hiện tại. Thao tác này
                            có thể ảnh hưởng tới trải nghiệm học tập của học viên đang theo học.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={reorderModules.isPending}>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirm();
                            }}
                            disabled={reorderModules.isPending}
                        >
                            {reorderModules.isPending ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Xác nhận cập nhật"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

