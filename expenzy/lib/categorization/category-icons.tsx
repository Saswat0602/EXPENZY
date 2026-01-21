/**
 * Category Icon Mappings using Lucide React Icons
 * 
 * Maps each expense category to a corresponding Lucide icon
 * Use these instead of emojis for better UI consistency
 */

import {
    Utensils,
    ShoppingBasket,
    Plane,
    Receipt,
    Film,
    ShoppingBag,
    HeartPulse,
    GraduationCap,
    TrendingUp,
    HandCoins,
    Home,
    Fuel,
    Sparkles,
    Baby,
    ShieldCheck,
    Landmark,
    PlaySquare,
    Laptop,
    Wrench,
    Dumbbell,
    HeartHandshake,
    Briefcase,
    Gift,
    PartyPopper,
    Bus,
    KeyRound,
    Droplets,
    ChefHat,
    Cloud,
    CreditCard,
    MoreHorizontal,
    Banknote,
    Building,
    Coffee,
    type LucideIcon,
} from 'lucide-react';

export type CategoryType =
    | 'food'
    | 'beverages'
    | 'groceries'
    | 'travel'
    | 'bills'
    | 'entertainment'
    | 'shopping'
    | 'health'
    | 'education'
    | 'investments'
    | 'fees'
    | 'home'
    | 'fuel'
    | 'personal_care'
    | 'kids_family'
    | 'insurance'
    | 'taxes'
    | 'subscriptions'
    | 'electronics'
    | 'repairs_maintenance'
    | 'fitness_sports'
    | 'charity'
    | 'business_work'
    | 'gifts'
    | 'events'
    | 'transport'
    | 'rent'
    | 'utilities'
    | 'dining_out'
    | 'online_services'
    | 'loans_credit'
    | 'other'
    | 'salary'
    | 'freelance'
    | 'business'
    | 'investment';

export const ICON_MAP: Record<string, LucideIcon> = {
    Utensils,
    ShoppingBasket,
    Plane,
    Receipt,
    Film,
    ShoppingBag,
    HeartPulse,
    GraduationCap,
    TrendingUp,
    HandCoins,
    Home,
    Fuel,
    Sparkles,
    Baby,
    ShieldCheck,
    Landmark,
    PlaySquare,
    Laptop,
    Wrench,
    Dumbbell,
    HeartHandshake,
    Briefcase,
    Gift,
    PartyPopper,
    Bus,
    KeyRound,
    Droplets,
    ChefHat,
    Cloud,
    CreditCard,
    MoreHorizontal,
    Banknote,
    Building,
    Coffee,
};

export function getIconByName(iconName: string): LucideIcon {
    return ICON_MAP[iconName] || MoreHorizontal;
}

export function formatCategoryName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
}

export function CategoryIcon({
    iconName,
    color,
    className = "h-5 w-5"
}: {
    iconName?: string;
    color?: string;
    className?: string;
}) {
    const Icon = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : MoreHorizontal;
    const colorClass = color || 'text-gray-500';

    return <Icon className={`${className} ${colorClass}`} />;
}

export function CategoryBadge({
    category,
    showLabel = true,
}: {
    category: { name: string; icon?: string; color?: string };
    showLabel?: boolean;
}) {
    const label = formatCategoryName(category.name);

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50">
            <CategoryIcon iconName={category.icon} color={category.color} className="h-4 w-4" />
            {showLabel && (
                <span className="text-sm font-medium">{label}</span>
            )}
        </div>
    );
}