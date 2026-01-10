import React from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ChevronRight,
  MoreVertical,
  Sparkles,
  ShieldCheck,
  LayoutDashboard
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
      toast.error(t('messages.logoutError'))
      navigate('/login', { replace: true })
    }
  }

  const NavGroup = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="py-2">
      {!isCollapsed && (
        <h4 className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 animate-in fade-in duration-500 italic">
          {title}
        </h4>
      )}
      <div className="space-y-1.5 px-3">
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
          "group relative flex items-center rounded-2xl px-4 py-3 text-[13px] font-bold transition-all duration-500 ease-out",
          isActive
            ? "bg-primary text-white shadow-xl shadow-primary/20"
            : "text-muted-foreground/60 hover:bg-primary/5 hover:text-primary",
          isCollapsed ? "justify-center px-0" : "justify-start"
        )}
      >
        <item.icon className={cn("size-5 shrink-0 transition-transform duration-500", isActive && "scale-110", !isActive && "group-hover:scale-110 group-hover:rotate-[5deg]")} />
        {!isCollapsed && (
          <span className="ml-4 truncate animate-in fade-in slide-in-from-left-2 duration-500">
            {t(item.titleKey)}
          </span>
        )}
        {!isCollapsed && isActive && (
          <Sparkles className="ml-auto size-3 opacity-50 animate-pulse text-white/50" />
        )}

        {isActive && !isCollapsed && (
          <div className="absolute left-0 w-1 h-4 bg-white/20 rounded-full" />
        )}
      </Link>
    )

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <PermissionWrapper item={item}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
          </PermissionWrapper>
          <TooltipContent side="right" className="flex items-center gap-2 font-black uppercase tracking-widest text-[9px] z-50 bg-background/80 backdrop-blur-xl border-primary/10">
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
          "flex h-screen flex-col bg-background/40 backdrop-blur-3xl transition-[width] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-border/20 relative",
          isCollapsed ? "w-[90px]" : "w-[300px]",
          className
        )}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/[0.03] blur-3xl -z-10" />

        {/* Header / Logo */}
        <div className="flex h-24 items-center px-8">
          <Link to="/" className={cn("flex items-center gap-4 group cursor-pointer", isCollapsed ? "justify-center w-full" : "")}>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[1.25rem] bg-primary shadow-lg shadow-primary/20 text-white font-black transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M3 10h18" strokeLinecap="round" />
                <path d="M5 10v8" strokeLinecap="round" />
                <path d="M19 10v8" strokeLinecap="round" />
                <path d="M3 7c0-1 1-2 3-2h12c2 0 3 1 3 2" strokeLinecap="round" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                <span className="text-xl font-black tracking-tighter uppercase italic leading-none">Torii <span className="text-primary not-italic text-sm">ADMIN</span></span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mt-1.5">{t('sidebar.workspace')}</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-none [&::-webkit-scrollbar]:hidden space-y-8">
          <NavGroup title={t('sidebar.overview')} items={mainNavItems} />
          <NavGroup title={t('sidebar.management')} items={managementNavItems} />
          <NavGroup title={t('sidebar.system')} items={systemNavItems} />
        </div>

        {/* Footer info or stats could go here */}

        {/* User Profile Footer */}
        <div className="p-6">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-[1.5rem] bg-muted/20 border border-border/30 transition-all duration-500 hover:bg-muted/40 group",
            isCollapsed ? "justify-center px-0 bg-transparent border-none" : "justify-between"
          )}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <Avatar className="size-10 border-2 border-background shadow-lg">
                      <AvatarImage src={user?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-white font-black text-xs uppercase">
                        {user?.displayName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 size-3.5 bg-emerald-500 border-2 border-background rounded-full" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-xs font-black uppercase tracking-tight">{user?.displayName || t('sidebar.defaultUser')}</span>
                    <div className="flex items-center gap-1.5 opacity-40">
                      <ShieldCheck className="size-2.5" />
                      <span className="truncate text-[9px] font-bold uppercase tracking-widest">{user?.role || t('sidebar.defaultRole')}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="relative cursor-pointer group-hover:scale-110 transition-transform duration-500" onClick={toggleCollapse}>
                <Avatar className="size-11 border-2 border-background shadow-xl">
                  <AvatarFallback className="bg-primary text-white font-black">
                    {user?.displayName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-background rounded-full" />
              </div>
            )}

            {!isCollapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 size-8 hover:bg-primary/10 hover:text-primary transition-colors">
                    <MoreVertical className="size-4 opacity-40" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-2xl p-2">
                  <DropdownMenuItem onClick={toggleCollapse} className="rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest">
                    {isCollapsed ? <PanelLeftOpen className="mr-3 size-4 text-primary" /> : <PanelLeftClose className="mr-3 size-4 text-primary" />}
                    {isCollapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')}
                  </DropdownMenuItem>
                  <div className="h-px bg-border/40 my-1 mx-2" />
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest" onClick={handleLogout}>
                    <LogOut className="mr-3 size-4" />
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
                className="size-12 rounded-2xl text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all"
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
