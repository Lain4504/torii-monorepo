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
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Image src={logo} alt="Torii Nihongo" width={72} height={72} className="w-16 h-auto object-contain" />
                    <span className="text-xl font-bold tracking-tight text-foreground">Torii Nihongo</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-md font-medium text-zinc-600">
                    <Link href="/courses" className="hover:text-primary transition-colors">Khóa học</Link>
                    <Link href="/blogs" className="hover:text-primary transition-colors">Blog</Link>
                    <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
                </nav>

                <div className="flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-medium text-zinc-900">
                                    {user.displayName}
                                </DropdownMenuLabel>
                                <p className="px-1.5 py-1 text-xs text-zinc-500 truncate">
                                    {user.email || 'No email'}
                                </p>
                                <DropdownMenuSeparator />
                                <div className="flex items-center justify-between px-1.5 py-2">
                                    <div className="flex items-center gap-2">
                                        {theme === "dark" ? (
                                            <Moon className="size-4 text-zinc-600" />
                                        ) : (
                                            <Sun className="size-4 text-zinc-600" />
                                        )}
                                        <span className="text-sm font-medium text-zinc-700">{theme === "dark" ? "Dark" : "Light"}</span>
                                    </div>
                                    <Switch
                                        checked={theme === "dark"}
                                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                    />
                                </div>
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
                            <Button variant="ghost" className="hidden sm:flex font-semibold text-zinc-600 hover:text-primary" asChild>
                                <Link href="/login">Đăng nhập</Link>
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-6 transition-transform hover:scale-105" asChild>
                                <Link href="/register">Đăng ký</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
