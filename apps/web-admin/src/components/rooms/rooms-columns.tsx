import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { StopCircle, ChevronDown, ChevronUp, FileVideo, BarChart3 } from "lucide-react";
import { formatDateTime } from "@/lib/format-utils";
import { type RoomInfo, type PastRoomInfo } from "@/lib/api/services/rooms";

// --- Active Rooms Columns ---

interface ActiveRoomsColumnsProps {
    onEndRoom: (roomId: string, roomTitle: string) => void;
    formatCreatedAt: (room: RoomInfo) => string;
    calculateDuration: (room: RoomInfo) => number;
}

export const getActiveRoomsColumns = ({
    onEndRoom,
    formatCreatedAt,
    calculateDuration,
}: ActiveRoomsColumnsProps): ColumnDef<RoomInfo>[] => [
        {
            header: "#",
            cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.index + 1}</span>,
            size: 50,
        },
        {
            header: "Trạng thái",
            cell: () => (
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <Badge variant="destructive" className="text-[9px] font-black uppercase tracking-widest">
                        Live Now
                    </Badge>
                </div>
            ),
        },
        {
            header: "Tên phòng",
            cell: ({ row }) => (
                <div className="space-y-1">
                    <p className="font-semibold text-sm">{row.original.roomTitle}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Mã: {row.original.roomId}</p>
                </div>
            ),
        },
        {
            header: "Thời gian bắt đầu",
            cell: ({ row }) => <span className="text-sm">{formatCreatedAt(row.original)}</span>,
        },
        {
            header: "Đã chạy",
            cell: ({ row }) => <span className="text-sm font-medium">{calculateDuration(row.original)} phút</span>,
        },
        {
            header: "Số người tối đa",
            cell: ({ row }) => <span className="text-sm">{row.original.maxParticipants} người</span>,
        },
        {
            header: "Ghi hình",
            cell: ({ row }) => (
                <Badge variant={row.original.allowRecording ? 'default' : 'outline'} className="text-[9px] font-black uppercase tracking-widest">
                    {row.original.allowRecording ? 'Đang ghi' : 'Không ghi'}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">Thao tác</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onEndRoom(row.original.roomId, row.original.roomTitle)}
                    >
                        <StopCircle className="size-3" />
                        Kết thúc
                    </Button>
                </div>
            ),
        },
    ];

// --- Past Rooms Columns ---

interface PastRoomsColumnsProps {
    onToggleExpand: (rowId: string) => void;
    isExpanded: (rowId: string) => boolean;
    formatDuration: (seconds: string) => string;
}

export const getPastRoomsColumns = ({
    onToggleExpand,
    isExpanded,
    formatDuration,
}: PastRoomsColumnsProps): ColumnDef<PastRoomInfo>[] => [
        {
            id: "expander",
            header: () => null,
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleExpand(row.id)}
                    className="size-8 rounded-lg"
                >
                    {isExpanded(row.id) ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </Button>
            ),
            size: 50,
        },
        {
            header: "#",
            cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.index + 1}</span>,
            size: 50,
        },
        {
            header: "Tên phòng",
            cell: ({ row }) => (
                <div>
                    <p className="font-semibold text-sm">{row.original.roomTitle}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Mã: {row.original.roomId}</p>
                </div>
            ),
        },
        {
            header: "Ngày",
            cell: ({ row }) => {
                const startTime = new Date(parseInt(row.original.roomCreationTime || '0'));
                return <span className="text-sm">{!isNaN(startTime.getTime()) ? formatDateTime(startTime, 'dd/MM/yyyy HH:mm') : 'N/A'}</span>;
            },
        },
        {
            header: "Thời lượng",
            cell: ({ row }) => <span className="text-sm font-medium">{formatDuration(row.original.roomDuration)}</span>,
        },
        {
            header: "Người tham gia",
            cell: ({ row }) => <span className="text-sm">{row.original.participants} người</span>,
        },
        {
            header: "Recordings",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <FileVideo className="size-3.5 text-primary" />
                    <span className="text-sm font-medium">{row.original.recordingFiles?.length || 0}</span>
                </div>
            ),
        },
        {
            header: "Analytics",
            cell: ({ row }) => row.original.analyticsFileId ? (
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                    <BarChart3 className="size-3 mr-1" />
                    Có
                </Badge>
            ) : (
                <span className="text-xs text-muted-foreground">Không có</span>
            ),
        },
    ];
