import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import type { QuestionPoolQueryDTO, QuestionPoolResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useQuestionPools } from "@/lib/api/services/question-pools.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { Plus, TriangleAlert } from 'lucide-react';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { CreateQuestionPoolDialog } from '@/components/question-pools/create-question-pool-sheet.tsx';
import { EditQuestionPoolDialog } from '@/components/question-pools/edit-question-pool-sheet.tsx';
import { DeleteQuestionPoolDialog } from '@/components/question-pools/delete-question-pool-dialog.tsx';
import { PoolsPrimaryToolbar } from '@/components/question-pools/pools-primary-toolbar.tsx';
import { PoolsTable } from '@/components/question-pools/pools-table.tsx';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";

export default function QuestionPoolsPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingPool, setEditingPool] = useState<QuestionPoolResponseDTO | null>(null);
    const [deletingPool, setDeletingPool] = useState<QuestionPoolResponseDTO | null>(null);

    const limit = 10;
    const queryParams: QuestionPoolQueryDTO = {
        page,
        limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as any }),
    };

    const { data: poolsData, isLoading, error } = useQuestionPools(queryParams);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, jlptLevelFilter]);

    const pools = poolsData?.data || [];
    const meta = poolsData ? {
        total: poolsData.total,
        totalPages: poolsData.totalPages,
        page: poolsData.page,
        limit: poolsData.limit
    } : null;

    if (error) {
        return (
            <div className="rounded-xl border bg-card">
                <Empty>
                    <EmptyMedia className="bg-destructive/10 text-destructive">
                        <TriangleAlert className="size-6" />
                    </EmptyMedia>
                    <EmptyContent>
                        <EmptyTitle>Có lỗi xảy ra</EmptyTitle>
                        <EmptyDescription>{error.message}</EmptyDescription>
                    </EmptyContent>
                    <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                        Thử lại
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Ngân hàng Câu hỏi"
                subtitle="Hệ thống quản lý và tổ chức kho dữ liệu câu hỏi tri thức"
                stats={[
                    { label: "Tổng số kho đề", value: meta?.total?.toLocaleString() || 0 }
                ]}
                actions={
                    <Can permission="question_pool.create">
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            size="lg"
                        >
                            Tạo Kho đề mới
                            <Plus />
                        </Button>
                    </Can>
                }
            />

            <div className="space-y-4">
                <PoolsPrimaryToolbar
                    search={search}
                    onSearchChange={setSearch}
                    jlptLevelFilter={jlptLevelFilter}
                    onJlptLevelFilterChange={setJlptLevelFilter}
                />

                <Card className="overflow-hidden">
                <CardContent className="p-0">

                                    <PoolsTable
                                        data={pools}
                                        isLoading={isLoading}
                                        page={page}
                                        limit={limit}
                                        onView={(pool) => navigate(`/question-bank/${pool.id}`)}
                                        onEdit={setEditingPool}
                                        onDelete={setDeletingPool}
                                    />
                                
                </CardContent>
                </Card>

                <SmartPagination
                    page={page}
                    totalPages={meta?.totalPages || 0}
                    totalItems={meta?.total || 0}
                    onPageChange={setPage}
                    itemName="kho đề"
                />
            </div>

            <CreateQuestionPoolDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <EditQuestionPoolDialog
                open={!!editingPool}
                onOpenChange={(open) => !open && setEditingPool(null)}
                pool={editingPool}
            />

            <DeleteQuestionPoolDialog
                open={!!deletingPool}
                onOpenChange={(open) => !open && setDeletingPool(null)}
                pool={deletingPool}
            />
        </div>
    );
}

