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
import { selectUser, clearUser, setAuthenticated } from "@/store/slices/auth-slice.ts"
import { apiClient } from "@/api/api-client.ts"
import { toast } from "@workspace/ui/components/sonner"

export function DashboardHeader() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch(clearUser())
      dispatch(setAuthenticated({ isAuthenticated: false }))
      toast.success('Logged out successfully')
      // Route change handled by AuthGuard or updates
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
      {/* Breadcrumbs */}
      <div className="hidden md:flex items-center text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-md">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && <BreadcrumbSeparator />}
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1
              const href = `/${pathSegments.slice(0, index + 1).join('/')}`
              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="capitalize font-semibold text-foreground">{segment.replace('-', ' ')}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={href} className="capitalize">{segment.replace('-', ' ')}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <CommandMenu />

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full animate-pulse ring-2 ring-background"></span>
        </Button>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-input shadow-sm hover:shadow-md transition-shadow">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || ''} />
                <AvatarFallback>{user?.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(user?.role || null)} className="text-[10px] px-1.5 h-5">
                    {user?.role?.toUpperCase() || 'USER'}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
