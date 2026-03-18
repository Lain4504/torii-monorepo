import { Copy } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

interface SyllabusSidebarProps {
    syllabuses: any[];
    selectedSyllabus: any;
    onSelectSyllabus: (id: string) => void;
    onClone: () => void;
}

export function SyllabusSidebar({
    syllabuses,
    selectedSyllabus,
    onSelectSyllabus,
    onClone,
}: SyllabusSidebarProps) {
    return (
        <div className="space-y-4 lg:pl-2">
            {/* Danh sách syllabus (theo hồ sơ khóa học) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold italic">Danh sách phiên bản Syllabus</h2>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={!selectedSyllabus}
                        onClick={onClone}
                    >
                        <Copy className="mr-1 h-3 w-3" />
                        Clone giáo trình
                    </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {syllabuses.map((s) => (
                        <Button
                            key={s.id}
                            variant={s.id === selectedSyllabus?.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onSelectSyllabus(s.id)}
                        >
                            <span className="font-mono mr-2">{s.versionLabel}</span>
                            {s.name && <span>{s.name}</span>}
                        </Button>
                    ))}
                </div>
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
                                <Badge variant={selectedSyllabus?.status === 'LOCKED' ? 'secondary' : 'default'}>
                                    {selectedSyllabus?.status || 'DRAFT'}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground uppercase font-bold">Phiên bản</label>
                            <div className="font-mono">{selectedSyllabus?.versionLabel || 'N/A'}</div>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                                Syllabus này đang được sử dụng ở{" "}
                                <strong>{selectedSyllabus?._count?.classes || 0}</strong> lớp học.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
