'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Layers, Play, Settings, MoreVertical, Trash2, Edit } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import Link from 'next/link'

interface DeckCardProps {
    deck: any
    onEdit: (deck: any) => void
    onDelete: (id: string) => void
}

export function DeckCard({ deck, onEdit, onDelete }: DeckCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{deck.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                        {deck.description || "Chưa có mô tả..."}
                    </CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(deck)}><Edit className="mr-2 h-4 w-4" /> Sửa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(deck.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>{deck.stats?.cardCount || 0} thẻ</span>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button asChild className="flex-1" size="sm">
                    <Link href={`/dashboard/flashcards/${deck.id}`}>
                        <Play className="mr-2 h-4 w-4" /> Học ngay
                    </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1" size="sm">
                    <Link href={`/dashboard/flashcards/${deck.id}/manage`}>
                        <Settings className="mr-2 h-4 w-4" /> Quản lý
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
