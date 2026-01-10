import React from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"

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
import { ChevronRight, Sparkles } from "lucide-react"

import { ModeToggle } from "@/components/layout/mode-toggle.tsx"
import { CommandMenu } from "@/components/layout/command-menu.tsx"
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown.tsx"
import { useAppSelector, useAppDispatch } from "@/hooks/hooks.ts"
import { selectUser, logout } from "@/store/slices/auth-slice.ts"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils";

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
      toast.error(t('messages.logoutError'))
      navigate('/login', { replace: true })
    }
  }

  const pathSegments = location.pathname.split('/').filter(Boolean)

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'staff': return 'bg-primary/10 text-primary border-primary/20'
      case 'lecturer': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-muted/10 text-muted-foreground border-border/20'
    }
  }

  return (
    <div className="flex w-full items-center gap-4">
      {/* Breadcrumbs - Zen Refined */}
      <div className="hidden md:flex items-center text-sm px-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-all flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  {t('navigation.dashboard')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && <BreadcrumbSeparator className="opacity-20"><ChevronRight className="size-3" /></BreadcrumbSeparator>}
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1
              const href = `/${pathSegments.slice(0, index + 1).join('/')}`
              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="capitalize text-[11px] font-black uppercase tracking-[0.15em] text-foreground italic flex items-center gap-2">
                        <Sparkles className="size-3 text-primary/40" />
                        {segment.replace('-', ' ')}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={href} className="capitalize text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-all">
                          {segment.replace('-', ' ')}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="opacity-20"><ChevronRight className="size-3" /></BreadcrumbSeparator>}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Modern Interactive Tools */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/20 border border-border/10">
          <CommandMenu />
          <NotificationsDropdown />
          <LanguageSwitcher />
          <ModeToggle />
        </div>

        {/* User Profile Hook */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-[1.25rem] ring-2 ring-transparent hover:ring-primary/20 transition-all p-0 overflow-hidden shadow-lg shadow-primary/5">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || ''} />
                <AvatarFallback className="bg-primary text-white font-black text-xs sm:text-sm">{user?.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl p-3 rounded-[2rem]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-3 text-center">
                <div className="mx-auto w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Avatar className="h-14 w-14 rounded-[1rem]">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary text-white font-black text-xl">{user?.displayName?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-tight leading-none italic">{user?.displayName}</p>
                  <p className="text-[9px] font-bold tracking-[0.1em] text-muted-foreground/60">
                    {user?.email}
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.25em] border", getRoleColor(user?.role || null))}>
                    {user?.role || 'USER'}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/20 mx-2" />
            <div className="p-1 space-y-1">
              <DropdownMenuItem asChild className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary">
                <Link to="/settings/profile">{t('navigation.profile')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary">
                <Link to="/settings">{t('navigation.settings')}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/20 my-1 mx-2" />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer">
                {t('navigation.logout')}
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
