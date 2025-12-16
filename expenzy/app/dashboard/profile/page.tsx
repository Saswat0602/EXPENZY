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
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Responsive Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">Profile & Settings</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
                </div>

                {/* Profile Header */}
                <ProfileHeader user={user} onEditProfile={() => setIsEditProfileOpen(true)} />

                <div className="border-t border-border/40" />

                {/* Settings Grid */}
                <div className="grid lg:grid-cols-2 gap-x-12 gap-y-10">
                    <AppearanceSettings settings={settings} onSettingChange={handleSettingChange} />
                    <PreferencesSettings
                        user={user}
                        userSettings={settings}
                        onCurrencyChange={handleCurrencyChange}
                        onTextSizeChange={handleTextSizeChange}
                    />
                    <NotificationSettings settings={settings} onToggle={handleToggle} />
                    <DataPrivacySettings
                        settings={settings}
                        onSettingChange={handleSettingChange}
                        onToggle={handleToggle}
                    />
                </div>

                <div className="border-t border-border/40" />

                {/* Security - Full Width */}
                <SecuritySettings
                    user={user}
                    onPasswordChange={handlePasswordChange}
                    isChangingPassword={changePassword.isPending}
                />

                <div className="border-t border-border/40" />

                {/* Danger Zone */}
                <DangerZone
                    onLogout={() => setIsLogoutConfirmOpen(true)}
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
