'use client';

import { useState } from 'react';
import { useProfile, useChangePassword, useUpdateProfile } from '@/lib/hooks/use-profile';
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-settings';
import { useAuth } from '@/contexts/auth-context';
import { EditProfileModal } from '@/components/modals/edit-profile-modal';
import { DeleteAccountModal } from '@/components/modals/delete-account-modal';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
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
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function ProfilePage() {
    const { logout } = useAuth();
    // const { setLayoutVisibility } = useLayout(); // Removed
    const { data: user, isLoading: userLoading } = useProfile();
    const { data: settings, isLoading: settingsLoading } = useSettings();
    const updateSettings = useUpdateSettings();
    const updateProfile = useUpdateProfile();
    const changePassword = useChangePassword();

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    const handleSettingChange = async (key: string, value: string) => {
        await updateSettings.mutateAsync({ [key]: value });
    };

    const handleToggle = async (key: string, value: boolean) => {
        await updateSettings.mutateAsync({ [key]: value });
    };
    // ... (rest of handlers unchanged)

    const handleCurrencyChange = (currency: string) => {
        updateProfile.mutate({ defaultCurrency: currency as 'USD' | 'EUR' | 'INR' });
    };

    const handleTextSizeChange = (textSize: 'small' | 'medium' | 'large') => {
        updateSettings.mutate({ textSize });
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
        <PageWrapper>
            <div className="max-w-5xl mx-auto py-4 sm:py-6 lg:py-8">
                {/* Page Header */}
                <div className="mb-6 sm:mb-8 lg:mb-10">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Profile & Settings</h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">Manage your account and preferences</p>
                </div>

                {/* Profile Header Card */}
                <div className="mb-5 sm:mb-6 lg:mb-8">
                    <ProfileHeader user={user} onEditProfile={() => setIsEditProfileOpen(true)} />
                </div>

                {/* Settings Sections */}
                <div className="space-y-4 sm:space-y-5 lg:space-y-8">
                    {/* Appearance & Preferences Row */}
                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                        <AppearanceSettings settings={settings} onSettingChange={handleSettingChange} />
                        <PreferencesSettings
                            user={user}
                            userSettings={settings}
                            onCurrencyChange={handleCurrencyChange}
                            onTextSizeChange={handleTextSizeChange}
                        />
                    </div>

                    {/* Notifications & Data Privacy Row */}
                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
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

                    {/* Danger Zone - Full Width */}
                    <DangerZone
                        onLogout={() => setIsLogoutConfirmOpen(true)}
                        onDeleteAccount={() => setIsDeleteAccountOpen(true)}
                    />
                </div>

                {/* Modals */}
                <EditProfileModal
                    open={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                />
                <DeleteAccountModal
                    open={isDeleteAccountOpen}
                    onClose={() => setIsDeleteAccountOpen(false)}
                />
                <ConfirmationModal
                    open={isLogoutConfirmOpen}
                    onClose={() => setIsLogoutConfirmOpen(false)}
                    onConfirm={logout}
                    title="Logout Confirmation"
                    description="Are you sure you want to logout? You'll need to sign in again to access your account."
                    confirmText="Logout"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </PageWrapper>
    );
}
