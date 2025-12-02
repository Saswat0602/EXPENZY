'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface VirtualListProps<T> {
    fetchData: (page: number) => Promise<{
        data: T[];
        hasMore: boolean;
        total?: number;
    }>;
    renderItem: (item: T, index: number) => React.ReactNode;
    emptyState?: React.ReactNode;
    loadingState?: React.ReactNode;
    itemsPerPage?: number;
    enableDesktopPagination?: boolean;
    getItemKey: (item: T, index: number) => string;
    dependencies?: unknown[];
}

type LoadingState = 'idle' | 'loading' | 'loading-more' | 'error';

interface PaginationState {
    desktop: number;
    mobile: number;
}

const ITEMS_PER_PAGE = 20;

export function VirtualList<T>({
    fetchData,
    renderItem,
    emptyState,
    loadingState,
    itemsPerPage = ITEMS_PER_PAGE,
    enableDesktopPagination = true,
    getItemKey,
    dependencies = [],
}: VirtualListProps<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ desktop: 1, mobile: 1 });
    const [currentLoadingState, setCurrentLoadingState] = useState<LoadingState>('loading');
    const [metadata, setMetadata] = useState({ total: 0, hasMore: true });

    const abortControllerRef = useRef<AbortController | null>(null);
    const prevDepsRef = useRef<string>('');
    const isMountedRef = useRef(true);

    const loadData = useCallback(async (page: number, mode: 'initial' | 'append') => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setCurrentLoadingState(mode === 'initial' ? 'loading' : 'loading-more');

        try {
            const result = await fetchData(page);

            if (!isMountedRef.current) return;

            setItems(prev => mode === 'append' ? [...prev, ...result.data] : result.data);
            setPagination(prev => ({
                ...prev,
                mobile: mode === 'append' ? page : 1,
            }));
            setMetadata({
                total: result.total ?? result.data.length,
                hasMore: result.hasMore,
            });
            setCurrentLoadingState('idle');
        } catch (error) {
            if (!isMountedRef.current) return;

            console.error('Failed to load data:', error);

            if (mode === 'initial') {
                setItems([]);
            }
            setCurrentLoadingState('error');
        } finally {
            abortControllerRef.current = null;
        }
    }, [fetchData]);

    const depsString = JSON.stringify(dependencies);
    if (prevDepsRef.current !== depsString) {
        prevDepsRef.current = depsString;
        setPagination({ desktop: 1, mobile: 1 });
        loadData(1, 'initial');
    }

    const handleLoadMore = useCallback(() => {
        if (!metadata.hasMore || currentLoadingState === 'loading-more') return;
        loadData(pagination.mobile + 1, 'append');
    }, [metadata.hasMore, currentLoadingState, pagination.mobile, loadData]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, desktop: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const desktopData = useMemo(() => {
        const start = (pagination.desktop - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return {
            items: items.slice(start, end),
            start,
            end,
            totalPages: Math.ceil(metadata.total / itemsPerPage),
        };
    }, [items, pagination.desktop, itemsPerPage, metadata.total]);

    const pageNumbers = useMemo(() => {
        const { totalPages } = desktopData;
        const current = pagination.desktop;
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (current <= 3) {
            return [1, 2, 3, 4, '...', totalPages];
        }

        if (current >= totalPages - 2) {
            return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, '...', current - 1, current, current + 1, '...', totalPages];
    }, [pagination.desktop, desktopData]);

    if (currentLoadingState === 'loading' && items.length === 0) {
        return loadingState || (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading items...</p>
                </div>
            </div>
        );
    }

    if (currentLoadingState !== 'loading' && items.length === 0) {
        return emptyState || (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-medium">No items found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search criteria</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {enableDesktopPagination && (
                <div className="hidden md:block">
                    {metadata.total > 0 && (
                        <p className="mb-4 text-sm text-muted-foreground">
                            Showing {desktopData.start + 1}-{Math.min(desktopData.end, metadata.total)} of {metadata.total}
                        </p>
                    )}

                    <div className="space-y-2">
                        {desktopData.items.map((item, idx) => (
                            <div key={getItemKey(item, desktopData.start + idx)}>
                                {renderItem(item, desktopData.start + idx)}
                            </div>
                        ))}
                    </div>

                    {desktopData.totalPages > 1 && (
                        <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.desktop - 1)}
                                disabled={pagination.desktop === 1}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {pageNumbers.map((page, idx) =>
                                    page === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                            ...
                                        </span>
                                    ) : (
                                        <Button
                                            key={page}
                                            variant={pagination.desktop === page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(page as number)}
                                            className="min-w-[40px]"
                                            aria-label={`Page ${page}`}
                                            aria-current={pagination.desktop === page ? 'page' : undefined}
                                        >
                                            {page}
                                        </Button>
                                    )
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.desktop + 1)}
                                disabled={pagination.desktop === desktopData.totalPages}
                                aria-label="Next page"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </nav>
                    )}
                </div>
            )}

            <div className={enableDesktopPagination ? 'md:hidden' : ''}>
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <div key={getItemKey(item, idx)}>
                            {renderItem(item, idx)}
                        </div>
                    ))}
                </div>

                {metadata.hasMore && (
                    <div className="mt-4">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={currentLoadingState === 'loading-more'}
                            className="w-full"
                            aria-label="Load more items"
                        >
                            {currentLoadingState === 'loading-more' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    Loading more...
                                </span>
                            ) : (
                                'Show More'
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}