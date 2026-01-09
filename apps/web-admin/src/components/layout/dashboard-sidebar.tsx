import React from "react"
import { useLocation, Link } from "react-router-dom"
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ChevronRight,
  MoreVertical
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
import { useNavigate } from "react-router-dom"
import { toast } from "@workspace/ui/components/sonner"

import { mainNavItems, managementNavItems, systemNavItems, type NavItem } from "@/config/navigation"

interface SidebarProps {
  className?: string
  isCollapsed: boolean
  toggleCollapse: () => void
}

export function DashboardSidebar({ className, isCollapsed, toggleCollapse }: SidebarProps) {
  const { t } = useTranslation('common')
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
      // Even if logout fails, clear local state and redirect
      toast.error(t('messages.logoutError'))
      navigate('/login', { replace: true })
    }
  }

  const NavGroup = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="py-2">
      {!isCollapsed && (
        <h4 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 animate-in fade-in duration-300">
          {title}
        </h4>
      )}
      <div className="space-y-1 px-2">
        {items.map((item) => (
          <NavEntry key={item.url} item={item} />
        ))}
      </div>
    </div>
  )

  const NavEntry = ({ item }: { item: NavItem }) => {
    // Active if exact match or starts with url/ (sub-routes)
    const isActive = item.url === "/"
      ? pathname === "/"
      : pathname === item.url || pathname.startsWith(item.url + "/")

    const content = (
      <Link
        to={item.url}
        className={cn(
          "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out",
          isActive
            ? "bg-primary/10 text-primary shadow-none"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          isCollapsed ? "justify-center" : "justify-start"
        )}
      >
        <item.icon className={cn("size-5 shrink-0 transition-transform duration-300", isActive && "scale-110", !isActive && "group-hover:scale-105")} />
        {!isCollapsed && (
          <span className="ml-3 truncate animate-in fade-in slide-in-from-left-1 duration-300">
            {t(item.titleKey)}
          </span>
        )}
        {!isCollapsed && isActive && (
          <ChevronRight className="ml-auto size-4 opacity-50" />
        )}
      </Link>
    )

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <PermissionWrapper item={item}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
          </PermissionWrapper>
          <TooltipContent side="right" className="flex items-center gap-2 font-medium z-50">
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
          "flex h-screen flex-col bg-background/60 backdrop-blur-2xl transition-[width] duration-500 ease-in-out border-none shadow-sm",
          isCollapsed ? "w-[80px]" : "w-[280px]",
          className
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-20 items-center px-6 transition-all duration-300">
          <div className={cn("flex items-center gap-3 overflow-hidden", isCollapsed ? "justify-center w-full" : "")}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold transition-all duration-300 hover:scale-105 hover:bg-primary/20">
              T
            </div>
            {!isCollapsed && ( // Using css trick for smoother transition or just conditional
              <div className="flex flex-col whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
                <span className="text-base font-semibold tracking-tight text-foreground">{t('sidebar.appName')}</span>
                <span className="text-[10px] uppercase text-muted-foreground font-medium tracking-widest">{t('sidebar.workspace')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-2 px-3 scrollbar-none [&::-webkit-scrollbar]:hidden space-y-6">
          <NavGroup title={t('sidebar.overview')} items={mainNavItems} />
          {/* Removed Separator for cleaner look, relying on spacing */}
          <NavGroup title={t('sidebar.management')} items={managementNavItems} />
          <NavGroup title={t('sidebar.system')} items={systemNavItems} />
        </div>

        {/* User Footer */}
        <div className="p-4 bg-transparent mb-2">
          <div className={cn("flex items-center rounded-2xl bg-muted/30 p-2 transition-all duration-300 hover:bg-muted/50", isCollapsed ? "justify-center bg-transparent p-0 hover:bg-transparent" : "justify-between")}>
            {!isCollapsed ? (
              <div className="flex items-center gap-3 overflow-hidden animate-in fade-in duration-300">
                <Avatar className="size-8">
                  <AvatarImage src={user?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-background text-primary font-medium text-xs">
                    {user?.displayName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate max-w-[100px]">
                  <span className="truncate text-xs font-semibold">{user?.displayName || t('sidebar.defaultUser')}</span>
                  <span className="truncate text-[10px] text-muted-foreground capitalize">{user?.role || t('sidebar.defaultRole')}</span>
                </div>
              </div>
            ) : (
              <Avatar className="size-9 cursor-pointer border-2 border-background shadow-none hover:scale-105 transition-transform" onClick={toggleCollapse}>
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.displayName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("ml-auto shrink-0 size-8", isCollapsed && "hidden")}>
                  <MoreVertical className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-none shadow-xl bg-background/80 backdrop-blur-xl">
                <DropdownMenuItem onClick={toggleCollapse}>
                  {isCollapsed ? <PanelLeftOpen className="mr-2 size-4" /> : <PanelLeftClose className="mr-2 size-4" />}
                  {isCollapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  {t('navigation.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isCollapsed && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="icon" onClick={toggleCollapse} className="text-muted-foreground hover:text-foreground">
                <PanelLeftOpen className="size-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
