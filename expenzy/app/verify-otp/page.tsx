'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function VerifyOtpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const purpose = (searchParams.get('purpose') as 'registration' | 'password_reset') || 'registration';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            router.push(ROUTES.SIGNUP);
            return;
        }

        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, [email, router]);

    useEffect(() => {
        if (countdown > 0 && !canResend) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (index === 5 && value && newOtp.every(digit => digit)) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);

        // Focus last filled input or submit if complete
        const lastIndex = Math.min(pastedData.length - 1, 5);
        inputRefs.current[lastIndex]?.focus();

        if (pastedData.length === 6) {
            handleVerify(pastedData);
        }
    };

    const handleVerify = async (code?: string) => {
        const otpCode = code || otp.join('');
        if (otpCode.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otpCode, purpose }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid OTP code');
            }

            toast.success('Email verified successfully!');

            if (purpose === 'registration') {
                // Store token and redirect to dashboard
                if (data.access_token) {
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                router.push(ROUTES.DASHBOARD);
            } else if (purpose === 'password_reset') {
                // Redirect to reset password page
                router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${otpCode}`);
            }
        } catch (error) {
            const err = error as { message: string };
            toast.error(err.message || 'Verification failed');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);

        try {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, purpose }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            toast.success('New code sent to your email');
            setOtp(['', '', '', '', '', '']);
            setCountdown(60);
            setCanResend(false);
            inputRefs.current[0]?.focus();
        } catch (error) {
            const err = error as { message: string };
            toast.error(err.message || 'Failed to resend code');
        } finally {
            setIsResending(false);
        }
    };

    const purposeText = {
        registration: 'Email Verification',
        password_reset: 'Password Reset',
    }[purpose];

    const descriptionText = {
        registration: `We've sent a 6-digit verification code to ${email}. Please enter it below to activate your account.`,
        password_reset: `We've sent a 6-digit code to ${email}. Please enter it below to reset your password.`,
    }[purpose];

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
                        <h1 className="text-5xl font-bold tracking-tight">Check your email</h1>
                        <p className="text-xl text-primary-foreground/80 font-light leading-relaxed">
                            We&apos;ve sent a verification code to your email address. Enter it to continue.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                        <p className="text-sm text-primary-foreground/90">
                            <strong>Security Tip:</strong> Never share your verification code with anyone. We&apos;ll never ask for it via phone or email.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - OTP Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                                <Mail className="w-6 h-6" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">{purposeText}</h2>
                        <p className="text-muted-foreground">{descriptionText}</p>
                    </div>

                    <div className="space-y-6">
                        {/* OTP Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Enter verification code</label>
                            <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-input bg-muted/40 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={() => handleVerify()}
                            disabled={isLoading || otp.some(digit => !digit)}
                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-primary/25 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Verify Code'
                            )}
                        </button>

                        {/* Resend Code */}
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Didn&apos;t receive the code?
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={!canResend || isResending}
                                className="text-primary hover:text-primary/80 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                                {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
                            </button>
                        </div>

                        {/* Back Link */}
                        <div className="pt-4 text-center">
                            <Link
                                href={purpose === 'registration' ? ROUTES.SIGNUP : ROUTES.LOGIN}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to {purpose === 'registration' ? 'Sign Up' : 'Login'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyOtpForm />
        </Suspense>
    );
}
