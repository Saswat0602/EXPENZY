import React from 'react';
import { GroupIcon } from '@/components/ui/group-icon';

interface GroupAvatarProps {
    name: string;
    iconSeed?: string;
    iconProvider?: string;
    imageUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
};

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
    iconSeed,
    iconProvider,
    imageUrl,
    size = 'md',
    className,
}) => {
    const sizeInPixels = sizeMap[size];

    return (
        <GroupIcon
            seed={iconSeed}
            provider={iconProvider as 'jdenticon' | undefined}
            fallbackUrl={imageUrl}
            size={sizeInPixels}
            className={className}
        />
    );
};
