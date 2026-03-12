"use client"

import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar"
import { Switch } from "@workspace/ui/components/switch"
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
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAppSelector, useAppDispatch } from "@/hooks/hooks"
import { logout } from "@/store/slices/authSlice"
import { useLogo } from "@/hooks/useLogo"
export function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated } = useAppSelector(state => state.auth)
    const { theme, setTheme } = useTheme()
    const logo = useLogo()

    const handleLogout = async () => {
        await dispatch(logout())
        router.push('/')
    }

    return (
        <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all">
            <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
                    <Image src={logo} alt="Torii Nihongo" width={64} height={64} className="w-12 h-auto object-contain" />
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-foreground leading-none font-space">TORII</span>
                        <span className="text-[10px] font-bold text-muted-foreground tracking-[0.3em] leading-none mt-1 uppercase">Nihongo</span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-10 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    <Link href="/courses" className="hover:text-primary transition-colors">Khóa học</Link>
                    <Link href="/blogs" className="hover:text-primary transition-colors">Blog</Link>
                    <Link href="/faq" className="hover:text-primary transition-colors">Hỗ trợ</Link>
                </nav>

                <div className="flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-10 w-10 cursor-pointer border-2 border-primary/20 hover:border-primary/50 transition-all shadow-sm">
                                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                                    <AvatarFallback className="bg-primary text-primary-foreground font-black">
                                        {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-border bg-card/90 backdrop-blur-xl">
                                <DropdownMenuLabel className="font-black text-foreground text-base px-2 pt-2">
                                    {user.displayName}
                                </DropdownMenuLabel>
                                <p className="px-2 pb-2 text-xs text-muted-foreground truncate">
                                    {user.email || 'No email'}
                                </p>
                                <DropdownMenuSeparator />
                                <div className="flex items-center justify-between px-2 py-3">
                                    <div className="flex items-center gap-2">
                                        {theme === "dark" ? (
                                            <Moon className="size-4 text-primary" />
                                        ) : (
                                            <Sun className="size-4 text-amber-500" />
                                        )}
                                        <span className="text-sm font-bold">{theme === "dark" ? "Chế độ tối" : "Chế độ sáng"}</span>
                                    </div>
                                    <Switch
                                        checked={theme === "dark"}
                                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                    />
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
                                    <Link href="/dashboard" className="flex items-center gap-3">
                                        <LayoutDashboard className="size-4 text-primary" />
                                        <span className="font-bold">Vào học ngay</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="rounded-xl py-3 cursor-pointer text-destructive focus:bg-destructive/10">
                                    <LogOut className="size-4" />
                                    <span className="font-bold">Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="hidden sm:flex font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-primary" asChild>
                                <Link href="/login">Đăng nhập</Link>
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-full px-8 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95" asChild>
                                <Link href="/register">Đăng ký</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

