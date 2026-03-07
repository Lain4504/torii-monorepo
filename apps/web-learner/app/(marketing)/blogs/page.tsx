import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { BlogListClient } from "@/components/blog/blog-list-client";

const ArrowRight = ChevronRight;

export default function BlogsPage() {
    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-zinc-50 border-b border-zinc-100 py-3">
                <div className="container mx-auto px-4 lg:px-8">
                    <nav className="flex items-center gap-2 text-sm text-zinc-500">
                        <Link href="/" className="hover:text-[#E63946] transition-colors">
                            Trang chủ
                        </Link>
                        <ArrowRight className="size-4" strokeWidth={2} />
                        <span className="text-zinc-900 font-medium">Tin tức</span>
                    </nav>
                </div>
            </div>

            <BlogListClient />
        </>
    );
}
