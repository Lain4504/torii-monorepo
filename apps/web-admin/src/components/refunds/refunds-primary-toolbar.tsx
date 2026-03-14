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
import { RefundStatus } from '@workspace/schemas';

interface RefundsPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: string | undefined;
    onStatusChange: (value: string) => void;
}

export function RefundsPrimaryToolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
}: RefundsPrimaryToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between w-full">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                    placeholder="Tìm kiếm theo email, ID học viên..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Select value={status || 'all'} onValueChange={onStatusChange}>
                    <SelectTrigger className="h-10 w-full sm:w-[200px] rounded-lg border-border bg-background hover:bg-muted/50 transition-all text-sm">
                        <div className="flex items-center gap-2">
                            <Filter className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Trạng thái hoàn tiền" />
                        </div>
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl border-border/60 shadow-xl bg-background">
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value={RefundStatus.PENDING}>Đang chờ</SelectItem>
                        <SelectItem value={RefundStatus.COMPLETED}>Hoàn tất</SelectItem>
                        <SelectItem value={RefundStatus.REJECTED}>Từ chối</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
