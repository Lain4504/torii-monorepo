import React from "react"
import { useLocation, Link } from "react-router-dom"
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

export function DashboardHeader() {
  const { t } = useTranslation('common')
  const location = useLocation()

  const pathSegments = location.pathname.split('/').filter(Boolean)

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* Breadcrumbs - Minimalist Zen Style */}
      <div className="hidden md:flex items-center text-sm px-1 overflow-hidden">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-all flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary/20" />
                  {t('navigation.dashboard')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && (
              <BreadcrumbSeparator className="opacity-20">
                <ChevronRight className="size-3" />
              </BreadcrumbSeparator>
            )}
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1
              const href = `/${pathSegments.slice(0, index + 1).join('/')}`

              // Skip UUIDs or long IDs from breadcrumbs for cleaner UI
              if (segment.length > 20) return null;

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="capitalize text-[11px] font-bold tracking-tight text-foreground flex items-center gap-2 max-w-[150px] truncate">
                        <Sparkles className="size-3 text-primary/40 shrink-0" />
                        {segment.replace('-', ' ')}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={href} className="capitalize text-[10px] font-medium text-muted-foreground/60 hover:text-foreground transition-all">
                          {segment.replace('-', ' ')}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="opacity-20">
                      <ChevronRight className="size-3" />
                    </BreadcrumbSeparator>
                  )}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Interactive Tools Group */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/10 border border-border/5">
          <CommandMenu />
          <NotificationsDropdown />
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
