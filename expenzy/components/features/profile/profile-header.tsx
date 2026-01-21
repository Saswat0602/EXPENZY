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
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                <UserAvatar
                    seed={user?.avatarSeed}
                    style={user?.avatarStyle as string | undefined}
                    fallbackUrl={user?.avatar}
                    fallbackName={displayName}
                    size={96}
                    className="ring-4 ring-primary/10 shadow-lg"
                />
                <div className="flex-1 text-center sm:text-left space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{displayName}</h2>
                        <div className="space-y-1.5 text-muted-foreground">
                            <p className="flex items-center gap-2.5 justify-center sm:justify-start text-sm">
                                <Mail className="w-4 h-4 text-primary/70" />
                                <span>{user?.email}</span>
                            </p>
                            {user?.phone && (
                                <p className="flex items-center gap-2.5 justify-center sm:justify-start text-sm">
                                    <Smartphone className="w-4 h-4 text-primary/70" />
                                    <span>{user.phone}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-6 font-medium"
                        onClick={onEditProfile}
                    >
                        Edit Profile
                    </Button>
                </div>
            </div>
        </div>
    );
}
