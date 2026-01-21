import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAddGroupMember } from '@/lib/hooks/use-groups';

interface AddMemberModalProps {
    groupId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
    groupId,
    open,
    onOpenChange,
}) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
    const addMember = useAddGroupMember();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) return;

        try {
            await addMember.mutateAsync({ groupId, email: email.trim() });
            setEmail('');
            setRole('MEMBER');
            onOpenChange(false);
        } catch {
            // Error handled by the hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Add Member
                    </DialogTitle>
                    <DialogDescription>
                        Invite someone to join this group by entering their email address.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="friend@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={role}
                                onValueChange={(value) => setRole(value as 'ADMIN' | 'MEMBER')}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEMBER">Member</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Admins can manage members and group settings
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={addMember.isPending || !email.trim()}>
                            {addMember.isPending ? 'Adding...' : 'Add Member'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
