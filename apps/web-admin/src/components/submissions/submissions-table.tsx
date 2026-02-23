import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { Inbox } from 'lucide-react';
import { getSubmissionsColumns } from "./submissions-columns";
import type { SubmissionResponseDTO } from "@workspace/schemas";

interface SubmissionsTableProps {
  data: SubmissionResponseDTO[];
  isLoading: boolean;
  onGrade: (submission: SubmissionResponseDTO) => void;
  onView: (submission: SubmissionResponseDTO) => void;
}

export function SubmissionsTable({
  data,
  isLoading,
  onGrade,
  onView,
}: SubmissionsTableProps) {
  const columns = getSubmissionsColumns({
    onGrade,
    onView,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full overflow-hidden">
      <Table>
        <TableCaption>Danh sách bài nộp của học viên</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-muted-foreground/50 font-sans font-bold italic text-[10px] uppercase tracking-widest text-left">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j} className="py-4">
                    <Skeleton className="h-6 w-full rounded-lg" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="group hover:bg-muted/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4 px-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-[400px] text-center"
              >
                <Empty>
                  <EmptyMedia>
                    <Inbox className="size-8 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyContent>
                    <EmptyTitle>Chưa có bài nộp nào</EmptyTitle>
                    <EmptyDescription>
                      Chưa có học viên nào nộp bài.
                    </EmptyDescription>
                  </EmptyContent>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
