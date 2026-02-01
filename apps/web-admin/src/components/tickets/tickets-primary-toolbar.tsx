
import {
    Search,
    Filter,
} from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { TicketStatus, TicketType } from '@workspace/schemas';

interface TicketsPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    type: string | undefined;
    onTypeChange: (value: string) => void;
    status: string | undefined;
    onStatusChange: (value: string) => void;
}

export function TicketsPrimaryToolbar({
    search,
    onSearchChange,
    type,
    onTypeChange,
    status,
    onStatusChange,
}: TicketsPrimaryToolbarProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between w-full">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                    placeholder="Tìm kiếm theo tiêu đề, email, ID..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-10 pl-9 rounded-lg border-border bg-background focus-visible:ring-primary/20 transition-all text-sm placeholder:text-muted-foreground/50"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Select value={type || 'all'} onValueChange={onTypeChange}>
                    <SelectTrigger className="h-10 w-full sm:w-[180px] rounded-lg border-border bg-background hover:bg-muted/50 transition-all text-sm">
                        <div className="flex items-center gap-2">
                            <Filter className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Loại hỗ trợ" />
                        </div>
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl border-border/60 shadow-xl bg-background">
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value={TicketType.SUPPORT}>Hỗ trợ kỹ thuật</SelectItem>
                        <SelectItem value={TicketType.REFUND}>Hoàn tiền</SelectItem>
                        <SelectItem value={TicketType.ERROR_REPORT}>Báo lỗi</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={status || 'all'} onValueChange={onStatusChange}>
                    <SelectTrigger className="h-10 w-full sm:w-[180px] rounded-lg border-border bg-background hover:bg-muted/50 transition-all text-sm">
                        <div className="flex items-center gap-2">
                            <Filter className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Trạng thái" />
                        </div>
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl border-border/60 shadow-xl bg-background">
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value={TicketStatus.PENDING}>Đang chờ</SelectItem>
                        <SelectItem value={TicketStatus.PROCESSING}>Đang xử lý</SelectItem>
                        <SelectItem value={TicketStatus.APPROVED}>Thành công</SelectItem>
                        <SelectItem value={TicketStatus.REJECTED}>Đã từ chối</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
