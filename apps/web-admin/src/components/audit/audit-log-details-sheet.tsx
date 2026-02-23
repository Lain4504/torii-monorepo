import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Label } from '@workspace/ui/components/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@workspace/ui/components/sonner';
import { formatDateTime } from '@/lib/format-utils';
import type { AuditLog } from "@/lib/api/services/audit-logs.ts";

export const ENTITY_MAP: Record<string, string> = {
    user: "Người dùng",
    permission: "Quyền hạn",
    course: "Khóa học",
    module: "Chương học",
    lesson: "Bài học",
    ticket: "Yêu cầu hỗ trợ",
    meet_room: "Phòng họp",
    order: "Đơn hàng",
    payment: "Thanh toán",
    review: "Đánh giá",
    coupon: "Mã giảm giá",
    question_pool: "Kho câu hỏi",
    question: "Câu hỏi",
    exam: "Đề thi",
    app_config: "Cấu hình ứng dụng",
    category: "Danh mục",
    enrollment: "Đăng ký học",
};

export const ACTION_MAP: Record<string, string> = {
    CREATE: "Thêm mới",
    UPDATE: "Cập nhật",
    DELETE: "Xóa",
    LOGIN: "Đăng nhập",
    LOGOUT: "Đăng xuất",
    UPLOAD: "Tải lên",
    DOWNLOAD: "Tải về",
    CONFIRM: "Xác nhận",
    CANCEL: "Hủy bỏ",
};

const FIELD_MAP: Record<string, string> = {
    name: "Tên",
    displayName: "Tên hiển thị",
    description: "Mô tả",
    status: "Trạng thái",
    amount: "Số tiền",
    price: "Giá",
    email: "Email",
    role: "Vai trò",
    code: "Mã",
    title: "Tiêu đề",
    content: "Nội dung",
    type: "Loại",
    level: "Cấp độ",
    slug: "Đường dẫn",
    thumbnail: "Ảnh bìa",
};

function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(label ? `Đã sao chép ${label}` : 'Đã sao chép');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7"
        >
            {copied ? <Check className="size-3.5 mr-1.5" /> : <Copy className="size-3.5 mr-1.5" />}
            {copied ? "Đã sao chép" : "Sao chép"}
        </Button>
    );
}

function DiffViewer({ oldValues, newValues }: { oldValues: any; newValues: any }) {
    if (!oldValues && !newValues) return null;

    const oldKeys = oldValues ? Object.keys(oldValues) : [];
    const newKeys = newValues ? Object.keys(newValues) : [];
    const EXCLUDED_FIELDS = ['id', 'createdAt', 'updatedAt', 'deletedAt', 'version', 'userId', 'entityId'];

    const allKeys = Array.from(new Set([...oldKeys, ...newKeys]))
        .filter(key => !EXCLUDED_FIELDS.includes(key));

    const getFieldLabel = (key: string) => FIELD_MAP[key] || key;

    const formatValue = (val: any) => {
        if (val === null) return 'null';
        if (val === undefined) return '-';
        if (typeof val === 'object') return JSON.stringify(val, null, 2);
        return String(val);
    };

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-1/4">Trường</TableHead>
                        <TableHead>Cũ</TableHead>
                        <TableHead>Mới</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allKeys.map((key) => {
                        const oldVal = oldValues?.[key];
                        const newVal = newValues?.[key];
                        const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                        if (!isChanged) return null;

                        return (
                            <TableRow key={key}>
                                <TableCell className="font-medium align-top py-3">
                                    <div className="text-sm">{getFieldLabel(key)}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono">{key}</div>
                                </TableCell>
                                <TableCell className="text-muted-foreground align-top py-3">
                                    <pre className="text-xs whitespace-pre-wrap break-all font-mono">
                                        {formatValue(oldVal)}
                                    </pre>
                                </TableCell>
                                <TableCell className="text-foreground align-top py-3">
                                    <pre className="text-xs whitespace-pre-wrap break-all font-mono font-semibold">
                                        {formatValue(newVal)}
                                    </pre>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

interface AuditLogDetailsSheetProps {
    log: AuditLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailsSheet({ log, open, onOpenChange }: AuditLogDetailsSheetProps) {
    if (!log) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col h-full p-0">
                <SheetHeader className="p-6 border-b shrink-0">
                    <SheetTitle>Chi tiết nhật ký</SheetTitle>
                    <SheetDescription>
                        Bản ghi hoạt động hệ thống lúc {formatDateTime(log.createdAt, 'dd/MM/yyyy HH:mm:ss')}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 p-6">
                        {/* Thông tin cơ bản */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Người thực hiện</Label>
                                <div className="text-sm font-semibold">{log.user?.displayName || 'Hệ thống'}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Vai trò</Label>
                                <div><Badge variant="secondary" className="font-mono text-[10px]">{log.user?.role || 'SYSTEM'}</Badge></div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Hành động</Label>
                                <div className="text-sm">{ACTION_MAP[log.action] || log.action}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Đối tượng</Label>
                                <div className="text-sm">{ENTITY_MAP[log.entity] || log.entity}</div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold">Mô tả hoạt động</Label>
                            <div className="text-sm p-3 bg-muted/50 rounded-md border italic">"{log.description}"</div>
                        </div>

                        {/* Thay đổi dữ liệu */}
                        {(log.oldValues || log.newValues) && (
                            <div className="space-y-3">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                    Dữ liệu thay đổi
                                </Label>
                                <DiffViewer oldValues={log.oldValues} newValues={log.newValues} />
                            </div>
                        )}

                        {/* Metadata thô */}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                        Metadata (JSON)
                                    </Label>
                                    <CopyButton text={JSON.stringify(log.metadata, null, 2)} />
                                </div>
                                <div className="rounded-md border bg-muted/30 overflow-hidden">
                                    <pre className="p-4 text-[11px] font-mono overflow-auto max-h-60 leading-relaxed text-muted-foreground">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t pb-6">
                            <div className="text-[10px] text-muted-foreground font-mono text-center">
                                Trace ID: {log.id}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
