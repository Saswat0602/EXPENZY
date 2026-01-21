import React from 'react';
import { ArrowLeft, Settings, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GroupIcon } from '@/components/ui/group-icon';

interface GroupHeaderProps {
    groupId: string;
    name: string;
    description?: string;
    iconSeed?: string;
    iconProvider?: string;
    imageUrl?: string;
    memberCount: number;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
    groupId,
    name,
    description,
    iconSeed,
    iconProvider,
    imageUrl,
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
                    className="h-10 w-10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/groups/${groupId}/settings`)}
                    className="h-10 w-10"
                >
                    <Settings className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex items-start gap-4">
                <GroupIcon
                    seed={iconSeed}
                    provider={iconProvider as 'jdenticon' | undefined}
                    fallbackUrl={imageUrl}
                    size={80}
                />

                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-bold mb-2 truncate">{name}</h1>

                    {description && (
                        <p className="text-muted-foreground mb-3">{description}</p>
                    )}

                    <Badge variant="outline" className="gap-1.5 bg-muted/30 border-muted">
                        <Users className="h-3.5 w-3.5" />
                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </Badge>
                </div>
            </div>
        </div>
    );
};
