"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Sparkles, type LucideIcon } from "lucide-react"

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

export interface NavMainItem {
    name: string
    href: string
    icon?: LucideIcon
    items?: {
        name: string
        href: string
    }[]
}

export function NavMain({
    label,
    items,
}: {
    label: string
    items: NavMainItem[]
}) {
    const pathname = usePathname()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:px-0">
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-2 px-4 group-data-[collapsible=icon]:hidden">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isItemActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
                    const hasSubItems = item.items && item.items.length > 0

                    const menuButton = (
                        <SidebarMenuButton
                            tooltip={isCollapsed ? undefined : item.name}
                            className={cn(
                                "h-11 rounded-xl transition-all duration-300",
                                isItemActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground",
                                "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                            )}
                        >
                            <div className="flex items-center justify-center shrink-0">
                                {item.icon && <item.icon className={cn("size-4 shadow-sm transition-transform", isItemActive && "scale-110")} />}
                            </div>
                            <span className="ml-2 font-bold text-[11px] uppercase tracking-widest group-data-[collapsible=icon]:hidden truncate">{item.name}</span>
                            {hasSubItems && (
                                <ChevronRight className="ml-auto size-3 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 opacity-40 group-data-[collapsible=icon]:hidden" />
                            )}
                            {isItemActive && !hasSubItems && (
                                <Sparkles className="ml-auto size-3 text-primary opacity-50 animate-pulse group-data-[collapsible=icon]:hidden" />
                            )}
                        </SidebarMenuButton>
                    )

                    return (
                        <SidebarMenuItem key={item.name} className="px-2 group-data-[collapsible=icon]:px-0">
                            {hasSubItems ? (
                                isCollapsed ? (
                                    <DropdownMenu>
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
                                                {item.name}
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-border/10" />
                                            {item.items?.map((subItem) => (
                                                <DropdownMenuItem key={subItem.name} asChild>
                                                    <Link
                                                        href={subItem.href}
                                                        className={cn(
                                                            "rounded-xl px-3 py-2.5 text-xs font-medium cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary mb-1",
                                                            pathname === subItem.href ? "bg-primary/5 text-primary" : "text-muted-foreground/70"
                                                        )}
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Collapsible
                                        asChild
                                        defaultOpen={isItemActive}
                                        className="group/collapsible"
                                    >
                                        <div>
                                            <CollapsibleTrigger asChild>
                                                {menuButton}
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="animate-in fade-in slide-in-from-top-1 duration-300">
                                                <SidebarMenuSub className="ml-4 border-l border-primary/10 pl-2 mt-1 space-y-1 group-data-[collapsible=icon]:hidden">
                                                    {item.items?.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.name}>
                                                            <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                                                <Link href={subItem.href} className={cn(
                                                                    "h-9 rounded-lg text-xs font-medium transition-colors",
                                                                    pathname === subItem.href ? "text-primary bg-primary/5" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
                                                                )}>
                                                                    <span className="truncate">{subItem.name}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                )
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.name}
                                    className={cn(
                                        "h-11 rounded-xl transition-all duration-300",
                                        isItemActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground",
                                        "group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                                    )}
                                >
                                    <Link href={item.href}>
                                        <div className="flex items-center justify-center shrink-0">
                                            {item.icon && <item.icon className={cn("size-4 shadow-sm transition-transform", isItemActive && "scale-110")} />}
                                        </div>
                                        <span className="ml-2 font-bold text-[11px] uppercase tracking-widest group-data-[collapsible=icon]:hidden truncate">{item.name}</span>
                                        {isItemActive && (
                                            <Sparkles className="ml-auto size-3 text-primary opacity-50 animate-pulse group-data-[collapsible=icon]:hidden" />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
