import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import type { QuestionPoolQueryDTO, QuestionPoolResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useQuestionPools } from "@/api/services/question-pools.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { QuestionJlptLevel } from '@workspace/schemas';
import { Input } from '@workspace/ui/components/input';
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Inbox } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { Badge } from '@workspace/ui/components/badge';
import { MoreHorizontal, Pencil, Trash, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button as UIButton } from '@workspace/ui/components/button';

export default function QuestionPoolsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

    const queryParams: QuestionPoolQueryDTO = {
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as QuestionJlptLevel }),
    };

    const { data: poolsData, isLoading, error } = useQuestionPools(queryParams);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, jlptLevelFilter]);

    const pools = poolsData?.data || [];
    const meta = poolsData ? {
        total: poolsData.total,
        totalPages: poolsData.totalPages,
        page: poolsData.page,
        limit: poolsData.limit
    } : null;

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center text-rose-500 py-8">
                    Error: {error.message}
                </div>
            </div>
        );
    }

    const renderPaginationItems = () => {
        if (!meta) return null;
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(meta.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" />);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        isActive={page === i}
                        onClick={() => setPage(i)}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < meta.totalPages) {
            if (endPage < meta.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" />);
            items.push(
                <PaginationItem key={meta.totalPages}>
                    <PaginationLink onClick={() => setPage(meta.totalPages)}>{meta.totalPages}</PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                <div className="space-y-1 sm:space-y-1.5 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        Question Pools
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Organize questions into pools for courses and lessons.
                    </p>
                </div>
                <Can permission="question_pool.create">
                    <Button
                        onClick={() => {}}
                        className="w-full sm:w-auto rounded-full shadow-sm hover:shadow-md transition-all bg-primary min-h-[44px] px-6"
                    >
                        Create Pool
                    </Button>
                </Can>
            </div>

            <div className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow duration-300 rounded-xl p-0 overflow-hidden">
                <div className="p-6 pb-0">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 peer-focus:text-foreground transition-colors" />
                                <Input
                                    placeholder="Search pools..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80"
                                />
                            </div>
                            <Select
                                value={jlptLevelFilter || 'all'}
                                onValueChange={(value) =>
                                    setJlptLevelFilter(value === 'all' ? '' : value)
                                }
                            >
                                <SelectTrigger className="flex-1 sm:w-[150px] bg-background/50 border-border/40 focus:bg-background transition-all hover:bg-background/80">
                                    <SelectValue placeholder="JLPT Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value={QuestionJlptLevel.N5}>N5</SelectItem>
                                    <SelectItem value={QuestionJlptLevel.N4}>N4</SelectItem>
                                    <SelectItem value={QuestionJlptLevel.N3}>N3</SelectItem>
                                    <SelectItem value={QuestionJlptLevel.N2}>N2</SelectItem>
                                    <SelectItem value={QuestionJlptLevel.N1}>N1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/20">
                                    <TableRow className="border-border/40 hover:bg-transparent">
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">#</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">Name</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">Description</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">JLPT Level</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow key={index} className="border-border/20">
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                                <TableCell className="py-4 px-4">
                                                    <Skeleton className="h-6 w-full bg-muted/40 rounded-md" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : pools.length > 0 ? (
                                        pools.map((pool, index) => (
                                            <TableRow
                                                key={pool.id}
                                                className="border-border/20 hover:bg-muted/30 transition-colors"
                                            >
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap text-center">
                                                    {(page - 1) * 10 + index + 1}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap font-medium">
                                                    {pool.name}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 max-w-[300px] truncate">
                                                    {pool.description || 'N/A'}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap">
                                                    <Badge variant="outline" className="font-normal bg-background/50">
                                                        {pool.jlptLevel || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-sm text-foreground/80 whitespace-nowrap">
                                                    <div className="flex justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <UIButton variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </UIButton>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => {}}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => {}}>
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {}}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center text-muted-foreground border-none"
                                            >
                                                <div className="flex h-full w-full items-center justify-center p-8">
                                                    <Empty>
                                                        <EmptyHeader>
                                                            <EmptyMedia variant="icon" className="text-muted-foreground/30"><Inbox /></EmptyMedia>
                                                            <EmptyTitle>No pools found</EmptyTitle>
                                                            <EmptyDescription>
                                                                Try adjusting your search or create a new pool.
                                                            </EmptyDescription>
                                                        </EmptyHeader>
                                                    </Empty>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {meta && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6 border-t border-border/30 px-4 sm:px-6">
                            <div className="text-xs sm:text-sm text-muted-foreground">
                                Showing <span className="font-semibold text-foreground">{pools.length}</span> of <span className="font-semibold text-foreground">{meta.total}</span> pools
                            </div>

                            {meta.totalPages > 1 && (
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-muted/50 transition-colors"}
                                            />
                                        </PaginationItem>

                                        {renderPaginationItems()}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                                className={page === meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-muted/50 transition-colors"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

