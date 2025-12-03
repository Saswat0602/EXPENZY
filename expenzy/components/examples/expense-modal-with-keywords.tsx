/**
 * Example: Expense Modal with Keyword Matching and Icon Suggestions
 * 
 * This shows how to integrate:
 * 1. Keyword matcher for instant suggestions
 * 2. Category icons from Lucide React
 * 3. Real-time category suggestions as user types
 */

'use client';

import { useState, useEffect } from 'react';
import { useKeywordMatcher } from '@/lib/categorization/keyword-matcher';
import { CategoryIcon, getCategoryLabel } from '@/lib/categorization/category-icons';
import { getCategoryOptions } from '@/lib/categorization/category-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';

export function ExpenseModalExample() {
    const { match, isReady } = useKeywordMatcher();
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string>('');
    const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

    // Match keywords as user types
    useEffect(() => {
        if (isReady && description) {
            const matched = match(description);
            setSuggestedCategory(matched);
        } else {
            setSuggestedCategory(null);
        }
    }, [description, isReady, match]);

    // Auto-select suggested category if user hasn't chosen one
    useEffect(() => {
        if (suggestedCategory && !category) {
            setCategory(suggestedCategory);
        }
    }, [suggestedCategory, category]);

    const categoryOptions = getCategoryOptions();

    return (
        <div className="space-y-4">
            {/* Description Input with Instant Suggestion */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Paid rent, Bought groceries, Uber to office"
                    className="w-full"
                />

                {/* Instant Suggestion Badge */}
                {suggestedCategory && (
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-secondary/30 border border-secondary">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                            Suggested category:
                        </span>
                        <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary"
                            onClick={() => setCategory(suggestedCategory)}
                        >
                            <CategoryIcon
                                category={suggestedCategory}
                                className="h-3 w-3 mr-1"
                            />
                            {getCategoryLabel(suggestedCategory)}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Category Select with Icons */}
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category">
                            {category && (
                                <div className="flex items-center gap-2">
                                    <CategoryIcon category={category} className="h-4 w-4" />
                                    <span>{getCategoryLabel(category)}</span>
                                </div>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {categoryOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${option.color}`} />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{option.label}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {option.description}
                                            </span>
                                        </div>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* Amount, Date, etc. - rest of your form */}
        </div>
    );
}

/**
 * Usage in your actual modal:
 * 
 * import { ExpenseModalExample } from '@/components/examples/expense-modal-example';
 * 
 * Or integrate the logic directly into your existing modal:
 * - Import useKeywordMatcher hook
 * - Import CategoryIcon and helper functions
 * - Add the suggestion badge UI
 * - Update category select to show icons
 */
