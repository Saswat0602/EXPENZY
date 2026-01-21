'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Filter, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import type { Category } from '@/types/category';

export interface TransactionFilters {
    categories: string[];
    dateRange: {
        from: Date | null;
        to: Date | null;
    };
    amountRange: {
        min: number;
        max: number;
    };
    sortBy: 'date' | 'amount' | 'category';
    sortOrder: 'asc' | 'desc';
}

interface TransactionFiltersProps {
    filters: TransactionFilters;
    onFiltersChange: (filters: TransactionFilters) => void;
    categories: Category[];
    maxAmount?: number;
}

export function TransactionFiltersComponent({
    filters,
    onFiltersChange,
    categories,
    maxAmount = 10000,
}: TransactionFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters =
        filters.categories.length > 0 ||
        filters.dateRange.from !== null ||
        filters.dateRange.to !== null ||
        filters.amountRange.min > 0 ||
        filters.amountRange.max < maxAmount;

    const clearFilters = () => {
        onFiltersChange({
            categories: [],
            dateRange: { from: null, to: null },
            amountRange: { min: 0, max: maxAmount },
            sortBy: 'date',
            sortOrder: 'desc',
        });
    };

    const toggleCategory = (categoryId: string) => {
        const newCategories = filters.categories.includes(categoryId)
            ? filters.categories.filter((id) => id !== categoryId)
            : [...filters.categories, categoryId];
        onFiltersChange({ ...filters, categories: newCategories });
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">
                            {filters.categories.length +
                                (filters.dateRange.from ? 1 : 0) +
                                (filters.amountRange.min > 0 || filters.amountRange.max < maxAmount ? 1 : 0)}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Filters</h3>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                        <Label>Categories</Label>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {categories.map((category) => (
                                <label
                                    key={category.id}
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category.id)}
                                        onChange={() => toggleCategory(category.id)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">{category.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'justify-start text-left font-normal',
                                            !filters.dateRange.from && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateRange.from ? (
                                            format(filters.dateRange.from, 'PP')
                                        ) : (
                                            <span>From</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={filters.dateRange.from || undefined}
                                        onSelect={(date) =>
                                            onFiltersChange({
                                                ...filters,
                                                dateRange: { ...filters.dateRange, from: date || null },
                                            })
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'justify-start text-left font-normal',
                                            !filters.dateRange.to && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateRange.to ? (
                                            format(filters.dateRange.to, 'PP')
                                        ) : (
                                            <span>To</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={filters.dateRange.to || undefined}
                                        onSelect={(date) =>
                                            onFiltersChange({
                                                ...filters,
                                                dateRange: { ...filters.dateRange, to: date || null },
                                            })
                                        }
                                        disabled={(date) =>
                                            filters.dateRange.from ? date < filters.dateRange.from : false
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Amount Range */}
                    <div className="space-y-2">
                        <Label>Amount Range</Label>
                        <div className="px-2">
                            <Slider
                                min={0}
                                max={maxAmount}
                                step={10}
                                value={[filters.amountRange.min, filters.amountRange.max]}
                                onValueChange={([min, max]) =>
                                    onFiltersChange({
                                        ...filters,
                                        amountRange: { min, max },
                                    })
                                }
                                className="mb-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>₹{filters.amountRange.min}</span>
                                <span>₹{filters.amountRange.max}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="space-y-2">
                        <Label>Sort By</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={filters.sortBy}
                                onChange={(e) =>
                                    onFiltersChange({
                                        ...filters,
                                        sortBy: e.target.value as TransactionFilters['sortBy'],
                                    })
                                }
                                className="px-3 py-2 border rounded-md text-sm"
                            >
                                <option value="date">Date</option>
                                <option value="amount">Amount</option>
                                <option value="category">Category</option>
                            </select>

                            <select
                                value={filters.sortOrder}
                                onChange={(e) =>
                                    onFiltersChange({
                                        ...filters,
                                        sortOrder: e.target.value as TransactionFilters['sortOrder'],
                                    })
                                }
                                className="px-3 py-2 border rounded-md text-sm"
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
