import { useState } from 'react';
import { useCourses } from "@/lib/api/services/courses.ts";
import { CourseMasterTable } from "@/components/courses/course-master-table.tsx";
import { CourseMasterPrimaryToolbar } from "@/components/courses/course-master-primary-toolbar.tsx";
import { usePermissions } from "@/hooks/use-permissions.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@workspace/ui/components/pagination';
import { cn } from '@workspace/ui/lib/utils';
import { toast } from '@workspace/ui/components/sonner';
import { useSubmitCourseForReview } from "@/lib/api/services/courses.ts";
import { Can } from "@/lib/guard/can";
import { Button } from '@workspace/ui/components/button';
import { CreateCourseMasterSheet } from "@/components/courses/create-course-master-sheet.tsx";
import { Plus } from 'lucide-react';
import type { CourseMasterResponseDTO } from '@workspace/schemas';
import { CourseMasterAuditLogSheet } from '@/components/courses/course-master-audit-log-sheet';
import { RejectCourseMasterDialog } from '@/components/courses/reject-course-master-dialog';

import { useNavigate } from 'react-router-dom';
import { EditCourseMasterSheet } from "@/components/courses/edit-course-master-sheet.tsx";
import { PublishCourseMasterDialog } from "@/components/courses/publish-course-master-dialog.tsx";

import { useSelector } from 'react-redux';
import { selectUser } from "@/store/slices/auth-slice";

export default function MyCoursesPage() {
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { can } = usePermissions();
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseMasterResponseDTO | null>(null);
    const [viewingAuditLogCourse, setViewingAuditLogCourse] = useState<CourseMasterResponseDTO | null>(null);
    const [rejectingCourse, setRejectingCourse] = useState<CourseMasterResponseDTO | null>(null);
    const [publishingCourse, setPublishingCourse] = useState<CourseMasterResponseDTO | null>(null);

    const submitForReviewMutation = useSubmitCourseForReview();

    // Fetch courses with fixed instructor filter if role is lecturer
    // (The gateway already forces this for security, but we make it explicit here for clarity)
    const { data, isLoading } = useCourses({
        page,
        limit: 10,
        search: debouncedSearch,
        status: undefined, // Let user filter or show all
        instructorId: user?.id,
    });

    const handleSubmitForReview = async (course: CourseMasterResponseDTO) => {
        try {
            await submitForReviewMutation.mutateAsync(course.id);
            toast.success('Đã gửi yêu cầu kiểm duyệt', {
                description: `Khung chương trình "${course.title}" đang chờ quản trị viên phê duyệt.`,
            });
        } catch (error) {
            toast.error('Gửi yêu cầu thất bại');
        }
    };

    const totalPages = data?.totalPages || 1;

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 pb-20">
            <div className="space-y-4 max-w-2xl text-left">
                <h1 className="text-3xl md:text-4xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                    Khung chương trình <span className="text-primary not-italic">Của Tôi</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                    Quản lý các khung chương trình bạn đang phụ trách xây dựng.
                </p>
            </div>

            <div className="flex justify-between items-end gap-4">
                <CourseMasterPrimaryToolbar
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={""}
                    onStatusFilterChange={() => { }}
                    jlptLevelFilter={""}
                    onJlptLevelFilterChange={() => { }}
                />

                {/* 
                    Business Rule: Only admin and staff-lms can create courses
                    Lecturers can only manage courses assigned to them by admin/staff
                    This button is hidden for lecturers who don't have course.create permission
                */}
                <Can permission="course.create">
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 hover:shadow-md transition-all whitespace-nowrap"
                    >
                        Tạo Khung chương trình Mới
                        <Plus className="ml-2 size-4" />
                    </Button>
                </Can>
            </div>

            <CourseMasterTable
                data={data?.data || []}
                onEdit={setSelectedCourse}
                onDelete={() => { }}
                onModules={(course: CourseMasterResponseDTO) => navigate(`/course-master/${course.id}`)}
                onPublish={setPublishingCourse}
                onReject={setRejectingCourse}
                onViewAuditLog={setViewingAuditLogCourse}
                onSubmitForReview={handleSubmitForReview}
                onUnpublish={() => { }}
                onTitleClick={(course: CourseMasterResponseDTO) => navigate(`/course-master/${course.id}`)}
                can={can}
                page={page}
                limit={10}
                isLoading={isLoading}
            />

            {totalPages > 1 && (
                <div className="flex items-center justify-between py-4">
                    <p className="text-xs text-muted-foreground">Trang {page} / {totalPages}</p>
                    <Pagination className="w-auto mx-0">
                        <PaginationContent className="flex items-center gap-1">
                            <PaginationItem>
                                <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} className={cn("cursor-pointer", page === 1 && "opacity-50 pointer-events-none")} />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={cn("cursor-pointer", page === totalPages && "opacity-50 pointer-events-none")} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <CreateCourseMasterSheet
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <EditCourseMasterSheet
                course={selectedCourse}
                open={!!selectedCourse}
                onOpenChange={(open: boolean) => !open && setSelectedCourse(null)}
            />

            <PublishCourseMasterDialog
                open={!!publishingCourse}
                onOpenChange={(open: boolean) => !open && setPublishingCourse(null)}
                course={publishingCourse}
            />

            <CourseMasterAuditLogSheet
                courseId={viewingAuditLogCourse?.id || null}
                courseTitle={viewingAuditLogCourse?.title || null}
                onClose={() => setViewingAuditLogCourse(null)}
            />


            <RejectCourseMasterDialog
                open={!!rejectingCourse}
                onOpenChange={(open: boolean) => !open && setRejectingCourse(null)}
                course={rejectingCourse}
            />
        </div>
    );
}
