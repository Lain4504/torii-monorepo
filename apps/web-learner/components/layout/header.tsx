"use client"

import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { LayoutDashboard, LogOut, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@workspace/ui/lib/utils"
import { useAppSelector, useAppDispatch } from "@/hooks/hooks"
import { logout } from "@/store/slices/authSlice"

const TORII_RED = "text-[#E63946]"
const BG_TORII_RED = "bg-[#E63946] hover:bg-[#D62828]"

export function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated } = useAppSelector(state => state.auth)
    const { theme, setTheme } = useTheme()

    const handleLogout = async () => {
        await dispatch(logout())
        router.push('/')
    }

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
                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                                    <AvatarFallback className="bg-[#E63946] text-white">
                                        {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="font-medium text-zinc-900">
                                    {user.displayName}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="cursor-pointer">
                                    <div className="flex items-center gap-2 w-full">
                                        {theme === "dark" ? (
                                            <>
                                                <Sun className="size-4" />
                                                <span>Light Mode</span>
                                            </>
                                        ) : (
                                            <>
                                                <Moon className="size-4" />
                                                <span>Dark Mode</span>
                                            </>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                                        <LayoutDashboard className="size-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                    <LogOut className="size-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" className="hidden sm:flex font-semibold text-zinc-600 hover:text-[#E63946]" asChild>
                                <Link href="/login">Đăng nhập</Link>
                            </Button>
                            <Button className={`${BG_TORII_RED} text-white font-semibold rounded-full px-6 transition-transform hover:scale-105`} asChild>
                                <Link href="/register">Đăng ký</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
