import { useAiUserSubscriptions } from '@/lib/api/services/ai-subscriptions';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@workspace/ui/components/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Search, UserCircle } from 'lucide-react';
import { SmartPagination } from '@/components/common/smart-pagination';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function UserSubscriptionsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const { data, isLoading } = useAiUserSubscriptions({ page, limit, search });

    const handleSearch = (val: string) => {
        setSearchParams(prev => {
            if (val) prev.set('search', val);
            else prev.delete('search');
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Lịch sử Subscription"
                subtitle="Xem danh sách người dùng đã và đang đăng ký các gói AI."
            />

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo email hoặc mã gói..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-primary" />
                        Đăng ký người dùng
                    </CardTitle>
                    <CardDescription>
                        Danh sách tất cả các đăng ký dịch vụ AI của người dùng trên hệ thống.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Người dùng</TableHead>
                                <TableHead>Gói</TableHead>
                                <TableHead>Bắt đầu</TableHead>
                                <TableHead>Kết thúc</TableHead>
                                <TableHead>Trạng thái</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Đang tải...</TableCell>
                                </TableRow>
                            ) : data?.items?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Không tìm thấy dữ liệu</TableCell>
                                </TableRow>
                            ) : data?.items?.map((sub: any) => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{sub.user?.displayName || 'N/A'}</span>
                                            <span className="text-xs text-muted-foreground">{sub.user?.email || sub.userId}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">{sub.planCode}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(sub.startedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(sub.expiresAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </TableCell>
                                    <TableCell>
                                        {sub.status === 'ACTIVE' ? (
                                            <Badge className="bg-green-500 hover:bg-green-600">Đang hoạt động</Badge>
                                        ) : sub.status === 'EXPIRED' ? (
                                            <Badge variant="secondary">Hết hạn</Badge>
                                        ) : (
                                            <Badge variant="destructive">{sub.status}</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {data && (
                        <div className="mt-4">
                            <SmartPagination
                                page={page}
                                totalPages={data.totalPages}
                                totalItems={data.total}
                                onPageChange={handlePageChange}
                                itemName="đăng ký"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
