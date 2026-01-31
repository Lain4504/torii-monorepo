
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
        <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Tìm kiếm theo tiêu đề, email, ID..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 h-11 w-full bg-background border-border hover:border-border/80 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={type || 'all'} onValueChange={onTypeChange}>
                        <SelectTrigger className="w-full sm:w-[180px] h-11 bg-background border-border hover:border-border/80 rounded-xl focus:ring-primary/20 font-medium">
                            <div className="flex items-center gap-2">
                                <Filter className="size-3.5 opacity-50" />
                                <SelectValue placeholder="Loại hỗ trợ" />
                            </div>
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-xl border-border/60 shadow-xl">
                            <SelectItem value="all">Tất cả loại</SelectItem>
                            <SelectItem value={TicketType.SUPPORT}>Hỗ trợ kỹ thuật</SelectItem>
                            <SelectItem value={TicketType.REFUND}>Hoàn tiền</SelectItem>
                            <SelectItem value={TicketType.ERROR_REPORT}>Báo lỗi</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={status || 'all'} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-full sm:w-[180px] h-11 bg-background border-border hover:border-border/80 rounded-xl focus:ring-primary/20 font-medium">
                            <div className="flex items-center gap-2">
                                <Filter className="size-3.5 opacity-50" />
                                <SelectValue placeholder="Trạng thái" />
                            </div>
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-xl border-border/60 shadow-xl">
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value={TicketStatus.PENDING}>Đang chờ</SelectItem>
                            <SelectItem value={TicketStatus.PROCESSING}>Đang xử lý</SelectItem>
                            <SelectItem value={TicketStatus.APPROVED}>Thành công</SelectItem>
                            <SelectItem value={TicketStatus.REJECTED}>Đã từ chối</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
