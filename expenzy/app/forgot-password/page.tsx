'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset code');
            }

            toast.success('Reset code sent to your email');
            router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=password_reset`);
        } catch (error) {
            const err = error as { message: string };
            toast.error(err.message || 'Failed to send reset code');
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
                            <Mail className="w-8 h-8" />
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight">Reset your password</h1>
                        <p className="text-xl text-primary-foreground/80 font-light leading-relaxed">
                            Enter your email address and we&apos;ll send you a verification code to reset your password.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                        <p className="text-sm text-primary-foreground/90">
                            <strong>Security:</strong> For your protection, we&apos;ll send a verification code to your email address before allowing you to reset your password.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                                <Mail className="w-6 h-6" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Forgot Password?</h2>
                        <p className="text-muted-foreground">No worries, we&apos;ll send you reset instructions</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-input bg-muted/40 px-10 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted/60"
                                    placeholder="you@example.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-primary/25 flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Send Reset Code</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <Link
                            href={ROUTES.LOGIN}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
