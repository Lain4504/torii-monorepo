import React from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  MoreVertical,
} from "lucide-react"
import { useTranslation } from "@workspace/i18n"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

import { Can } from "@/lib/guard/can.tsx"
import { useAppDispatch, useAppSelector } from "@/hooks/hooks"
import { logout, selectUser } from "@/store/slices/auth-slice"
import { toast } from "@workspace/ui/components/sonner"

import { mainNavItems, managementNavItems, systemNavItems, type NavItem } from "@/config/navigation"

interface SidebarProps {
  className?: string
  isCollapsed: boolean
  toggleCollapse: () => void
}

export function DashboardSidebar({ className, isCollapsed, toggleCollapse }: SidebarProps) {
  const { t } = useTranslation(['common', 'admin'])
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const pathname = location.pathname

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

  const NavGroup = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="py-2">
      {!isCollapsed && (
        <h4 className="px-6 py-2 text-[10px] font-sans font-bold italic uppercase tracking-widest text-muted-foreground/40">
          {title}
        </h4>
      )}
      <div className="space-y-1 px-3">
        {items.map((item) => (
          <NavEntry key={item.url} item={item} />
        ))}
      </div>
    </div>
  )

  const NavEntry = ({ item }: { item: NavItem }) => {
    const isActive = item.url === "/"
      ? pathname === "/"
      : pathname === item.url || pathname.startsWith(item.url + "/")

    const content = (
      <Link
        to={item.url}
        className={cn(
          "group relative flex items-center rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
            : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground",
          isCollapsed ? "justify-center px-0" : "justify-start"
        )}
      >
        <item.icon className={cn("size-4 shrink-0 transition-colors", isActive && "text-primary", !isActive && "group-hover:text-primary")} />
        {!isCollapsed && (
          <span className="ml-3 truncate">
            {t(item.titleKey)}
          </span>
        )}
        {isActive && !isCollapsed && (
          <div className="ml-auto size-1 rounded-full bg-primary animate-pulse" />
        )}
      </Link>
    )

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <PermissionWrapper item={item}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
          </PermissionWrapper>
          <TooltipContent side="right" className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest z-50 bg-background/80 backdrop-blur-xl border-primary/10">
            {t(item.titleKey)}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <PermissionWrapper item={item}>
        {content}
      </PermissionWrapper>
    )
  }

  const PermissionWrapper = ({ item, children }: { item: NavItem; children: React.ReactNode }) => {
    if (!item.permission && !item.anyPermission) return <>{children}</>

    return (
      <Can permission={item.permission} anyPermission={item.anyPermission}>
        {children}
      </Can>
    )
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex h-screen flex-col bg-card border-r border-border/10 relative transition-[width] duration-500 ease-out",
          isCollapsed ? "w-[90px]" : "w-[280px]",
          className
        )}
      >

        {/* Header / Logo */}
        <div className="flex h-20 items-center px-6">
          <Link to="/" className={cn("flex items-center gap-3", isCollapsed ? "justify-center w-full" : "")}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform active:scale-95">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M3 10h18" strokeLinecap="round" />
                <path d="M5 10v8" strokeLinecap="round" />
                <path d="M19 10v8" strokeLinecap="round" />
                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-sans font-bold italic tracking-tight text-foreground">Torii <span className="text-primary">Admin</span></span>
                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-wider">{t('sidebar.workspace')}</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-none [&::-webkit-scrollbar]:hidden space-y-4">
          <NavGroup title={t('sidebar.overview')} items={mainNavItems} />
          <NavGroup title={t('sidebar.management')} items={managementNavItems} />
          <NavGroup title={t('sidebar.system')} items={systemNavItems} />
        </div>

        {/* Footer info or stats could go here */}

        {/* User Profile Footer */}
        <div className="p-4 mt-auto">
          <div className={cn(
            "flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-muted/20 transition-all hover:border-border",
            isCollapsed ? "justify-center px-0 bg-transparent border-none" : "justify-between"
          )}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="size-8.5 border border-background shadow-sm">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                      {user?.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-[13px] font-semibold text-foreground/80">{user?.displayName || t('sidebar.defaultUser')}</span>
                    <span className="truncate text-[10px] font-sans font-bold italic text-muted-foreground/40 uppercase tracking-wider">{user?.role || t('sidebar.defaultRole')}</span>
                  </div>
                </div>
              </>
            ) : (
              <Avatar className="size-9 border border-background shadow-sm cursor-pointer" onClick={toggleCollapse}>
                <AvatarFallback className="bg-primary text-white text-xs font-bold">
                  {user?.displayName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            )}

            {!isCollapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 hover:bg-muted text-muted-foreground/40">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border border-border shadow-xl bg-background rounded-xl p-1.5">
                  <DropdownMenuItem onClick={toggleCollapse} className="rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer">
                    {isCollapsed ? <PanelLeftOpen className="mr-2 size-4 text-primary" /> : <PanelLeftClose className="mr-2 size-4 text-primary" />}
                    {isCollapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')}
                  </DropdownMenuItem>
                  <div className="h-px bg-border/50 my-1 mx-1.5" />
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    {t('navigation.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isCollapsed && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapse}
                className="size-12 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <PanelLeftOpen className="size-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
