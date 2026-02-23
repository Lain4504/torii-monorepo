import { useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
  Archive,
  Wifi,
} from 'lucide-react';
import {
  useActiveRooms,
  usePastRooms,
  useEndRoom,
  type RoomInfo,
} from '@/lib/api/services/rooms';
import { formatDateTime } from '@/lib/format-utils';
import { toast } from '@workspace/ui/components/sonner';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";
import { ActiveRoomsTable } from '@/components/rooms/active-rooms-table';
import { PastRoomsTable } from '@/components/rooms/past-rooms-table';

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
    } catch {
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
    const creationTime = room.creationTimeMillis || room.creationTime || '0';
    const createdAt = new Date(parseInt(creationTime));
    const now = new Date();
    const isValidDate = !isNaN(createdAt.getTime());
    const durationMs = isValidDate ? now.getTime() - createdAt.getTime() : 0;
    return Math.floor(durationMs / 60000);
  };

  const formatCreatedAt = (room: RoomInfo) => {
    const creationTime = room.creationTimeMillis || room.creationTime || '0';
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

        <TabsContent value="active" className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <ActiveRoomsTable
                data={activeRooms || []}
                isLoading={isLoadingActive}
                onEndRoom={handleEndRoom}
                formatCreatedAt={formatCreatedAt}
                calculateDuration={calculateDuration}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <PastRoomsTable
                data={pastRoomsData?.roomsList || []}
                isLoading={isLoadingPast}
                formatDuration={formatDuration}
                formatFileSize={formatFileSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
