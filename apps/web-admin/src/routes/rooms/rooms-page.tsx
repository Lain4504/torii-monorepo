import { Box } from 'lucide-react';
import { SystemStasis } from '@/components/layout/system-stasis';

export default function RoomsPage() {
  return (
    <SystemStasis
      title="Quản lý Phòng học"
      description="Quản lý việc phân bổ và sắp xếp lịch học cho các khóa học và sự kiện."
      icon={Box}
      statusText="Sắp ra mắt"
    />
  );
}
