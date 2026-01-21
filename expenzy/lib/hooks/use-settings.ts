import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { toast } from 'sonner';

export interface UserSettings {
    id: string;
    userId: string;
    theme: 'light' | 'dark' | 'system';
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    weekStartDay: string;
    defaultView: string;
    textSize: 'small' | 'medium' | 'large';
    notificationEnabled: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    budgetAlerts: boolean;
    subscriptionReminders: boolean;
    loanReminders: boolean;
    exportFormat: 'pdf' | 'csv' | 'excel';
    biometricEnabled: boolean;
    autoBackup: boolean;
}

export interface UpdateUserSettingsDto {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
    weekStartDay?: string;
    defaultView?: string;
    textSize?: 'small' | 'medium' | 'large';
    notificationEnabled?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    budgetAlerts?: boolean;
    subscriptionReminders?: boolean;
    loanReminders?: boolean;
    exportFormat?: 'pdf' | 'csv' | 'excel';
    biometricEnabled?: boolean;
    autoBackup?: boolean;
}

export function useSettings() {
    return useQuery<UserSettings>({
        queryKey: ['user-settings'],
        queryFn: async () => {
            return await apiClient.get<UserSettings>('/user-settings');
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateUserSettingsDto) => {
            return await apiClient.patch<UserSettings>('/user-settings', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-settings'] });
            toast.success('Settings updated successfully');
        },
        onError: () => {
            toast.error('Failed to update settings');
        },
    });
}
