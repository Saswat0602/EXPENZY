import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LetterAvatar } from '@/components/ui/letter-avatar';

interface MemberAvatarProps {
    name: string;
    avatarSeed?: string;
    avatarStyle?: string;
    isSelected?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showCheckmark?: boolean;
}

const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
};

export function MemberAvatar({
    name,
    avatarSeed,
    avatarStyle,
    isSelected = false,
    onClick,
    size = 'md',
    showCheckmark = true
}: MemberAvatarProps) {
    const pixelSize = sizeMap[size];

    return (
        <div
            onClick={onClick}
            className={cn(
                'relative rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                onClick && 'cursor-pointer hover:scale-105',
                isSelected && showCheckmark && 'ring-2 ring-primary ring-offset-2'
            )}
            style={{ width: pixelSize, height: pixelSize }}
        >
            {isSelected && showCheckmark ? (
                <div className="absolute inset-0 bg-primary/90 rounded-full flex items-center justify-center z-10">
                    <Check className={cn(
                        'text-primary-foreground',
                        size === 'sm' && 'h-4 w-4',
                        size === 'md' && 'h-5 w-5',
                        size === 'lg' && 'h-6 w-6'
                    )} />
                </div>
            ) : avatarSeed ? (
                <UserAvatar
                    seed={avatarSeed}
                    style={avatarStyle}
                    fallbackName={name}
                    size={pixelSize}
                />
            ) : (
                <LetterAvatar
                    name={name}
                    size={pixelSize}
                />
            )}
        </div>
    );
}
