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
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isItemActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
                    const hasSubItems = item.items && item.items.length > 0

                    const isAISensei = item.name === "AI Sensei"

                    const menuButton = (
                        <SidebarMenuButton
                            tooltip={isCollapsed ? undefined : item.name}
                            className={cn(
                                'h-10 transition-all',
                                isItemActive && 'bg-primary/10 text-primary',
                                !isItemActive && 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <div className="flex shrink-0 items-center justify-center">
                                {item.icon && <item.icon className={cn('size-4', isItemActive && 'text-primary')} />}
                            </div>
                            <span className="truncate group-data-[collapsible=icon]:hidden ml-2 text-xs font-medium uppercase tracking-wider">{item.name}</span>
                            {hasSubItems && (
                                <ChevronRight className="group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden ml-auto size-3 opacity-40 transition-transform" />
                            )}
                            {isItemActive && !hasSubItems && (
                                <Sparkles className="group-data-[collapsible=icon]:hidden ml-auto size-3 text-primary opacity-50" />
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
                                            className="w-56 p-1 shadow-xl border-border/50"
                                        >
                                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                {item.name}
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {item.items?.map((subItem) => (
                                                <DropdownMenuItem key={subItem.name} asChild>
                                                    <Link
                                                        href={subItem.href}
                                                        className={cn(
                                                            'cursor-pointer px-3 py-2 text-xs font-medium transition-colors focus:bg-accent focus:text-accent-foreground',
                                                            pathname === subItem.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
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
                                                <SidebarMenuSub className="group-data-[collapsible=icon]:hidden mt-1 ml-4 space-y-1 border-l border-primary/10 pl-2">
                                                    {item.items?.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.name}>
                                                            <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                                                <Link href={subItem.href} className={cn(
                                                                    'h-8 text-xs font-medium transition-colors',
                                                                    pathname === subItem.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
                                        'h-10 transition-all',
                                        isItemActive && 'bg-primary/10 text-primary',
                                        !isItemActive && 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    <Link href={item.href}>
                                        <div className="flex shrink-0 items-center justify-center">
                                            {item.icon && <item.icon className={cn('size-4', isItemActive && 'text-primary')} />}
                                        </div>
                                        <span className="truncate group-data-[collapsible=icon]:hidden ml-2 text-xs font-medium uppercase tracking-wider">{item.name}</span>
                                        {isItemActive && (
                                            <Sparkles className="group-data-[collapsible=icon]:hidden ml-auto size-3 text-primary opacity-50" />
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
