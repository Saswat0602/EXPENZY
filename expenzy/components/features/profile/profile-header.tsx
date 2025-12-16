'use client';

import { Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import type { User } from '@/types/user';

interface ProfileHeaderProps {
    user: User | undefined;
    onEditProfile: () => void;
}

export function ProfileHeader({ user, onEditProfile }: ProfileHeaderProps) {
    const displayName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.username || 'User';

    return (
        <div className="py-2">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                <UserAvatar
                    seed={user?.avatarSeed}
                    style={user?.avatarStyle as string | undefined}
                    fallbackUrl={user?.avatar}
                    fallbackName={displayName}
                    size={80}
                    className="ring-2 ring-primary/20"
                />
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold mb-1">{displayName}</h2>
                    <div className="space-y-0.5 text-muted-foreground text-sm">
                        <p className="flex items-center gap-2 justify-center md:justify-start">
                            <Mail className="w-3.5 h-3.5" />
                            {user?.email}
                        </p>
                        {user?.phone && (
                            <p className="flex items-center gap-2 justify-center md:justify-start">
                                <Smartphone className="w-3.5 h-3.5" />
                                {user.phone}
                            </p>
                        )}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 h-8" onClick={onEditProfile}>
                        Edit Profile
                    </Button>
                </div>
            </div>
        </div>
    );
}
