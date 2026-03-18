import { Link } from 'react-router-dom';
import { ChevronRight, Lock, Save } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';

interface SyllabusHeaderProps {
    selectedSyllabus: any;
    onLock: () => void;
    isLockPending: boolean;
}

export function SyllabusHeader({
    selectedSyllabus,
    onLock,
    isLockPending,
}: SyllabusHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link to="/academy/course-profiles" className="hover:underline">Hồ sơ khóa học</Link>
                    <ChevronRight className="size-4" />
                    <span className="text-foreground">{selectedSyllabus?.name || 'Giáo trình'}</span>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {selectedSyllabus?.name || 'Giáo trình'}
                        </h1>
                        {selectedSyllabus && (
                            <Badge variant="secondary" className="font-mono text-sm px-2">
                                {selectedSyllabus.versionLabel}
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground max-w-4xl leading-relaxed">
                        Xây dựng lộ trình học tập, tổ chức các module và bài giảng. Quản lý nhiều phiên bản giáo trình cho cùng một hồ sơ khóa học.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                    variant="outline"
                    disabled={!selectedSyllabus || selectedSyllabus.status === 'LOCKED' || isLockPending}
                    onClick={onLock}
                >
                    <Lock className="mr-2 h-4 w-4" />
                    Khóa chỉnh sửa (Finalize)
                </Button>
                {selectedSyllabus?.status === 'LOCKED' && (
                    <Badge variant="outline" className="border-orange-500 text-orange-500 bg-orange-50">
                        <Lock className="mr-1 size-3" />
                        Chỉ xem (Locked)
                    </Badge>
                )}
                {selectedSyllabus?.status !== 'LOCKED' && (
                    <Badge variant="outline" className="border-green-500 text-green-500 bg-green-50">
                        <Save className="mr-1 size-3" />
                        Có thể chỉnh sửa
                    </Badge>
                )}
            </div>
        </div>
    );
}
