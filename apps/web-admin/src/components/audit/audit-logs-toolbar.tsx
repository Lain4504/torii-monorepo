import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Field, FieldLabel } from '@workspace/ui/components/field';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { cn } from '@workspace/ui/lib/utils';
import { ENTITY_MAP } from './audit-log-details-sheet';

interface AuditLogsToolbarProps {
    action: string;
    onActionChange: (value: string) => void;
    entity: string;
    onEntityChange: (value: string) => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
}

export function AuditLogsToolbar({
    action,
    onActionChange,
    entity,
    onEntityChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
}: AuditLogsToolbarProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field>
                <FieldLabel>Hành động</FieldLabel>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm hành động..."
                        value={action}
                        onChange={(e) => onActionChange(e.target.value)}
                        className="pl-10 h-10"
                    />
                </div>
            </Field>
            <Field>
                <FieldLabel>Đối tượng</FieldLabel>
                <Select value={entity || 'all'} onValueChange={(val) => onEntityChange(val === 'all' ? '' : val)}>
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Chọn đối tượng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {Object.entries(ENTITY_MAP).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
            <Field>
                <FieldLabel>Ngày bắt đầu</FieldLabel>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full h-10 justify-start text-left font-normal",
                                !startDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(new Date(startDate), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={startDate ? new Date(startDate) : undefined}
                            onSelect={(date) => onStartDateChange(date ? format(date, "yyyy-MM-dd") : "")}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </Field>
            <Field>
                <FieldLabel>Ngày kết thúc</FieldLabel>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full h-10 justify-start text-left font-normal",
                                !endDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(new Date(endDate), "dd/MM/yyyy") : <span>Chọn ngày</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={endDate ? new Date(endDate) : undefined}
                            onSelect={(date) => onEndDateChange(date ? format(date, "yyyy-MM-dd") : "")}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </Field>
        </div>
    );
}
