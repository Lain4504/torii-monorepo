import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { ModuleItem } from './module-item';

interface ModuleListProps {
    selectedSyllabus: any;
    expandedModules: Record<string, boolean>;
    onToggleModule: (id: string) => void;
    onAddModule: () => void;
    onEditModule: (module: any) => void;
    onDeleteModule: (module: any) => void;
    onAddLesson: (module: any) => void;
    onEditLesson: (lesson: any) => void;
    onDeleteLesson: (lesson: any) => void;
    onViewLesson: (lesson: any) => void;
}

export function ModuleList({
    selectedSyllabus,
    expandedModules,
    onToggleModule,
    onAddModule,
    onEditModule,
    onDeleteModule,
    onAddLesson,
    onEditLesson,
    onDeleteLesson,
    onViewLesson,
}: ModuleListProps) {
    return (
        <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold italic">Cấu trúc Module</h2>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedSyllabus}
                    onClick={onAddModule}
                >
                    <Plus className="mr-1 h-3 w-3" />
                    Thêm Module
                </Button>
            </div>

            <ScrollArea className="h-[600px] rounded-md border bg-card p-4">
                <div className="space-y-4">
                    {selectedSyllabus?.modules?.map((module: any, mIdx: number) => (
                        <ModuleItem
                            key={module.id}
                            module={module}
                            index={mIdx}
                            isExpanded={!!expandedModules[module.id]}
                            onToggle={() => onToggleModule(module.id)}
                            onEditModule={onEditModule}
                            onDeleteModule={onDeleteModule}
                            onAddLesson={onAddLesson}
                            onEditLesson={onEditLesson}
                            onDeleteLesson={onDeleteLesson}
                            onViewLesson={onViewLesson}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
