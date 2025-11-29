'use client';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { User, Mail, Palette, LogOut, Settings, Bell, Shield } from 'lucide-react';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            {/* User Info Card */}
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user?.name}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                    Edit Profile
                </button>
            </div>

            {/* Settings Sections */}
            <div className="space-y-4">
                {/* Appearance */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Palette className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Appearance</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Theme</p>
                            <p className="text-sm text-muted-foreground">
                                Choose your preferred color scheme
                            </p>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors capitalize"
                        >
                            {theme}
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Settings className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Preferences</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Currency</p>
                                <p className="text-sm text-muted-foreground">
                                    {user?.currency || 'USD'}
                                </p>
                            </div>
                            <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                                Change
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Budget Alerts</p>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when you exceed budget limits
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Subscription Reminders</p>
                                <p className="text-sm text-muted-foreground">
                                    Remind me about upcoming subscriptions
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Security</h3>
                    </div>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors">
                            Change Password
                        </button>
                        <button className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors">
                            Two-Factor Authentication
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-card border border-destructive/50 rounded-lg p-6">
                    <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full sm:w-auto px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
