
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

interface CouponsPrimaryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: string | undefined;
    onStatusChange: (value: string) => void;
}

export function CouponsPrimaryToolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
}: CouponsPrimaryToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between w-full">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm theo mã, tên..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={status || 'all'} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <div className="flex items-center gap-2">
                            <Filter className="size-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </div>
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                        <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                        <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
