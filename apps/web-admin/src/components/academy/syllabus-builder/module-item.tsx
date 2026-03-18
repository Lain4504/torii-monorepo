import { Plus, ChevronDown, ChevronUp, MoreVertical, Video, FileText } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

interface ModuleItemProps {
    module: any;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onEditModule: (module: any) => void;
    onDeleteModule: (module: any) => void;
    onAddLesson: (module: any) => void;
    onEditLesson: (lesson: any) => void;
    onDeleteLesson: (lesson: any) => void;
    onViewLesson: (lesson: any) => void;
}

export function ModuleItem({
    module,
    index,
    isExpanded,
    onToggle,
    onEditModule,
    onDeleteModule,
    onAddLesson,
    onEditLesson,
    onDeleteLesson,
    onViewLesson,
}: ModuleItemProps) {
    return (
        <Card className="overflow-hidden border-muted">
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    <div className="size-6 bg-secondary flex items-center justify-center rounded text-xs font-bold">
                        {index + 1}
                    </div>
                    <span className="font-medium">{module.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{module.lessons?.length || 0} bài học</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditModule(module);
                                }}
                            >
                                Chỉnh sửa Module
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteModule(module);
                                }}
                            >
                                Xóa Module
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        className="p-1 hover:bg-muted rounded"
                    >
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <CardContent className="p-0 border-t bg-background/50">
                    <div className="divide-y divide-muted/50">
                        {module.lessons?.map((lesson: any) => (
                            <div
                                key={lesson.id}
                                className="w-full flex items-center justify-between p-3 pl-12 hover:bg-accent transition-colors text-left cursor-pointer"
                                onClick={() => onViewLesson(lesson)}
                            >
                                <div className="flex items-center gap-3">
                                    {lesson.type === 'VIDEO' ? (
                                        <Video className="size-4 text-blue-500" />
                                    ) : (
                                        <FileText className="size-4 text-orange-500" />
                                    )}
                                    <span className="text-sm">{lesson.title}</span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-8 border-border/60"
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <MoreVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditLesson(lesson);
                                            }}
                                        >
                                            Chỉnh sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteLesson(lesson);
                                            }}
                                        >
                                            Xóa
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                        <button
                            className="w-full p-3 pl-12 flex items-center gap-2 text-sm text-primary hover:bg-primary/5 transition-colors"
                            type="button"
                            onClick={() => onAddLesson(module)}
                        >
                            <Plus className="size-3" />
                            Thêm bài học mới
                        </button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
