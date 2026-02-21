import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from '@workspace/ui/components/sonner';
import { selectUser } from "@/store/slices/auth-slice";
import { useAssignments, usePublishAssignment, useDeleteAssignment } from "@/api/services/assignments";
import { useCourses } from "@/api/services/courses";
import { AssignmentsTable } from "@/components/assignments/assignments-table.tsx";
import { EditAssignmentSheet } from "@/components/assignments/edit-assignment-sheet.tsx";

import { PageHeader } from '@/components/common/page-header';
import { SmartPagination } from '@/components/common/smart-pagination';
import { Card } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@workspace/ui/components/select";
import { BookOpen, Search } from 'lucide-react';
import type { AssignmentResponseDTO } from '@workspace/schemas';
import { AssignmentStatus } from '@workspace/schemas';

export default function AssignmentsPage() {
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const [page, setPage] = useState(1);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<AssignmentResponseDTO | null>(null);

    // Fetch lecturer's courses for the filter
    const { data: coursesData } = useCourses({
        page: 1,
        limit: 100,
        instructorId: user?.id,
    });

    // Fetch assignments with pagination
    const { data: assignmentsData, isLoading } = useAssignments({
        page: page,
        limit: 10,
        courseId: selectedCourseId === "all" ? undefined : selectedCourseId,
        ...(debouncedSearch && { search: debouncedSearch })
    });

    useEffect(() => {
        setPage(1);
    }, [selectedCourseId, debouncedSearch]);

    const publishMutation = usePublishAssignment();
    const deleteMutation = useDeleteAssignment();

    const handlePublish = async (assignment: AssignmentResponseDTO) => {
        try {
            await publishMutation.mutateAsync(assignment.id);
            toast.success(`Đã công bố bài tập: ${assignment.title}`);
        } catch (error) {
            toast.error("Công bố thất bại");
        }
    };

    const handleDelete = async (assignment: AssignmentResponseDTO) => {
        if (!confirm(`Bạn có chắc muốn xóa bài tập "${assignment.title}"?`)) return;
        try {
            await deleteMutation.mutateAsync(assignment.id);
            toast.success("Đã xóa bài tập");
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    const handleEdit = (assignment: AssignmentResponseDTO) => {
        setEditingAssignment(assignment);
        setShowEditSheet(true);
    };

    const handleViewSubmissions = (assignment: AssignmentResponseDTO) => {
        navigate(`/assignments/${assignment.id}/submissions`);
    };

    const totalStats = {
        total: assignmentsData?.total || 0,
        published: assignmentsData?.data?.filter(a => a.status === AssignmentStatus.PUBLISHED).length || 0,
        draft: assignmentsData?.data?.filter(a => a.status === AssignmentStatus.DRAFT).length || 0,
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-10">
            <PageHeader
                title={<>Quản lý <span className="text-primary italic">Bài tập</span></>}
                subtitle={<>Hệ sinh thái chương trình giảng dạy <span className="text-primary/60 font-medium font-sans italic tracking-wide">Torii Academy</span></>}
                stats={[
                    { label: "Tổng số bài tập", value: totalStats.total },
                    { label: "Đã công bố", value: totalStats.published },
                    { label: "Bài tập nháp", value: totalStats.draft }
                ]}
            />

            <div className="space-y-4">
                {/* Toolbar */}
                <Card className="bg-card p-4 rounded-xl border-border shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between w-full">
                        {/* Search Input */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                                placeholder="Tìm kiếm bài tập theo tên..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 pl-9 rounded-lg border-border bg-background focus-visible:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground/50"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Select value={selectedCourseId} onValueChange={(val) => { setSelectedCourseId(val); setPage(1); }}>
                                <SelectTrigger className="h-10 w-full lg:w-[350px] rounded-lg border-border bg-background hover:bg-muted/50 transition-all text-sm overflow-hidden">
                                    <div className="flex items-center gap-2 max-w-full overflow-hidden">
                                        <BookOpen className="size-3.5 text-muted-foreground shrink-0" />
                                        <div className="truncate text-left flex-1">
                                            <SelectValue placeholder="Bộ lọc theo khóa học" />
                                        </div>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="border-border rounded-lg shadow-lg bg-background max-w-[400px]">
                                    <SelectItem value="all" className="text-sm">Tất cả khóa học</SelectItem>
                                    {coursesData?.data?.map(course => (
                                        <SelectItem key={course.id} value={course.id} className="text-sm">
                                            <span className="truncate">{course.title}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Content Container */}
                <Card className="bg-card p-0 rounded-xl border-border overflow-hidden shadow-sm">
                    <div className="bg-card/20 backdrop-blur-sm">
                        <AssignmentsTable
                            data={assignmentsData?.data || []}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onPublish={handlePublish}
                            onViewSubmissions={handleViewSubmissions}
                        />
                    </div>
                </Card>

                {/* Pagination */}
                <SmartPagination
                    page={page}
                    totalPages={assignmentsData?.totalPages || 0}
                    totalItems={assignmentsData?.total || 0}
                    onPageChange={setPage}
                    itemName="bài tập"
                />
            </div>

            <EditAssignmentSheet
                open={showEditSheet}
                onOpenChange={setShowEditSheet}
                assignment={editingAssignment}
            />
        </div>
    );
}
