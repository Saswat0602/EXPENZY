'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    changePasswordSchema,
    type ChangePasswordFormData,
} from '@/lib/validations/profile.schema';
import { formatDate } from '@/lib/utils/format';
import type { User } from '@/types/user';

interface SecuritySettingsProps {
    user: User | undefined;
    onPasswordChange: (data: ChangePasswordFormData) => Promise<void>;
    isChangingPassword: boolean;
}

export function SecuritySettings({ user, onPasswordChange, isChangingPassword }: SecuritySettingsProps) {
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = async (data: ChangePasswordFormData) => {
        await onPasswordChange(data);
        reset();
        setShowPasswordSection(false);
    };

    return (
        <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-base">Security</h3>
            </div>

            <div className="space-y-1 pl-1">
                <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-2 px-0 border-none bg-transparent hover:bg-transparent shadow-none"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                    <div className="flex items-center gap-3">
                        <div className="text-left">
                            <p className="font-medium text-sm">Change Password</p>
                            {user?.lastPasswordChange && (
                                <p className="text-[11px] text-muted-foreground">
                                    Last changed: {formatDate(user.lastPasswordChange)}
                                </p>
                            )}
                        </div>
                    </div>
                    {showPasswordSection ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </Button>

                {showPasswordSection && (
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4 pl-1">
                        <div>
                            <Label htmlFor="currentPassword" className="text-xs font-medium">
                                Current Password
                            </Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    {...register('currentPassword')}
                                    placeholder="Enter current password"
                                    className="pr-10 h-8 text-sm bg-muted/30 border-none shadow-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            {errors?.currentPassword && (
                                <p className="text-xs text-destructive mt-1">{errors.currentPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="newPassword" className="text-xs font-medium">
                                New Password
                            </Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    {...register('newPassword')}
                                    placeholder="Enter new password"
                                    className="pr-10 h-8 text-sm bg-muted/30 border-none shadow-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            {errors?.newPassword && (
                                <p className="text-xs text-destructive mt-1">{errors.newPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword" className="text-xs font-medium">
                                Confirm New Password
                            </Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword')}
                                    placeholder="Confirm new password"
                                    className="pr-10 h-8 text-sm bg-muted/30 border-none shadow-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            {errors?.confirmPassword && (
                                <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    reset();
                                    setShowPasswordSection(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={isChangingPassword}>
                                {isChangingPassword ? 'Changing...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
