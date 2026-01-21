import { CategoryIcon, formatCategoryName } from '@/lib/categorization/category-icons';
import { CategoryMatch } from '@/lib/categorization/keyword-matcher';
import { cn } from '@/lib/utils/cn';
import { Category } from '@/types';
import { Check } from 'lucide-react';

interface CategorySelectorProps {
    matches: CategoryMatch[];
    selectedCategory?: string;
    onSelect: (categoryKey: string) => void;
    className?: string;
    categories: Category[];
}

export function CategorySelector({ matches, selectedCategory, onSelect, className, categories }: CategorySelectorProps) {
    if (matches.length === 0) return null;

    return (
        <div className={cn('space-y-2', className)}>
            <p className="text-xs text-muted-foreground font-medium">
                Multiple categories detected - choose one:
            </p>
            <div className="grid grid-cols-1 gap-2">
                {matches.map((match) => {
                    const isSelected = selectedCategory === match.category;
                    const isRecommended = match === matches[0]; // First match is highest confidence

                    // Find the full category object from the list
                    const categoryObj = categories.find(c =>
                        c.name.toLowerCase() === match.category.toLowerCase() ||
                        c.name.toLowerCase().includes(match.category.toLowerCase())
                    );

                    return (
                        <button
                            key={match.category}
                            type="button"
                            onClick={() => onSelect(match.category)}
                            className={cn(
                                'relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                                'hover:border-primary/50 hover:bg-primary/5',
                                isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-background'
                            )}
                        >
                            {/* Category Icon */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center">
                                <CategoryIcon
                                    iconName={categoryObj?.icon}
                                    color={categoryObj?.color}
                                    className="w-5 h-5"
                                />
                            </div>

                            {/* Category Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                        {categoryObj ? formatCategoryName(categoryObj.name) : formatCategoryName(match.category)}
                                    </span>
                                    {isRecommended && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                                            Recommended
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Matched: {match.matchedKeywords.slice(0, 3).join(', ')}
                                    {match.matchedKeywords.length > 3 && ` +${match.matchedKeywords.length - 3} more`}
                                </p>
                            </div>

                            {/* Confidence Badge */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <span className={cn(
                                    'text-xs font-medium px-2 py-1 rounded',
                                    match.confidence >= 80
                                        ? 'bg-success/20 text-success'
                                        : match.confidence >= 60
                                            ? 'bg-warning/20 text-warning'
                                            : 'bg-muted text-muted-foreground'
                                )}>
                                    {match.confidence}%
                                </span>
                                {isSelected && (
                                    <Check className="w-5 h-5 text-primary" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
