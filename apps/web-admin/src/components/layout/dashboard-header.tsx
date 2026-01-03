import React from "react"
import { useNavigate } from "react-router-dom"
import { Zap, Menu, LogOut } from "lucide-react"
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
import { DashboardSidebar } from "./dashboard-sidebar.tsx";
import { ModeToggle } from "@/components/mode-toggle"
import { CommandMenu } from "@/components/command-menu"
import { useAppSelector, useAppDispatch } from "@/store/hooks.ts"
import { selectUser, clearUser, setAuthenticated } from "@/store/slices/auth-slice.ts"
import { apiClient } from "@/lib/api-client.ts"
import { toast } from "@workspace/ui/components/sonner"

export function DashboardHeader() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout')
      dispatch(clearUser())
      dispatch(setAuthenticated({ isAuthenticated: false }))
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear local state even if API call fails
      dispatch(clearUser())
      dispatch(setAuthenticated({ isAuthenticated: false }))
      navigate('/login')
    }
  }

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'staff':
        return 'default'
      case 'lecturer':
        return 'secondary'
      case 'learner':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string | null) => {
    if (role === 'admin') return 'Admin'
    if (role === 'staff') return 'Staff'
    if (role === 'lecturer') return 'Lecturer'
    if (role === 'learner') return 'Learner'
    return 'User'
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 px-2 lg:px-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Zap className="size-4 lg:size-5 text-primary" />
            <span className="font-semibold text-sm lg:text-base">Torii Admin</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center mx-4">
          <CommandMenu />
        </div>

        <div className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3">
          <ModeToggle />
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || ''} />
                  <AvatarFallback>{getInitials(user?.displayName || null)}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">{user?.displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <div className="pt-2">
                    <Badge variant={getRoleBadgeVariant(user?.role || null)} className="text-xs">
                      {getRoleLabel(user?.role || null)}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile menu - simple slide-in sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r z-50 lg:hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close</span>
                ×
              </Button>
            </div>
            <DashboardSidebar />
          </div>
        </>
      )}
    </>
  )
}
