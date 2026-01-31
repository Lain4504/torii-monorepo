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
import { ChevronRight } from "lucide-react"

import { ModeToggle } from "@/components/layout/mode-toggle.tsx"
import { CommandMenu } from "@/components/layout/command-menu.tsx"
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown.tsx"

export function DashboardHeader() {
  const { t } = useTranslation('common')
  const location = useLocation()

  const pathSegments = location.pathname.split('/').filter(Boolean)

  return (
    <div className="flex w-full items-center justify-between gap-4 h-14">
      {/* Breadcrumbs - Refined Admin Style */}
      <div className="hidden md:flex items-center text-sm px-1 overflow-hidden">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-xs font-semibold text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-2">
                  {t('navigation.dashboard')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && (
              <BreadcrumbSeparator className="opacity-30">
                <ChevronRight className="size-3" />
              </BreadcrumbSeparator>
            )}
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1
              const href = `/${pathSegments.slice(0, index + 1).join('/')}`

              if (segment.length > 20) return null;

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="capitalize text-xs font-sans font-bold italic text-foreground flex items-center gap-2 max-w-[150px] truncate">
                        {segment.replace('-', ' ')}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={href} className="capitalize text-xs font-semibold text-muted-foreground/50 hover:text-foreground transition-colors">
                          {segment.replace('-', ' ')}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="opacity-30">
                      <ChevronRight className="size-3" />
                    </BreadcrumbSeparator>
                  )}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-lg sm:bg-muted/20 sm:border border-border/50">
          <CommandMenu />
          <NotificationsDropdown />
          <div className="hidden sm:block w-px h-4 bg-border/50 mx-0.5" />
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
