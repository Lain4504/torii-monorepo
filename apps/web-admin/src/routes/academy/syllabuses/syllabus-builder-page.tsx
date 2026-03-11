import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import {
    Plus,
    ChevronRight,
    Video,
    FileText,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Lock,
    Save
} from 'lucide-react';
import { useAcademySyllabus } from '@/lib/api/services/academy-syllabuses';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

export default function SyllabusBuilderPage() {
    const { id } = useParams<{ id: string }>();
    const { data: syllabus, isLoading } = useAcademySyllabus(id);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!syllabus) return <div>Không tìm thấy giáo trình.</div>;

    return (
        <div className="flex flex-col gap-6 h-full">
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        <Link to="/academy/course-profiles" className="hover:underline text-muted-foreground">Course Profiles</Link>
                        <ChevronRight className="size-4" />
                        <span>{syllabus.name || 'Giáo trình'}</span>
                        <Badge variant="outline" className="ml-2 font-mono">{syllabus.versionLabel}</Badge>
                    </div>
                }
                subtitle="Xây dựng lộ trình học tập, tổ chức các module và bài giảng."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Lock className="mr-2 h-4 w-4" />
                            Khóa giáo trình
                        </Button>
                        <Button>
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thay đổi
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Module List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold italic">Cấu trúc Module</h2>
                        <Button size="sm" variant="outline">
                            <Plus className="mr-1 h-3 w-3" />
                            Thêm Module
                        </Button>
                    </div>

                    <ScrollArea className="h-[600px] rounded-md border bg-card p-4">
                        <div className="space-y-4">
                            {syllabus.modules?.map((module, mIdx) => (
                                <Card key={module.id} className="overflow-hidden border-muted">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-6 bg-secondary flex items-center justify-center rounded text-xs font-bold">
                                                {mIdx + 1}
                                            </div>
                                            <span className="font-medium">{module.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{module.lessons?.length || 0} bài học</span>
                                            {expandedModules[module.id] ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                        </div>
                                    </div>

                                    {expandedModules[module.id] && (
                                        <CardContent className="p-0 border-t bg-background/50">
                                            <div className="divide-y divide-muted/50">
                                                {module.lessons?.map((lesson: any) => (
                                                    <div key={lesson.id} className="flex items-center justify-between p-3 pl-12 hover:bg-accent transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            {lesson.type === 'VIDEO' ? <Video className="size-4 text-blue-500" /> : <FileText className="size-4 text-orange-500" />}
                                                            <span className="text-sm">{lesson.title}</span>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <button className="w-full p-3 pl-12 flex items-center gap-2 text-sm text-primary hover:bg-primary/5 transition-colors">
                                                    <Plus className="size-3" />
                                                    Thêm bài học mới
                                                </button>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Properties Pane */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold italic">Chi tiết</h2>
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="text-base">Thông tin chung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground uppercase font-bold">Trạng thái</label>
                                <div>
                                    <Badge variant={syllabus.status === 'LOCKED' ? 'secondary' : 'default'}>
                                        {syllabus.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground uppercase font-bold">Phiên bản</label>
                                <div className="font-mono">{syllabus.versionLabel}</div>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p>Syllabus này đang được sử dụng ở <strong>{syllabus._count?.classes || 0}</strong> lớp học.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
