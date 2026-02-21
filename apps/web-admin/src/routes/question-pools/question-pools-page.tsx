import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import type { QuestionPoolQueryDTO, QuestionPoolResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useQuestionPools } from "@/api/services/question-pools.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { Plus } from 'lucide-react';
import { CreateQuestionPoolDialog } from '@/components/question-pools/create-question-pool-dialog.tsx';
import { EditQuestionPoolDialog } from '@/components/question-pools/edit-question-pool-dialog.tsx';
import { DeleteQuestionPoolDialog } from '@/components/question-pools/delete-question-pool-dialog.tsx';
import { PoolsPrimaryToolbar } from '@/components/question-pools/pools-primary-toolbar.tsx';
import { PoolsTable } from '@/components/question-pools/pools-table.tsx';
import { PageHeader } from '@/components/common/page-header';

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
            <div className="flex h-[450px] items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="size-12 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
                            <Plus className="size-6 rotate-45" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Thông báo hệ thống</h3>
                            <p className="text-sm text-muted-foreground">{error.message}</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Thử kết nối lại
                        </Button>
                    </div>
                </div>
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

                <div className="rounded-xl border bg-card overflow-hidden">
                    <PoolsTable
                        data={pools}
                        isLoading={isLoading}
                        page={page}
                        limit={limit}
                        onView={(pool) => navigate(`/question-bank/${pool.id}`)}
                        onEdit={setEditingPool}
                        onDelete={setDeletingPool}
                    />
                </div>

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

