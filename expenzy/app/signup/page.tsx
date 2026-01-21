'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const { signup, isAuthenticated } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.push(ROUTES.DASHBOARD);
        }
    }, [isAuthenticated, router]);

    if (isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await signup({ username, email, password });
            toast.success('Account created! Please check your email for verification code.');
            // Redirect to OTP verification page
            router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=registration`);
        } catch (error) {
            const err = error as { message: string };
            toast.error(err.message || 'Failed to create account');
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
                            <span className="text-3xl font-bold">E</span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight">Manage your finances with confidence.</h1>
                        <p className="text-xl text-primary-foreground/80 font-light leading-relaxed">
                            Join thousands of users who are taking control of their financial future with Expenzy&apos;s powerful tracking tools.
                        </p>
                    </div>

                    <div className="space-y-4 pt-8">
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                            <span className="text-lg">Smart category tracking</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                            <span className="text-lg">Real-time analytics dashboard</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                            <span className="text-lg">Group expense splitting</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                                <span className="text-xl font-bold">E</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                        <p className="text-muted-foreground">Enter your details to get started with Expenzy</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Username
                                </label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-input bg-muted/40 px-10 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted/60"
                                        placeholder="johndoe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-input bg-muted/40 px-10 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted/60"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-input bg-muted/40 px-10 pr-12 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted/60"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-background/80"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 6 characters
                                </p>
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
                                    <span>Create Account</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link
                            href={ROUTES.LOGIN}
                            className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>

                    <div className="pt-8 flex justify-center space-x-6">
                        <div className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Privacy Policy</div>
                        <div className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Terms of Service</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
