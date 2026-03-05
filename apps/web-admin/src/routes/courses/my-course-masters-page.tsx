import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import type { CourseMasterQueryDTO, CourseMasterResponseDTO } from '@workspace/schemas';
import { useCourses, useSubmitCourseForReview } from "@/lib/api/services/courses.ts";
import { CourseMasterPrimaryToolbar } from "@/components/courses/course-master-primary-toolbar.tsx";
import { CourseMasterTable } from "@/components/courses/course-master-table.tsx";
import { CreateCourseMasterSheet } from "@/components/courses/create-course-master-sheet.tsx";
import { EditCourseMasterSheet } from "@/components/courses/edit-course-master-sheet.tsx";
import { CourseMasterAuditLogSheet } from "@/components/courses/course-master-audit-log-sheet.tsx";
import { usePermissions } from "@/hooks/use-permissions.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { toast } from '@workspace/ui/components/sonner';
import { Plus, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";
import { formatNumber } from "@/lib/format-utils";
import { useAppSelector } from "@/hooks/hooks";
import { selectUser } from "@/store/slices/auth-slice";
import { Can } from '@/lib/guard/can';

export default function MyCourseMastersPage() {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { can } = usePermissions();
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

    // Dialog/Sheet States
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseMasterResponseDTO | null>(null);
    const [viewingAuditLogCourse, setViewingAuditLogCourse] = useState<CourseMasterResponseDTO | null>(null);

    const queryParams: CourseMasterQueryDTO = {
        page,
        limit: 10,
        instructorId: user?.id, // Filter by current lecturer
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter as any }),
        ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as any }),
    };

    const { data: coursesData, isLoading, error } = useCourses(queryParams);
    const submitForReviewMutation = useSubmitCourseForReview();

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter, jlptLevelFilter]);

    const courses = coursesData?.data || [];
    const meta = coursesData ? {
        total: coursesData.total,
        totalPages: coursesData.totalPages,
        page: coursesData.page,
        limit: coursesData.limit
    } : null;

    const handleSubmitForReview = async (course: CourseMasterResponseDTO) => {
        try {
            await submitForReviewMutation.mutateAsync(course.id);
            toast.success('Đã gửi yêu cầu kiểm duyệt khung chương trình');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu kiểm duyệt');
        }
    };

    if (error) {
        return (
            <div className="flex h-[450px] items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="size-12 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
                            <ShieldAlert className="size-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Thông báo hệ thống</h3>
                            <p className="text-sm text-muted-foreground">{error.message}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Khung chương trình của tôi"
                subtitle="Quản lý và biên soạn các khóa học mà bạn đang phụ trách biên soạn nội dung."
                stats={[
                    { label: "Syllabus của tôi", value: formatNumber(meta?.total) || 0 }
                ]}
                actions={
                    <Can permission="course.create">
                        <Button onClick={() => setShowCreateSheet(true)} size="lg" className="rounded-xl shadow-lg shadow-primary/20 gap-2 uppercase tracking-widest text-[10px] font-black">
                            <Plus className="size-4" />
                            Biên soạn Syllabus mới
                        </Button>
                    </Can>
                }
            />

            <div className="space-y-4">
                <CourseMasterPrimaryToolbar
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    jlptLevelFilter={jlptLevelFilter}
                    onJlptLevelFilterChange={setJlptLevelFilter}
                />

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <CourseMasterTable
                            data={courses}
                            onEdit={setEditingCourse}
                            onDelete={() => { }} // Lecturer usually can't delete
                            onTitleClick={(course: CourseMasterResponseDTO) => navigate(`/course-master/${course.id}`)}
                            onModules={(course: CourseMasterResponseDTO) => navigate(`/course-master/${course.id}`)}
                            onPublish={() => { }} // Lecturer can't publish directly
                            onReject={() => { }}
                            onViewAuditLog={setViewingAuditLogCourse}
                            onSubmitForReview={handleSubmitForReview}
                            onUnpublish={() => { }}
                            can={can}
                            page={page}
                            limit={queryParams.limit || 10}
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>

                <SmartPagination
                    page={page}
                    totalPages={meta?.totalPages || 0}
                    totalItems={meta?.total || 0}
                    onPageChange={setPage}
                    itemName="khung chương trình"
                />
            </div>

            <CreateCourseMasterSheet
                open={showCreateSheet}
                onOpenChange={setShowCreateSheet}
            />

            <EditCourseMasterSheet
                open={!!editingCourse}
                onOpenChange={(open: boolean) => !open && setEditingCourse(null)}
                course={editingCourse}
            />

            <CourseMasterAuditLogSheet
                courseId={viewingAuditLogCourse?.id || null}
                courseTitle={viewingAuditLogCourse?.title || null}
                onClose={() => setViewingAuditLogCourse(null)}
            />
        </div>
    );
}
