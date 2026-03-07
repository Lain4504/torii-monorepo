import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { BlogListClient } from "@/components/blog/blog-list-client";

const ArrowRight = ChevronRight;

export default function BlogsPage() {
    return (
        <>
            <BlogListClient />
        </>
    );
}
