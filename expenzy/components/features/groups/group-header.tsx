import React from 'react';
import { ArrowLeft, Settings, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GroupAvatar } from './group-avatar';

interface GroupHeaderProps {
    groupId: string;
    name: string;
    description?: string;
    icon?: 'home' | 'trip' | 'couple' | 'friends' | 'work' | 'shopping' | 'other';
    memberCount: number;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
    groupId,
    name,
    description,
    icon,
    memberCount,
}) => {
    const router = useRouter();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/dashboard/groups')}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/groups/${groupId}/settings`)}
                >
                    <Settings className="h-6 w-6" />
                </Button>
            </div>

            <div className="flex items-start gap-4">
                <GroupAvatar name={name} icon={icon} size="xl" />

                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-bold mb-2 truncate">{name}</h1>

                    {description && (
                        <p className="text-muted-foreground mb-3">{description}</p>
                    )}

                    <Badge variant="secondary" className="gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </Badge>
                </div>
            </div>
        </div>
    );
};
