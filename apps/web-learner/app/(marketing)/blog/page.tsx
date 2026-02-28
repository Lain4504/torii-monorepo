import { Metadata } from 'next';
import { BlogClient } from '@/components/marketing/blog-client';

export const metadata: Metadata = {
  title: 'Blog Kiến Thức Tiếng Nhật | Torii Nihongo',
  description: 'Khám phá các bài viết về ngữ pháp, từ vựng, văn hóa Nhật Bản và bí quyết chinh phục JLPT cùng AI Sensei.',
  keywords: ['blog tiếng nhật', 'học tiếng nhật', 'ngữ pháp tiếng nhật', 'từ vựng tiếng nhật', 'jlpt', 'văn hóa nhật bản'],
  openGraph: {
    title: 'Blog Kiến Thức Tiếng Nhật | Torii Nihongo',
    description: 'Nơi chia sẻ kiến thức và bí quyết học tiếng Nhật hiệu quả nhất.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Torii Nihongo Blog',
      },
    ],
  },
};

export default function BlogListingPage() {
  return <BlogClient />;
}
