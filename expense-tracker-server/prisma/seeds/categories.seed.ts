import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
    console.log('📁 Seeding system categories...');

    const systemCategories: Array<{
        name: string;
        icon: string;
        color: string;
        type: 'EXPENSE' | 'INCOME' | 'GROUP';
    }> = [
            // Expense Categories
            { name: 'food', icon: 'Utensils', color: 'text-orange-500', type: 'EXPENSE' },
            { name: 'beverages', icon: 'Coffee', color: 'text-amber-600', type: 'EXPENSE' },
            { name: 'groceries', icon: 'ShoppingBasket', color: 'text-green-500', type: 'EXPENSE' },
            { name: 'travel', icon: 'Plane', color: 'text-blue-500', type: 'EXPENSE' },
            { name: 'bills', icon: 'Receipt', color: 'text-yellow-500', type: 'EXPENSE' },
            { name: 'entertainment', icon: 'Film', color: 'text-pink-500', type: 'EXPENSE' },
            { name: 'shopping', icon: 'ShoppingBag', color: 'text-purple-500', type: 'EXPENSE' },
            { name: 'health', icon: 'HeartPulse', color: 'text-red-500', type: 'EXPENSE' },
            { name: 'education', icon: 'GraduationCap', color: 'text-cyan-500', type: 'EXPENSE' },
            { name: 'investments', icon: 'TrendingUp', color: 'text-teal-500', type: 'EXPENSE' },
            { name: 'fees', icon: 'HandCoins', color: 'text-amber-600', type: 'EXPENSE' },
            { name: 'home', icon: 'Home', color: 'text-indigo-500', type: 'EXPENSE' },
            { name: 'fuel', icon: 'Fuel', color: 'text-slate-600', type: 'EXPENSE' },
            { name: 'personal_care', icon: 'Sparkles', color: 'text-pink-400', type: 'EXPENSE' },
            { name: 'kids_family', icon: 'Baby', color: 'text-rose-400', type: 'EXPENSE' },
            { name: 'insurance', icon: 'ShieldCheck', color: 'text-blue-600', type: 'EXPENSE' },
            { name: 'taxes', icon: 'Landmark', color: 'text-slate-700', type: 'EXPENSE' },
            { name: 'subscriptions', icon: 'PlaySquare', color: 'text-purple-600', type: 'EXPENSE' },
            { name: 'electronics', icon: 'Laptop', color: 'text-gray-600', type: 'EXPENSE' },
            { name: 'repairs_maintenance', icon: 'Wrench', color: 'text-orange-600', type: 'EXPENSE' },
            { name: 'fitness_sports', icon: 'Dumbbell', color: 'text-emerald-500', type: 'EXPENSE' },
            { name: 'charity', icon: 'HeartHandshake', color: 'text-red-400', type: 'EXPENSE' },
            { name: 'business_work', icon: 'Briefcase', color: 'text-slate-500', type: 'EXPENSE' },
            { name: 'gifts', icon: 'Gift', color: 'text-pink-500', type: 'EXPENSE' },
            { name: 'events', icon: 'PartyPopper', color: 'text-yellow-400', type: 'EXPENSE' },
            { name: 'transport', icon: 'Bus', color: 'text-blue-400', type: 'EXPENSE' },
            { name: 'rent', icon: 'KeyRound', color: 'text-indigo-600', type: 'EXPENSE' },
            { name: 'utilities', icon: 'Droplets', color: 'text-cyan-600', type: 'EXPENSE' },
            { name: 'dining_out', icon: 'ChefHat', color: 'text-orange-400', type: 'EXPENSE' },
            { name: 'online_services', icon: 'Cloud', color: 'text-sky-500', type: 'EXPENSE' },
            { name: 'loans_credit', icon: 'CreditCard', color: 'text-red-600', type: 'EXPENSE' },
            { name: 'other', icon: 'MoreHorizontal', color: 'text-gray-500', type: 'EXPENSE' },

            // Income Categories
            { name: 'salary', icon: 'Banknote', color: 'text-green-600', type: 'INCOME' },
            { name: 'freelance', icon: 'Briefcase', color: 'text-blue-600', type: 'INCOME' },
            { name: 'business', icon: 'Building', color: 'text-slate-600', type: 'INCOME' },
            { name: 'investment', icon: 'TrendingUp', color: 'text-teal-600', type: 'INCOME' },

            // Group Categories
            { name: 'rent', icon: 'KeyRound', color: 'text-indigo-600', type: 'GROUP' },
            { name: 'utilities', icon: 'Droplets', color: 'text-cyan-600', type: 'GROUP' },
            { name: 'groceries', icon: 'ShoppingBasket', color: 'text-green-500', type: 'GROUP' },
            { name: 'household', icon: 'Home', color: 'text-blue-500', type: 'GROUP' },
            { name: 'internet_cable', icon: 'Wifi', color: 'text-purple-500', type: 'GROUP' },
            { name: 'cleaning', icon: 'Sparkles', color: 'text-pink-400', type: 'GROUP' },
            { name: 'furniture', icon: 'Sofa', color: 'text-amber-600', type: 'GROUP' },
            { name: 'repairs', icon: 'Wrench', color: 'text-orange-600', type: 'GROUP' },
            { name: 'entertainment', icon: 'Film', color: 'text-pink-500', type: 'GROUP' },
            { name: 'dining', icon: 'ChefHat', color: 'text-orange-400', type: 'GROUP' },
            { name: 'transportation', icon: 'Bus', color: 'text-blue-400', type: 'GROUP' },
            { name: 'other', icon: 'MoreHorizontal', color: 'text-gray-500', type: 'GROUP' },
        ];

    const createdCategories: Array<{
        id: string;
        name: string;
        icon: string | null;
        color: string | null;
        type: 'EXPENSE' | 'INCOME' | 'GROUP';
        isSystem: boolean;
    }> = [];
    for (const cat of systemCategories) {
        // Find existing category by name and type
        const existing = await prisma.category.findFirst({
            where: {
                name: cat.name,
                type: cat.type,
                isSystem: true,
            },
        });

        const category = existing
            ? await prisma.category.update({
                where: { id: existing.id },
                data: {
                    icon: cat.icon,
                    color: cat.color,
                },
            })
            : await prisma.category.create({
                data: {
                    ...cat,
                    isSystem: true,
                },
            });

        createdCategories.push(category);
    }

    console.log(`✅ Upserted ${createdCategories.length} system categories`);

    const categoryLookup = createdCategories.reduce<Record<string, { id: string; name: string; type: string }>>(
        (acc, category) => {
            acc[`${category.type}:${category.name}`] = {
                id: category.id,
                name: category.name,
                type: category.type,
            };
            return acc;
        },
        {},
    );

    return categoryLookup;
}
