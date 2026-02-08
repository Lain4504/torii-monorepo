import { useState } from 'react';
import { useAssignments, usePublishAssignment, useDeleteAssignment } from "@/api/services/assignments";
import { useCourses } from "@/api/services/courses";
import { AssignmentsTable } from "@/components/assignments/assignments-table.tsx";
import { EditAssignmentSheet } from "@/components/assignments/edit-assignment-sheet.tsx";
import { Button } from '@workspace/ui/components/button';
import { FileText, CheckCircle2, Clock, ChevronLeft } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useSelector } from 'react-redux';
import { selectUser } from "@/store/slices/auth-slice";
import { useNavigate } from 'react-router-dom';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select";
import type { AssignmentResponseDTO } from '@workspace/schemas';
import { AssignmentStatus } from '@workspace/schemas';
import { Card } from '@workspace/ui/components/card';

export default function AssignmentsPage() {
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<AssignmentResponseDTO | null>(null);

    // Fetch lecturer's courses for the filter
    const { data: coursesData } = useCourses({
        page: 1,
        limit: 100,
        instructorId: user?.id,
    });

    // Fetch assignments
    const { data: assignmentsData, isLoading } = useAssignments({
        page: 1,
        limit: 20,
        courseId: selectedCourseId === "all" ? undefined : selectedCourseId,
    });

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

    const stats = [
        { 
            label: "Tổng bài tập", 
            value: assignmentsData?.total || 0, 
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        { 
            label: "Đã công bố", 
            value: assignmentsData?.data?.filter(a => a.status === AssignmentStatus.PUBLISHED).length || 0, 
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        { 
            label: "Bản nháp", 
            value: assignmentsData?.data?.filter(a => a.status === AssignmentStatus.DRAFT).length || 0, 
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ];

    return (
        <div className="flex flex-col gap-8 p-4 md:p-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 max-w-2xl text-left">
                    <h1 className="text-3xl md:text-4xl font-sans font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
                        Quản lý <span className="text-primary not-italic">Bài Tập</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        Theo dõi bài nộp, chỉnh sửa nội dung bài tập và chấm điểm tập trung.
                    </p>
                </div>

                {/* Create button removed from here as per request */}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="p-4 rounded-2xl border-border/50 bg-card/40 backdrop-blur-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="size-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{stat.label}</p>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/20 p-2 rounded-2xl border border-border/50">
                <div className="flex items-center gap-2 px-4 whitespace-nowrap">
                   <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Lọc theo:</span>
                </div>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-full sm:w-[300px] rounded-xl border-none bg-background/50 shadow-none focus:ring-0">
                        <SelectValue placeholder="Tất cả khóa học" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/10 bg-card/80 backdrop-blur-xl">
                        <SelectItem value="all">Tất cả khóa học</SelectItem>
                        {coursesData?.data?.map(course => (
                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm overflow-hidden">
                <AssignmentsTable
                    data={assignmentsData?.data || []}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPublish={handlePublish}
                    onViewSubmissions={handleViewSubmissions}
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
