import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: '--font-sans',
  subsets: ["latin", "vietnamese"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Torii Nihongo - Chinh phục Tiếng Nhật bài bản & hiệu quả",
  description: "Mô hình Blended Learning thông minh, kết hợp tuyệt vời giữa khóa học quay sẵn (VOD) bài bản và lớp học trực tuyến (Live) tương tác cao. Đỗ JLPT thật dễ dàng cùng Torii Nihongo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={nunitoSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans selection:bg-[#E63946]/20`}
      >
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}

