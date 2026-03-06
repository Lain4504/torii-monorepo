"use client"

import { Button } from "@workspace/ui/components/button"
import { LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946] hover:bg-[#D62828]"

export function Header() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <LayoutDashboard className={`size-8 ${TORII_RED} fill-current`} />
                    <span className="text-xl font-bold tracking-tight">Torii Nihongo</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
                    <Link href="/#ve-torii" className="hover:text-[#E63946] transition-colors">Về Torii</Link>
                    <Link href="/#lo-trinh" className="hover:text-[#E63946] transition-colors">Lộ trình JLPT</Link>
                    <Link href="/#sensei" className="hover:text-[#E63946] transition-colors">Đội ngũ Sensei</Link>
                    <Link href="/#cam-nhan" className="hover:text-[#E63946] transition-colors">Cảm nhận học viên</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="hidden sm:flex font-semibold text-zinc-600 hover:text-[#E63946]" asChild>
                        <Link href="/login">Đăng nhập</Link>
                    </Button>
                    <Button className={`${BG_TORII_RED} text-white font-semibold rounded-full px-6 transition-transform hover:scale-105`} asChild>
                        <Link href="/register">Đăng ký</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
