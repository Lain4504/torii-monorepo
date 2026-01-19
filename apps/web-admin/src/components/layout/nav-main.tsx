"use client"

import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Sparkles, type LucideIcon } from "lucide-react"
import { useTranslation } from "@workspace/i18n"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@workspace/ui/components/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"
import { Can } from "@/lib/guard/can"

export interface NavMainItem {
    titleKey: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    permission?: string
    anyPermission?: string[]
    items?: {
        titleKey: string
        url: string
        permission?: string
    }[]
}

export function NavMain({
    labelKey,
    items,
}: {
    labelKey: string
    items: NavMainItem[]
}) {
    const { t } = useTranslation(['common', 'admin'])
    const { pathname } = useLocation()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:px-0">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-2 px-4 group-data-[collapsible=icon]:hidden">
                {t(labelKey)}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isItemActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
                    const hasSubItems = item.items && item.items.length > 0

                    let menuButton = (
                        <SidebarMenuButton
                            tooltip={isCollapsed ? undefined : t(item.titleKey)}
                            className={cn(
                                "h-11 rounded-xl transition-all duration-300",
                                isItemActive && !hasSubItems ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground",
                                "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                            )}
                        >
                            <div className="flex items-center justify-center shrink-0">
                                {item.icon && <item.icon className={cn("size-4 shadow-sm transition-transform", isItemActive && "scale-110")} />}
                            </div>
                            <span className="ml-2 font-bold text-[11px] uppercase tracking-widest group-data-[collapsible=icon]:hidden truncate">{t(item.titleKey)}</span>
                            {hasSubItems && (
                                <ChevronRight className="ml-auto size-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 opacity-40 group-data-[collapsible=icon]:hidden" />
                            )}
                            {isItemActive && !hasSubItems && (
                                <Sparkles className="ml-auto size-3 text-primary opacity-50 animate-pulse group-data-[collapsible=icon]:hidden" />
                            )}
                        </SidebarMenuButton>
                    )

                    const content = hasSubItems ? (
                        isCollapsed ? (
                            <DropdownMenu key={item.titleKey}>
                                <SidebarMenuItem className="px-2 group-data-[collapsible=icon]:px-0">
                                    <DropdownMenuTrigger asChild>
                                        {menuButton}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        side="right"
                                        align="start"
                                        sideOffset={16}
                                        className="w-56 rounded-2xl border-border/20 bg-background/80 backdrop-blur-3xl p-2 shadow-2xl"
                                    >
                                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-3 py-2">
                                            {t(item.titleKey)}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-border/10" />
                                        {item.items?.map((subItem) => (
                                            <PermissionWrapper key={subItem.titleKey} permission={subItem.permission}>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        to={subItem.url}
                                                        className={cn(
                                                            "rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary mb-1",
                                                            pathname === subItem.url ? "bg-primary/5 text-primary" : "text-muted-foreground/70"
                                                        )}
                                                    >
                                                        {t(subItem.titleKey)}
                                                    </Link>
                                                </DropdownMenuItem>
                                            </PermissionWrapper>
                                        ))}
                                    </DropdownMenuContent>
                                </SidebarMenuItem>
                            </DropdownMenu>
                        ) : (
                            <Collapsible
                                key={item.titleKey}
                                asChild
                                defaultOpen={isItemActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem className="px-2 group-data-[collapsible=icon]:px-0">
                                    <CollapsibleTrigger asChild>
                                        {menuButton}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-300">
                                        <SidebarMenuSub className="ml-4 border-l border-primary/10 pl-2 mt-1 space-y-1 group-data-[collapsible=icon]:hidden">
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.titleKey}>
                                                    <PermissionWrapper permission={subItem.permission}>
                                                        <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                            <Link to={subItem.url} className={cn(
                                                                "h-9 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors",
                                                                pathname === subItem.url ? "text-primary bg-primary/5" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
                                                            )}>
                                                                <span className="truncate">{t(subItem.titleKey)}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </PermissionWrapper>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )
                    ) : (
                        <SidebarMenuItem key={item.titleKey} className="px-2 group-data-[collapsible=icon]:px-0">
                            <SidebarMenuButton
                                asChild
                                tooltip={t(item.titleKey)}
                                className={cn(
                                    "h-11 rounded-xl transition-all duration-300",
                                    isItemActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground",
                                    "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                                )}
                            >
                                <Link to={item.url}>
                                    <div className="flex items-center justify-center shrink-0">
                                        {item.icon && <item.icon className={cn("size-4 shadow-sm transition-transform", isItemActive && "scale-110")} />}
                                    </div>
                                    <span className="ml-2 font-bold text-[11px] uppercase tracking-widest group-data-[collapsible=icon]:hidden truncate">{t(item.titleKey)}</span>
                                    {isItemActive && (
                                        <Sparkles className="ml-auto size-3 text-primary opacity-50 animate-pulse group-data-[collapsible=icon]:hidden" />
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )

                    return (
                        <PermissionWrapper key={item.titleKey} permission={item.permission} anyPermission={item.anyPermission}>
                            {content}
                        </PermissionWrapper>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}

function PermissionWrapper({
    permission,
    anyPermission,
    children
}: {
    permission?: string;
    anyPermission?: string[];
    children: React.ReactNode
}) {
    if (!permission && !anyPermission) return <>{children}</>
    return (
        <Can permission={permission} anyPermission={anyPermission}>
            {children}
        </Can>
    )
}
