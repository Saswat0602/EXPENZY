'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ROUTES } from '@/lib/routes';
import { toast } from 'sonner';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth(); // We might need a direct way to set user/token if login expects credentials

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));

                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // We need to force a refresh of the auth context or reload the page
                // simpler is to just reload or redirect to dashboard which auth context will pick up
                window.location.href = ROUTES.DASHBOARD;

            } catch (error) {
                console.error('Failed to parse user data', error);
                toast.error('Authentication failed');
                router.push(ROUTES.LOGIN);
            }
        } else {
            router.push(ROUTES.LOGIN);
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
