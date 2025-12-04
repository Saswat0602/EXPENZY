import React from 'react';
import { Home, Plane, Heart, Users, Briefcase, ShoppingBag, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { generateGroupColor, getGroupInitials } from '@/lib/utils/balance-utils';

interface GroupAvatarProps {
    name: string;
    icon?: 'home' | 'trip' | 'couple' | 'friends' | 'work' | 'shopping' | 'other';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const iconMap = {
    home: Home,
    trip: Plane,
    couple: Heart,
    friends: Users,
    work: Briefcase,
    shopping: ShoppingBag,
    other: Coffee,
};

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
    xl: 'h-20 w-20 text-lg',
};

const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
};

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
    name,
    icon,
    size = 'md',
    className,
}) => {
    const bgColor = generateGroupColor(name);
    const Icon = icon ? iconMap[icon] : null;
    const initials = getGroupInitials(name);

    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-full font-semibold text-white shrink-0',
                bgColor,
                sizeClasses[size],
                className
            )}
        >
            {Icon ? (
                <Icon className={iconSizeClasses[size]} />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
};
