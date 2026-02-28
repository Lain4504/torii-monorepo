import { Metadata } from 'next';
import { CoursesClient } from '@/components/marketing/courses-client';

export const metadata: Metadata = {
    title: 'Danh Sách Khóa Học Tiếng Nhật | Torii Nihongo',
    description: 'Khám phá hàng trăm khóa học tiếng Nhật từ sơ cấp đến cao cấp (N5 - N1), luyện thi JLPT và tiếng Nhật thương mại cùng đội ngũ giảng viên chuyên nghiệp.',
    keywords: ['khóa học tiếng nhật', 'luyện thi jlpt', 'học tiếng nhật online', 'tiếng nhật sơ cấp', 'tiếng nhật trung cấp', 'tiếng nhật cao cấp'],
    openGraph: {
        title: 'Danh Sách Khóa Học Tiếng Nhật | Torii Nihongo',
        description: 'Nâng tầm trình độ tiếng Nhật của bạn với các lộ trình học tập bài bản và hiện đại.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop',
                width: 1200,
                height: 630,
                alt: 'Torii Nihongo Courses',
            },
        ],
    },
};

export default function CourseCatalogPage() {
    return <CoursesClient />;
}
