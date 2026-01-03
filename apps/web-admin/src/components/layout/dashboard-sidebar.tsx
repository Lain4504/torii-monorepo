import React from "react"
import { useLocation, Link } from "react-router-dom"
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  Video,
  CreditCard,
  Settings,
  BarChart3,
  PanelLeftDashed,
  Bell,
  Shield,
  Sparkles,
  FileQuestion,
  Newspaper,
} from "lucide-react"

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Can } from "@/lib/guard/can.tsx"

// Dữ liệu menu chính - for Torii Learning Platform
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  permission?: string // Optional permission required to see this item
  anyPermission?: string[] // Any of these permissions
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    // No permission required - everyone can see dashboard
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    permission: "user.view",
  },
  {
    title: "Rooms",
    url: "/rooms",
    icon: Video,
    anyPermission: ["live_class.schedule", "live_class.manage"],
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
    anyPermission: ["course.view_restricted", "course.create", "course.update"],
  },
  {
    title: "Question Bank",
    url: "/question-bank",
    icon: FileQuestion,
    permission: "exam.manage",
  },
  {
    title: "Assessments",
    url: "/assessments",
    icon: ClipboardList,
    permission: "exam.manage",
  },
  {
    title: "Blog",
    url: "/blogs",
    icon: Newspaper,
    anyPermission: ["blog.write", "blog.manage"],
  },
]

const workflowNavItems: NavItem[] = [
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
    permission: "payment.view",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    permission: "report.view",
  },
]

// System Navigation
const secondaryNavItems: NavItem[] = [
  {
    title: "AI Service",
    url: "/ai-service",
    icon: Sparkles,
    permission: "ai.config",
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    // No specific permission - available to all authenticated users
  },
  {
    title: "Permissions",
    url: "/permissions",
    icon: Shield,
    permission: "system.config",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    permission: "system.config",
  },
]

interface NavItemButtonProps {
  item: NavItem
  pathname: string
  sidebarModeState: 'expanded' | 'collapsed' | 'hover'
}

