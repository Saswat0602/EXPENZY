'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteAccount } from '@/lib/hooks/use-profile';
import { useAuth } from '@/contexts/auth-context';
import {
    deleteAccountSchema,
    type DeleteAccountFormData,
} from '@/lib/validations/profile.schema';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface DeleteAccountModalProps {
    open: boolean;
    onClose: () => void;
}

export function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
    const deleteAccount = useDeleteAccount();
    const { logout } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<DeleteAccountFormData>({
        resolver: zodResolver(deleteAccountSchema),
    });

    const confirmation = useWatch({ control, name: 'confirmation' });
    const isConfirmationValid =
        confirmation?.toLowerCase() === 'delete my account';

    const onSubmit = async (data: DeleteAccountFormData) => {
        await deleteAccount.mutateAsync(data);
        reset();
        onClose();
        // Logout and redirect to login page
        setTimeout(() => {
            logout();
        }, 1000);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Delete Account
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
                        <h4 className="font-semibold text-destructive mb-2">
                            Warning: This action cannot be undone
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Deleting your account will permanently remove:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                            <li>All your transactions and expenses</li>
                            <li>All budgets and savings goals</li>
                            <li>All subscriptions and recurring payments</li>
                            <li>All tags and categories</li>
                            <li>Your profile and settings</li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="confirmation">
                                Type <span className="font-mono font-semibold">delete my account</span> to confirm
                            </Label>
                            <Input
                                id="confirmation"
                                {...register('confirmation')}
                                placeholder="delete my account"
                                className={
                                    errors.confirmation
                                        ? 'border-destructive'
                                        : isConfirmationValid
                                            ? 'border-success'
                                            : ''
                                }
                            />
                            {errors.confirmation && (
                                <p className="text-sm text-destructive mt-1">
                                    {errors.confirmation.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Confirm your password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={deleteAccount.isPending || !isConfirmationValid}
                            >
                                {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
