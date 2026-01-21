'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, PiggyBank, Users, Wallet, TrendingUp, Shield, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold">
              E
            </div>
            <span className="text-2xl font-bold">Expenzy</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(ROUTES.LOGIN)}>Login</Button>
            <Button onClick={() => router.push(ROUTES.SIGNUP)}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      < section className="container mx-auto px-4 py-20 md:py-32" >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Take Control of Your Finances
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Track expenses, manage budgets, achieve savings goals, and split bills with friends - all in one beautiful app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => router.push(ROUTES.SIGNUP)}>
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => router.push(ROUTES.LOGIN)}>
              Sign In
            </Button>
          </div>
        </div>
      </section >

      {/* Features Grid */}
      < section className="container mx-auto px-4 py-20" >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need to Manage Money
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Wallet}
            title="Expense Tracking"
            description="Track every expense with categories, tags, and receipts. Know exactly where your money goes."
          />
          <FeatureCard
            icon={PiggyBank}
            title="Savings Goals"
            description="Set goals, track progress, and celebrate achievements. Make saving money fun and rewarding."
          />
          <FeatureCard
            icon={BarChart3}
            title="Smart Analytics"
            description="Beautiful charts and insights help you understand spending patterns and make better decisions."
          />
          <FeatureCard
            icon={Users}
            title="Group Expenses"
            description="Split bills with friends and roommates. Track who owes what and settle up easily."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Budget Management"
            description="Create budgets, get alerts, and stay on track. Never overspend again."
          />
          <FeatureCard
            icon={Shield}
            title="Secure & Private"
            description="Bank-level security keeps your financial data safe. Your privacy is our priority."
          />
        </div>
      </section >

      {/* CTA Section */}
      < section className="container mx-auto px-4 py-20" >
        <div className="max-w-3xl mx-auto bg-primary text-primary-foreground rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already in control of their money.
          </p>
          <Button size="lg" variant="secondary" onClick={() => router.push(ROUTES.SIGNUP)}>
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section >

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Expenzy. All rights reserved.</p>
          {isInstallable && (
            <div className="mt-4">
              <Button onClick={handleInstallClick} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download App
              </Button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
