import React from "react"
import { useLocation, Link } from "react-router-dom"
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
import { LanguageSwitcher } from "@workspace/ui/components/language-switcher"
import { useTranslation } from "@workspace/i18n"

import { ModeToggle } from "@/components/layout/mode-toggle.tsx"
import { CommandMenu } from "@/components/layout/command-menu.tsx"
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown.tsx"
import { useAppSelector, useAppDispatch } from "@/hooks/hooks.ts"
import { selectUser, logout } from "@/store/slices/auth-slice.ts"
import { toast } from "@workspace/ui/components/sonner"
import { useNavigate } from "react-router-dom"

export function DashboardHeader() {
  const { t } = useTranslation('common')
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success(t('messages.logoutSuccess'))
      navigate('/login', { replace: true })
    } catch (error) {
      // Even if logout fails, clear local state and redirect
      toast.error(t('messages.logoutError'))
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
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">{t('navigation.dashboard')}</Link>
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

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <CommandMenu />

        <NotificationsDropdown />

        <LanguageSwitcher />

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-transparent hover:ring-primary/10 transition-all p-0 overflow-hidden">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || ''} />
                <AvatarFallback className="bg-muted hover:bg-muted/80 transition-colors text-xs sm:text-sm">{user?.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
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
                  <Badge variant={getRoleBadgeVariant(user?.role || null)} className="text-[10px] px-2 py-0.5 rounded-md capitalize">
                    {user?.role || 'USER'}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-muted/50" />
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link to="/settings/profile">{t('navigation.profile')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link to="/settings">{t('navigation.settings')}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-muted/50" />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-500 focus:bg-rose-500/10 focus:text-rose-600 rounded-xl cursor-pointer">
              {t('navigation.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
