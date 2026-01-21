'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const code = searchParams.get('code') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!email || !code) {
            toast.error('Invalid reset link');
            router.push(ROUTES.LOGIN);
        }
    }, [email, code, router]);

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, text: '', color: '' };
        if (password.length < 6) return { strength: 1, text: 'Weak', color: 'text-red-500' };
        if (password.length < 10) return { strength: 2, text: 'Medium', color: 'text-yellow-500' };
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return { strength: 3, text: 'Strong', color: 'text-green-500' };
        }
        return { strength: 2, text: 'Medium', color: 'text-yellow-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            toast.success('Password reset successfully!');
            router.push(ROUTES.LOGIN);
        } catch (error) {
            const err = error as { message: string };
            toast.error(err.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background">
            {/* Left Side - Visual & Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/80 to-purple-900/80 backdrop-blur-sm z-0"></div>

                <div className="relative z-10 text-primary-foreground max-w-lg space-y-8">
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xl">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight">Create new password</h1>
                        <p className="text-xl text-primary-foreground/80 font-light leading-relaxed">
                            Your new password must be different from previously used passwords.
                        </p>
                    </div>

                    <div className="space-y-4 pt-8">
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                            <span className="text-lg">At least 6 characters</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                            <span className="text-lg">Mix of letters and numbers</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                            <span className="text-lg">Include uppercase letters</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                                <Lock className="w-6 h-6" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Set New Password</h2>
                        <p className="text-muted-foreground">Enter your new password below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* New Password */}
                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="text-sm font-medium leading-none">
                                    New Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <input
                                        id="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-input bg-muted/40 px-10 pr-12 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted/60"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-background/80"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {newPassword && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength.strength
                                                        ? passwordStrength.strength === 1
                                                            ? 'bg-red-500'
                                                            : passwordStrength.strength === 2
                                                                ? 'bg-yellow-500'
                                                                : 'bg-green-500'
                                                        : 'bg-muted'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs ${passwordStrength.color}`}>
                                            {passwordStrength.text}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-input bg-muted/40 px-10 pr-12 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted/60"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-background/80"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <p className="text-xs text-red-500">Passwords do not match</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-primary/25 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
