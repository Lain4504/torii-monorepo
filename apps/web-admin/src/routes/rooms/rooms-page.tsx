import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
  Video,
  Download,
  StopCircle,
  Archive,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileVideo,
} from 'lucide-react';
import {
  useActiveRooms,
  usePastRooms,
  useEndRoom,
  type RoomInfo,
  type PastRoomInfo
} from '@/api/services/rooms';
import { formatDateTime } from '@/lib/format-utils';
import { toast } from '@workspace/ui/components/sonner';
import { PageHeader } from '@/components/common/page-header';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';

const ACTIVE_COLS = 8;
const PAST_COLS = 8;

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const { data: activeRooms, isLoading: isLoadingActive } = useActiveRooms();
  const { data: pastRoomsData, isLoading: isLoadingPast } = usePastRooms({ limit: 100 });
  const endRoomMutation = useEndRoom();

  const handleEndRoom = async (roomId: string, roomTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn kết thúc phòng "${roomTitle}"?`)) return;

    try {
      await endRoomMutation.mutateAsync(roomId);
      toast.success('Đã kết thúc phòng học');
    } catch (error) {
      toast.error('Không thể kết thúc phòng học');
    }
  };

  const formatDuration = (seconds: string) => {
    const sec = parseInt(seconds);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} phút`;
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const calculateDuration = (room: RoomInfo) => {
    const creationTime = room.creationTimeMillis || room.creationTime || Date.now().toString();
    const createdAt = new Date(parseInt(creationTime));
    const now = new Date();
    const isValidDate = !isNaN(createdAt.getTime());
    const durationMs = isValidDate ? now.getTime() - createdAt.getTime() : 0;
    return Math.floor(durationMs / 60000);
  };

  const formatCreatedAt = (room: RoomInfo) => {
    const creationTime = room.creationTimeMillis || room.creationTime || Date.now().toString();
    const createdAt = new Date(parseInt(creationTime));
    const isValidDate = !isNaN(createdAt.getTime());
    return isValidDate ? formatDateTime(createdAt, 'HH:mm - dd/MM/yyyy') : 'N/A';
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Quản lý Phòng học Live"
        subtitle="Theo dõi và quản lý tất cả các phòng học trực tuyến"
        stats={[
          {
            label: 'Đang hoạt động',
            value: activeRooms?.length || 0,
          },
          {
            label: 'Tổng số phòng',
            value: pastRoomsData?.totalRooms || 0,
          },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'past')} className="space-y-6">
        <TabsList>
          <TabsTrigger
            value="active"
            className="gap-2"
          >
            <Wifi className="size-4" />
            Đang hoạt động
            {activeRooms && activeRooms.length > 0 && (
              <Badge variant="destructive" className="ml-1 size-5 p-0 flex items-center justify-center rounded-full text-[9px] font-bold">
                {activeRooms.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="gap-2"
          >
            <Archive className="size-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Active Rooms Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tên phòng</TableHead>
                  <TableHead>Thời gian bắt đầu</TableHead>
                  <TableHead>Đã chạy</TableHead>
                  <TableHead>Số người tối đa</TableHead>
                  <TableHead>Ghi hình</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingActive ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : activeRooms?.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={ACTIVE_COLS} className="h-[400px] text-center">
                      <Empty>
                        <EmptyMedia>
                          <WifiOff className="size-8 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyContent>
                          <EmptyTitle>Không có phòng hoạt động</EmptyTitle>
                          <EmptyDescription>
                            Các phòng học live sẽ xuất hiện ở đây khi có buổi học đang diễn ra.
                          </EmptyDescription>
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  activeRooms?.map((room, idx) => (
                    <TableRow key={room.roomId} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          <Badge variant="destructive" className="text-[9px] font-black uppercase tracking-widest">
                            Live Now
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{room.roomTitle}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">Mã: {room.roomId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatCreatedAt(room)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{calculateDuration(room)} phút</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{room.maxParticipants} người</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.allowRecording ? 'default' : 'outline'} className="text-[9px] font-black uppercase tracking-widest">
                          {room.allowRecording ? 'Đang ghi' : 'Không ghi'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEndRoom(room.roomId, room.roomTitle)}
                        >
                          <StopCircle className="size-3" />
                          Kết thúc
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Past Rooms Tab */}
        <TabsContent value="past" className="space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Tên phòng</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Người tham gia</TableHead>
                  <TableHead>Recordings</TableHead>
                  <TableHead>Analytics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPast ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    </TableRow>
                  ))
                ) : pastRoomsData?.roomsList?.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={PAST_COLS} className="h-[400px] text-center">
                      <Empty>
                        <EmptyMedia>
                          <Archive className="size-8 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyContent>
                          <EmptyTitle>Chưa có lịch sử phòng học</EmptyTitle>
                          <EmptyDescription>
                            Lịch sử các buổi học đã kết thúc sẽ được lưu trữ tại đây.
                          </EmptyDescription>
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  pastRoomsData?.roomsList?.map((room, idx) => (
                    <PastRoomRow key={room.sid} room={room} idx={idx} formatDuration={formatDuration} formatFileSize={formatFileSize} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Past Room Row Component with expandable details
function PastRoomRow({ room, idx, formatDuration, formatFileSize }: {
  room: PastRoomInfo;
  idx: number;
  formatDuration: (s: string) => string;
  formatFileSize: (b: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const startTime = new Date(parseInt(room.roomCreationTime || '0'));
  const isValidDate = !isNaN(startTime.getTime());

  return (
    <>
      <TableRow className="border-b border-border/50 hover:bg-muted/30 transition-colors">
        <TableCell className="font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="size-8 rounded-lg"
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </TableCell>
        <TableCell>
          <div>
            <p className="font-semibold text-sm">{room.roomTitle}</p>
            <p className="text-[10px] text-muted-foreground font-mono">Mã: {room.roomId}</p>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm">{isValidDate ? formatDateTime(startTime, 'dd/MM/yyyy HH:mm') : 'N/A'}</span>
        </TableCell>
        <TableCell>
          <span className="text-sm font-medium">{formatDuration(room.roomDuration)}</span>
        </TableCell>
        <TableCell>
          <span className="text-sm">{room.participants} người</span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <FileVideo className="size-3.5 text-primary" />
            <span className="text-sm font-medium">{room.recordingFiles?.length || 0}</span>
          </div>
        </TableCell>
        <TableCell>
          {room.analyticsFileId ? (
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
              <BarChart3 className="size-3 mr-1" />
              Có
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Không có</span>
          )}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/10 hover:bg-muted/10 border-border/20">
          <TableCell colSpan={8} className="p-6">
            <div className="space-y-4">
              {room.analyticsFileId && (
                <div className="p-4 rounded-xl bg-background border border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Báo cáo phân tích</p>
                        <p className="text-[10px] text-muted-foreground font-mono">Mã: {room.analyticsFileId}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg text-[10px] font-bold uppercase">
                      <Download className="size-3 mr-1.5" />
                      Tải xuống
                    </Button>
                  </div>
                </div>
              )}

              {room.recordingFiles && room.recordingFiles.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Recordings ({room.recordingFiles.length})
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {room.recordingFiles.map((file, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-background border border-border/20 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Video className="size-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate">{file.fileName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatFileSize(file.fileSize)} • {file.recordingType}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-lg text-[10px] font-bold uppercase shrink-0">
                          <Download className="size-3 mr-1.5" />
                          Tải
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
