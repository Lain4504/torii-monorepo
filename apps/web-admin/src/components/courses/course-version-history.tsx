import { useCourseVersionHistory } from '@/lib/api/services/courses.ts';
import { formatRelativeTime } from '@/lib/format-utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Package, BookOpen } from 'lucide-react';

interface CourseVersionHistoryProps {
  courseId: string;
}

export function CourseVersionHistory({ courseId }: CourseVersionHistoryProps) {
  const { data: versions, isLoading } = useCourseVersionHistory(courseId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lịch sử phiên bản
          </CardTitle>
          <CardDescription>
            Xem danh sách các phiên bản đã công bố của khóa học
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lịch sử phiên bản
          </CardTitle>
          <CardDescription>
            Xem danh sách các phiên bản đã công bố của khóa học
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Chưa có phiên bản nào được công bố
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Lịch sử phiên bản
        </CardTitle>
        <CardDescription>
          Xem danh sách các phiên bản đã công bố của khóa học
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-mono">
                    {version.versionTag}
                  </Badge>
                  {index === 0 && (
                    <Badge className="bg-green-100 text-green-700 border-green-300">
                      Phiên bản mới nhất
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(version.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{version.totalModules || 0} học phần</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{version.totalLessons || 0} bài học</span>
                </div>
              </div>

              {version.changelog && (
                <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 mt-2">
                  <p className="font-semibold mb-1">Ghi chú:</p>
                  <p>{version.changelog}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
