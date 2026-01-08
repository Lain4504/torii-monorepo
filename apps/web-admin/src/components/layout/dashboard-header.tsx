import React from "react"
import { useLocation, Link } from "react-router-dom"
import { Bell } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"

import { ModeToggle } from "@/components/layout/mode-toggle.tsx"
import { CommandMenu } from "@/components/layout/command-menu.tsx"
import { useAppSelector, useAppDispatch } from "@/hooks/hooks.ts"
import { selectUser, logout } from "@/store/slices/auth-slice.ts"
import { toast } from "@workspace/ui/components/sonner"
import { useNavigate } from "react-router-dom"

export function DashboardHeader() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success('Logged out successfully')
      navigate('/login', { replace: true })
    } catch (error) {
      // Even if logout fails, clear local state and redirect
      toast.error('Failed to logout properly, but you have been signed out locally')
      navigate('/login', { replace: true })
    }
  }

  // Simple Breadcrumb logic
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'staff': return 'default'
      case 'lecturer': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="flex w-full items-center gap-4">
      {/* Breadcrumbs - Clean & Minimal */}
      <div className="hidden md:flex items-center text-sm px-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && <BreadcrumbSeparator className="opacity-40" />}
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1
              const href = `/${pathSegments.slice(0, index + 1).join('/')}`
              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="capitalize font-medium text-foreground">{segment.replace('-', ' ')}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={href} className="capitalize text-muted-foreground hover:text-foreground transition-colors">{segment.replace('-', ' ')}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="opacity-40" />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <CommandMenu />

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl">
          <Bell className="size-5" />
          <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full ring-2 ring-background"></span>
        </Button>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/10 transition-all p-0 overflow-hidden">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || ''} />
                <AvatarFallback className="bg-muted hover:bg-muted/80 transition-colors">{user?.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 border-none shadow-xl bg-background/90 backdrop-blur-xl p-2 rounded-2xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user?.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <div className="mt-2">
                  <Badge variant={getRoleBadgeVariant(user?.role || null)} className="text-[10px] px-2 py-0.5 rounded-full capitalize">
                    {user?.role || 'USER'}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-muted/50" />
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link to="/settings/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-muted/50" />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-500 focus:bg-rose-500/10 focus:text-rose-600 rounded-xl cursor-pointer">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
