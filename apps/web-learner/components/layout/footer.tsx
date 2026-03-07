"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { LayoutDashboard, Facebook, Youtube } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLogo } from "@/hooks/useLogo"

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946] hover:bg-[#D62828]"

export function Footer() {
    const logo = useLogo()
    
    return (
        <footer className="bg-zinc-900 text-zinc-300 py-16">
            <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Image src={logo} alt="Torii Nihongo" width={120} height={40} className="h-8 w-auto object-contain" />
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Hệ thống nhật ngữ cao cấp, tiên phong trong công tác chuyển đổi số E-learning. Giúp bạn chinh phục tiếng Nhật một cách bài bản nhất!
                    </p>
                </div>

                <div className="space-y-6 lg:ml-auto">
                    <h4 className="text-white font-bold text-lg">Liên kết nhanh</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link href="#" className="hover:text-white transition-colors text-zinc-400">Về chúng tôi</Link></li>
                        <li><Link href="/khoa-hoc" className="hover:text-white transition-colors text-zinc-400">Thư viện VOD JLPT</Link></li>
                        <li><Link href="/khoa-hoc-live" className="hover:text-white transition-colors text-zinc-400">Lịch khai giảng Live</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors text-zinc-400">Tuyển dụng</Link></li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="text-white font-bold text-lg">Liên hệ</h4>
                    <ul className="space-y-3 text-sm text-zinc-400">
                        <li>Hotline: 1900 1234</li>
                        <li>Email: contact@toriinihongo.edu.vn</li>
                        <li>Địa chỉ: 123 Đường Trần Phú, Quận Hải Châu, TP. Đà Nẵng, Việt Nam</li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="text-white font-bold text-lg">Đăng ký nhận bảng tin</h4>
                    <p className="text-sm text-zinc-400">Nhận lịch khai giảng ưu đãi, tài liệu JLPT miễn phí hàng tuần.</p>
                    <div className="flex gap-2">
                        <Input placeholder="Email của bạn..." className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-[#E63946]" />
                        <Button className={`${BG_TORII_RED} text-white`}>Gửi</Button>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 lg:px-8 mt-16 pt-8 border-t border-zinc-800 text-sm text-zinc-500 flex flex-col md:flex-row justify-between items-center gap-4">
                <p>© 2026 Torii Nihongo Platform. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link href="#" className="hover:text-white transition-colors flex items-center gap-2">
                        <Facebook className="size-4" /> Facebook
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors flex items-center gap-2">
                        <Youtube className="size-4" /> YouTube
                    </Link>
                </div>
            </div>
        </footer>
    )
}
