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
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Security</h3>
            </div>

            <div>
                <Button
                    variant="ghost"
                    className="w-full justify-between h-auto py-3 px-4 hover:bg-muted/50 rounded-lg"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                    <div className="text-left space-y-0.5">
                        <p className="font-medium text-sm">Change Password</p>
                        {user?.lastPasswordChange && (
                            <p className="text-xs text-muted-foreground">
                                Last changed: {formatDate(user.lastPasswordChange)}
                            </p>
                        )}
                    </div>
                    {showPasswordSection ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                </Button>

                {showPasswordSection && (
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 sm:mt-5 lg:mt-6 space-y-4 sm:space-y-5 px-2 sm:px-3 lg:px-4">
                        <div>
                            <Label htmlFor="currentPassword" className="text-sm font-medium">
                                Current Password
                            </Label>
                            <div className="relative mt-2">
                                <Input
                                    id="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    {...register('currentPassword')}
                                    placeholder="Enter current password"
                                    className="pr-10 h-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors?.currentPassword && (
                                <p className="text-xs text-destructive mt-1.5">{errors.currentPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="newPassword" className="text-sm font-medium">
                                New Password
                            </Label>
                            <div className="relative mt-2">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    {...register('newPassword')}
                                    placeholder="Enter new password"
                                    className="pr-10 h-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors?.newPassword && (
                                <p className="text-xs text-destructive mt-1.5">{errors.newPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm New Password
                            </Label>
                            <div className="relative mt-2">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword')}
                                    placeholder="Confirm new password"
                                    className="pr-10 h-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors?.confirmPassword && (
                                <p className="text-xs text-destructive mt-1.5">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
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
                                {isChangingPassword ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
