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
    PawPrint,
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
    type LucideIcon,
} from 'lucide-react';
import { createElement } from 'react';

export type CategoryType =
    | 'food'
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
    | 'pets'
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

export interface CategoryConfig {
    icon: LucideIcon;
    color: string; // Tailwind color class
    label: string;
    description: string;
}

export const CATEGORY_ICONS: Record<CategoryType, CategoryConfig> = {
    food: {
        icon: Utensils,
        color: 'text-orange-500',
        label: 'Food',
        description: 'Food and meals',
    },
    groceries: {
        icon: ShoppingBasket,
        color: 'text-green-500',
        label: 'Groceries',
        description: 'Supermarkets, vegetables, fruits, daily essentials',
    },
    travel: {
        icon: Plane,
        color: 'text-blue-500',
        label: 'Travel',
        description: 'Flights, hotels, vacation',
    },
    bills: {
        icon: Receipt,
        color: 'text-yellow-500',
        label: 'Bills',
        description: 'Monthly bills and payments',
    },
    entertainment: {
        icon: Film,
        color: 'text-pink-500',
        label: 'Entertainment',
        description: 'Movies, Netflix, Spotify, concerts',
    },
    shopping: {
        icon: ShoppingBag,
        color: 'text-purple-500',
        label: 'Shopping',
        description: 'Online shopping, clothes',
    },
    health: {
        icon: HeartPulse,
        color: 'text-red-500',
        label: 'Health',
        description: 'Pharmacy, hospital, doctor visits',
    },
    education: {
        icon: GraduationCap,
        color: 'text-cyan-500',
        label: 'Education',
        description: 'Tuition, courses, books, certifications',
    },
    investments: {
        icon: TrendingUp,
        color: 'text-teal-500',
        label: 'Investments',
        description: 'Stocks, mutual funds',
    },
    fees: {
        icon: HandCoins,
        color: 'text-amber-600',
        label: 'Fees',
        description: 'Service fees, charges',
    },
    home: {
        icon: Home,
        color: 'text-indigo-500',
        label: 'Home',
        description: 'Home expenses',
    },
    fuel: {
        icon: Fuel,
        color: 'text-slate-600',
        label: 'Fuel',
        description: 'Petrol, diesel, gas',
    },
    personal_care: {
        icon: Sparkles,
        color: 'text-pink-400',
        label: 'Personal Care',
        description: 'Salon, spa, grooming',
    },
    pets: {
        icon: PawPrint,
        color: 'text-amber-500',
        label: 'Pets',
        description: 'Pet food, vet, grooming',
    },
    kids_family: {
        icon: Baby,
        color: 'text-rose-400',
        label: 'Kids & Family',
        description: 'Children expenses, family',
    },
    insurance: {
        icon: ShieldCheck,
        color: 'text-blue-600',
        label: 'Insurance',
        description: 'Health, life, vehicle insurance',
    },
    taxes: {
        icon: Landmark,
        color: 'text-slate-700',
        label: 'Taxes',
        description: 'Income tax, property tax',
    },
    subscriptions: {
        icon: PlaySquare,
        color: 'text-purple-600',
        label: 'Subscriptions',
        description: 'Monthly subscriptions',
    },
    electronics: {
        icon: Laptop,
        color: 'text-gray-600',
        label: 'Electronics',
        description: 'Gadgets, devices',
    },
    repairs_maintenance: {
        icon: Wrench,
        color: 'text-orange-600',
        label: 'Repairs & Maintenance',
        description: 'Repairs, maintenance',
    },
    fitness_sports: {
        icon: Dumbbell,
        color: 'text-emerald-500',
        label: 'Fitness & Sports',
        description: 'Gym, yoga, sports equipment',
    },
    charity: {
        icon: HeartHandshake,
        color: 'text-red-400',
        label: 'Charity',
        description: 'Donations, charity',
    },
    business_work: {
        icon: Briefcase,
        color: 'text-slate-500',
        label: 'Business & Work',
        description: 'Work expenses',
    },
    gifts: {
        icon: Gift,
        color: 'text-pink-500',
        label: 'Gifts',
        description: 'Presents, gifts',
    },
    events: {
        icon: PartyPopper,
        color: 'text-yellow-400',
        label: 'Events',
        description: 'Parties, celebrations',
    },
    transport: {
        icon: Bus,
        color: 'text-blue-400',
        label: 'Transport',
        description: 'Public transport, taxi',
    },
    rent: {
        icon: KeyRound,
        color: 'text-indigo-600',
        label: 'Rent',
        description: 'House rent',
    },
    utilities: {
        icon: Droplets,
        color: 'text-cyan-600',
        label: 'Utilities',
        description: 'Water, electricity, gas',
    },
    dining_out: {
        icon: ChefHat,
        color: 'text-orange-400',
        label: 'Dining Out',
        description: 'Restaurants, cafes',
    },
    online_services: {
        icon: Cloud,
        color: 'text-sky-500',
        label: 'Online Services',
        description: 'Cloud services, online tools',
    },
    loans_credit: {
        icon: CreditCard,
        color: 'text-red-600',
        label: 'Loans & Credit',
        description: 'Loan payments, credit',
    },
    other: {
        icon: MoreHorizontal,
        color: 'text-gray-500',
        label: 'Other',
        description: 'Miscellaneous expenses',
    },
    salary: {
        icon: Banknote,
        color: 'text-green-600',
        label: 'Salary',
        description: 'Monthly salary',
    },
    freelance: {
        icon: Briefcase,
        color: 'text-blue-600',
        label: 'Freelance',
        description: 'Freelance income',
    },
    business: {
        icon: Building,
        color: 'text-slate-600',
        label: 'Business',
        description: 'Business income',
    },
    investment: {
        icon: TrendingUp,
        color: 'text-teal-600',
        label: 'Investment',
        description: 'Investment returns',
    },
};

/**
 * Get icon component for a category
 */
export function getCategoryIcon(category: CategoryType): LucideIcon {
    return CATEGORY_ICONS[category]?.icon || MoreHorizontal;
}

/**
 * Get color class for a category
 */
export function getCategoryColor(category: CategoryType): string {
    return CATEGORY_ICONS[category]?.color || 'text-gray-500';
}

/**
 * Get label for a category
 */
export function getCategoryLabel(category: string): string {
    const categoryType = category as CategoryType;
    return CATEGORY_ICONS[categoryType]?.label || category;
}

/**
 * Get description for a category
 */
export function getCategoryDescription(category: CategoryType): string {
    return CATEGORY_ICONS[category]?.description || 'Miscellaneous expenses';
}

/**
 * Get all categories as array
 */
export function getAllCategories(): CategoryType[] {
    return Object.keys(CATEGORY_ICONS) as CategoryType[];
}

/**
 * Component to render category icon with color
 */
export function CategoryIcon({
    category,
    className = "h-5 w-5"
}: {
    category: string;
    className?: string;
}) {
    const categoryType = category as CategoryType;
    const Icon = getCategoryIcon(categoryType);
    const color = getCategoryColor(categoryType);

    return createElement(Icon, { className: `${className} ${color}` });
}

/**
 * Component to render category badge with icon
 */
export function CategoryBadge({
    category,
    showLabel = true,
}: {
    category: CategoryType;
    showLabel?: boolean;
}) {
    const Icon = getCategoryIcon(category);
    const color = getCategoryColor(category);
    const label = getCategoryLabel(category);

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50">
            {createElement(Icon, { className: `h-4 w-4 ${color}` })}
            {showLabel && (
                <span className="text-sm font-medium">{label}</span>
            )}
        </div>
    );
}
