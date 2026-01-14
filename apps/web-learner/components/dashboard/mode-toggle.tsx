"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@workspace/ui/components/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export function ModeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl h-9 w-9 transition-all group"
                >
                    <Sun className="size-4 sm:size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:rotate-45" />
                    <Moon className="absolute size-4 sm:size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:-rotate-12" />
                    <span className="sr-only">Toggle chromatic mode</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl p-3 rounded-[2rem] animate-in slide-in-from-top-2 duration-500"
            >
                <div className="px-4 py-3 mb-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/30 italic">Chromatic Mode</p>
                </div>
                <div className="space-y-1">
                    <DropdownMenuItem
                        onClick={() => setTheme("light")}
                        className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary transition-all flex items-center justify-between group/mode"
                    >
                        <span>Light Emission</span>
                        <Sun className="size-3 opacity-20 group-hover/mode:opacity-100 transition-opacity" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setTheme("dark")}
                        className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary transition-all flex items-center justify-between group/mode"
                    >
                        <span>Void Matrix</span>
                        <Moon className="size-3 opacity-20 group-hover/mode:opacity-100 transition-opacity" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setTheme("system")}
                        className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary transition-all flex items-center justify-between group/mode"
                    >
                        <span>System Logic</span>
                        <div className="size-1 rounded-full bg-border group-hover/mode:bg-primary transition-colors" />
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
