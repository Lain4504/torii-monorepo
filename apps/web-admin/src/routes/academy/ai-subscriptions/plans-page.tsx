import { useState } from 'react';
import { useAiSubscriptionPlans, useUpdateAiSubscriptionPlan } from '@/lib/api/services/ai-subscriptions';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Edit2, Save, X, Activity } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { toast } from 'sonner';

export default function SubscriptionPlansPage() {
    const { data: plans, isLoading } = useAiSubscriptionPlans();
    const updateMutation = useUpdateAiSubscriptionPlan();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>(null);

    const handleEdit = (plan: any) => {
        setEditingId(plan.id);
        setEditData({ ...plan });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData(null);
    };

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                id: editingId!,
                data: {
                    name: editData.name,
                    price: parseFloat(editData.price),
                    isActive: editData.isActive,
                    description: editData.description
                }
            });
            toast.success('Cập nhật gói thành công');
            setEditingId(null);
            setEditData(null);
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
    };

    if (isLoading) return <div>Đang tải...</div>;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Quản lý Gói Subscription"
                subtitle="Chỉnh sửa thông báo, giá và trạng thái của các gói AI Sensei."
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Danh sách gói
                    </CardTitle>
                    <CardDescription>
                        Các gói này được hiển thị trực tiếp cho người dùng tại trang thanh toán.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã Gói</TableHead>
                                <TableHead>Tên Gói</TableHead>
                                <TableHead>Giá (VNĐ)</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans?.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-mono text-xs">{plan.code}</TableCell>
                                    <TableCell>
                                        {editingId === plan.id ? (
                                            <Input
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            />
                                        ) : (
                                            <span className="font-medium">{plan.name}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === plan.id ? (
                                            <Input
                                                type="number"
                                                value={editData.price}
                                                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                                            />
                                        ) : (
                                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {plan.isActive ? (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Hoạt động</Badge>
                                        ) : (
                                            <Badge variant="secondary">Ẩn</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {editingId === plan.id ? (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={handleCancel}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Lưu
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="ghost" onClick={() => handleEdit(plan)}>
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Sửa
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
