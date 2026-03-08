import { useState, Suspense } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from "@workspace/ui/components/card";
import { PageHeader } from '@/components/common/page-header';
import { Can } from '@/lib/guard/can';
import { useAdminAchievements } from '@/lib/api/services/gamification';
import { AchievementsTable } from '@/components/gamification/achievements-table';
import { CreateAchievementDialog } from '@/components/gamification/create-achievement-dialog';
import { EditAchievementDialog } from '@/components/gamification/edit-achievement-dialog';
import { DeleteAchievementDialog } from '@/components/gamification/delete-achievement-dialog';
import type { AchievementDTO } from '@workspace/schemas';

export default function AchievementsPage() {
    // Dialog State
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<AchievementDTO | null>(null);

    // Data Fetching
    const { data: achievements = [], isLoading } = useAdminAchievements();

    // Handlers
    const handleCreate = () => {
        setCreateOpen(true);
    };

    const handleEdit = (achievement: AchievementDTO) => {
        setSelectedAchievement(achievement);
        setEditOpen(true);
    };

    const handleDelete = (achievement: AchievementDTO) => {
        setSelectedAchievement(achievement);
        setDeleteOpen(true);
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Quản lý Thành tích (Achievements)"
                subtitle="Thiết lập các mốc thành tích, danh hiệu để gắn bó học viên với nền tảng."
                actions={
                    <Can permission="gamification.manage">
                        <Button
                            onClick={handleCreate}
                            size="lg"
                        >
                            Tạo Thành tích mới
                            <Plus className="mr-2 h-4 w-4" />
                        </Button>
                    </Can>
                }
            />

            <div className="space-y-4">
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <AchievementsTable
                            data={achievements}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs */}
            <Suspense fallback={null}>
                {createOpen && (
                    <CreateAchievementDialog
                        open={createOpen}
                        onOpenChange={setCreateOpen}
                    />
                )}

                {selectedAchievement && (
                    <>
                        <EditAchievementDialog
                            open={editOpen}
                            onOpenChange={setEditOpen}
                            achievement={selectedAchievement}
                        />
                        <DeleteAchievementDialog
                            open={deleteOpen}
                            onOpenChange={setDeleteOpen}
                            achievement={selectedAchievement}
                        />
                    </>
                )}
            </Suspense>
        </div>
    );
}

