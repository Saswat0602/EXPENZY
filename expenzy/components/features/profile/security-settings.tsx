'use client';

import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
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
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-muted/50 p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Security</h3>
                        <p className="text-sm text-muted-foreground">Account security settings</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <Button
                    variant="outline"
                    className="w-full justify-between h-auto p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                    <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4" />
                        <div className="text-left">
                            <p className="font-medium text-sm">Change Password</p>
                            {user?.lastPasswordChange && (
                                <p className="text-xs text-muted-foreground">
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
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 p-5 border border-border rounded-lg bg-muted/20">
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
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-sm text-destructive mt-1">{errors.currentPassword.message}</p>
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
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>
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
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    reset();
                                    setShowPasswordSection(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isChangingPassword}>
                                {isChangingPassword ? 'Changing...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