function NavItemButton({ item, pathname, sidebarModeState }: NavItemButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          asChild
          className={cn(
            "relative w-full h-8 lg:h-8 px-2",
            sidebarModeState === 'expanded' && "justify-start",
            sidebarModeState === 'collapsed' && "lg:justify-center",
            sidebarModeState === 'hover' && "lg:justify-center lg:group-hover:justify-start",
            pathname === item.url && "bg-accent"
          )}
        >
          <Link to={item.url}>
            <item.icon className={cn(
              "size-4",
              sidebarModeState === 'expanded' && "mr-2",
              sidebarModeState === 'hover' && "lg:mr-0 lg:group-hover:mr-2"
            )} />
            <span className={cn(
              "transition-opacity duration-300 whitespace-nowrap",
              sidebarModeState === 'expanded' && "inline",
              sidebarModeState === 'collapsed' && "hidden",
              sidebarModeState === 'hover' && "hidden lg:group-hover:inline"
            )}>
              {item.title}
            </span>
            {item.badge && (
              <>
                {sidebarModeState === 'collapsed' && (
                  <span className="absolute right-0 top-1 hidden lg:inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">
                    {item.badge}
                  </span>
                )}
                {sidebarModeState === 'hover' && (
                  <>
                    <span className="absolute right-0 top-1 hidden lg:inline-flex lg:group-hover:hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">
                      {item.badge}
                    </span>
                    <span className="ml-auto hidden lg:group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {item.badge}
                    </span>
                  </>
                )}
                {sidebarModeState === 'expanded' && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className={cn("lg:block hidden", sidebarModeState === 'expanded' && "hidden")}>
        <p>{item.title}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function DashboardSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const [sidebarModeState, setSidebarModeState] = React.useState<'expanded' | 'collapsed' | 'hover'>('hover')

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile) {
      setSidebarModeState('expanded')
    } else {
      const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null
      if (stored && (stored === 'expanded' || stored === 'collapsed' || stored === 'hover')) {
        setSidebarModeState(stored)
      }
    }

    const onModeChange = (e: CustomEvent<'expanded' | 'collapsed' | 'hover'>) => {
      const mode = e.detail
      const nowMobile = window.matchMedia('(max-width: 1023px)').matches
      if (nowMobile) {
        setSidebarModeState('expanded')
        return
      }
      setSidebarModeState(mode)
      localStorage.setItem('sidebarMode', mode)
    }

    const mq = window.matchMedia('(max-width: 1023px)')
    const onMqChange = () => {
      if (mq.matches) {
        setSidebarModeState('expanded')
      } else {
        const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null
        setSidebarModeState(stored || 'hover')
      }
    }

    mq.addEventListener?.('change', onMqChange)
    window.addEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    return () => {
      mq.removeEventListener?.('change', onMqChange)
      window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    }
  }, [])

  const setSidebarMode = (mode: 'expanded' | 'collapsed' | 'hover') => {
    if (typeof window !== 'undefined') {
      const isMobile = window.matchMedia('(max-width: 1023px)').matches
      if (isMobile) return
      localStorage.setItem('sidebarMode', mode)
      setSidebarModeState(mode)
      window.dispatchEvent(new CustomEvent('sidebar-mode-change', { detail: mode }))
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Navigation Content */}
        <div
          className="flex-1 overflow-y-auto sidebar-scroll"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="p-2 lg:p-2">
            {/* Main Navigation */}
            <div className="mb-6">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
                sidebarModeState === 'collapsed' && "hidden"
              )}>
                Main Navigation
              </h3>
              {/* Main Navigation Items with permissions */}
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  // If item has no permission requirement, show to everyone
                  if (!item.permission && !item.anyPermission) {
                    return (
                      <NavItemButton
                        key={item.title}
                        item={item}
                        pathname={pathname}
                        sidebarModeState={sidebarModeState}
                      />
                    )
                  }

                  // Otherwise, wrap with Can component
                  return (
                    <Can
                      key={item.title}
                      permission={item.permission}
                      anyPermission={item.anyPermission}
                    >
                      <NavItemButton
                        item={item}
                        pathname={pathname}
                        sidebarModeState={sidebarModeState}
                      />
                    </Can>
                  )
                })}
              </div>
            </div>

            {/* Workflow Navigation */}
            <div className="mb-6">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
                sidebarModeState === 'collapsed' && "hidden"
              )}>
                Management
              </h3>
              <div className="space-y-1">
                {workflowNavItems.map((item) => {
                  if (!item.permission && !item.anyPermission) {
                    return (
                      <NavItemButton
                        key={item.title}
                        item={item}
                        pathname={pathname}
                        sidebarModeState={sidebarModeState}
                      />
                    )
                  }

                  return (
                    <Can
                      key={item.title}
                      permission={item.permission}
                      anyPermission={item.anyPermission}
                    >
                      <NavItemButton
                        item={item}
                        pathname={pathname}
                        sidebarModeState={sidebarModeState}
                      />
                    </Can>
                  )
                })}
              </div>
            </div>

            {/* Separator */}
            <div className={cn(
              "border-t border-sidebar-border my-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
              sidebarModeState === 'collapsed' && "hidden"
            )} />

            {/* System Navigation */}
            <div className="mb-4">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
                sidebarModeState === 'collapsed' && "hidden"
              )}>
                System
              </h3>
              <div className="space-y-1">
                {secondaryNavItems.map((item) => {
                  if (!item.permission && !item.anyPermission) {
                    return (
                      <NavItemButton
                        key={item.title}
                        item={item}
                        pathname={pathname}
                        sidebarModeState={sidebarModeState}
                      />
                    )
                  }

                  return (
                    <Can
                      key={item.title}
                      permission={item.permission}
                      anyPermission={item.anyPermission}
                    >
                      <NavItemButton
                        item={item}
                        pathname={pathname}
                        sidebarModeState={sidebarModeState}
                      />
                    </Can>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with mode switcher - hidden on mobile */}
        <div className="p-2 border-t border-sidebar-border hidden lg:block space-y-2">
          {/* Mode Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full h-10 lg:h-10 px-2 lg:justify-center">
                <PanelLeftDashed className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="min-w-48">
              <DropdownMenuLabel>Sidebar mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSidebarMode('expanded')}>Expanded</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSidebarMode('collapsed')}>Collapsed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSidebarMode('hover')}>Expand on hover</DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}
