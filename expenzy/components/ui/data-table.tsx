'use client';

import { ReactNode } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export interface DataTableColumn<T> {
    key: string;
    header: string;
    render: (item: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    getRowId: (item: T) => string;
}

export function DataTable<T>({
    data,
    columns,
    onEdit,
    onDelete,
    isLoading,
    emptyMessage = 'No data available',
    getRowId,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                <p className="text-lg font-medium mb-1">No data found</p>
                <p className="text-sm">{emptyMessage}</p>
            </div>
        );
    }

    const showActions = onEdit || onDelete;

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                            {showActions && <TableHead className="w-[100px]">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={getRowId(item)} className="hover:bg-accent/5">
                                {columns.map((column) => (
                                    <TableCell key={column.key} className={column.className}>
                                        {column.render(item)}
                                    </TableCell>
                                ))}
                                {showActions && (
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="p-2 hover:bg-muted rounded-md transition-colors"
                                                    aria-label="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2">
                {data.map((item) => (
                    <div
                        key={getRowId(item)}
                        className="bg-card border border-border rounded-lg p-4 space-y-3"
                    >
                        {columns.map((column) => (
                            <div key={column.key} className="flex justify-between items-start gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {column.header}:
                                </span>
                                <div className="text-sm text-right flex-1">{column.render(item)}</div>
                            </div>
                        ))}
                        {showActions && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors text-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(item)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md transition-colors text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}
