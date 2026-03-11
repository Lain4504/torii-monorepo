import { redirect } from 'next/navigation';

export default function StudySetDetailPage() {
    // Trang chi tiết cũ không còn dùng nữa – chuyển về trang danh sách chính
    redirect('/dashboard/study-sets');
}
