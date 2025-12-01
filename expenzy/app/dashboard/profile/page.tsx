'use client';

import { useState } from 'react';
import { useProfile, useChangePassword, useUpdateProfile } from '@/lib/hooks/use-profile';
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-settings';
import { useAuth } from '@/contexts/auth-context';
import { EditProfileModal } from '@/components/modals/edit-profile-modal';
import { DeleteAccountModal } from '@/components/modals/delete-account-modal';
import {
    ProfileHeader,
    AppearanceSettings,
    PreferencesSettings,
    NotificationSettings,
    DataPrivacySettings,
    SecuritySettings,
    DangerZone,
} from '@/components/features/profile';
import type { ChangePasswordFormData } from '@/lib/validations/profile.schema';

export default function ProfilePage() {
    const { logout } = useAuth();
    const { data: user, isLoading: userLoading } = useProfile();
    const { data: settings, isLoading: settingsLoading } = useSettings();
    const updateSettings = useUpdateSettings();
    const updateProfile = useUpdateProfile();
    const changePassword = useChangePassword();

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

    const handleSettingChange = async (key: string, value: string) => {
        await updateSettings.mutateAsync({ [key]: value });
    };

    const handleToggle = async (key: string, value: boolean) => {
        await updateSettings.mutateAsync({ [key]: value });
    };

    const handleCurrencyChange = (currency: string) => {
        updateProfile.mutate({ defaultCurrency: currency });
    };

    const handlePasswordChange = async (data: ChangePasswordFormData) => {
        await changePassword.mutateAsync({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    };

    if (userLoading || settingsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold">Profile & Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>

            {/* Profile Header */}
            <ProfileHeader user={user} onEditProfile={() => setIsEditProfileOpen(true)} />

            {/* Settings Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                <AppearanceSettings settings={settings} onSettingChange={handleSettingChange} />
                <PreferencesSettings user={user} onCurrencyChange={handleCurrencyChange} />
                <NotificationSettings settings={settings} onToggle={handleToggle} />
                <DataPrivacySettings
                    settings={settings}
                    onSettingChange={handleSettingChange}
                    onToggle={handleToggle}
                />
            </div>

            {/* Security - Full Width */}
            <SecuritySettings
                user={user}
                onPasswordChange={handlePasswordChange}
                isChangingPassword={changePassword.isPending}
            />

            {/* Danger Zone */}
            <DangerZone
                onLogout={logout}
                onDeleteAccount={() => setIsDeleteAccountOpen(true)}
            />

            {/* Modals */}
            <EditProfileModal
                open={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
            />
            <DeleteAccountModal
                open={isDeleteAccountOpen}
                onClose={() => setIsDeleteAccountOpen(false)}
            />
        </div>
    );
}
