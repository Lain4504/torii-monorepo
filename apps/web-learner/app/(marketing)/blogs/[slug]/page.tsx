import { BlogDetailClient } from "@/components/blog/blog-detail-client";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BlogDetailPage({ params }: PageProps) {
    const { slug } = await params;
    return <BlogDetailClient slug={slug} />;
}
