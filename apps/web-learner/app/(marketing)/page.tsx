import { Metadata } from "next"
import Home2Client from "@/components/marketing/home2-client"

export const metadata: Metadata = {
    title: "Torii Nihongo - Học tiếng Nhật với AI Sensei",
    description: "Nền tảng học tiếng Nhật hiện đại với các bài học tương tác, WebRTC thời gian thực và trợ lý AI Sensei cá nhân hóa.",
    keywords: ["học tiếng Nhật", "JLPT", "tiếng Nhật thương mại", "AI Sensei", "học trực tuyến", "Torii Nihongo"],
    openGraph: {
        title: "Torii Nihongo - Chinh phục tiếng Nhật thật dễ dàng",
        description: "Học tiếng Nhật mọi lúc mọi nơi với công nghệ AI hàng đầu và giảng viên bản ngữ chất lượng.",
        type: "website",
        locale: "vi_VN",
        siteName: "Torii Nihongo",
    }
}

export default function HomePage() {
    return <Home2Client />
}
