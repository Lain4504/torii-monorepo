'use client'

import { useQuery } from '@tanstack/react-query'
import { flashcardApi } from '@/api/services/flashcard-api'
import { PageLoading } from '@workspace/ui/components/page-loading'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import {
    Sparkles,
    Plus,
    Search,
    Layers,
    Clock,
    BrainCircuit,
    MoreVertical,
    Trash2,
    Edit
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

export default function FlashcardsPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const { data: decksData, isLoading } = useQuery({
        queryKey: ['flashcard-decks', searchQuery],
        queryFn: () => flashcardApi.getDecks({ search: searchQuery }),
    })

    if (isLoading) {
        return <PageLoading text="Loading Memory Banks..." className="h-[50vh]" />
    }

    const decks = decksData?.data || []

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                        <BrainCircuit className="size-8 text-primary" />
                        Neural Memory Banks
                    </h1>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] pl-1">
                        Long-term retention protocols active. SRS Algorithms ready.
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="SEARCH DATA BANKS..."
                            className="pl-10 h-12 rounded-2xl bg-muted/5 border-white/5 focus:bg-background/80 transition-all font-bold uppercase tracking-wider text-[10px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                        <Plus className="size-4 mr-2" />
                        Initialize Deck
                    </Button>
                </div>
            </div>

            {/* Decks Grid */}
            {decks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-[3rem] bg-white/5">
                    <div className="p-6 rounded-full bg-muted/10 mb-6">
                        <Layers className="size-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight italic text-muted-foreground/50">No Data Banks Found</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mt-2">Initialize a new memory bank to begin retention protocols.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map((deck) => (
                        <Link href={`/dashboard/flashcards/${deck.id}`} key={deck.id}>
                            <Card className="group relative overflow-hidden transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 bg-background/40 backdrop-blur-xl border-white/5 rounded-[2rem] h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="p-6 space-y-6 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                            <Sparkles className="size-6" />
                                        </div>
                                        <div className="flex items-start gap-2">
                                            {deck.jlptLevel && (
                                                <span className="px-3 py-1 rounded-full bg-muted/10 border border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                    {deck.jlptLevel}
                                                </span>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                    <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-muted/20">
                                                        <MoreVertical className="size-4 text-muted-foreground/40" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl bg-background/90 backdrop-blur-3xl p-1">
                                                    <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider rounded-lg p-2 cursor-pointer">
                                                        <Edit className="size-3 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-wider rounded-lg p-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                        <Trash2 className="size-3 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black uppercase italic tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                                            {deck.name}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground/60 line-clamp-2 min-h-[2.5em]">
                                            {deck.description || "No description provided for this memory bank."}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground/40">
                                            <Layers className="size-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{deck.cardCount} Cards</span>
                                        </div>
                                        {deck.lastStudiedAt && (
                                            <div className="flex items-center gap-2 text-primary/60">
                                                <Clock className="size-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                                    {formatDistanceToNow(new Date(deck.lastStudiedAt))} ago
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
